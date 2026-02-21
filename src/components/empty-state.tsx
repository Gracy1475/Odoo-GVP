"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "📋",
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-slate-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 text-center max-w-sm mb-6">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="wire-button">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function LoadingEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 border-3 border-transparent border-t-indigo-500 border-r-indigo-500 rounded-full animate-spin mb-4"></div>
      <p className="text-sm text-slate-400">Loading data...</p>
    </div>
  );
}
