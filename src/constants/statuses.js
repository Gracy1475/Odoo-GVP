const VehicleStatus = Object.freeze({
  AVAILABLE: "Available",
  ON_TRIP: "On Trip",
  IN_SHOP: "In Shop",
  RETIRED: "Retired",
});

const TripStatus = Object.freeze({
  DRAFT: "Draft",
  DISPATCHED: "Dispatched",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
});

const DriverStatus = Object.freeze({
  AVAILABLE: "Available",
  ON_DUTY: "On Duty",
  ON_TRIP: "On Trip",
  OFF_DUTY: "Off Duty",
  SUSPENDED: "Suspended",
});

const PerformanceTag = Object.freeze({
  HIGH_MAINTENANCE: "High Maintenance Cost",
  UNDERUTILIZED: "Underutilized",
  NORMAL: "Normal",
});

module.exports = {
  VehicleStatus,
  TripStatus,
  DriverStatus,
  PerformanceTag,
};