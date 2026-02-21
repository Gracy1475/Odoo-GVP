const { orm } = require("../utils/db");
const { ApiError } = require("../utils/apiError");
const { VehicleStatus } = require("../constants/statuses");

async function createMaintenanceLog(payload) {
  const { vehicleId, serviceType, cost = 0 } = payload;

  if (!vehicleId || !serviceType) {
    throw new ApiError(400, "vehicleId and serviceType are required");
  }

  const vehicle = await orm.getVehicleById(vehicleId);
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const log = await orm.createMaintenanceLog({
    vehicleId: Number(vehicleId),
    serviceType,
    cost: Number(cost),
    createdAt: new Date().toISOString(),
  });

  await orm.updateVehicle(vehicleId, { status: VehicleStatus.IN_SHOP });

  return log;
}

async function getMaintenanceLogs() {
  return orm.getMaintenanceLogs();
}

module.exports = {
  createMaintenanceLog,
  getMaintenanceLogs,
};