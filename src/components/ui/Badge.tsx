import type { ReactNode } from "react";

const variants = {
  success: "bg-success/15 text-success border-success/20",
  warning: "bg-warning/15 text-warning border-warning/20",
  danger: "bg-danger/15 text-danger border-danger/20",
  info: "bg-info/15 text-info border-info/20",
  neutral: "bg-surface-700/60 text-surface-300 border-surface-600/50",
  accent: "bg-accent/15 text-accent-soft border-accent/25",
} as const;

interface BadgeProps {
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
}

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
} as const;

export function Badge({
  size = "sm",
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`${sizes[size]} inline-flex items-center rounded-full border font-medium tracking-wide ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
