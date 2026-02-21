/**
 * Vehicle analytics and intelligence utilities
 */

import { Vehicle, Trip } from "@/lib/types";

export interface VehiclePerformance {
  vehicleId: number;
  totalTrips: number;
  completedTrips: number;
  maintenanceCostPerTrip: number;
  totalMaintenanceCost: number;
  utilization: number;
  rating: "high-performer" | "underutilized" | "high-maintenance" | "normal";
}

export const calculateVehiclePerformance = (
  vehicle: Vehicle,
  trips: Trip[],
  maintenanceCosts: Map<number, number>
): VehiclePerformance => {
  const vehicleTrips = trips.filter((trip) => trip.vehicleId === vehicle.id);
  const completedTrips = vehicleTrips.filter((trip) => trip.status === "Completed").length;
  const maintenanceCost = maintenanceCosts.get(vehicle.id) || 0;
  const maintenanceCostPerTrip = vehicleTrips.length > 0 ? maintenanceCost / vehicleTrips.length : 0;
  const utilization = vehicleTrips.length > 0 ? (completedTrips / vehicleTrips.length) * 100 : 0;

  let rating: "high-performer" | "underutilized" | "high-maintenance" | "normal" = "normal";
  if (maintenanceCostPerTrip > 150) rating = "high-maintenance";
  else if (vehicleTrips.length < 5 && vehicleTrips.length > 0) rating = "underutilized";
  else if (utilization > 90) rating = "high-performer";

  return {
    vehicleId: vehicle.id,
    totalTrips: vehicleTrips.length,
    completedTrips,
    maintenanceCostPerTrip,
    totalMaintenanceCost: maintenanceCost,
    utilization,
    rating,
  };
};

export const getVehiclePerformanceLabel = (rating: VehiclePerformance["rating"]): string => {
  const labels: Record<VehiclePerformance["rating"], string> = {
    "high-performer": "High Performer",
    "underutilized": "Underutilized",
    "high-maintenance": "High Maintenance Cost",
    "normal": "Normal",
  };
  return labels[rating];
};

export const getVehiclePerformanceColor = (rating: VehiclePerformance["rating"]): string => {
  const colors: Record<VehiclePerformance["rating"], string> = {
    "high-performer": "text-emerald-400 bg-emerald-900/30",
    "underutilized": "text-amber-400 bg-amber-900/30",
    "high-maintenance": "text-red-400 bg-red-900/30",
    "normal": "text-slate-400 bg-slate-800/30",
  };
  return colors[rating];
};
