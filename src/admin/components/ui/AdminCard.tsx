import React from 'react';

interface AdminCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export const AdminCard: React.FC<AdminCardProps> = ({
  title,
  subtitle,
  action,
  children,
  footer,
  className = '',
  bodyClassName = '',
  noPadding = false,
}) => {
  const hasHeader = Boolean(title || subtitle || action);

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E8E3D8] shadow-[0_1px_3px_rgba(24,24,24,0.03)] overflow-hidden transition-all ${className}`}
    >
      {hasHeader && (
        <div className="px-5 py-4 sm:px-6 border-b border-[#F0ECE4] flex items-center justify-between gap-4 flex-wrap">
          <div>
            {title && (
              <h3 className="text-base font-bold text-[#181818] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#6B6860] mt-0.5 font-normal">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </div>
      )}

      <div className={`${noPadding ? '' : 'p-5 sm:p-6'} ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div className="px-5 py-3.5 sm:px-6 bg-[#FAF8F3]/60 border-t border-[#F0ECE4] flex items-center justify-between text-xs text-[#6B6860]">
          {footer}
        </div>
      )}
    </div>
  );
};
