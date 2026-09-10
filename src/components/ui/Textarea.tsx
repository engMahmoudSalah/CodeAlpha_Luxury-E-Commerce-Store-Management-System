import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-right font-arabic" dir="rtl">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-bold text-[#181818] tracking-normal">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        rows={rows}
        className={`w-full rounded-2xl bg-[#FAF8F3] border text-[#181818] placeholder-[#A8A49A] text-xs sm:text-sm p-3.5 transition-all duration-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00875A] focus:border-[#00875A] disabled:opacity-50 disabled:bg-[#EFECE5] resize-y ${
          error ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-[#E8E3D8] hover:border-[#CDC7BA]'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-600 font-bold mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#8C887F] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';
