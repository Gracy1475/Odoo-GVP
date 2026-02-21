"use client";

import { Tooltip } from "../common/Tooltip";
import { getVehiclePerformanceColor, getVehiclePerformanceLabel, VehiclePerformance } from "@/utils/vehicle-intelligence";

interface VehiclePerformanceBadgeProps {
  performance: VehiclePerformance;
  variant?: "compact" | "detailed";
}

const performanceTooltips = {
  "high-performer": "This vehicle has completed 90%+ of assigned trips. Great utilization rate.",
  "underutilized": "This vehicle has been assigned less than 5 trips. Consider for more assignments.",
  "high-maintenance": "This vehicle has high maintenance costs relative to trips. Monitor closely.",
  "normal": "This vehicle is operating within normal parameters.",
};

export function VehiclePerformanceBadge({ performance, variant = "compact" }: VehiclePerformanceBadgeProps) {
  const label = getVehiclePerformanceLabel(performance.rating);
  const colorClass = getVehiclePerformanceColor(performance.rating);
  const tooltip = performanceTooltips[performance.rating];

  if (variant === "compact") {
    return (
      <Tooltip content={tooltip}>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${colorClass} border-current/30`}>
          {performance.rating === "high-performer" && "⭐"}
          {performance.rating === "underutilized" && "📊"}
          {performance.rating === "high-maintenance" && "⚠️"}
          {performance.rating === "normal" && "✓"}
          {label}
        </span>
      </Tooltip>
    );
  }

  return (
    <div className={`p-3 rounded border ${colorClass} border-current/30 space-y-2`}>
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs space-y-1">
        <p>Trips: {performance.totalTrips} (Completed: {performance.completedTrips})</p>
        <p>Utilization: {performance.utilization.toFixed(0)}%</p>
        <p>Avg Maintenance Cost: ${performance.maintenanceCostPerTrip.toFixed(2)}/trip</p>
      </div>
      <p className="text-xs opacity-80">{tooltip}</p>
    </div>
  );
}
