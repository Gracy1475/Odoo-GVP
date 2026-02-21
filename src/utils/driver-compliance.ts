/**
 * Driver compliance and safety utilities
 */

import { Driver } from "@/lib/types";
import { formatExpiryStatus } from "./formatting";

export interface DriverCompliance {
  driverId: number;
  name: string;
  licenseStatus: "expired" | "critical" | "warning" | "ok";
  daysUntilExpiry: number;
  isSuspended: boolean;
  safetyRating: number;
  complianceScore: number;
}

export const calculateDriverCompliance = (driver: Driver): DriverCompliance => {
  const licenseExpiry = formatExpiryStatus(driver.licenseExpiry);
  const isSuspended = driver.status === "Suspended";
  
  // Compliance score: 0-100
  let complianceScore = 100;
  if (licenseExpiry.status === "expired") complianceScore -= 50;
  else if (licenseExpiry.status === "critical") complianceScore -= 30;
  else if (licenseExpiry.status === "warning") complianceScore -= 10;
  
  if (isSuspended) complianceScore = 0;
  if (driver.safetyScore < 80) complianceScore -= Math.round((100 - driver.safetyScore) * 0.3);

  return {
    driverId: driver.id,
    name: driver.name,
    licenseStatus: licenseExpiry.status,
    daysUntilExpiry: licenseExpiry.days,
    isSuspended,
    safetyRating: driver.safetyScore,
    complianceScore: Math.max(0, complianceScore),
  };
};

export const getRiskLevel = (compliance: DriverCompliance): "critical" | "warning" | "safe" => {
  if (compliance.isSuspended || compliance.licenseStatus === "expired") return "critical";
  if (compliance.licenseStatus === "critical" || compliance.safetyRating < 70) return "warning";
  return "safe";
};

export const getComplianceBadgeColor = (riskLevel: "critical" | "warning" | "safe"): string => {
  const colors = {
    critical: "bg-red-900/40 text-red-300 border-red-700",
    warning: "bg-amber-900/40 text-amber-300 border-amber-700",
    safe: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
  };
  return colors[riskLevel];
};

export const getNonCompliantDrivers = (drivers: Driver[]): DriverCompliance[] => {
  return drivers
    .map(calculateDriverCompliance)
    .filter((compliance) => getRiskLevel(compliance) !== "safe");
};
