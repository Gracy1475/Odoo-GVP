const maintenanceService = require("../services/maintenanceService");
const { sendSuccess } = require("../utils/response");

async function getMaintenanceLogs(_req, res) {
  const logs = await maintenanceService.getMaintenanceLogs();
  return sendSuccess(res, "Maintenance logs fetched successfully", logs);
}

async function createMaintenanceLog(req, res) {
  const log = await maintenanceService.createMaintenanceLog(req.body);
  return sendSuccess(res, "Maintenance log created successfully", log, 201);
}

module.exports = {
  getMaintenanceLogs,
  createMaintenanceLog,
};