import React, { useState } from 'react';
import { LucideIcon, UploadCloud, X, AlertCircle } from 'lucide-react';

// ============================================================================
// 1. ADMIN INPUT
// ============================================================================

export interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: LucideIcon;
  suffix?: string;
  required?: boolean;
}

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, helperText, error, icon: Icon, suffix, required, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5" dir="rtl">
        {label && (
          <label className="block text-xs font-bold text-[#181818]">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <div className="relative rounded-xl">
          {Icon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E9A90] pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}

          <input
            ref={ref}
            className={`w-full py-2.5 px-3.5 text-xs bg-[#FAF8F3] hover:bg-[#F3EFE6] focus:bg-white border rounded-xl transition-all text-[#181818] placeholder:text-[#9E9A90] outline-none ${
              Icon ? 'pr-10' : ''
            } ${suffix ? 'pl-12' : ''} ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/30'
                : 'border-[#E8E3D8] focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/20'
            } ${className}`}
            {...props}
          />

          {suffix && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6B6860] pointer-events-none">
              {suffix}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-[#6B6860]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
AdminInput.displayName = 'AdminInput';

// ============================================================================
// 2. ADMIN TEXTAREA
// ============================================================================

export interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const AdminTextarea = React.forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ label, helperText, error, required, className = '', rows = 4, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5" dir="rtl">
        {label && (
          <label className="block text-xs font-bold text-[#181818]">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          rows={rows}
          className={`w-full py-2.5 px-3.5 text-xs bg-[#FAF8F3] hover:bg-[#F3EFE6] focus:bg-white border rounded-xl transition-all text-[#181818] placeholder:text-[#9E9A90] outline-none resize-y ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/30'
              : 'border-[#E8E3D8] focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/20'
          } ${className}`}
          {...props}
        />

        {error ? (
          <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-[#6B6860]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
AdminTextarea.displayName = 'AdminTextarea';

// ============================================================================
// 3. ADMIN SELECT
// ============================================================================

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  required?: boolean;
}

export const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ label, helperText, error, options, required, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5" dir="rtl">
        {label && (
          <label className="block text-xs font-bold text-[#181818]">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <select
          ref={ref}
          className={`w-full py-2.5 px-3.5 text-xs bg-[#FAF8F3] hover:bg-[#F3EFE6] focus:bg-white border rounded-xl transition-all text-[#181818] outline-none cursor-pointer ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-[#E8E3D8] focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/20'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error ? (
          <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-[#6B6860]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
AdminSelect.displayName = 'AdminSelect';

// ============================================================================
// 4. ADMIN TOGGLE SWITCH
// ============================================================================

export interface AdminToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const AdminToggle: React.FC<AdminToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <label
      className={`flex items-start justify-between gap-4 p-3.5 rounded-xl border border-[#E8E3D8] bg-white transition-all select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#00875A]/40'
      }`}
      dir="rtl"
    >
      <div className="flex flex-col">
        <span className="text-xs font-bold text-[#181818]">{label}</span>
        {description && <span className="text-[11px] text-[#6B6860] mt-0.5">{description}</span>}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }}
        className={`w-11 h-6 shrink-0 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#00875A]/20 ${
          checked ? 'bg-[#00875A]' : 'bg-[#DCD8CD]'
        }`}
      >
        <span
          className={`block w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
            checked ? '-translate-x-6' : '-translate-x-1'
          } top-1 absolute`}
        />
      </button>
    </label>
  );
};

// ============================================================================
// 5. ADMIN CURRENCY INPUT (ر.س)
// ============================================================================

export interface AdminCurrencyInputProps extends Omit<AdminInputProps, 'type'> {
  value?: number;
  onCurrencyChange?: (val: number) => void;
}

export const AdminCurrencyInput: React.FC<AdminCurrencyInputProps> = ({
  value,
  onCurrencyChange,
  onChange,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onCurrencyChange) {
      const num = parseFloat(e.target.value) || 0;
      onCurrencyChange(num);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <AdminInput
      type="number"
      step="0.01"
      min="0"
      suffix="ر.س"
      value={value !== undefined ? value : ''}
      onChange={handleChange}
      {...props}
    />
  );
};

// ============================================================================
// 6. ADMIN TAG INPUT
// ============================================================================

export interface AdminTagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  helperText?: string;
}

export const AdminTagInput: React.FC<AdminTagInputProps> = ({
  label,
  tags,
  onChange,
  placeholder = 'أضف وسماً واضغط Enter...',
  helperText,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed && !tags.includes(trimmed)) {
        onChange([...tags, trimmed]);
        setInputValue('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="w-full space-y-1.5" dir="rtl">
      {label && <label className="block text-xs font-bold text-[#181818]">{label}</label>}

      <div className="min-h-[44px] p-2 bg-[#FAF8F3] border border-[#E8E3D8] rounded-xl flex flex-wrap items-center gap-1.5 focus-within:border-[#00875A] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00875A]/20 transition-all">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E6F4EE] text-[#00875A] text-xs font-semibold border border-[#00875A]/20"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-rose-600 focus:outline-none"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-xs text-[#181818] placeholder:text-[#9E9A90] outline-none px-1"
        />
      </div>

      {helperText && <p className="text-[11px] text-[#6B6860]">{helperText}</p>}
    </div>
  );
};

// ============================================================================
// 7. ADMIN FILE UPLOAD DROPZONE
// ============================================================================

export interface AdminFileUploadProps {
  label?: string;
  onFilesSelected?: (files: FileList | null) => void;
  helperText?: string;
  accept?: string;
  multiple?: boolean;
}

export const AdminFileUpload: React.FC<AdminFileUploadProps> = ({
  label,
  onFilesSelected,
  helperText = 'PNG, JPG, WEBP حتى 10 ميغابايت',
  accept = 'image/*',
  multiple = true,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onFilesSelected) onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full space-y-1.5" dir="rtl">
      {label && <label className="block text-xs font-bold text-[#181818]">{label}</label>}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-[#00875A] bg-[#E6F4EE]/50'
            : 'border-[#DCD8CD] hover:border-[#00875A]/50 bg-[#FAF8F3]'
        }`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => onFilesSelected && onFilesSelected(e.target.files)}
          className="hidden"
          id="admin-file-upload-input"
        />
        <label htmlFor="admin-file-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E3D8] text-[#00875A] flex items-center justify-center shadow-sm">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#00875A] hover:underline">انقر لرفع الملفات</span>
            <span className="text-xs text-[#6B6860]"> أو اسحب الصور هنا</span>
          </div>
          <p className="text-[11px] text-[#9E9A90]">{helperText}</p>
        </label>
      </div>
    </div>
  );
};
