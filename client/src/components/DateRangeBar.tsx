import FilterSelect from './FilterSelect';

export type RangePreset = 'today' | '7' | '30' | '90' | 'custom';

export interface DateRange {
  from: string;
  to: string;
}

interface DateRangeBarProps {
  from: string;
  to: string;
  preset: RangePreset;
  onChange: (range: DateRange, preset: RangePreset) => void;
}

const PRESETS: { value: Exclude<RangePreset, 'custom'>; label: string; days: number }[] = [
  { value: 'today', label: 'Today', days: 1 },
  { value: '7', label: '7 days', days: 7 },
  { value: '30', label: '30 days', days: 30 },
  { value: '90', label: '90 days', days: 90 }
];

function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function shiftISODate(isoDate: string, deltaDays: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + deltaDays);
  return toISODate(date);
}

export function defaultRange(): DateRange {
  const to = toISODate(new Date());
  return { from: shiftISODate(to, -29), to };
}

/**
 * Shared time window (UX-DR11): preset chips styled like the POS category
 * chips plus two native date inputs. Typing switches to Custom; a start past
 * the end moves the other endpoint instead of erroring. Endpoints inclusive.
 */
export default function DateRangeBar({ from, to, preset, onChange }: DateRangeBarProps) {
  const today = toISODate(new Date());

  const applyPreset = (days: number, value: RangePreset) => {
    onChange({ from: shiftISODate(today, -(days - 1)), to: today }, value);
  };

  const handlePresetSelect = (value: string) => {
    if (value === 'custom') {
      onChange({ from, to }, 'custom');
      return;
    }
    const option = PRESETS.find((entry) => entry.value === value);
    if (option) applyPreset(option.days, option.value);
  };

  const handleFromChange = (value: string) => {
    if (value === '') return;
    onChange({ from: value, to: value > to ? value : to }, 'custom');
  };

  const handleToChange = (value: string) => {
    if (value === '') return;
    onChange({ from: value < from ? value : from, to: value }, 'custom');
  };

  const chipClass = (active: boolean) =>
    `inline-flex min-h-[44px] items-center rounded-full px-4 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
      active ? 'bg-brand text-white' : 'bg-white text-brand-strong hover:bg-brand-surface'
    }`;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <FilterSelect
        label="Date range preset"
        value={preset}
        onChange={handlePresetSelect}
        options={[
          ...PRESETS.map((option) => ({ value: option.value, label: option.label })),
          { value: 'custom', label: 'Custom' }
        ]}
        className="w-full md:hidden"
      />
      <div className="hidden md:flex flex-wrap gap-2 rounded-lg bg-brand-subtle p-2" role="group" aria-label="Date range presets">
        {PRESETS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={preset === option.value}
            onClick={() => applyPreset(option.days, option.value)}
            className={chipClass(preset === option.value)}
          >
            {option.label}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={preset === 'custom'}
          onClick={() => onChange({ from, to }, 'custom')}
          className={chipClass(preset === 'custom')}
        >
          Custom
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div>
          <label htmlFor="range-from" className="sr-only">
            Start date
          </label>
          <input
            id="range-from"
            type="date"
            value={from}
            max={today}
            onChange={(e) => handleFromChange(e.target.value)}
            className="border-line-strong border rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <span aria-hidden="true" className="text-sm text-slate-600">
          to
        </span>
        <div>
          <label htmlFor="range-to" className="sr-only">
            End date
          </label>
          <input
            id="range-to"
            type="date"
            value={to}
            max={today}
            onChange={(e) => handleToChange(e.target.value)}
            className="border-line-strong border rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>
    </div>
  );
}
