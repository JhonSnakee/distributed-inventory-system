# Postman API Examples

## Base Configuration
- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json` (for POST/PUT requests)

## 1. Health Check
```
GET http://localhost:3000/health
```

## 2. Get Inventory by SKU
```
GET http://localhost:3000/inventory/sku-123
```

## 3. Create/Update Inventory
```
PUT http://localhost:3000/inventory/sku-123
Headers:
  Content-Type: application/json
  X-Store-Id: store-1
Body (JSON):
{
  "quantity": 15
}
```

## 4. Create with Idempotency
```
PUT http://localhost:3000/inventory/sku-456
Headers:
  Content-Type: application/json
  X-Store-Id: store-2
  Idempotency-Key: unique-key-123
Body (JSON):
{
  "quantity": 25
}
```

## 5. Adjust Stock (Reduce by Sale)
```
POST http://localhost:3000/inventory/sku-123/adjust
Headers:
  Content-Type: application/json
  X-Store-Id: store-1
Body (JSON):
{
  "delta": -3,
  "expectedVersion": 1
}
```

## 6. Adjust Stock (Add Restock)
```
POST http://localhost:3000/inventory/sku-123/adjust
Headers:
  Content-Type: application/json
  X-Store-Id: store-1
  Idempotency-Key: restock-op-456
Body (JSON):
{
  "delta": 10,
  "expectedVersion": 2
}
```

## 7. Batch Sync from Store
```
POST http://localhost:3000/sync/push
Headers:
  Content-Type: application/json
  Idempotency-Key: batch-sync-789
Body (JSON):
[
  {
    "sku": "sku-123",
    "quantity": 20,
    "store_id": "store-1"
  },
  {
    "sku": "sku-456", 
    "quantity": 8,
    "store_id": "store-1"
  }
]
```

## Test Scenarios

### Scenario 1: Version Conflict (409 Error)
1. Get current version: `GET /inventory/sku-123`
2. Use wrong version: 
```
POST http://localhost:3000/inventory/sku-123/adjust
Headers:
  Content-Type: application/json
  X-Store-Id: store-1
Body (JSON):
{
  "delta": -1,
  "expectedVersion": 999
}
```

### Scenario 2: Insufficient Stock (400 Error)
```
POST http://localhost:3000/inventory/sku-123/adjust
Headers:
  Content-Type: application/json
  X-Store-Id: store-1
Body (JSON):
{
  "delta": -1000
}
```

### Scenario 3: Idempotency Test
Run the same request twice with same `Idempotency-Key` - should return identical results.