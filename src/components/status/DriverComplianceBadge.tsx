"use client";

import { Tooltip } from "../common/Tooltip";
import { DriverCompliance, getRiskLevel, getComplianceBadgeColor } from "@/utils/driver-compliance";

interface DriverComplianceBadgeProps {
  compliance: DriverCompliance;
  showDetails?: boolean;
}

export function DriverComplianceBadge({ compliance, showDetails = true }: DriverComplianceBadgeProps) {
  const riskLevel = getRiskLevel(compliance);
  const badgeColor = getComplianceBadgeColor(riskLevel);

  const statusText =
    riskLevel === "critical"
      ? compliance.isSuspended
        ? "Suspended"
        : compliance.licenseStatus === "expired"
          ? "License Expired"
          : "Non-Compliant"
      : riskLevel === "warning"
        ? compliance.licenseStatus === "critical"
          ? `License Expires in ${compliance.daysUntilExpiry} days`
          : "Safety Alert"
        : "Compliant";

  const tooltipContent = (
    <div className="space-y-1">
      <p>License Expires: {compliance.daysUntilExpiry > 0 ? `${compliance.daysUntilExpiry} days` : "Expired"}</p>
      <p>Safety Score: {compliance.safetyRating}%</p>
      <p>Compliance: {compliance.complianceScore}%</p>
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <span key={`${riskLevel}-${compliance.complianceScore}`} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor} border-current/30 state-transition`}>
        {riskLevel === "critical" && "🔴"}
        {riskLevel === "warning" && "🟡"}
        {riskLevel === "safe" && "🟢"}
        {statusText}
      </span>
    </Tooltip>
  );
}
