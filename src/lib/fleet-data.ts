import { DashboardFilters, Driver, ExpenseLog, FuelLog, ServiceLog, Trip, Vehicle } from "./types";

export const seedVehicles: Vehicle[] = [
  { id: 1, model: "Volvo FH16", licensePlate: "FF-TRK-101", maxCapacity: 30000, odometer: 124320, acquisitionCost: 160000, status: "On Trip", region: "North", type: "Truck" },
  { id: 2, model: "Mercedes Actros", licensePlate: "FF-TRK-205", maxCapacity: 28000, odometer: 98310, acquisitionCost: 148000, status: "Available", region: "South", type: "Truck" },
  { id: 3, model: "Ford Transit", licensePlate: "FF-VAN-331", maxCapacity: 3500, odometer: 76220, acquisitionCost: 52000, status: "In Shop", region: "East", type: "Van" },
  { id: 4, model: "Scania R500", licensePlate: "FF-TRL-408", maxCapacity: 32000, odometer: 189000, acquisitionCost: 172000, status: "Retired", region: "West", type: "Trailer" },
];

export const seedDrivers: Driver[] = [
  { id: 1, name: "Liam Torres", licenseExpiry: "2027-05-02", category: "A", status: "On Duty", safetyScore: 94 },
  { id: 2, name: "Maya Chen", licenseExpiry: "2026-01-20", category: "A", status: "On Duty", safetyScore: 89 },
  { id: 3, name: "Noah Ibrahim", licenseExpiry: "2026-12-11", category: "B", status: "Off Duty", safetyScore: 91 },
];

export const seedTrips: Trip[] = [
  { id: 1, vehicleId: 1, driverId: 1, cargoWeight: 22000, revenue: 7200, status: "Dispatched", startOdometer: 123900, endOdometer: 124320 },
  { id: 2, vehicleId: 2, driverId: 1, cargoWeight: 14000, revenue: 6100, status: "Draft", startOdometer: 97600, endOdometer: 98310 },
  { id: 3, vehicleId: 1, driverId: 1, cargoWeight: 21000, revenue: 8300, status: "Completed", startOdometer: 121300, endOdometer: 123900 },
];

export const seedServiceLogs: ServiceLog[] = [
  { id: 1, vehicleId: 3, serviceType: "Brake Inspection", cost: 860, date: "2026-02-14", completed: false },
  { id: 2, vehicleId: 2, serviceType: "Oil Change", cost: 240, date: "2026-01-21", completed: true },
];

export const seedFuelLogs: FuelLog[] = [
  { id: 1, vehicleId: 1, liters: 410, cost: 560, date: "2026-02-12" },
  { id: 2, vehicleId: 1, liters: 440, cost: 610, date: "2026-02-18" },
  { id: 3, vehicleId: 2, liters: 300, cost: 430, date: "2026-02-11" },
];

export const seedExpenseLogs: ExpenseLog[] = [
  { id: 1, tripId: 1, driverId: 1, distance: 1000, fuelCost: 19000, miscExpense: 3000, status: "Done" },
  { id: 2, tripId: 2, driverId: 1, distance: 850, fuelCost: 16000, miscExpense: 2500, status: "Done" },
  { id: 3, tripId: 3, driverId: 1, distance: 1200, fuelCost: 22000, miscExpense: 4000, status: "Done" },
];

export function applyDashboardFilters(vehicles: Vehicle[], filters: DashboardFilters) {
  return vehicles.filter((vehicle) => {
    const typeMatch = filters.vehicleType === "All" || vehicle.type === filters.vehicleType;
    const regionMatch = filters.region === "All" || vehicle.region === filters.region;
    const statusMatch = filters.status === "All" || vehicle.status === filters.status;
    return typeMatch && regionMatch && statusMatch;
  });
}

export function calcDashboardMetrics(vehicles: Vehicle[], trips: Trip[]) {
  const nonRetired = vehicles.filter((vehicle) => vehicle.status !== "Retired");
  const onTrip = vehicles.filter((vehicle) => vehicle.status === "On Trip");
  const inShop = vehicles.filter((vehicle) => vehicle.status === "In Shop");
  const pendingCargo = trips.filter((trip) => trip.status === "Draft").length;
  const utilization = nonRetired.length === 0 ? 0 : (onTrip.length / nonRetired.length) * 100;

  return {
    activeFleet: onTrip.length,
    maintenanceAlerts: inShop.length,
    pendingCargo,
    utilization,
  };
}

export function isLicenseExpired(dateISO: string) {
  return new Date(dateISO) < new Date();
}

export function suspendExpiredDrivers(drivers: Driver[]) {
  return drivers.map((driver) =>
    isLicenseExpired(driver.licenseExpiry)
      ? { ...driver, status: "Suspended" as const }
      : driver,
  );
}

export function getTripDistance(trip: Trip) {
  return Math.max(0, trip.endOdometer - trip.startOdometer);
}

export function validateTripAssignment(params: {
  cargoWeight: number;
  vehicle: Vehicle | undefined;
  driver: Driver | undefined;
}) {
  const { cargoWeight, vehicle, driver } = params;
  if (!vehicle) return "Vehicle is required.";
  if (!driver) return "Driver is required.";
  if (cargoWeight > vehicle.maxCapacity) return "Cargo exceeds vehicle max capacity.";
  if (isLicenseExpired(driver.licenseExpiry)) return "Driver license is expired.";
  if (driver.status !== "On Duty") return "Driver is not On Duty.";
  if (vehicle.status !== "Available") return "Vehicle is not available.";
  return null;
}

export function calculateTotalOperationalCostByVehicle(
  vehicleId: number,
  fuelLogs: FuelLog[],
  maintenanceLogs: ServiceLog[],
) {
  const fuelCost = fuelLogs
    .filter((fuelLog) => fuelLog.vehicleId === vehicleId)
    .reduce((sum, fuelLog) => sum + fuelLog.cost, 0);

  const maintenanceCost = maintenanceLogs
    .filter((maintenanceLog) => maintenanceLog.vehicleId === vehicleId)
    .reduce((sum, maintenanceLog) => sum + maintenanceLog.cost, 0);

  return fuelCost + maintenanceCost;
}

export function calculateFuelEfficiency(distance: number, liters: number) {
  if (liters <= 0) return 0;
  return distance / liters;
}

export function calculateROI(revenue: number, maintenance: number, fuel: number, acquisitionCost: number) {
  if (!acquisitionCost) return 0;
  return (revenue - (maintenance + fuel)) / acquisitionCost;
}
