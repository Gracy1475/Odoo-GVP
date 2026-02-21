const { orm } = require("../utils/db");
const { TripStatus, VehicleStatus } = require("../constants/statuses");
const vehicleService = require("./vehicleService");
const driverService = require("./driverService");

async function calculateUtilization() {
  const vehicles = await orm.getVehicles();
  const activeVehicles = vehicles.filter((vehicle) => vehicle.status !== VehicleStatus.RETIRED);
  const onTripCount = activeVehicles.filter((vehicle) => vehicle.status === VehicleStatus.ON_TRIP).length;

  if (!activeVehicles.length) return 0;
  return (onTripCount / activeVehicles.length) * 100;
}

async function calculateCostPerKm() {
  const fuelExpenses = await orm.getFuelExpenses();
  const totalDistance = fuelExpenses.reduce((sum, item) => sum + Number(item.distanceKm || 0), 0);
  const totalCost = fuelExpenses.reduce((sum, item) => sum + Number(item.fuelCost || 0) + Number(item.miscExpense || 0), 0);

  if (!totalDistance) return 0;
  return totalCost / totalDistance;
}

async function calculateFuelEfficiency() {
  const fuelExpenses = await orm.getFuelExpenses();
  const totalDistance = fuelExpenses.reduce((sum, item) => sum + Number(item.distanceKm || 0), 0);
  const totalLiters = fuelExpenses.reduce((sum, item) => sum + Number(item.liters || 0), 0);

  if (!totalLiters) return 0;
  return totalDistance / totalLiters;
}

async function calculateComplianceRate() {
  const summary = await driverService.getComplianceSummary();
  if (!summary.totalDrivers) return 100;
  return ((summary.totalDrivers - summary.nonCompliantDrivers) / summary.totalDrivers) * 100;
}

async function calculateMaintenanceHealth() {
  const vehicles = await orm.getVehicles();
  const activeVehicles = vehicles.filter((vehicle) => vehicle.status !== VehicleStatus.RETIRED);
  const inShopCount = activeVehicles.filter((vehicle) => vehicle.status === VehicleStatus.IN_SHOP).length;

  if (!activeVehicles.length) return 100;
  return ((activeVehicles.length - inShopCount) / activeVehicles.length) * 100;
}

async function calculateROI() {
  const [trips, fuelExpenses, maintenanceLogs, vehicles] = await Promise.all([
    orm.getTrips(),
    orm.getFuelExpenses(),
    orm.getMaintenanceLogs(),
    orm.getVehicles(),
  ]);

  const totalRevenue = trips
    .filter((trip) => trip.status === TripStatus.COMPLETED || trip.status === TripStatus.DISPATCHED)
    .reduce((sum, trip) => sum + Number(trip.revenue || 0), 0);

  const totalFuelAndExpenses = fuelExpenses.reduce((sum, item) => sum + Number(item.fuelCost || 0) + Number(item.miscExpense || 0), 0);
  const totalMaintenance = maintenanceLogs.reduce((sum, log) => sum + Number(log.cost || 0), 0);
  const totalAcquisition = vehicles.reduce((sum, vehicle) => sum + Number(vehicle.acquisitionCost || 0), 0);

  if (!totalAcquisition) return 0;

  return ((totalRevenue - (totalFuelAndExpenses + totalMaintenance)) / totalAcquisition) * 100;
}

async function calculateFleetHealth() {
  const [utilization, complianceRate, maintenanceHealth, roi] = await Promise.all([
    calculateUtilization(),
    calculateComplianceRate(),
    calculateMaintenanceHealth(),
    calculateROI(),
  ]);

  const normalizedRoi = Math.max(0, Math.min(100, roi));
  const score =
    utilization * 0.3 +
    complianceRate * 0.25 +
    maintenanceHealth * 0.25 +
    normalizedRoi * 0.2;

  return {
    score,
    components: {
      utilization,
      complianceRate,
      maintenanceHealth,
      roi,
    },
  };
}

async function getUnderperformingVehicles() {
  const vehicles = await vehicleService.getVehiclesWithPerformanceTags();
  return vehicles.filter((vehicle) => vehicle.performanceTag === "Underutilized");
}

async function getHighMaintenanceVehicles() {
  const vehicles = await vehicleService.getVehiclesWithPerformanceTags();
  return vehicles.filter((vehicle) => vehicle.performanceTag === "High Maintenance Cost");
}

async function getAnalyticsSummary() {
  const [utilization, costPerKm, fuelEfficiency, fleetHealth, underperformingVehicles, highMaintenanceVehicles] = await Promise.all([
    calculateUtilization(),
    calculateCostPerKm(),
    calculateFuelEfficiency(),
    calculateFleetHealth(),
    getUnderperformingVehicles(),
    getHighMaintenanceVehicles(),
  ]);

  return {
    utilization,
    costPerKm,
    fuelEfficiency,
    fleetHealth,
    underperformingVehicles,
    highMaintenanceVehicles,
  };
}

module.exports = {
  calculateUtilization,
  calculateCostPerKm,
  calculateFuelEfficiency,
  calculateFleetHealth,
  getUnderperformingVehicles,
  getHighMaintenanceVehicles,
  getAnalyticsSummary,
};