import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-right font-arabic">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-[#181818] tracking-normal">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {rightIcon && (
          <div className="absolute right-4 text-[#8C887F] pointer-events-none flex items-center justify-center">
            {rightIcon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full rounded-full bg-[#FAF8F3] border text-[#181818] placeholder-[#A8A49A] text-xs sm:text-sm px-4 py-2.5 transition-all duration-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00875A] focus:border-[#00875A] disabled:opacity-50 disabled:bg-[#EFECE5] ${
            rightIcon ? 'pr-11' : ''
          } ${leftIcon ? 'pl-11' : ''} ${
            error ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-[#E8E3D8] hover:border-[#CDC7BA]'
          } ${className}`}
          {...props}
        />
        {leftIcon && (
          <div className="absolute left-4 text-[#8C887F] flex items-center justify-center">
            {leftIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-rose-600 font-bold mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#8C887F] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';


