// Centralized error handler. Keeps internal error details out of responses.
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[error]', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Malformed MongoDB ObjectId in a route param (e.g. /requests/not-an-id)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}` });
  }

  // Mongoose schema validation failure
  if (err.name === 'ValidationError') {
    const firstMessage = Object.values(err.errors)[0]?.message || 'Validation failed';
    return res.status(400).json({ message: firstMessage });
  }

  // Duplicate unique-index key (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `That ${field} is already in use` });
  }

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed request body' });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: status === 500 ? 'Something went wrong' : err.message,
  });
}

module.exports = { notFound, errorHandler };