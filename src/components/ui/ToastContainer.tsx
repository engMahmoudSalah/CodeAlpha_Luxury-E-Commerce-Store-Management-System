import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />,
    info: <Info className="w-4.5 h-4.5 text-[#18181B] shrink-0" />
  };

  const borders = {
    success: 'border-emerald-200 bg-white text-[#18181B]',
    error: 'border-rose-200 bg-white text-[#18181B]',
    warning: 'border-amber-200 bg-white text-[#18181B]',
    info: 'border-[#E4E4E7] bg-white text-[#18181B]'
  };

  return (
    <div
      id="toast-container"
      className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      dir="rtl"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 p-4 rounded-[3px] border shadow-xl text-[#18181B] transition-all duration-300 transform translate-y-0 opacity-100 ${
            borders[toast.type]
          }`}
        >
          {icons[toast.type]}
          <p className="text-xs sm:text-sm font-medium leading-snug flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            aria-label="إغلاق التنبيه"
            className="text-[#71717A] hover:text-[#18181B] p-1 rounded-[2px] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

