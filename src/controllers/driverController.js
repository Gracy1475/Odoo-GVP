const driverService = require("../services/driverService");
const { sendSuccess } = require("../utils/response");

async function getDrivers(_req, res) {
  const drivers = await driverService.getDrivers();
  return sendSuccess(res, "Drivers fetched successfully", drivers);
}

async function getComplianceSummary(_req, res) {
  const summary = await driverService.getComplianceSummary();
  return sendSuccess(res, "Compliance summary fetched successfully", summary);
}

module.exports = {
  getDrivers,
  getComplianceSummary,
};