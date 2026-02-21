"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

export function Dropdown({
  trigger,
  children,
}: {
  trigger: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex">
      <button onClick={() => setOpen((prev) => !prev)} className="wire-button-alt !h-9 !min-h-9">
        {trigger}
      </button>
      {open && (
        <div className="animate-fadeIn absolute right-0 top-10 z-50 min-w-40 rounded-[12px] border border-[color:color-mix(in_srgb,var(--accent-primary)_25%,transparent)] bg-[var(--bg-card)] p-1 shadow-[var(--shadow-elevated)]">
          {children}
        </div>
      )}
    </div>
  );
}
