/**
 * Centralized error handling middleware and utilities
 */

class InventoryError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  
  if (err instanceof InventoryError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      error: 'constraint_violation',
      message: 'Database constraint violation',
      timestamp: new Date().toISOString()
    });
  }
  
  // Default error
  res.status(500).json({
    error: 'internal_server_error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
};

module.exports = { InventoryError, errorHandler };