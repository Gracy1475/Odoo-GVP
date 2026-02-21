const { orm } = require("../utils/db");
const driverService = require("./driverService");
const analyticsService = require("./analyticsService");
const vehicleService = require("./vehicleService");
const { TripStatus } = require("../constants/statuses");

async function getNotificationsSnapshot() {
  const [complianceSummary, vehiclesInShop, trips, underperformingVehicles] = await Promise.all([
    driverService.getComplianceSummary(),
    vehicleService.getVehiclesInShop(),
    orm.getTrips(),
    analyticsService.getUnderperformingVehicles(),
  ]);

  const pendingTrips = trips.filter((trip) => trip.status === TripStatus.DRAFT);

  return {
    nonCompliantDrivers: complianceSummary.nonCompliantDriverDetails,
    vehiclesInShop,
    pendingTrips,
    underperformingVehicles,
  };
}

module.exports = {
  getNotificationsSnapshot,
};