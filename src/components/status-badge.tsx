"use client";

type StatusType = "active" | "pending" | "completed" | "cancelled" | "available" | "on-trip" | "in-shop" | "retired" | "on-duty" | "off-duty" | "suspended" | "done" | "new";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

const statusConfig: Record<StatusType, { tone: "success" | "warning" | "danger" | "info" | "default"; dot: string; label: string }> = {
  active: { tone: "success", dot: "🟢", label: "Active" },
  pending: { tone: "warning", dot: "🟡", label: "Pending" },
  completed: { tone: "success", dot: "🟢", label: "Completed" },
  cancelled: { tone: "danger", dot: "🔴", label: "Cancelled" },
  available: { tone: "success", dot: "🟢", label: "Available" },
  "on-trip": { tone: "info", dot: "🔵", label: "On Trip" },
  "in-shop": { tone: "warning", dot: "🟡", label: "In Shop" },
  retired: { tone: "default", dot: "⚫", label: "Retired" },
  "on-duty": { tone: "success", dot: "🟢", label: "On Duty" },
  "off-duty": { tone: "default", dot: "⚫", label: "Off Duty" },
  suspended: { tone: "danger", dot: "🔴", label: "Suspended" },
  done: { tone: "success", dot: "🟢", label: "Done" },
  new: { tone: "warning", dot: "🟠", label: "New" },
};

const toneClass = {
  success:
    "text-[var(--success)] bg-[color:color-mix(in_srgb,var(--success)_14%,transparent)] border-[color:color-mix(in_srgb,var(--success)_35%,transparent)]",
  warning:
    "text-[var(--warning)] bg-[color:color-mix(in_srgb,var(--warning)_14%,transparent)] border-[color:color-mix(in_srgb,var(--warning)_35%,transparent)]",
  danger:
    "text-[var(--danger)] bg-[color:color-mix(in_srgb,var(--danger)_14%,transparent)] border-[color:color-mix(in_srgb,var(--danger)_35%,transparent)]",
  info:
    "text-[var(--info)] bg-[color:color-mix(in_srgb,var(--info)_14%,transparent)] border-[color:color-mix(in_srgb,var(--info)_35%,transparent)]",
  default:
    "text-[var(--text-secondary)] bg-[var(--bg-hover)] border-[color:color-mix(in_srgb,var(--text-secondary)_30%,transparent)]",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <span
      key={`${status}-${displayLabel}`}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 status-transition ${toneClass[config.tone]}`}
    >
      <span className="text-sm">{config.dot}</span>
      {displayLabel}
    </span>
  );
}
