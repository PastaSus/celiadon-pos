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

/**
 * Stock tone driven by the product's own reorder_level rather than a hardcoded
 * threshold, so CAP-5's configurable reordering needs no rewrite here.
 */
export function stockTone(quantity: number, reorderLevel = 10): Tone {
  if (quantity <= 0) return 'red';
  if (quantity <= reorderLevel) return 'yellow';
  return 'green';
}