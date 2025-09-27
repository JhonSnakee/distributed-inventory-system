# Project Plan — Improvement for Distributed Inventory Management System

## Objective
Reduce stock inconsistencies in online channels and decrease update latency from stores.

## Minimum Viable Product (MVP)
- Centralized API to receive and validate changes from stores
- Event persistence and simple read-model (SQLite)
- Optimistic concurrency control with version/cas
- Public endpoints for stock query and adjustment
- Batch reconciliation and manual push endpoint

## Milestones (2 weeks)
1. **Day 0-2**: Architecture and API design (documentation)
2. **Day 3-7**: Prototype implementation (main endpoints, db init, test scripts)
3. **Day 8-10**: Concurrency testing (simulate multiple stores), adjustments and documentation
4. **Day 11-14**: Minimal observability (structured logs) and deliverable preparation (zip + README + run.md)

## Key Technical Decisions
- **Stack**: Node.js + Express (fast for prototypes), SQLite for local persistence
- **Consistency**: Optimistic locking for critical stock operations; centralized validation in command service
- **Scaling**: Decouple read/write with CQRS and use Redis for read-models in production
- **Event Bus**: Kafka or Kinesis; for prototype uses synchronous/local model

## Implementation Status
✅ API design and documentation
✅ Core prototype implementation
✅ Optimistic locking with version control
✅ Idempotency support
✅ Comprehensive testing suite
✅ Error handling and logging
✅ Documentation and examples
