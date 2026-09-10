import React from 'react';

export type AdminBadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'primary'
  | 'draft'
  | 'archived';

export type AdminBadgeSize = 'sm' | 'md' | 'lg';

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: AdminBadgeVariant;
  size?: AdminBadgeSize;
  dot?: boolean;
  className?: string;
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variantStyles: Record<AdminBadgeVariant, string> = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-800 border-rose-200/80',
    info: 'bg-amber-50 text-amber-900 border-amber-200/80',
    neutral: 'bg-[#F2EFE8] text-[#5A5852] border-[#E8E3D8]',
    primary: 'bg-[#E6F4EE] text-[#00875A] border-[#00875A]/20',
    draft: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    archived: 'bg-neutral-200 text-neutral-700 border-neutral-300',
  };

  const dotStyles: Record<AdminBadgeVariant, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-amber-500',
    neutral: 'bg-neutral-400',
    primary: 'bg-[#00875A]',
    draft: 'bg-neutral-400',
    archived: 'bg-neutral-500',
  };

  const sizeStyles: Record<AdminBadgeSize, string> = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-full',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-full',
    lg: 'text-sm px-3 py-1.5 font-semibold rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border tracking-wide select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant]}`} />}
      <span>{children}</span>
    </span>
  );
};
