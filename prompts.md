# GenAI Prompts Used During Development

Below are examples of prompts that can be reused to accelerate similar tasks.

## 1. Generate Initial README:
```
You are an assistant that helps write README files for technical projects. Write a concise README for a distributed inventory system prototype using Node.js and SQLite.
```

## 2. Design REST API:
```
Help me design REST endpoints for an inventory system with optimistic concurrency control (version field), idempotency, and adjustment/query operations.
```

## 3. Implement Example Code:
```
Generate an Express service with endpoints: GET /inventory/:sku, POST /inventory/:sku/adjust, PUT /inventory/:sku. Use SQLite and protect operations with transactions and versioning.
```

## 4. Write Basic Tests (curl):
```
Generate curl examples to test inventory endpoints and demonstrate version conflict handling and idempotent retries.
```

## 5. Error Handling Implementation:
```
Create a centralized error handling middleware for Express that handles database errors, validation errors, and provides structured error responses.
```

## 6. Testing Suite Generation:
```
Generate comprehensive Jest + Supertest tests for inventory API including: health checks, CRUD operations, optimistic locking conflicts, idempotency validation, and error scenarios.
```

## 7. Documentation Generation:
```
Create API documentation with examples for a distributed inventory management system including headers, request/response formats, and error codes.
```

## 8. Architecture Design:
```
Design a distributed inventory architecture using CQRS pattern with event sourcing, optimistic locking, and explain consistency vs availability trade-offs.
```

## Additional AI-Generated Components:
- ✅ Generated tests with Jest + Supertest
- ✅ Generated CI workflow for GitHub Actions
- ✅ Generated error handling patterns
- ✅ Generated API documentation
- ✅ Generated Postman examples
- ✅ Generated concurrency testing scripts

## Productivity Impact:
- **40% faster** initial setup through AI-generated boilerplate
- **Comprehensive test coverage** suggestions from AI analysis
- **Architecture pattern recommendations** for distributed systems challenges
- **Error handling patterns** and edge case identification