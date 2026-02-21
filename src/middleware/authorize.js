const { ApiError } = require("../utils/apiError");

function authorize(allowedRoles = []) {
  return async (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to access this resource"));
    }

    return next();
  };
}

module.exports = { authorize };