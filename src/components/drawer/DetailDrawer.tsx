"use client";

import { ReactNode } from "react";

interface DetailDrawerProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

export function DetailDrawer({ isOpen, title, subtitle, onClose, children }: DetailDrawerProps) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/55 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-xl border-l border-indigo-500/30 bg-slate-950/95 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-slate-700/80 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100">{title}</h2>
              {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </div>
      </aside>
    </>
  );
}
