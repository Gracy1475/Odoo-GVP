export type Role = "Manager" | "Dispatcher" | "Safety Officer" | "Financial Analyst";

export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";
export type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled";
export type DriverStatus = "On Duty" | "Off Duty" | "Suspended";

export type Vehicle = {
  id: number;
  model: string;
  licensePlate: string;
  maxCapacity: number;
  odometer: number;
  acquisitionCost: number;
  status: VehicleStatus;
  region: "North" | "South" | "East" | "West";
  type: "Truck" | "Van" | "Trailer";
};

export type Driver = {
  id: number;
  name: string;
  licenseExpiry: string;
  category: string;
  status: DriverStatus;
  safetyScore: number;
};

export type Trip = {
  id: number;
  vehicleId: number;
  driverId: number;
  cargoWeight: number;
  revenue: number;
  status: TripStatus;
  startOdometer: number;
  endOdometer: number;
  origin?: string;
  destination?: string;
};

export type ServiceLog = {
  id: number;
  vehicleId: number;
  serviceType: string;
  cost: number;
  date: string;
  completed: boolean;
};

export type FuelLog = {
  id: number;
  vehicleId: number;
  liters: number;
  cost: number;
  date: string;
};

export type ExpenseLog = {
  id: number;
  tripId: number;
  driverId: number;
  distance: number;
  fuelCost: number;
  miscExpense: number;
  status: "Pending" | "Done";
};

export type DashboardFilters = {
  vehicleType: "All" | Vehicle["type"];
  region: "All" | Vehicle["region"];
  status: "All" | VehicleStatus;
};
