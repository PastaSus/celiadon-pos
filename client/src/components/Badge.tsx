import type { ReactNode } from 'react';

export type Tone = 'green' | 'yellow' | 'red' | 'indigo' | 'gray';

const TONES: Record<Tone, string> = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  gray: 'bg-gray-100 text-gray-800'
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