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

  const status = err.status || 500;
  res.status(status).json({
    message: status === 500 ? 'Something went wrong' : err.message,
  });
}

module.exports = { notFound, errorHandler };
