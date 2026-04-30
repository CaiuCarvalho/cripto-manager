const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * Global Express error-handling middleware.
 * Must be registered AFTER all routes with app.use(errorHandler).
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'key', 'private'];
  const sanitizedBody = env.isProduction
    ? Object.fromEntries(
        Object.entries(req.body || {}).filter(
          ([k]) => !SENSITIVE_FIELDS.some(f => k.toLowerCase().includes(f))
        )
      )
    : req.body;

  logger.error(`[${req.method}] ${req.path} — ${statusCode} ${message}`, {
    stack: err.stack,
    body: sanitizedBody,
    params: req.params,
    query: req.query,
  });

  const response = {
    error: true,
    message: statusCode >= 500 && env.isProduction ? 'Internal Server Error' : message,
    statusCode,
  };

  // Expose stack trace only in development
  if (!env.isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
