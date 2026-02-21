"use client";

import { ReactNode } from "react";

interface DetailsModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-96",
  md: "w-[600px]",
  lg: "w-[800px]",
  xl: "w-[1000px]",
};

export function DetailsModal({ isOpen, title, children, onClose, size = "md" }: DetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative ${sizeClasses[size]} max-h-[90vh] overflow-y-auto rounded-lg bg-slate-900 border border-slate-700 shadow-2xl animate-slideUp`}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-slate-900/95 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}
