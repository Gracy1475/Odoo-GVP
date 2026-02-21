const vehicleService = require("../services/vehicleService");
const { sendSuccess } = require("../utils/response");

async function getVehicles(_req, res) {
  const vehicles = await vehicleService.getVehiclesWithPerformanceTags();
  return sendSuccess(res, "Vehicles fetched successfully", vehicles);
}

module.exports = {
  getVehicles,
};