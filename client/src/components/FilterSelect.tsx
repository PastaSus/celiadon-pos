import { ChevronDown } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  /** Programmatic name; the first option's own label carries the visible meaning. */
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  className?: string;
}

/**
 * A native select wearing the input tokens (UX-DR5). Never a custom dropdown:
 * the native control is faster on a tablet and needs no keyboard work, which is
 * why the platform arrow is replaced with a decorative chevron and nothing else.
 */
export default function FilterSelect({
  label,
  value,
  options,
  onChange,
  className = ''
}: FilterSelectProps) {
  // Derived from the label so each select on a surface gets its own linked label.
  const id = `filter-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border border-line-strong rounded-lg bg-white pl-3 pr-9 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={20}
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </div>
  );
}