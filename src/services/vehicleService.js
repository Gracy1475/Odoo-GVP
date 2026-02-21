const { orm } = require("../utils/db");
const { PerformanceTag, TripStatus, VehicleStatus } = require("../constants/statuses");

const DEFAULT_MONTHLY_TRIP_THRESHOLD = 5;

async function getVehiclePerformanceContext() {
  const [vehicles, trips, maintenanceLogs] = await Promise.all([
    orm.getVehicles(),
    orm.getTrips(),
    orm.getMaintenanceLogs(),
  ]);

  const maintenanceCostByVehicle = new Map();
  for (const log of maintenanceLogs) {
    maintenanceCostByVehicle.set(log.vehicleId, (maintenanceCostByVehicle.get(log.vehicleId) || 0) + Number(log.cost || 0));
  }

  const allMaintenanceCosts = [...maintenanceCostByVehicle.values()];
  const fleetAvgMaintenanceCost = allMaintenanceCosts.length
    ? allMaintenanceCosts.reduce((sum, cost) => sum + cost, 0) / allMaintenanceCosts.length
    : 0;

  return { vehicles, trips, maintenanceCostByVehicle, fleetAvgMaintenanceCost };
}

function computePerformanceTag({ maintenanceCost, avgMaintenanceCost, tripCount, monthlyThreshold = DEFAULT_MONTHLY_TRIP_THRESHOLD }) {
  if (avgMaintenanceCost > 0 && maintenanceCost > avgMaintenanceCost * 1.2) {
    return PerformanceTag.HIGH_MAINTENANCE;
  }

  if (tripCount < monthlyThreshold) {
    return PerformanceTag.UNDERUTILIZED;
  }

  return PerformanceTag.NORMAL;
}

async function getVehiclesWithPerformanceTags() {
  const { vehicles, trips, maintenanceCostByVehicle, fleetAvgMaintenanceCost } = await getVehiclePerformanceContext();

  return vehicles.map((vehicle) => {
    const tripCount = trips.filter((trip) => trip.vehicleId === vehicle.id && trip.status !== TripStatus.CANCELLED).length;
    const maintenanceCost = maintenanceCostByVehicle.get(vehicle.id) || 0;

    return {
      ...vehicle,
      performanceTag: computePerformanceTag({
        maintenanceCost,
        avgMaintenanceCost: fleetAvgMaintenanceCost,
        tripCount,
      }),
      tripCount,
      maintenanceCost,
    };
  });
}

async function getVehiclesInShop() {
  const vehicles = await orm.getVehicles();
  return vehicles.filter((vehicle) => vehicle.status === VehicleStatus.IN_SHOP);
}

module.exports = {
  getVehiclesWithPerformanceTags,
  getVehiclesInShop,
  computePerformanceTag,
};