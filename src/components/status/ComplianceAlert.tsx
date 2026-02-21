"use client";

import { Driver } from "@/lib/types";
import { getNonCompliantDrivers } from "@/utils/driver-compliance";

interface ComplianceAlertProps {
  drivers: Driver[];
  onAlertClick?: () => void;
}

export function ComplianceAlert({ drivers, onAlertClick }: ComplianceAlertProps) {
  const nonCompliantDrivers = getNonCompliantDrivers(drivers);

  if (nonCompliantDrivers.length === 0) return null;

  const criticalCount = nonCompliantDrivers.filter((d) => d.complianceScore === 0).length;
  const warningCount = nonCompliantDrivers.length - criticalCount;

  return (
    <div
      key={nonCompliantDrivers.length}
      onClick={onAlertClick}
      className="p-4 rounded-lg border border-red-700/50 bg-red-900/30 shadow-lg cursor-pointer hover:bg-red-900/40 transition-colors state-transition"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">🚨</div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-300 mb-1">
            {nonCompliantDrivers.length} Driver{nonCompliantDrivers.length !== 1 ? "s" : ""} Non-Compliant
          </h3>
          <p className="text-xs text-red-200/80">
            {criticalCount > 0 && <span>{criticalCount} critical issue{criticalCount !== 1 ? "s" : ""}</span>}
            {criticalCount > 0 && warningCount > 0 && " • "}
            {warningCount > 0 && <span>{warningCount} warning{warningCount !== 1 ? "s" : ""}</span>}
          </p>
          <p className="text-xs text-red-200/60 mt-2">
            Affected: {nonCompliantDrivers.map((d) => d.name).join(", ")}
          </p>
        </div>
        <div className="text-xl text-red-400">→</div>
      </div>
    </div>
  );
}
