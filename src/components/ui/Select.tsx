import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options = [],
  placeholder,
  className = '',
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-right font-arabic" dir="rtl">
      {label && (
        <label htmlFor={selectId} className="text-xs font-bold text-[#181818] tracking-normal">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        <select
          id={selectId}
          ref={ref}
          className={`w-full rounded-full bg-[#FAF8F3] border text-[#181818] text-xs sm:text-sm pl-10 pr-4 py-2.5 transition-all duration-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00875A] focus:border-[#00875A] disabled:opacity-50 disabled:bg-[#EFECE5] appearance-none cursor-pointer ${
            error ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-[#E8E3D8] hover:border-[#CDC7BA]'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-[#8C887F]">
              {placeholder}
            </option>
          )}
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute left-4 pointer-events-none text-[#8C887F]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="text-xs text-rose-600 font-bold mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#8C887F] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
