# How to Run the Prototype (Local)

## Requirements
- Node.js 18+ and npm (or pnpm/yarn)
- Git (optional)

## Installation
```bash
git clone <this-repo> inventory-prototype
cd inventory-prototype
npm install
```

## Initialize DB and Sample Data
```bash
# Creates data folder if it doesn't exist and starts the server (server initializes DB automatically)
npm start
```

## Useful Commands (curl)

### 1. Query global inventory by SKU:
```bash
curl -s http://localhost:3000/inventory/sku-123 | jq .
```
or
```bash
curl http://localhost:3000/inventory/sku-123 | ConvertFrom-Json
```

### 2. Adjust stock (reduction by sale) with version control and idempotency:
```bash
curl -X POST http://localhost:3000/inventory/sku-123/adjust \
  -H "Content-Type: application/json" \
  -H "X-Store-Id: store-1" \
  -H "Idempotency-Key: my-op-123" \
  -d '{"delta": -2, "expectedVersion": 5}'
```

### 3. Create/Update stock (set):
```bash
curl -X PUT http://localhost:3000/inventory/sku-123 \
  -H "Content-Type: application/json" \
  -H "X-Store-Id: store-1" \
  -d '{"quantity": 10}'
```

## Testing
```bash
npm test                # Run all tests
npm run test:coverage   # Run with coverage
```

## API Testing
See `postman-examples.md` for comprehensive API testing examples.

## Notes
- This prototype is deliberately simple: the intention is to demonstrate architectural decisions and key mechanisms (optimistic locking, idempotency, local transactions).
- For production it's recommended to: migrate event bus to Kafka/Kinesis, use Redis for read cache, add TLS/JWT, and deploy services in containers + autoscaling.
- More examples at postman-examples.md
