import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  loading,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const loadingState = isLoading ?? loading ?? false;
  const baseClasses = 'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#181818]/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none rounded-full';

  const variantClasses = {
    primary: 'bg-[#00875A] hover:bg-[#00704A] text-white border border-[#00875A] shadow-xs active:scale-[0.98]',
    secondary: 'bg-[#EFECE5] hover:bg-[#E5E0D6] text-[#181818] border border-[#E5E0D6] active:scale-[0.98]',
    outline: 'bg-white hover:bg-[#F7F4EC] text-[#181818] border border-[#DDD8CE] active:scale-[0.98]',
    gold: 'bg-[#181818] hover:bg-[#282828] text-[#FFC700] border border-[#FFC700]/40 shadow-xs active:scale-[0.98]',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-[#EFECE5] text-[#5A5852] hover:text-[#181818] border-transparent'
  };

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 h-8 font-semibold',
    md: 'text-xs sm:text-sm px-5 py-2.5 gap-2 h-10 font-bold',
    lg: 'text-sm sm:text-base px-6 py-3 gap-2.5 h-12 font-bold'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loadingState}
      {...props}
    >
      {loadingState ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin ml-2" />
      ) : leftIcon ? (
        <span className="inline-flex shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!loadingState && rightIcon ? (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      ) : null}
    </button>
  );
};


