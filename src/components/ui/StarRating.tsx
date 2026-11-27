import React from 'react';
import { Star } from 'lucide-react';

export const StarRating: React.FC<{
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showCount?: boolean;
  count?: number;
}> = ({
  rating,
  max = 5,
  size = 'sm',
  interactive = false,
  onRatingChange,
  showCount = false,
  count
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5" {...(interactive ? {} : { role: 'img', 'aria-label': `تقييم ${(rating ?? 0).toFixed(1)} من ${max}` })}>
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;
          return (
            <button
              type="button"
              key={`star-${i}`}
              disabled={!interactive}
              {...(interactive ? { 'aria-label': `قيّم ${i + 1} من ${max}` } : { 'aria-hidden': true, tabIndex: -1 })}
              onClick={() => interactive && onRatingChange?.(i + 1)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0.5`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  filled
                    ? 'text-[#C5A880] fill-[#C5A880]'
                    : half
                    ? 'text-[#C5A880] fill-[#C5A880]/50'
                    : 'text-[#E4E4E7]'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showCount && (
        <span className="text-xs text-[#71717A] font-medium">
          {(rating ?? 0).toFixed(1)} {count !== undefined ? `(${count})` : ''}
        </span>
      )}
    </div>
  );
};

