import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = "", padding = true }: CardProps) {
  return (
    <div
      className={`glass rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] ${padding ? "p-5 md:p-6" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-accent text-base font-semibold">{title}</h3>
        {description ? (
          <p className="text-base-content mt-1 text-sm">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
