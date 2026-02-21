"use client";

import { ReactNode } from "react";

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close modal backdrop" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="wire-window animate-slideUp relative z-10 w-full max-w-lg p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="wire-button-alt !h-9 !min-h-9">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
