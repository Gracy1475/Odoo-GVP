const tripService = require("../services/tripService");
const { sendSuccess } = require("../utils/response");

async function getTrips(_req, res) {
  const trips = await tripService.getAllTrips();
  return sendSuccess(res, "Trips fetched successfully", trips);
}

async function createTrip(req, res) {
  const trip = await tripService.createTrip(req.body);
  return sendSuccess(res, "Trip created successfully", trip, 201);
}

async function updateTripStatus(req, res) {
  const trip = await tripService.updateTripStatus({
    tripId: req.params.id,
    nextStatus: req.body.nextStatus,
  });

  return sendSuccess(res, "Trip status updated successfully", trip);
}

module.exports = {
  getTrips,
  createTrip,
  updateTripStatus,
};