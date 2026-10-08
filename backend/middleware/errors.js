export function notFound(_req, res) {
  res.status(404).json({ message: 'The requested resource was not found.' });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);
  if (error.name === 'MulterError') {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'Resume must be 5 MB or smaller.' : error.message });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(error.errors).map(item => item.message).join(' ') });
  }
  if (error.code === 11000) return res.status(409).json({ message: 'This record already exists.' });
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid resource identifier.' });
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ message: 'Invalid JSON request body.' });
  res.status(error.status || 500).json({ message: error.message || 'An unexpected server error occurred.' });
}
