import type { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary:
    'bg-accent text-white hover:bg-accent-soft shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_10px_30px_rgba(99,102,241,0.25)]',
  secondary: 'bg-surface-800 text-surface-200 hover:bg-surface-750 border border-surface-700',
  ghost: 'bg-transparent text-surface-300 hover:bg-surface-800 hover:text-white',
  danger: 'bg-danger/15 text-danger hover:bg-danger/25 border border-danger/20',
} as const;

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
