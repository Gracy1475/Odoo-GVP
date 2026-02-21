"use client";

interface ExportPanelProps {
  title?: string;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  isLoading?: boolean;
  onExportSuccess?: (type: string) => void;
  onExportError?: (type: string, error?: Error) => void;
}

export function ExportPanel({
  title = "Export Data",
  onExportCSV,
  onExportPDF,
  isLoading = false,
  onExportSuccess,
  onExportError,
}: ExportPanelProps) {
  const handleExport = (type: "csv" | "pdf", handler?: () => void) => {
    if (!handler) {
      if (onExportSuccess) onExportSuccess(type.toUpperCase());
      return;
    }

    try {
      handler();
      if (onExportSuccess) onExportSuccess(type.toUpperCase());
    } catch (error) {
      if (onExportError) onExportError(type.toUpperCase(), error as Error);
    }
  };

  return (
    <div className="p-4 rounded-lg border border-slate-700 bg-slate-900/40">
      <h3 className="text-sm font-semibold text-slate-100 mb-3">{title}</h3>
      <div className="flex gap-2">
        <button
          onClick={() => handleExport("csv", onExportCSV)}
          disabled={isLoading}
          className="flex-1 px-3 py-2 rounded border border-slate-600 text-slate-300 text-xs font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          📊 CSV
        </button>
        <button
          onClick={() => handleExport("pdf", onExportPDF)}
          disabled={isLoading}
          className="flex-1 px-3 py-2 rounded border border-slate-600 text-slate-300 text-xs font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          📄 PDF
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-2">Data exports are generated locally in your browser</p>
    </div>
  );
}
