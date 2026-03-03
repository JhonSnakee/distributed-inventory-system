# 📦 Distributed Inventory System

A backend prototype for a **distributed inventory management system** built with Node.js, Express and SQLite. It demonstrates key distributed systems concepts such as optimistic locking, idempotency, store-level partitioning and batch synchronization.

---

## 🚀 Features

- **Optimistic Locking** — Version-based concurrency control to prevent lost updates in concurrent environments.
- **Idempotency** — All write operations support `Idempotency-Key` header for safe retries on network failures.
- **Store-level Partitioning** — Each SKU tracks inventory per store independently.
- **Batch Synchronization** — Bulk push endpoint to reconcile inventory from multiple stores.
- **ACID Transactions** — SQLite transactions ensure data integrity on all writes.
- **Centralized Error Handling** — Structured JSON error responses with meaningful codes and timestamps.

---

## 🛠️ Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Runtime      | Node.js 18+                         |
| Framework    | Express.js                          |
| Database     | SQLite via `better-sqlite3`         |
| Testing      | Jest + Supertest                    |
| Logging      | Morgan                              |
| ID Generation| UUID v4                             |

---

## 📁 Project Structure

```
distributed-inventory-system/
├── src/
│   ├── server.js               # Main application server & API routes
│   └── error-handler.js        # Centralized error handling middleware
├── tests/
│   ├── inventory.test.js       # Core API tests
│   └── error-handling.test.js  # Error handling tests
├── data/
│   └── inventory.db            # SQLite database (auto-created on first run)
├── scripts/
│   └── simulate_concurrent_requests.py  # Concurrency simulation script
├── api-design.md
├── setup-instructions.md
├── postman-examples.md
└── package.json
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js 18+** and **npm**
- Git (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url> distributed-inventory-system
cd distributed-inventory-system

# Install dependencies
npm install
```

### Run the Server

```bash
npm start
# Server starts at http://localhost:3000
```

The SQLite database is created automatically at `data/inventory.db` and seeded with sample data on first run.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode
npm run test:watch
```

---

## 🌐 API Reference

### Base URL
```
http://localhost:3000
```

### Headers

| Header            | Description                                      |
|-------------------|--------------------------------------------------|
| `X-Store-Id`      | Identifies the store making the request          |
| `Idempotency-Key` | Unique key to ensure operation idempotency       |
| `Content-Type`    | `application/json` (required for POST/PUT)       |

---

### Endpoints

#### `GET /health`
Health check.

**Response:**
```json
{ "status": "ok", "now": "2026-03-02T10:00:00.000Z" }
```

---

#### `GET /inventory/:sku`
Get aggregated inventory across all stores for a given SKU.

**Response:**
```json
{
  "sku": "sku-123",
  "total": 15,
  "per_store": [
    { "store_id": "store-1", "quantity": 10, "version": 1, "last_updated": "..." },
    { "store_id": "store-2", "quantity": 5, "version": 1, "last_updated": "..." }
  ]
}
```

---

#### `PUT /inventory/:sku`
Set the quantity for a SKU in a specific store. Supports idempotency.

**Headers:** `X-Store-Id`, `Idempotency-Key` (optional)

**Body:**
```json
{ "quantity": 15 }
```

**Response:**
```json
{ "sku": "sku-123", "store_id": "store-1", "quantity": 15, "version": 2, "last_updated": "..." }
```

---

#### `POST /inventory/:sku/adjust`
Adjust inventory by a delta value using **optimistic locking**. The client must provide `expectedVersion` to prevent lost updates.

**Headers:** `X-Store-Id`, `Idempotency-Key` (optional)

**Body:**
```json
{ "delta": -3, "expectedVersion": 1 }
```

**Response:**
```json
{ "sku": "sku-123", "store_id": "store-1", "quantity": 7, "version": 2, "last_updated": "..." }
```

**Error — Version Mismatch (409):**
```json
{ "error": "version_mismatch", "currentVersion": 3 }
```

**Error — Insufficient Stock (400):**
```json
{ "error": "insufficient_stock" }
```

---

#### `POST /sync/push`
Batch synchronization — push multiple SKU quantities from a store to the central system. Supports idempotency.

**Headers:** `Idempotency-Key` (optional)

**Body:**
```json
[
  { "sku": "sku-123", "quantity": 20, "store_id": "store-1" },
  { "sku": "sku-456", "quantity": 8,  "store_id": "store-1" }
]
```

**Response:**
```json
{ "changed": [ { "sku": "sku-123", "store_id": "store-1", "quantity": 20, "version": 3, "last_updated": "..." } ] }
```

---

## 🏗️ Architecture & Design Decisions

### Consistency over Availability
Critical stock operations prioritize **strong consistency**. When `expectedVersion` mismatches (concurrent update detected), the request is rejected with `409 Conflict` so the client can re-fetch and retry with the latest version. This prevents overselling.

### Optimistic Locking
Each inventory record carries a `version` field that increments on every write. Clients submit the `expectedVersion` they last read; if it no longer matches the database, the update is rejected.

### Idempotency
Write operations (`PUT`, `POST`) accept an `Idempotency-Key` header. If the same key is seen again, the original response is returned immediately — enabling safe retries after network failures without side effects.

### Store-level Partitioning
Each `(sku, store_id)` pair is tracked independently, supporting a distributed model where each physical store manages its own stock and syncs periodically to the central system.

---

## 🔄 Concurrency Simulation

A Python script is provided to simulate concurrent requests and observe optimistic locking in action:

```bash
python scripts/simulate_concurrent_requests.py
```

---

## 📄 Additional Documentation

| File                    | Description                                  |
|-------------------------|----------------------------------------------|
| `api-design.md`         | API design decisions and endpoint overview   |
| `postman-examples.md`   | Ready-to-use Postman request examples        |
| `setup-instructions.md` | Detailed setup and configuration guide       |
| `tech-stack.md`         | Technology choices and GenAI integration     |
| `project-plan.md`       | Project planning notes                       |

---

## 👤 Autor

> Desarrollado con cariño por [@JhonSnakee](https://github.com/JhonSnakee)

