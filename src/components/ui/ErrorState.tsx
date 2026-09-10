import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'حدث خطأ أثناء تحميل البيانات',
  message = 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-rose-50/50 border border-rose-200 my-6 shadow-2xs font-arabic ${className}`}
      dir="rtl"
    >
      <div className="w-14 h-14 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-lg sm:text-xl font-extrabold text-[#181818] mb-2 tracking-tight">
        {title}
      </h3>
      {message && (
        <p className="text-xs sm:text-sm text-[#5A5852] max-w-md mb-6 leading-relaxed">
          {message}
        </p>
      )}
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
};
