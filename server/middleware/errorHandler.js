function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const isMulterOrValidationError = err.name === 'MulterError' || err.message?.includes('Only image files');
  const status = err.statusCode || (isMulterOrValidationError ? 400 : 500);
  res.status(status).json({
    message: err.message || 'Something went wrong on the server.',
  });
}

module.exports = { notFound, errorHandler };
