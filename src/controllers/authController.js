const authService = require("../services/authService");
const { sendSuccess } = require("../utils/response");

async function login(req, res) {
  const result = await authService.login(req.body);
  return sendSuccess(res, "Login successful", result, 200);
}

module.exports = {
  login,
};