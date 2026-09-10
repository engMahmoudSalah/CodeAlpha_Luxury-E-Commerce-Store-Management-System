import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline' | 'gold' | 'star';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = ''
}) => {
  const variantStyles = {
    primary: 'bg-[#00875A] text-white border border-[#00875A]',
    star: 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]',
    gold: 'bg-[#181818] text-[#FFC700] border border-[#FFC700]/30',
    success: 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]',
    warning: 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200',
    neutral: 'bg-[#EFECE5] text-[#181818] border border-[#E5E0D6]',
    outline: 'bg-transparent text-[#5A5852] border border-[#DDD8CE]'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-full font-bold',
    md: 'text-xs px-3 py-1 rounded-full font-bold'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 leading-tight select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};


