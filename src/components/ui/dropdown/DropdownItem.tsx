import type React from "react";
import Link from "next/link";

interface DropdownItemProps {
  tag?: "a" | "button";
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  onItemClick?: () => void;
  baseClassName?: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  tag = "button",
  href,
  onClick,
  onItemClick,
  baseClassName = "block w-full text-left px-4 py-2 text-sm",
  className = "",
  children,
  disabled = false,
}) => {
  const combinedClasses = `${baseClassName} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-base-300 text-base-content"}`.trim();

  const handleClick = (event: React.MouseEvent) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    if (tag === "button") {
      event.preventDefault();
    }
    if (onClick) onClick(event);
    if (onItemClick) onItemClick();
  };

  if (tag === "a" && href && !disabled) {
    return (
      <Link href={href} className={combinedClasses} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={handleClick} className={combinedClasses} disabled={disabled}>
      {children}
    </button>
  );
};
