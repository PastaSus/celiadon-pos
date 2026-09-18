import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Fired debounced after typing stops; parents wire this to filtering. */
  onSearch: (term: string) => void;
  debounceMs?: number;
  placeholder?: string;
  ariaLabel?: string;
}

export default function SearchInput({
  value,
  onChange,
  onSearch,
  debounceMs = 200,
  placeholder = 'Search...',
  ariaLabel
}: SearchInputProps) {
  // Ref-held so an inline parent callback never resets the debounce timer.
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;
  // The parent loads its own initial list; no search fires on mount.
  const firstRun = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const timer = setTimeout(() => onSearchRef.current(value), debounceMs);
    return () => clearTimeout(timer);
  }, [value, debounceMs]);

  const clear = () => {
    onChange('');
    onSearchRef.current('');
    // The clear button unmounts when empty, so park focus back in the field.
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <Search
        size={20}
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && value !== '') clear();
        }}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="w-full border-line-strong border rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
      />
      {value !== '' && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center min-h-[44px] min-w-[44px] text-slate-500 hover:text-slate-800"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
