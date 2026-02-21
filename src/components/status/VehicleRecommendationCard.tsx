"use client";

import { Tooltip } from "../common/Tooltip";
import { VehicleRecommendation } from "@/utils/smart-dispatch";

interface VehicleRecommendationCardProps {
  recommendation: VehicleRecommendation;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function VehicleRecommendationCard({
  recommendation,
  isSelected = false,
  onSelect,
}: VehicleRecommendationCardProps) {
  const getCapacityColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 70) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? "border-cyan-500 bg-cyan-900/30 ring-2 ring-cyan-500"
          : "border-slate-600 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-100">{recommendation.model}</h4>
            {recommendation.capacityMatch >= 90 && <span className="text-xs px-2 py-1 bg-emerald-900/40 text-emerald-300 rounded">Recommended</span>}
          </div>
          <p className="text-xs text-slate-400 mt-1">Plate: {recommendation.licensePlate}</p>
        </div>
        <div className="text-right">
          <Tooltip content={`Capacity match score based on cargo weight requirement`}>
            <div className={`text-2xl font-bold ${getCapacityColor(recommendation.capacityMatch)}`}>
              {recommendation.capacityMatch}%
            </div>
          </Tooltip>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-xs text-slate-300">{recommendation.reason}</p>

        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${recommendation.isAvailable ? "bg-emerald-500" : "bg-red-500"}`} />
          <span className="text-xs text-slate-400">
            {recommendation.isAvailable ? "Available" : "Not Available"}
          </span>
        </div>
      </div>
    </div>
  );
}
