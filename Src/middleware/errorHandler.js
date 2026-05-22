const logger = require('../utils/logger.js');

class AppError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message, isOperational } = err;

  // Log error
  if (statusCode >= 500) {
    logger.error(`Error: ${message}`, { 
      stack: err.stack, 
      url: req.url, 
      method: req.method,
      body: req.body,
      user: req.user?.id 
    });
  } else {
    logger.warn(`Client Error: ${message}`, { 
      url: req.url, 
      method: req.method,
      statusCode 
    });
  }

  // Don't leak error details in production
  const errorMessage = process.env.NODE_ENV === 'production' && !isOperational
    ? 'Internal server error'
    : message;

  res.status(statusCode).json({
    status: 'error',
    message: errorMessage,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new AppError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

module.exports = { errorHandler, notFound, AppError };