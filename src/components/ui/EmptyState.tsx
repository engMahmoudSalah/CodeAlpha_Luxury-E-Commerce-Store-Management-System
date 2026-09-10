import React from 'react';
import { Button } from './Button';

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-14 rounded-3xl bg-white border border-[#E8E3D8] my-6 shadow-2xs font-arabic ${className}`}>
      {icon && (
        <div className="w-14 h-14 rounded-full bg-[#FAF8F3] border border-[#E8E3D8] flex items-center justify-center text-[#181818] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg sm:text-xl font-extrabold text-[#181818] mb-2 tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-[#5A5852] max-w-md mb-6 leading-relaxed">{description}</p>
      )}
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};


