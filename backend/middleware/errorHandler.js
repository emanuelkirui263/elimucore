// Global error handler middleware
const errorHandler = (error, req, res, next) => {
  console.error(error);

  // Joi validation errors
  if (error.isJoi) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      })),
    });
  }

  // Sequelize validation errors
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      details: error.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Sequelize unique constraint errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'This record already exists',
      details: error.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message =
    error.message || 'An unexpected error occurred. Please try again later.';

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = errorHandler;
