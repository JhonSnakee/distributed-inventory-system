# API Design Documentation

## Core Endpoints

### Inventory Operations
- `GET /inventory/{sku}` - Get aggregated inventory across stores
- `PUT /inventory/{sku}` - Set quantity for SKU in store (idempotent)
- `POST /inventory/{sku}/adjust` - Adjust quantity with optimistic locking
- `POST /sync/push` - Batch synchronization from stores

### Headers
- `X-Store-Id`: Identifies the store making the request
- `Idempotency-Key`: Ensures operation idempotency

### Design Decisions

**Consistency over Availability**: Chose strong consistency for critical stock operations using optimistic locking with version control. This prevents overselling but may reject concurrent updates.

**Idempotency**: All write operations support idempotency keys to handle network retries safely.

**Store-level partitioning**: Each SKU can have different quantities per store, enabling distributed inventory management.

**Optimistic Locking**: Uses version field to detect concurrent modifications and prevent lost updates.