const request = require('supertest');
const path = require('path');
const child_process = require('child_process');

let serverProcess;
const SERVER_START_CMD = 'node src/server.js';
const SERVER_PORT = 3000;
const BASE_URL = `http://localhost:${SERVER_PORT}`;

beforeAll((done) => {
  // Start server as a child process
  serverProcess = child_process.spawn('node', ['src/server.js'], { stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
  // wait for server to log "listening" by watching stdout
  serverProcess.stdout && serverProcess.stdout.on('data', (chunk) => {
    const s = chunk.toString();
    if (s.toLowerCase().includes('listening')) done();
  });
  // Fallback: if no stdout, wait 500ms
  setTimeout(() => done(), 500);
}, 10000);

afterAll(() => {
  if (serverProcess) serverProcess.kill();
});

test('GET /health responds ok', async () => {
  const res = await request(BASE_URL).get('/health');
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('ok');
});

test('PUT create/update inventory and GET aggregated', async () => {
  const sku = 'test-sku-1';
  const resPut = await request(BASE_URL).put(`/inventory/${sku}`).set('X-Store-Id','test-store').send({ quantity: 7 });
  expect(resPut.statusCode).toBe(200);
  expect(resPut.body.quantity).toBe(7);

  const resGet = await request(BASE_URL).get(`/inventory/${sku}`);
  expect(resGet.statusCode).toBe(200);
  expect(resGet.body.sku).toBe(sku);
  expect(resGet.body.per_store.some(p => p.store_id === 'test-store')).toBeTruthy();
});

test('POST adjust with optimistic locking rejects on version mismatch', async () => {
  const sku = 'test-sku-2';
  await request(BASE_URL).put(`/inventory/${sku}`).set('X-Store-Id','s1').send({ quantity: 5 });
  // fetch current version
  const g = await request(BASE_URL).get(`/inventory/${sku}`);
  const per = g.body.per_store.find(p => p.store_id === 's1');
  const wrongVersion = per.version + 1;
  const res = await request(BASE_URL).post(`/inventory/${sku}/adjust`).set('X-Store-Id','s1').send({ delta: -1, expectedVersion: wrongVersion });
  expect(res.statusCode).toBe(409);
  expect(res.body.error).toBe('version_mismatch');
});

test('Idempotency: repeated PUT with same Idempotency-Key returns same result', async () => {
  const sku = 'test-sku-idemp';
  const key = 'idem-key-123';
  const r1 = await request(BASE_URL).put(`/inventory/${sku}`).set('X-Store-Id','sidem').set('Idempotency-Key', key).send({ quantity: 12 });
  expect(r1.statusCode).toBe(200);
  const r2 = await request(BASE_URL).put(`/inventory/${sku}`).set('X-Store-Id','sidem').set('Idempotency-Key', key).send({ quantity: 999 });
  expect(r2.statusCode).toBe(200);
  expect(r2.body.quantity).toBe(r1.body.quantity);
}, 10000);
