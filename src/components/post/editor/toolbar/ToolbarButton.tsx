import clsx from "clsx";
import React from "react";

const BUTTON_BASE =
  "text-sm px-2 py-1 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 active:scale-95 transition";

export const ToolbarButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, ...props }) => (
  <button
    type="button"
    className={clsx(BUTTON_BASE, "shadow-sm", className)}
    {...props}
  >
    {children}
  </button>
);
