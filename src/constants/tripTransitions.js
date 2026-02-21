const { TripStatus } = require("./statuses");

const allowedTripTransitions = Object.freeze({
  [TripStatus.DRAFT]: [TripStatus.DISPATCHED],
  [TripStatus.DISPATCHED]: [TripStatus.COMPLETED, TripStatus.CANCELLED],
  [TripStatus.COMPLETED]: [],
  [TripStatus.CANCELLED]: [],
});

module.exports = {
  allowedTripTransitions,
};