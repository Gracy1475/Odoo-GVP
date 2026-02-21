import { ReactNode } from "react";

type StatusTone = "success" | "warning" | "danger" | "info" | "default";

const toneStyles: Record<StatusTone, string> = {
  success: "text-[var(--success)] bg-[color:color-mix(in_srgb,var(--success)_14%,transparent)] border-[color:color-mix(in_srgb,var(--success)_35%,transparent)]",
  warning: "text-[var(--warning)] bg-[color:color-mix(in_srgb,var(--warning)_14%,transparent)] border-[color:color-mix(in_srgb,var(--warning)_35%,transparent)]",
  danger: "text-[var(--danger)] bg-[color:color-mix(in_srgb,var(--danger)_14%,transparent)] border-[color:color-mix(in_srgb,var(--danger)_35%,transparent)]",
  info: "text-[var(--info)] bg-[color:color-mix(in_srgb,var(--info)_14%,transparent)] border-[color:color-mix(in_srgb,var(--info)_35%,transparent)]",
  default: "text-[var(--text-secondary)] bg-[var(--bg-hover)] border-[color:color-mix(in_srgb,var(--text-secondary)_30%,transparent)]",
};

export function StatusPill({
  label,
  tone = "default",
  icon,
}: {
  label: string;
  tone?: StatusTone;
  icon?: ReactNode;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 hover:brightness-110 ${toneStyles[tone]}`}>
      {icon}
      {label}
    </span>
  );
}
