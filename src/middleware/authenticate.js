const jwt = require("jsonwebtoken");
const { ApiError } = require("../utils/apiError");

async function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing or invalid authorization token"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "fleetflow-dev-secret");
    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
    return next();
  } catch (_error) {
    return next(new ApiError(401, "Token is invalid or expired"));
  }
}

module.exports = { authenticate };