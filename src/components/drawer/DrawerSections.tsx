"use client";

interface SummaryItem {
  label: string;
  value: string;
}

interface MetricItem {
  label: string;
  value: string;
  tone?: "default" | "good" | "warning" | "danger";
}

interface TimelineItem {
  date: string;
  label: string;
  status?: string;
}

const toneClass: Record<NonNullable<MetricItem["tone"]>, string> = {
  default: "text-slate-100",
  good: "text-emerald-300",
  warning: "text-amber-300",
  danger: "text-red-300",
};

export function DrawerSummary({ items }: { items: SummaryItem[] }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Summary</h3>
      <div className="grid gap-2 rounded-lg border border-slate-700/80 bg-slate-900/60 p-3 text-xs">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-2 last:border-b-0 last:pb-0">
            <span className="text-slate-400">{item.label}</span>
            <span className="text-right font-semibold text-slate-100">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DrawerMetrics({ items }: { items: MetricItem[] }) {
  return (
    <section className="mt-4 space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Performance Metrics</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-700/70 bg-slate-900/55 p-3">
            <p className="text-[11px] text-slate-400">{item.label}</p>
            <p className={`mt-1 text-sm font-semibold ${toneClass[item.tone ?? "default"]}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DrawerHistory({ title, rows }: { title: string; rows: string[] }) {
  return (
    <section className="mt-4 space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-cyan-300">{title}</h3>
      <div className="rounded-lg border border-slate-700/70 bg-slate-900/55 p-3">
        <ul className="space-y-2 text-xs text-slate-300">
          {rows.map((row, index) => (
            <li key={`${row}-${index}`} className="border-b border-slate-800/80 pb-2 last:border-b-0 last:pb-0">
              {row}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function DrawerTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <section className="mt-4 space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Status Timeline</h3>
      <div className="space-y-2 rounded-lg border border-slate-700/70 bg-slate-900/55 p-3">
        {items.map((item, index) => (
          <div key={`${item.date}-${item.label}-${index}`} className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-100">{item.label}</p>
              <p className="text-[11px] text-slate-400">{item.date}</p>
              {item.status && <p className="text-[11px] text-slate-300">{item.status}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
