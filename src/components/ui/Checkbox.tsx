import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  error,
  checked,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 font-arabic" dir="rtl">
      <label
        htmlFor={checkboxId}
        className={`inline-flex items-start gap-2.5 cursor-pointer select-none text-right ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            checked={checked}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div className="w-4.5 h-4.5 rounded-md border border-[#CDC7BA] bg-[#FAF8F3] transition-all peer-checked:bg-[#00875A] peer-checked:border-[#00875A] peer-focus-visible:ring-2 peer-focus-visible:ring-[#00875A]/20 flex items-center justify-center">
            <Check className="w-3 h-3 text-white stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-xs font-bold text-[#181818] leading-snug">{label}</span>}
            {description && <span className="text-[11px] text-[#8C887F] leading-normal">{description}</span>}
          </div>
        )}
      </label>
      {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
