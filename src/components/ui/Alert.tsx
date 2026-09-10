import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const typeStyles = {
    info: {
      container: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E3A8A]',
      icon: <Info className="w-4 h-4 text-[#2563EB] shrink-0" />,
      titleColor: 'text-[#1E40AF]',
    },
    success: {
      container: 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]',
      icon: <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />,
      titleColor: 'text-[#065F46]',
    },
    warning: {
      container: 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]',
      icon: <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />,
      titleColor: 'text-[#92400E]',
    },
    error: {
      container: 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]',
      icon: <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />,
      titleColor: 'text-[#991B1B]',
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={`relative flex items-start gap-3 p-4 rounded-2xl border text-xs leading-relaxed font-arabic ${style.container} ${className}`}
      dir="rtl"
      role="alert"
    >
      <div className="mt-0.5">{style.icon}</div>
      <div className="flex-1">
        {title && <h5 className={`font-bold mb-0.5 text-xs sm:text-sm ${style.titleColor}`}>{title}</h5>}
        <div className="opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق التنبيه"
          className="text-current opacity-60 hover:opacity-100 transition-opacity cursor-pointer p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
