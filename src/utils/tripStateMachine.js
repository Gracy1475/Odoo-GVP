const { allowedTripTransitions } = require("../constants/tripTransitions");

function validateTripTransition(currentStatus, nextStatus) {
  const allowedNext = allowedTripTransitions[currentStatus] || [];
  return allowedNext.includes(nextStatus);
}

module.exports = {
  validateTripTransition,
};