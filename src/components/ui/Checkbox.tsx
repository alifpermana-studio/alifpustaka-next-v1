import type { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  indeterminate = false,
  className = '',
  disabled = false,
  ...props
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      ref={(input) => {
        if (input) {
          input.indeterminate = indeterminate;
        }
      }}
      className={`h-4 w-4 rounded border-base-300 bg-base-200 text-accent focus:ring-2 focus:ring-accent focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
