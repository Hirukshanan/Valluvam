/**
 * Centralized API Error Handling Middleware for Valluvam
 *
 * Provides a consistent, production-safe error structure:
 * {
 *   "success": false,
 *   "message": "Human-readable error message"
 * }
 *
 * Ensures no stack traces, file paths, credentials, or internal database
 * details are exposed in HTTP responses.
 */

/**
 * Custom application error class for throwing operational errors with HTTP status codes.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Handler for undefined API routes.
 * Catches all unmatched requests and returns a structured JSON 404 response.
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Centralized Express error-handling middleware.
 * Must be registered with 4 arguments (err, req, res, next) after all application routes.
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path || 'ID'} format`;
  }

  // 2. Mongoose Validation Error (ValidationError)
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    if (err.errors) {
      const messages = Object.values(err.errors).map((e) => e.message);
      message = messages.join(', ') || 'Validation failed';
    } else {
      message = 'Validation failed';
    }
  }

  // 3. MongoDB Duplicate Key Error (code 11000)
  else if (err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000)) {
    statusCode = 409;
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'record';
    message = `A record with that ${field} already exists.`;
  }

  // 4. JWT Authentication Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Not authorized — invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Not authorized — token expired';
  }

  // 5. Malformed JSON Body (SyntaxError from express.json())
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON payload in request body';
  }

  // 6. Multer File Upload Errors
  else if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.message || 'File upload failed';
  }

  // 7. Mask generic 500 errors in production to avoid leaking internals
  else if (statusCode >= 500) {
    if (process.env.NODE_ENV === 'production' && !err.isOperational) {
      message = 'Internal server error';
    }
  }

  // In development, log full error stack to server console for debugging
  if (statusCode >= 500 || !err.isOperational) {
    console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);
  }

  // Standardized error response structure
  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
};
