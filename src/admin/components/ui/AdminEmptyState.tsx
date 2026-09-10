import React from 'react';
import { LucideIcon, PackageSearch } from 'lucide-react';
import { AdminButton } from './AdminButton';

interface AdminEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon: Icon = PackageSearch,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-dashed border-[#D8D2C5] ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#F5F2EA] border border-[#E8E3D8] flex items-center justify-center text-[#00875A] mb-4 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-[#181818] tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#6B6860] max-w-sm mt-1.5 leading-relaxed font-normal">
        {description}
      </p>

      {(actionText || secondaryActionText) && (
        <div className="flex items-center gap-3 mt-6 flex-wrap justify-center">
          {secondaryActionText && (
            <AdminButton
              variant="outline"
              size="md"
              onClick={onSecondaryAction}
            >
              {secondaryActionText}
            </AdminButton>
          )}
          {actionText && (
            <AdminButton
              variant="primary"
              size="md"
              icon={actionIcon}
              onClick={onAction}
            >
              {actionText}
            </AdminButton>
          )}
        </div>
      )}
    </div>
  );
};
