const analyticsService = require("../services/analyticsService");
const { sendSuccess } = require("../utils/response");

async function getSummary(_req, res) {
  const summary = await analyticsService.getAnalyticsSummary();
  return sendSuccess(res, "Analytics summary fetched successfully", summary);
}

async function getFleetHealth(_req, res) {
  const fleetHealth = await analyticsService.calculateFleetHealth();
  return sendSuccess(res, "Fleet health fetched successfully", fleetHealth);
}

module.exports = {
  getSummary,
  getFleetHealth,
};