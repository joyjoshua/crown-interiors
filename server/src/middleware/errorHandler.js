/**
 * Global Error Handler Middleware
 *
 * Catches all errors thrown or passed via next(err) in the request pipeline.
 * Handles specific error types (Joi validation, Supabase/PostgreSQL, custom)
 * and returns structured JSON error responses.
 *
 * Must be registered LAST in the Express middleware chain.
 */

/**
 * Express error-handling middleware (4-argument signature).
 * @param {Error} err - The error object
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const errorHandler = (err, req, res, next) => {
  // Log the error with context (stack only in development)
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // ── Joi Validation Errors ──
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      })),
    });
  }

  // ── Supabase / PostgreSQL Errors (error codes prefixed with PGRST) ──
  if (err.code && err.code.startsWith('PGRST')) {
    return res.status(400).json({
      success: false,
      error: 'Database error',
      message: err.message,
    });
  }

  // ── Custom Application Errors ──
  if (err.message === 'Invoice not found') {
    return res.status(404).json({
      success: false,
      error: 'Invoice not found',
    });
  }

  // ── Default: Internal Server Error ──
  // In production, hide the real error message from clients
  res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
};

module.exports = { errorHandler };
