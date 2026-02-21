const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { orm } = require("../utils/db");
const { ApiError } = require("../utils/apiError");

async function login({ username, password }) {
  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }

  const user = await orm.getUserByUsername(username);
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET || "fleetflow-dev-secret",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };
}

module.exports = {
  login,
};