/**
 * Centralized Error Handling Middleware for Express REST API
 */
export function errorHandler(err, req, res, next) {
  // If headers have already been sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  // Map HTTP status codes to standard error codes
  const errorCodeMap = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    500: 'INTERNAL_SERVER_ERROR'
  };

  const errorCode = err.code || errorCodeMap[statusCode] || 'INTERNAL_SERVER_ERROR';
  const errorMessage = err.message || 'An unexpected error occurred. Please try again later.';

  // Log error on the server side (avoid logging sensitive credentials)
  if (statusCode >= 500) {
    console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err);
  } else {
    console.warn(`[CLIENT ERROR] ${req.method} ${req.originalUrl} (${statusCode}):`, errorMessage);
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
      ...(isProd ? {} : { details: err.details })
    }
  });
}

/**
 * 404 Not Found Middleware for unmatched API routes
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
}
