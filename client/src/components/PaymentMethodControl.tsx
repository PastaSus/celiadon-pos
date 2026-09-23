import type { PaymentMethod } from '../../../shared/types';

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'e-wallet', label: 'E-Wallet' },
];

interface PaymentMethodControlProps {
  selected: PaymentMethod;
  onSelect: (value: PaymentMethod) => void;
}

// Cart-panel surface, so every segment clears the 44px touch floor (NFR11).
const SEGMENT =
  'inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full px-4 text-xs font-medium transition-[color,background-color,border-color,transform] duration-fast ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

/**
 * Segmented single-select for the payment method at checkout (FR14).
 * Cash is preselected by the parent and exactly one segment is active at
 * a time. Text labels only, never emoji (UX-DR8).
 */
export default function PaymentMethodControl({ selected, onSelect }: PaymentMethodControlProps) {
  const segmentClass = (value: PaymentMethod) =>
    `${SEGMENT} ${selected === value ? 'bg-brand text-white' : 'bg-white text-brand-strong hover:bg-brand-surface'}`;

  return (
    <div
      role="group"
      aria-label="Payment method"
      className="flex gap-2 rounded-lg bg-brand-subtle p-2"
    >
      {METHODS.map((method) => (
        <button
          key={method.value}
          type="button"
          aria-pressed={selected === method.value}
          onClick={() => onSelect(method.value)}
          className={segmentClass(method.value)}
        >
          {method.label}
        </button>
      ))}
    </div>
  );
}
