"use client";

export function KpiCard({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <div className="wire-panel wire-panel-hover slide-up text-center">
      <p className="text-[11px] font-medium text-[var(--text-muted)]">{title}</p>
      <h3 key={value} className={`mt-2 text-2xl font-semibold ${accent} value-transition`}>
        {value}
      </h3>
    </div>
  );
}
