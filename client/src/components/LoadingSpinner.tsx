interface LoadingSpinnerProps {
  label?: string;
}

export default function LoadingSpinner({ label = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-brand" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}