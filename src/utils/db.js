const bcrypt = require("bcryptjs");
const { Roles } = require("../constants/roles");
const { DriverStatus, TripStatus, VehicleStatus } = require("../constants/statuses");

const db = {
  users: [
    { id: 1, username: "manager", passwordHash: null, role: Roles.MANAGER },
    { id: 2, username: "dispatcher", passwordHash: null, role: Roles.DISPATCHER },
    { id: 3, username: "safety", passwordHash: null, role: Roles.SAFETY_OFFICER },
    { id: 4, username: "finance", passwordHash: null, role: Roles.FINANCIAL_ANALYST },
  ],
  vehicles: [
    { id: 1, model: "Volvo FH16", licensePlate: "FF-TRK-101", maxCapacity: 30000, status: VehicleStatus.AVAILABLE },
    { id: 2, model: "Mercedes Actros", licensePlate: "FF-TRK-205", maxCapacity: 28000, status: VehicleStatus.IN_SHOP },
    { id: 3, model: "Ford Transit", licensePlate: "FF-VAN-331", maxCapacity: 3500, status: VehicleStatus.AVAILABLE },
  ],
  drivers: [
    { id: 1, name: "Liam Torres", status: DriverStatus.ON_DUTY, licenseExpiry: "2027-05-02" },
    { id: 2, name: "Maya Chen", status: DriverStatus.ON_DUTY, licenseExpiry: "2026-08-20" },
    { id: 3, name: "Noah Ibrahim", status: DriverStatus.OFF_DUTY, licenseExpiry: "2026-01-10" },
  ],
  trips: [
    { id: 1, vehicleId: 1, driverId: 1, cargoWeight: 22000, status: TripStatus.DRAFT, distanceKm: 450, revenue: 7200 },
    { id: 2, vehicleId: 3, driverId: 2, cargoWeight: 2000, status: TripStatus.DISPATCHED, distanceKm: 180, revenue: 1600 },
  ],
  maintenanceLogs: [
    { id: 1, vehicleId: 2, serviceType: "Brake Inspection", cost: 860, createdAt: "2026-02-14" },
  ],
  fuelExpenses: [
    { id: 1, tripId: 1, liters: 120, fuelCost: 560, miscExpense: 110, distanceKm: 450 },
    { id: 2, tripId: 2, liters: 58, fuelCost: 260, miscExpense: 55, distanceKm: 180 },
  ],
};

let initialized = false;

async function initDb() {
  if (initialized) return;
  for (const user of db.users) {
    user.passwordHash = await bcrypt.hash("password123", 10);
  }
  initialized = true;
}

function nextId(collection) {
  return collection.length ? Math.max(...collection.map((item) => item.id)) + 1 : 1;
}

const orm = {
  async getUsers() {
    return [...db.users];
  },
  async getUserByUsername(username) {
    return db.users.find((user) => user.username === username) || null;
  },

  async getVehicles() {
    return [...db.vehicles];
  },
  async getVehicleById(id) {
    return db.vehicles.find((vehicle) => vehicle.id === Number(id)) || null;
  },
  async updateVehicle(id, patch) {
    const vehicle = await this.getVehicleById(id);
    if (!vehicle) return null;
    Object.assign(vehicle, patch);
    return vehicle;
  },

  async getDrivers() {
    return [...db.drivers];
  },
  async getDriverById(id) {
    return db.drivers.find((driver) => driver.id === Number(id)) || null;
  },
  async updateDriver(id, patch) {
    const driver = await this.getDriverById(id);
    if (!driver) return null;
    Object.assign(driver, patch);
    return driver;
  },

  async getTrips() {
    return [...db.trips];
  },
  async getTripById(id) {
    return db.trips.find((trip) => trip.id === Number(id)) || null;
  },
  async createTrip(payload) {
    const trip = { id: nextId(db.trips), ...payload };
    db.trips.push(trip);
    return trip;
  },
  async updateTrip(id, patch) {
    const trip = await this.getTripById(id);
    if (!trip) return null;
    Object.assign(trip, patch);
    return trip;
  },

  async getMaintenanceLogs() {
    return [...db.maintenanceLogs];
  },
  async createMaintenanceLog(payload) {
    const log = { id: nextId(db.maintenanceLogs), ...payload };
    db.maintenanceLogs.push(log);
    return log;
  },

  async getFuelExpenses() {
    return [...db.fuelExpenses];
  },
};

module.exports = {
  orm,
  initDb,
};