const { ApiError } = require("../utils/httpError");

/** Unknown route -> 404 JSON. */
const notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });

/** Central error handler. Logs the stack, returns a safe message. */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(status).json({
    success: false,
    message: status >= 500 ? "Something went wrong. Please try again." : err.message,
    ...(err.details ? { errors: err.details } : {}),
  });
};

module.exports = { notFound, errorHandler, ApiError };
