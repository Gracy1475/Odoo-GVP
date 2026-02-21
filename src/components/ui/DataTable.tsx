import { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

export function DataTable<T>({ columns, rows, emptyText = "No records" }: { columns: Column<T>[]; rows: T[]; emptyText?: string }) {
  if (!rows.length) {
    return <div className="wire-window p-6 text-center text-sm text-[var(--text-muted)]">{emptyText}</div>;
  }

  return (
    <div className="wire-window overflow-hidden">
      <div className="mobile-scroll hidden md:block">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="border-b px-3 py-2 font-semibold border-[color:color-mix(in_srgb,var(--accent-primary)_25%,transparent)]">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="wire-table-row-hover border-b border-[color:color-mix(in_srgb,var(--accent-primary)_16%,transparent)]">
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2 text-[var(--text-primary)]">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 p-2 md:hidden">
        {rows.map((row, index) => (
          <div key={index} className="rounded-[12px] border border-[color:color-mix(in_srgb,var(--accent-primary)_25%,transparent)] bg-[var(--bg-card)] p-3">
            {columns.map((column) => (
              <div key={column.key} className="flex items-start justify-between gap-3 py-1">
                <span className="text-[11px] font-semibold text-[var(--text-muted)]">{column.header}</span>
                <span className="text-xs text-[var(--text-primary)]">{column.render(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
