import type { ReactNode } from 'react';

interface ChartPanelProps {
  title: string;
  loading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  actions?: ReactNode;
  children: ReactNode;
}

// Reusable titled wrapper for every Epic 4 chart: title at section scale,
// stable-height frame so filtering never makes the page jump, skeleton while
// loading, and "No sales in this range" instead of bare axes on empty windows.
export default function ChartPanel({
  title,
  loading = false,
  isEmpty = false,
  emptyMessage = 'No sales in this range',
  actions,
  children
}: ChartPanelProps) {
  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {actions}
      </div>
      <div className="h-72 w-full">
        {loading ? (
          <div className="h-full w-full animate-pulse" aria-label="Loading chart">
            <div className="h-4 w-1/3 rounded bg-slate-200 mb-4" />
            <div className="h-48 rounded bg-slate-100" />
            <div className="mt-4 h-4 w-2/3 rounded bg-slate-200" />
          </div>
        ) : isEmpty ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
