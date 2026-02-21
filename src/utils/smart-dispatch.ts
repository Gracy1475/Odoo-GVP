/**
 * Smart dispatch and vehicle recommendation logic
 */

import { Vehicle, Trip, Driver } from "@/lib/types";

export interface VehicleRecommendation {
  vehicleId: number;
  licensePlate: string;
  model: string;
  capacityMatch: number; // 0-100 score
  isAvailable: boolean;
  reason: string;
}

export const recommendVehicleForCargo = (
  cargoWeightKg: number,
  availableVehicles: Vehicle[]
): VehicleRecommendation | null => {
  if (availableVehicles.length === 0) return null;

  // Filter vehicles that can handle cargo
  const suitableVehicles = availableVehicles.filter((v) => v.maxCapacity >= cargoWeightKg);

  if (suitableVehicles.length === 0) return null;

  // Find vehicle with closest capacity match (not too big, not too small)
  const bestMatch = suitableVehicles.reduce((best, current) => {
    const bestScore = 100 - Math.abs(best.maxCapacity - cargoWeightKg) / (best.maxCapacity / 100);
    const currentScore = 100 - Math.abs(current.maxCapacity - cargoWeightKg) / (current.maxCapacity / 100);
    return currentScore > bestScore ? current : best;
  });

  const capacityMatch = Math.round(
    100 - Math.abs(bestMatch.maxCapacity - cargoWeightKg) / (bestMatch.maxCapacity / 100)
  );

  return {
    vehicleId: bestMatch.id,
    licensePlate: bestMatch.licensePlate,
    model: bestMatch.model,
    capacityMatch: Math.max(0, Math.min(100, capacityMatch)),
    isAvailable: bestMatch.status === "Available",
    reason: `Capacity match (${(cargoWeightKg / 1000).toFixed(1)}/${(bestMatch.maxCapacity / 1000).toFixed(1)} ton)`,
  };
};

export const validateTripAssignmentUI = (
  vehicleId: number,
  driverId: number,
  cargoWeightKg: number,
  vehicles: Vehicle[],
  drivers: Driver[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const driver = drivers.find((d) => d.id === driverId);

  if (!vehicle) errors.push("Vehicle not found");
  else {
    if (vehicle.status !== "Available") errors.push(`Vehicle is ${vehicle.status}`);
    if (cargoWeightKg > vehicle.maxCapacity) {
      errors.push(
        `Cargo (${(cargoWeightKg / 1000).toFixed(1)} ton) exceeds capacity (${(vehicle.maxCapacity / 1000).toFixed(1)} ton)`
      );
    }
  }

  if (!driver) errors.push("Driver not found");
  else {
    if (driver.status === "Off Duty") errors.push("Driver is Off Duty");
    if (driver.status === "Suspended") errors.push("Driver is Suspended");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const getRecommendedVehicleIds = (
  cargo: number,
  vehicles: Vehicle[]
): number[] => {
  return vehicles
    .filter((v) => v.status === "Available" && v.maxCapacity >= cargo)
    .sort((a, b) => {
      const aScore = Math.abs(a.maxCapacity - cargo);
      const bScore = Math.abs(b.maxCapacity - cargo);
      return aScore - bScore;
    })
    .slice(0, 3)
    .map((v) => v.id);
};
