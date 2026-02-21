"use client";

import { ReactNode } from "react";
import { Tooltip } from "./Tooltip";

interface IconActionButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  tone?: "default" | "danger";
}

const toneClass = {
  default: "border-slate-600 text-slate-300 hover:border-indigo-500/60 hover:text-indigo-200",
  danger: "border-slate-600 text-red-300 hover:border-red-500/60 hover:text-red-200",
};

export function IconActionButton({ label, icon, onClick, tone = "default" }: IconActionButtonProps) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-md border bg-slate-900/60 transition-all duration-200 hover:-translate-y-0.5 ${toneClass[tone]}`}
      >
        {icon}
      </button>
    </Tooltip>
  );
}
