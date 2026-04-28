const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Express middleware that validates a Supabase JWT from the Authorization header.
 * On success, injects req.user with the authenticated user data.
 * On failure, returns HTTP 401.
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header. Expected: Bearer <token>',
    });
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      logger.warn(`Auth failed: ${error?.message || 'No user returned'}`);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    req.user = data.user;
    next();
  } catch (err) {
    logger.error(`Auth middleware error: ${err.message}`);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token verification failed',
    });
  }
}

module.exports = authMiddleware;
