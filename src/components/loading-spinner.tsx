"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({ size = "md", label }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 border-3 border-transparent border-t-indigo-500 border-r-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-1 border-3 border-transparent border-b-cyan-500 border-l-cyan-500 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
      </div>
      {label && <p className="text-sm font-medium text-slate-300">{label}</p>}
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
      <LoadingSpinner size="lg" label="Loading..." />
    </div>
  );
}

export function LoadingSkeletonRow() {
  return (
    <tr className="border-b border-slate-800">
      <td className="px-3 py-2">
        <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-24 animate-pulse"></div>
      </td>
      <td className="px-3 py-2">
        <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-32 animate-pulse"></div>
      </td>
      <td className="px-3 py-2">
        <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-28 animate-pulse"></div>
      </td>
      <td className="px-3 py-2">
        <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-20 animate-pulse"></div>
      </td>
    </tr>
  );
}
