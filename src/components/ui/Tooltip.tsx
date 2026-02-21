"use client";

import { ReactNode, useState } from "react";

export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span className="animate-fadeIn absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-xs -translate-x-1/2 rounded-[12px] border border-[color:color-mix(in_srgb,var(--accent-primary)_30%,transparent)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-secondary)] shadow-[var(--shadow-elevated)]">
          {content}
        </span>
      )}
    </span>
  );
}
