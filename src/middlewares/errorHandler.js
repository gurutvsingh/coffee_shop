const errorHandler = (err, _req, res, _next) => {
  console.error('Server error:', err);

  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.'
  });
};

module.exports = errorHandler;
