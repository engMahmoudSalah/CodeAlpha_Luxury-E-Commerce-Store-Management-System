import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div
          className={`w-screen ${sizeClasses[size]} bg-white shadow-2xl flex flex-col border-r border-[#E8E3D8] animate-slideInLeft`}
        >
          {/* Header */}
          <div className="p-5 border-b border-[#E8E3D8] bg-[#FAF8F3] flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#181818]">{title}</h3>
              {subtitle && <p className="text-xs text-[#6B6860] mt-0.5">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#9E9A90] hover:text-[#181818] hover:bg-[#F3EFE6] rounded-xl transition-colors"
              aria-label="إغلاق اللوحة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">{children}</div>

          {/* Footer actions */}
          {footer && (
            <div className="p-4 border-t border-[#E8E3D8] bg-[#FAF8F3] flex items-center justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
