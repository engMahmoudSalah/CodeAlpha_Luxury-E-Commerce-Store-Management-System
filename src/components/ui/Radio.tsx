import React, { forwardRef } from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  label,
  description,
  checked,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const radioId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label
      htmlFor={radioId}
      className={`inline-flex items-start gap-2.5 cursor-pointer select-none text-right font-arabic ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      dir="rtl"
    >
      <div className="relative flex items-center justify-center shrink-0 mt-0.5">
        <input
          type="radio"
          id={radioId}
          ref={ref}
          checked={checked}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div className="w-4.5 h-4.5 rounded-full border border-[#CDC7BA] bg-[#FAF8F3] transition-all peer-checked:border-[#00875A] peer-focus-visible:ring-2 peer-focus-visible:ring-[#00875A]/20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#00875A] opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
      </div>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-xs font-bold text-[#181818] leading-snug">{label}</span>}
          {description && <span className="text-[11px] text-[#8C887F] leading-normal">{description}</span>}
        </div>
      )}
    </label>
  );
});

Radio.displayName = 'Radio';
