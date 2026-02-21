"use client";

import { ReactNode } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: "border-red-500/60 bg-red-950/20",
    warning: "border-amber-500/60 bg-amber-950/20",
    info: "border-indigo-500/60 bg-indigo-950/20",
  };

  const buttonColors = {
    danger: "wire-button",
    warning: "wire-button",
    info: "wire-button",
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className={`wire-window max-w-sm p-6 space-y-4 ${variantStyles[variant]}`}>
        <h2 className="text-lg font-bold text-slate-100">{title}</h2>
        <p className="text-sm text-slate-300">{message}</p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`${buttonColors[variant]} flex-1 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="wire-button-alt flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
