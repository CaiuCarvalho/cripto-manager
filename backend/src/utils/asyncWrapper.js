/**
 * Wraps an async Express route handler so that any rejected promise is forwarded
 * to the next(err) error pipeline instead of causing an unhandled rejection.
 *
 * @param {Function} fn  Async (req, res, next) handler
 * @returns {Function}   Standard Express handler
 */
function wrap(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { wrap };
