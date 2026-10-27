export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url} - ${err.message}`);
  
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected error occurred. Please try again.'
  });
};
