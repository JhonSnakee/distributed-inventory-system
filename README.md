# Distributed Inventory Management System — Prototype

## Quick Overview
This repository contains a **technical proposal** and **prototype implementation** (simplified) of a distributed inventory management system designed to minimize inconsistencies, reduce update latency, and improve observability and fault tolerance.

## Quick Start
```bash
npm install
npm start
# Server runs on http://localhost:3000
```

## Main Content
- `src/` - Backend prototype server (Node.js + Express) using SQLite as simulated persistence
- `run.md` - Instructions to run the prototype locally
- `prompts.md` - GenAI prompts used during development
- `project-plan.md` - Short project plan, architectural decisions and milestones
- `api-design.md` - Detailed API documentation
- `tech-stack.md` - Technology choices and GenAI integration
- `postman-examples.md` - API testing examples

## API Endpoints
- `GET /inventory/{sku}` - Get aggregated inventory across stores
- `PUT /inventory/{sku}` - Set quantity for SKU in store (idempotent)
- `POST /inventory/{sku}/adjust` - Adjust quantity with optimistic locking
- `POST /sync/push` - Batch synchronization from stores

## Proposed Architecture (Summary)
1. **Model**: CQRS + Event Sourcing conceptual approach
   - Writes (commands) go to a *command* service that validates and emits inventory events to *event bus* (e.g. Kafka / Amazon MSK / AWS Kinesis)
   - Reads (queries) are served from optimized replicas (read-models) in distributed caches (e.g. Redis) per store and for global view
2. **Consistency**: Proposes **strong consistency for critical stock operations** (purchase, reservation) using optimistic concurrency control (version/cas) and central confirmation (coordinator). For non-critical operations (reports) eventual consistency is allowed
3. **Synchronization**: Push synchronization from stores to command service with idempotency and periodic background reconciliation (compaction / reconciliation)
4. **Observability**: Event traceability, metrics (Prometheus), structured logs and traces (OpenTelemetry)
5. **Security**: TLS, JWT-based authentication, role-based authorization, and idempotency-key headers for safe idempotency

## Implemented Features
✅ Optimistic concurrency control with version field
✅ Idempotency support via Idempotency-Key header
✅ Multi-store inventory management
✅ Comprehensive error handling
✅ Automated testing suite
✅ REST API with proper HTTP status codes

## Prototype Implementation
The prototype implements:
- REST API with endpoints to query inventory, adjust stock and reconcile/push changes
- Simulated persistence with SQLite (file `data/inventory.db`)
- Optimistic concurrency control mechanism (`version` field) to avoid unintended overwrites
- Basic idempotency and retry via `Idempotency-Key` header
- Basic error handling and logging

## Testing
```bash
npm test                # Run all tests
npm run test:coverage   # Run with coverage report
```

## Production Roadmap
- Replace SQLite with PostgreSQL/MongoDB
- Implement Redis for read caching
- Add JWT authentication
- Deploy with Docker + Kubernetes
- Integrate with Kafka/Kinesis for events

Read `run.md` for quick execution and testing instructions.
