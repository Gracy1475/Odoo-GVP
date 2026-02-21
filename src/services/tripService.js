const { orm } = require("../utils/db");
const { ApiError } = require("../utils/apiError");
const { validateTripTransition } = require("../utils/tripStateMachine");
const { DriverStatus, TripStatus, VehicleStatus } = require("../constants/statuses");

function isLicenseExpired(licenseExpiry) {
  return new Date(licenseExpiry) < new Date();
}

async function validateTripBusinessRules({ vehicleId, driverId, cargoWeight }) {
  const vehicle = await orm.getVehicleById(vehicleId);
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const driver = await orm.getDriverById(driverId);
  if (!driver) {
    throw new ApiError(404, "Driver not found");
  }

  if (vehicle.status !== VehicleStatus.AVAILABLE) {
    throw new ApiError(400, "Vehicle is not available");
  }

  if (driver.status !== DriverStatus.ON_DUTY) {
    throw new ApiError(400, "Driver must be On Duty to be assigned");
  }

  if (isLicenseExpired(driver.licenseExpiry)) {
    throw new ApiError(400, "Driver license has expired");
  }

  if (Number(cargoWeight) > Number(vehicle.maxCapacity)) {
    throw new ApiError(400, "Cargo weight exceeds vehicle max capacity");
  }

  return { vehicle, driver };
}

async function syncStatusesByTripStatus(trip, nextStatus) {
  if (nextStatus === TripStatus.DISPATCHED) {
    await orm.updateVehicle(trip.vehicleId, { status: VehicleStatus.ON_TRIP });
    await orm.updateDriver(trip.driverId, { status: DriverStatus.ON_TRIP });
  }

  if (nextStatus === TripStatus.COMPLETED) {
    await orm.updateVehicle(trip.vehicleId, { status: VehicleStatus.AVAILABLE });
    await orm.updateDriver(trip.driverId, { status: DriverStatus.AVAILABLE });
  }
}

async function createTrip(payload) {
  const { vehicleId, driverId, cargoWeight, distanceKm = 0, revenue = 0 } = payload;

  if (!vehicleId || !driverId || cargoWeight == null) {
    throw new ApiError(400, "vehicleId, driverId and cargoWeight are required");
  }

  await validateTripBusinessRules({ vehicleId, driverId, cargoWeight });

  const trip = await orm.createTrip({
    vehicleId: Number(vehicleId),
    driverId: Number(driverId),
    cargoWeight: Number(cargoWeight),
    distanceKm: Number(distanceKm),
    revenue: Number(revenue),
    status: TripStatus.DRAFT,
  });

  return trip;
}

async function updateTripStatus({ tripId, nextStatus }) {
  const trip = await orm.getTripById(tripId);
  if (!trip) {
    throw new ApiError(404, "Trip not found");
  }

  if (!validateTripTransition(trip.status, nextStatus)) {
    throw new ApiError(400, `Invalid transition: ${trip.status} -> ${nextStatus}`);
  }

  if (nextStatus === TripStatus.DISPATCHED) {
    await validateTripBusinessRules({
      vehicleId: trip.vehicleId,
      driverId: trip.driverId,
      cargoWeight: trip.cargoWeight,
    });
  }

  const updatedTrip = await orm.updateTrip(trip.id, { status: nextStatus });
  await syncStatusesByTripStatus(updatedTrip, nextStatus);

  return updatedTrip;
}

async function getAllTrips() {
  return orm.getTrips();
}

module.exports = {
  validateTripBusinessRules,
  createTrip,
  updateTripStatus,
  getAllTrips,
  syncStatusesByTripStatus,
};