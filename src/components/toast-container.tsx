"use client";

import { useToast } from "@/context/toast-context";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const bgColor = {
          success: "bg-emerald-500/90",
          error: "bg-red-500/90",
          warning: "bg-amber-500/90",
          info: "bg-blue-500/90",
        }[toast.type];

        const iconSymbol = {
          success: "✓",
          error: "✕",
          warning: "⚠",
          info: "ℹ",
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border border-white/10 flex items-center gap-3 pointer-events-auto animate-slideUp`}
          >
            <span className="text-lg font-bold">{iconSymbol}</span>
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
