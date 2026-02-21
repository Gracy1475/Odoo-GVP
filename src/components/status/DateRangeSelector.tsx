"use client";

import { useState } from "react";

type DateRange = "month" | "quarter" | "year" | "custom";

interface DateRangeSelectorProps {
  onRangeChange?: (range: DateRange) => void;
  defaultRange?: DateRange;
}

export function DateRangeSelector({
  onRangeChange,
  defaultRange = "month",
}: DateRangeSelectorProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>(defaultRange);

  const handleChange = (range: DateRange) => {
    setSelectedRange(range);
    onRangeChange?.(range);
  };

  const options: { value: DateRange; label: string; emoji: string }[] = [
    { value: "month", label: "This Month", emoji: "📅" },
    { value: "quarter", label: "This Quarter", emoji: "📊" },
    { value: "year", label: "This Year", emoji: "📈" },
    { value: "custom", label: "Custom Range", emoji: "⚙️" },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleChange(option.value)}
          className={`px-3 py-2 rounded border text-xs font-medium transition-all ${
            selectedRange === option.value
              ? "bg-cyan-600 border-cyan-500 text-slate-100 shadow-lg shadow-cyan-500/30"
              : "border-slate-600 text-slate-300 hover:border-slate-400 hover:text-slate-100"
          }`}
        >
          {option.emoji} {option.label}
        </button>
      ))}
    </div>
  );
}
