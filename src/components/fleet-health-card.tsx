"use client";

import { Tooltip } from "./common";

interface FleetHealthCardProps {
  score: number;
}

export function FleetHealthCard({ score }: FleetHealthCardProps) {
  const normalizedScore = Math.max(0, Math.min(100, Number(score.toFixed(1))));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedScore / 100) * circumference;

  const toneClass =
    normalizedScore >= 80 ? "text-emerald-300" : normalizedScore >= 60 ? "text-amber-300" : "text-red-300";

  const strokeClass =
    normalizedScore >= 80 ? "stroke-emerald-400" : normalizedScore >= 60 ? "stroke-amber-400" : "stroke-red-400";

  return (
    <Tooltip content="Formula: 30% Utilization + 25% Compliance + 25% Maintenance Health + 20% ROI">
      <div className="wire-panel wire-panel-hover slide-up cursor-help">
        <p className="text-[11px] font-medium text-slate-300">Fleet Health Score</p>
        <div className="mt-3 flex items-center gap-3">
          <svg viewBox="0 0 84 84" className="h-16 w-16">
            <circle cx="42" cy="42" r={radius} className="fill-none stroke-slate-700" strokeWidth="8" />
            <circle
              cx="42"
              cy="42"
              r={radius}
              className={`fill-none ${strokeClass} transition-all duration-300`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 42 42)"
            />
          </svg>
          <div>
            <p className={`text-2xl font-semibold ${toneClass} value-transition`}>{normalizedScore}%</p>
            <p className="text-[11px] text-slate-400">Weighted fleet operating health</p>
          </div>
        </div>
      </div>
    </Tooltip>
  );
}
