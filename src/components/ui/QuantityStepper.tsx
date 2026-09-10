import React from 'react';
import { Minus, Plus } from 'lucide-react';

export const QuantityStepper: React.FC<{
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
}> = ({
  value,
  min = 1,
  max = 999,
  onChange,
  size = 'md',
  disabled = false
}) => {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)));
    }
  };

  const isSmall = size === 'sm';

  return (
    <div className={`inline-flex items-center rounded-[2px] border border-[#E4E4E7] bg-white overflow-hidden ${
      isSmall ? 'h-8' : 'h-10.5'
    } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min || disabled}
        className={`flex items-center justify-center text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer ${
          isSmall ? 'w-7 h-full' : 'w-9.5 h-full'
        }`}
        aria-label="تقليل الكمية"
      >
        <Minus className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </button>

      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className={`text-center bg-transparent text-[#18181B] font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
          isSmall ? 'w-8 text-xs' : 'w-11 text-sm'
        }`}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max || disabled}
        className={`flex items-center justify-center text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer ${
          isSmall ? 'w-7 h-full' : 'w-9.5 h-full'
        }`}
        aria-label="زيادة الكمية"
      >
        <Plus className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </button>
    </div>
  );
};

