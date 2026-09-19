import type { Category } from '../../../shared/types';

interface CategoryChipsProps {
  categories: Category[];
  /** 'all' or the category id as a string, so it drops straight into filter state. */
  selected: string;
  onSelect: (value: string) => void;
}

// POS-only surface, so every chip clears the 44px touch floor (NFR11).
const CHIP =
  'inline-flex min-h-[44px] items-center rounded-full px-4 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

/**
 * Filters the already-loaded POS grid client-side, issuing no request
 * (UX-DR6). Exactly one chip is active at a time and "All" is the default.
 */
export default function CategoryChips({ categories, selected, onSelect }: CategoryChipsProps) {
  const chipClass = (value: string) =>
    `${CHIP} ${selected === value ? 'bg-brand text-white' : 'bg-white text-brand-strong hover:bg-brand-surface'}`;

  return (
    <div
      role="group"
      aria-label="Filter products by category"
      className="flex flex-wrap gap-2 rounded-lg bg-brand-subtle p-2"
    >
      <button
        type="button"
        aria-pressed={selected === 'all'}
        onClick={() => onSelect('all')}
        className={chipClass('all')}
      >
        All
      </button>
      {categories.map((category) => {
        const value = String(category.id);
        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={selected === value}
            onClick={() => onSelect(value)}
            className={chipClass(value)}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}