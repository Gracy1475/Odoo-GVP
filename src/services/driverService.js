const { orm } = require("../utils/db");
const { ApiError } = require("../utils/apiError");
const { DriverStatus } = require("../constants/statuses");

function daysUntil(dateISO) {
  const now = new Date();
  const target = new Date(dateISO);
  const diffMs = target - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

async function updateDriverCompliance(driver) {
  const isExpired = new Date(driver.licenseExpiry) < new Date();

  if (isExpired && driver.status !== DriverStatus.SUSPENDED) {
    return orm.updateDriver(driver.id, { status: DriverStatus.SUSPENDED });
  }

  return driver;
}

async function getDrivers() {
  const drivers = await orm.getDrivers();
  const updated = [];
  for (const driver of drivers) {
    const compliantDriver = await updateDriverCompliance(driver);
    updated.push(compliantDriver);
  }
  return updated;
}

async function getComplianceSummary() {
  const drivers = await getDrivers();

  const nonCompliantDrivers = drivers.filter((driver) => driver.status === DriverStatus.SUSPENDED);
  const expiringSoonDrivers = drivers.filter((driver) => {
    const days = daysUntil(driver.licenseExpiry);
    return days >= 0 && days <= 30;
  });

  return {
    totalDrivers: drivers.length,
    nonCompliantDrivers: nonCompliantDrivers.length,
    expiringSoonDrivers: expiringSoonDrivers.length,
    nonCompliantDriverDetails: nonCompliantDrivers,
    expiringSoonDriverDetails: expiringSoonDrivers,
  };
}

async function getDriverById(id) {
  const driver = await orm.getDriverById(id);
  if (!driver) {
    throw new ApiError(404, "Driver not found");
  }
  return updateDriverCompliance(driver);
}

module.exports = {
  updateDriverCompliance,
  getDrivers,
  getComplianceSummary,
  getDriverById,
};