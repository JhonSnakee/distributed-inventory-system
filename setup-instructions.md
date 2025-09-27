# Setup Instructions

## Prerequisites
- Node.js 18+ and npm
- Git (optional)

## Installation Steps

1. **Clone and install dependencies:**
```bash
git clone <repository-url> inventory-system
cd inventory-system
npm install
```

2. **Run the application:**
```bash
npm start
```

3. **Run tests:**
```bash
npm test
```

4. **Run tests with coverage:**
```bash
npm run test:coverage
```

## Key Architectural Decisions

### Consistency Strategy
- **Strong consistency** for critical operations (stock adjustments)
- **Optimistic locking** with version control to prevent lost updates
- **Idempotency** support for safe retries

### Technology Choices
- **Node.js + Express**: Fast prototyping, good for I/O operations
- **SQLite**: Simple deployment, ACID transactions
- **better-sqlite3**: Synchronous operations, better performance

### API Design Principles
- RESTful endpoints with clear resource modeling
- Store-aware operations via headers
- Comprehensive error responses with structured format