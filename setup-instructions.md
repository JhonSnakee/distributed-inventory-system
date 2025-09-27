# Setup Instructions

## Prerequisites
- Node.js 18+ and npm
- Git (optional)

## Installation Steps

### 1. Clone and install dependencies:
```bash
git clone <repository-url> inventory-system
cd inventory-system
npm install
```

### 2. Run the application:
```bash
npm start
# Server will start on http://localhost:3000
```

### 3. Run tests:
```bash
npm test                # Run all tests
npm run test:coverage   # Run with coverage report
npm run test:watch      # Run in watch mode
```

### 4. Test the API:
See `postman-examples.md` for comprehensive API testing examples.

## Key Architectural Decisions

### Consistency Strategy
- **Strong consistency** for critical operations (stock adjustments)
- **Optimistic locking** with version control to prevent lost updates
- **Idempotency** support for safe retries

### Technology Choices
- **Node.js + Express**: Fast prototyping, excellent for I/O operations
- **SQLite**: Simple deployment, ACID transactions, zero configuration
- **better-sqlite3**: Synchronous operations, better performance than async alternatives
- **Jest + Supertest**: Comprehensive testing framework with API testing capabilities

### API Design Principles
- RESTful endpoints with clear resource modeling
- Store-aware operations via X-Store-Id header
- Comprehensive error responses with structured format
- Idempotency support via Idempotency-Key header
- Version-based optimistic concurrency control

## Project Structure
```
├── src/
│   ├── server.js          # Main application server
│   └── error-handler.js   # Centralized error handling
├── tests/
│   ├── inventory.test.js  # Core API tests
│   └── error-handling.test.js # Error handling tests
├── data/
│   └── inventory.db       # SQLite database (auto-created)
└── scripts/
    └── simulate_concurrent_requests.py # Concurrency testing
```