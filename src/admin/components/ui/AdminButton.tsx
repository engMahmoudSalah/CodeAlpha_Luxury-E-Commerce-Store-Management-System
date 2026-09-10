import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

export type AdminButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'dangerOutline'
  | 'ghost'
  | 'dark';

export type AdminButtonSize = 'sm' | 'md' | 'lg';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  isLoading?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
}

export const AdminButton: React.FC<AdminButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  loading,
  icon: Icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const loadingState = isLoading ?? loading ?? false;

  const variantStyles: Record<AdminButtonVariant, string> = {
    primary:
      'bg-[#00875A] hover:bg-[#006D48] active:bg-[#005437] text-white shadow-sm border border-transparent focus:ring-2 focus:ring-[#00875A]/20',
    secondary:
      'bg-[#F3EFE6] hover:bg-[#EBE5D8] active:bg-[#E2DBCA] text-[#181818] border border-[#E8E3D8] focus:ring-2 focus:ring-neutral-200',
    outline:
      'bg-white hover:bg-[#FAF8F3] active:bg-[#F3EFE6] text-[#181818] border border-[#E8E3D8] hover:border-[#181818]/30 focus:ring-2 focus:ring-neutral-200',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm border border-transparent focus:ring-2 focus:ring-rose-500/20',
    dangerOutline:
      'bg-white hover:bg-rose-50 active:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 focus:ring-2 focus:ring-rose-200',
    ghost:
      'bg-transparent hover:bg-[#F3EFE6] active:bg-[#EBE5D8] text-[#5A5852] hover:text-[#181818] border border-transparent',
    dark:
      'bg-[#181818] hover:bg-[#262626] active:bg-[#000000] text-white shadow-sm border border-transparent focus:ring-2 focus:ring-neutral-400',
  };

  const sizeStyles: Record<AdminButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 font-medium',
    md: 'text-sm px-4 py-2 rounded-xl gap-2 font-semibold',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 font-semibold',
  };

  return (
    <button
      disabled={disabled || loadingState}
      className={`inline-flex items-center justify-center transition-all cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loadingState ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      {children && <span>{children}</span>}
      {!loadingState && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
};
