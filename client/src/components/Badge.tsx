import type { ReactNode } from 'react';

export type Tone = 'green' | 'yellow' | 'red' | 'indigo' | 'gray';

const TONES: Record<Tone, string> = {
  green: 'bg-commit-surface text-commit-text',
  yellow: 'bg-warning-surface text-warning-text',
  red: 'bg-danger-surface text-danger-text',
  indigo: 'bg-brand-surface text-brand-strong',
  gray: 'bg-canvas text-slate-800'
};

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
}

export default function Badge({ tone = 'gray', children }: BadgeProps) {
  return <span className={`px-2 py-1 text-xs rounded-full ${TONES[tone]}`}>{children}</span>;
}

export type StockStatus = 'out' | 'low' | 'healthy';

/**
 * The single stock decision, driven by the product's own reorder_level rather
 * than a hardcoded threshold. Tone and wording both derive from here so a badge,
 * its label, and the low-stock filter can never disagree.
 */
export function stockStatus(quantity: number, reorderLevel = 10): StockStatus {
  if (quantity <= 0) return 'out';
  if (quantity <= reorderLevel) return 'low';
  return 'healthy';
}

export function stockTone(quantity: number, reorderLevel = 10): Tone {
  const status = stockStatus(quantity, reorderLevel);
  if (status === 'out') return 'red';
  if (status === 'low') return 'yellow';
  return 'green';
}