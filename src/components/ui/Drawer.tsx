"use client";

import { ReactNode } from "react";

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <button
        aria-label="Close drawer backdrop"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-xl border-l border-[color:color-mix(in_srgb,var(--accent-primary)_30%,transparent)] bg-[var(--bg-secondary)] shadow-[var(--shadow-elevated)] transition-transform duration-200 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="wire-titlebar">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="wire-button-alt !h-9 !min-h-9">Close</button>
        </div>
        <div className="h-[calc(100%-60px)] overflow-auto p-4">{children}</div>
      </aside>
    </>
  );
}
