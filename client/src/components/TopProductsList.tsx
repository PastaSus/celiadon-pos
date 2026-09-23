import type { TopProduct } from '../../../shared/types';
import { formatCurrency } from '../lib/api';

interface TopProductsListProps {
  items: (TopProduct & { rank: number })[];
}

// Ranked bar-list for the Dashboard top-products panel: each row carries its
// share of the top revenue as a background fill, so the list reads as a bar
// chart and a table at once. Fits the fixed ChartPanel frame; the panel owns
// the loading and empty states, so this renders data rows only.
export default function TopProductsList({ items }: TopProductsListProps) {
  const max = Math.max(1, ...items.map((item) => item.revenue));

  return (
    <ol className="flex h-full flex-col justify-between gap-1">
      {items.map((item) => (
        <li
          key={item.product_id}
          className="relative flex-1 overflow-hidden rounded-md"
        >
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 rounded-md bg-brand-subtle"
            style={{ width: `${Math.max(4, (item.revenue / max) * 100)}%` }}
          />
          <div className="relative flex h-full items-center gap-3 px-3 py-1.5">
            <span className="w-6 shrink-0 text-sm font-extrabold tabular-nums text-slate-600">
              {item.rank}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-800">
                {item.product_name}
              </span>
              <span className="block text-xs tabular-nums text-slate-600">
                {item.quantity} sold
              </span>
            </span>
            <span className="shrink-0 text-sm font-bold tabular-nums text-slate-800">
              {formatCurrency(item.revenue)}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
