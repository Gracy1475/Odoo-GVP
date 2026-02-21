const { sendError } = require("../utils/response");

function notFoundHandler(_req, _res, next) {
  const error = new Error("Route not found");
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  const details = error.details ? { details: error.details } : {};

  if (process.env.NODE_ENV !== "production" && statusCode >= 500) {
    details.stack = error.stack;
  }

  return sendError(res, message, details, statusCode);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};