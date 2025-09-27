const request = require('supertest');
const child_process = require('child_process');

let serverProcess;
const BASE_URL = 'http://localhost:3000';

beforeAll((done) => {
  serverProcess = child_process.spawn('node', ['src/server.js'], { 
    stdio: ['ignore', 'pipe', 'pipe'], 
    env: process.env 
  });
  setTimeout(() => done(), 500);
}, 10000);

afterAll(() => {
  if (serverProcess) serverProcess.kill();
});

describe('Error Handling', () => {
  test('Invalid quantity returns 400', async () => {
    const res = await request(BASE_URL)
      .put('/inventory/test-sku')
      .set('X-Store-Id', 'test-store')
      .send({ quantity: 'invalid' });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('quantity required');
  });

  test('Missing delta in adjust returns 400', async () => {
    const res = await request(BASE_URL)
      .post('/inventory/test-sku/adjust')
      .set('X-Store-Id', 'test-store')
      .send({ expectedVersion: 1 });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('delta required');
  });

  test('Adjust non-existent SKU returns 404', async () => {
    const res = await request(BASE_URL)
      .post('/inventory/non-existent-sku/adjust')
      .set('X-Store-Id', 'test-store')
      .send({ delta: -1 });
    
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('not_found');
  });

  test('Insufficient stock returns 400', async () => {
    // First create inventory
    await request(BASE_URL)
      .put('/inventory/low-stock-sku')
      .set('X-Store-Id', 'test-store')
      .send({ quantity: 1 });

    // Try to reduce by more than available
    const res = await request(BASE_URL)
      .post('/inventory/low-stock-sku/adjust')
      .set('X-Store-Id', 'test-store')
      .send({ delta: -5 });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('insufficient_stock');
  });
});