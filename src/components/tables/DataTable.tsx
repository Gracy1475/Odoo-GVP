"use client";

import { ReactNode, useMemo } from "react";
import { usePagination } from "@/hooks/usePagination";

export interface DataTableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T extends Record<string, any>> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  itemsPerPage?: number;
  onRowClick?: (row: T) => void;
  showPagination?: boolean;
  hoverable?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  isEmpty = false,
  emptyMessage = "No data found",
  itemsPerPage = 10,
  onRowClick,
  showPagination = true,
  hoverable = true,
}: DataTableProps<T>) {
  const pagination = usePagination(data, itemsPerPage);

  const alignClass = (align?: "left" | "center" | "right"): string => {
    const classes = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    };
    return classes[align || "left"];
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-700/30 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (isEmpty || data.length === 0) {
    return <div className="p-6 text-center text-slate-400">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full border-collapse text-left text-xs">
          {/* Header */}
          <thead className="bg-slate-900/80 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`border-b border-slate-700 px-4 py-3 text-cyan-300 font-semibold ${alignClass(col.align)} ${col.width ? `w-${col.width}` : ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {pagination.paginatedItems.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-slate-800 ${
                  hoverable ? "wire-table-row-hover" : ""
                } ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-4 py-3 text-slate-300 ${alignClass(col.align)}`}
                  >
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/40 rounded border border-slate-700">
          <div className="text-xs text-slate-400">
            Showing {pagination.startIndex + 1}–{pagination.endIndex} of {pagination.totalItems} items
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={pagination.goToPrevPage}
              disabled={!pagination.canGoPrev}
              className="px-3 py-1 rounded border border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
            >
              ← Prev
            </button>

            <div className="text-xs text-slate-400 px-2">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>

            <button
              onClick={pagination.goToNextPage}
              disabled={!pagination.canGoNext}
              className="px-3 py-1 rounded border border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
            >
              Next →
            </button>
          </div>

          {/* Items Per Page Selector */}
          <select
            value={pagination.itemsPerPage}
            onChange={(e) => {
              const interval = setInterval(() => {
                const select = document.querySelector('select');
                if (select) {
                  const newValue = parseInt(e.target.value);
                  // This would require passing a setter from parent - for now, just show UI
                }
              }, 0);
              clearInterval(interval);
            }}
            className="px-2 py-1 rounded border border-slate-600 bg-slate-900 text-slate-300 text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      )}
    </div>
  );
}
