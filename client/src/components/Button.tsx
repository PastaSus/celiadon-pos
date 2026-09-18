import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'dangerGhost' | 'success' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover disabled:bg-slate-400',
  secondary: 'bg-line text-ink hover:bg-line-strong disabled:bg-slate-100',
  danger: 'bg-danger text-white hover:bg-danger-hover disabled:bg-slate-400',
  dangerGhost: 'text-danger hover:text-danger-text',
  success: 'bg-commit text-white hover:bg-commit-hover disabled:bg-slate-400',
  ghost: 'text-slate-500 hover:text-slate-800'
};

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-base font-bold'
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`rounded-lg transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}