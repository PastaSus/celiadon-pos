interface StatCardProps {
  label: string;
  value: string;
  toneClass: string;
}

// Glanceable metric tile (UX-DR9): caption-scale muted label with a tone dot,
// value at numeric-lg with tabular figures. Never a button.
export default function StatCard({ label, value, toneClass }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${toneClass}`} />
        <p className="text-sm text-slate-500">{label}</p>
      </div>
      <p aria-live="polite" className="mt-2 text-2xl font-extrabold tabular-nums text-slate-800">{value}</p>
    </div>
  );
}
