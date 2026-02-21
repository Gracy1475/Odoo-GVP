"use client";

import { Tooltip } from "../common/Tooltip";
import { ReactNode } from "react";

interface AnalyticsMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    trend: "up" | "down" | "neutral";
  };
  icon?: ReactNode;
  tooltip?: string;
  variant?: "default" | "success" | "warning" | "danger";
  onClick?: () => void;
}

export function AnalyticsMetric({
  label,
  value,
  unit,
  change,
  icon,
  tooltip,
  variant = "default",
  onClick,
}: AnalyticsMetricProps) {
  const variantClasses = {
    default: "bg-slate-900/40 border-slate-700 text-slate-100",
    success: "bg-emerald-900/30 border-emerald-700 text-emerald-100",
    warning: "bg-amber-900/30 border-amber-700 text-amber-100",
    danger: "bg-red-900/30 border-red-700 text-red-100",
  };

  const content = (
    <div className={`p-4 rounded-lg border ${variantClasses[variant]} transition-all ${onClick ? "cursor-pointer hover:shadow-lg" : ""}`} onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</div>
          <div className="mt-2 flex items-baseline gap-1">
            {icon && <span className="text-xl">{icon}</span>}
            <div className="text-2xl font-bold">{value}</div>
            {unit && <span className="text-sm text-slate-400">{unit}</span>}
          </div>
        </div>

        {change && (
          <div
            className={`text-right px-2 py-1 rounded text-xs font-semibold ${
              change.trend === "up"
                ? "bg-emerald-900/40 text-emerald-300"
                : change.trend === "down"
                  ? "bg-red-900/40 text-red-300"
                  : "bg-slate-800/40 text-slate-400"
            }`}
          >
            <div>{change.trend === "up" ? "↑" : change.trend === "down" ? "↓" : "="}</div>
            <div>{Math.abs(change.value)}%</div>
          </div>
        )}
      </div>
    </div>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{content}</Tooltip>;
  }

  return content;
}
