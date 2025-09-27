/**
 * Simple prototype backend for distributed inventory.
 * - Uses SQLite via better-sqlite3 (synchronous, simple for prototypes)
 * - Implements optimistic locking with 'version' field
 * - Supports idempotency via Idempotency-Key header (simple cache table)
 *
 * Note: This is a simplified server intended as a demonstration.
 */
const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const morgan = require('morgan');
const { InventoryError, errorHandler } = require('./error-handler');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'inventory.db');
const db = new Database(DB_PATH);

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      sku TEXT NOT NULL,
      store_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      version INTEGER NOT NULL DEFAULT 1,
      last_updated TEXT,
      PRIMARY KEY (sku, store_id)
    );
    CREATE TABLE IF NOT EXISTS idempotency (
      idempotency_key TEXT PRIMARY KEY,
      result TEXT,
      created_at TEXT
    );
  `);

  // Seed example SKU if not exists
  const row = db.prepare('SELECT COUNT(1) as c FROM inventory').get();
  if (row.c === 0) {
    const insert = db.prepare('INSERT INTO inventory(sku, store_id, quantity, version, last_updated) VALUES(?,?,?,?,?)');
    insert.run('sku-123', 'store-1', 10, 1, new Date().toISOString());
    insert.run('sku-123', 'store-2', 5, 1, new Date().toISOString());
    insert.run('sku-789', 'store-1', 20, 1, new Date().toISOString());
  }
}

initDb();

const app = express();
app.use(bodyParser.json());
app.use(morgan('dev'));

// Helper: get store id from header (simulate request from store)
function getStoreId(req) {
  return req.header('X-Store-Id') || 'central';
}

// Idempotency helper
function checkIdempotency(key) {
  if (!key) return null;
  const row = db.prepare('SELECT result FROM idempotency WHERE idempotency_key = ?').get(key);
  return row ? JSON.parse(row.result) : null;
}
function storeIdempotency(key, result) {
  if (!key) return;
  const stmt = db.prepare('INSERT OR REPLACE INTO idempotency(idempotency_key, result, created_at) VALUES(?,?,?)');
  stmt.run(key, JSON.stringify(result), new Date().toISOString());
}

// Get aggregated inventory across stores (simple)
app.get('/inventory/:sku', (req, res) => {
  const sku = req.params.sku;
  const rows = db.prepare('SELECT store_id, quantity, version, last_updated FROM inventory WHERE sku = ?').all(sku);
  const total = rows.reduce((s,r) => s + r.quantity, 0);
  res.json({ sku, total, per_store: rows });
});

// Set quantity for a sku in a store (idempotent by operation if client uses Idempotency-Key)
app.put('/inventory/:sku', (req, res) => {
  try {
    const sku = req.params.sku;
    const storeId = getStoreId(req);
    const { quantity } = req.body;
    if (quantity == null || isNaN(quantity)) return res.status(400).json({ error: 'quantity required' });

    const idemp = req.header('Idempotency-Key');
    const prev = checkIdempotency(idemp);
    if (prev) return res.json(prev);

    const now = new Date().toISOString();
    const stmt = db.prepare(`INSERT INTO inventory(sku, store_id, quantity, version, last_updated)
      VALUES(?,?,?,?,?)
      ON CONFLICT(sku,store_id) DO UPDATE SET quantity = excluded.quantity, version = inventory.version + 1, last_updated = excluded.last_updated`);
    const info = stmt.run(sku, storeId, Math.floor(quantity), 1, now);

    const out = { sku, store_id: storeId, quantity: Math.floor(quantity), version: db.prepare('SELECT version FROM inventory WHERE sku=? AND store_id=?').get(sku, storeId).version, last_updated: now };
    storeIdempotency(idemp, out);
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Adjust quantity by delta with optimistic locking (clients MUST provide expectedVersion to avoid lost updates)
// Prioritizamos CONSISTENCY: if version mismatches, request is rejected so client can re-fetch and retry.
app.post('/inventory/:sku/adjust', (req, res) => {
  try {
    const sku = req.params.sku;
    const storeId = getStoreId(req);
    const { delta, expectedVersion } = req.body;
    if (delta == null || isNaN(delta)) return res.status(400).json({ error: 'delta required' });

    // idempotency support
    const idemp = req.header('Idempotency-Key');
    const prev = checkIdempotency(idemp);
    if (prev) return res.json(prev);

    // read current
    const select = db.prepare('SELECT quantity, version FROM inventory WHERE sku = ? AND store_id = ?');
    const row = select.get(sku, storeId);
    if (!row) return res.status(404).json({ error: 'not_found' });

    // Check expectedVersion for optimistic locking (client-provided). If not provided, still use current row version
    if (expectedVersion != null && expectedVersion !== row.version) {
      return res.status(409).json({ error: 'version_mismatch', currentVersion: row.version });
    }

    // Perform transactionally
    const now = new Date().toISOString();
    const tx = db.transaction((delta) => {
      const current = db.prepare('SELECT quantity, version FROM inventory WHERE sku = ? AND store_id = ?').get(sku, storeId);
      if (!current) throw new Error('not_found_tx');
      const newQty = current.quantity + delta;
      if (newQty < 0) throw new Error('insufficient_stock');
      const update = db.prepare('UPDATE inventory SET quantity = ?, version = version + 1, last_updated = ? WHERE sku = ? AND store_id = ?');
      update.run(newQty, now, sku, storeId);
      return db.prepare('SELECT quantity, version FROM inventory WHERE sku=? AND store_id=?').get(sku, storeId);
    });

    let result;
    try {
      result = tx(delta);
    } catch (e) {
      if (e.message === 'insufficient_stock') return res.status(400).json({ error: 'insufficient_stock' });
      console.error('tx error', e);
      return res.status(500).json({ error: 'internal_error' });
    }

    const out = { sku, store_id: storeId, quantity: result.quantity, version: result.version, last_updated: now };
    storeIdempotency(idemp, out);
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Endpoint to simulate push from store to central (reconciliation). This will merge incoming quantities by replacing store-level value.
// Idempotent by Idempotency-Key if provided.
app.post('/sync/push', (req, res) => {
  try {
    const payload = req.body; // expects array of {sku, quantity, store_id, version?}
    if (!Array.isArray(payload)) return res.status(400).json({ error: 'expect_array' });

    const idemp = req.header('Idempotency-Key');
    const prev = checkIdempotency(idemp);
    if (prev) return res.json(prev);

    const now = new Date().toISOString();
    const upsert = db.prepare(`INSERT INTO inventory(sku, store_id, quantity, version, last_updated)
      VALUES(?,?,?,?,?)
      ON CONFLICT(sku,store_id) DO UPDATE SET quantity = excluded.quantity, version = inventory.version + 1, last_updated = excluded.last_updated`);

    const changes = [];
    const t = db.transaction((items) => {
      for (const it of items) {
        const s = it.store_id || getStoreId({ header: () => null });
        upsert.run(it.sku, s, Math.floor(it.quantity), 1, now);
        const newRow = db.prepare('SELECT sku, store_id, quantity, version, last_updated FROM inventory WHERE sku=? AND store_id=?').get(it.sku, s);
        changes.push(newRow);
      }
    });

    t(payload);
    storeIdempotency(idemp, { changed: changes });
    res.json({ changed: changes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Quick health check
app.get('/health', (req, res) => res.json({ status: 'ok', now: new Date().toISOString() }));

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Inventory prototype listening on', PORT);
  console.log('DB path:', DB_PATH);
});
