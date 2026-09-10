import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
  count = 1,
}) => {
  const baseClasses = 'animate-pulse bg-[#E5E0D6] rounded-xl';

  const variantClasses = {
    rect: 'rounded-2xl',
    circle: 'rounded-full',
    text: 'rounded-md h-3.5 w-full my-1',
    card: 'rounded-3xl h-80 w-full',
  };

  const style: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
  };

  if (count > 1) {
    return (
      <div className="flex flex-col gap-2 w-full">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={`skel-${i}`}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col rounded-3xl bg-white border border-[#E8E3D8] p-4 gap-3 shadow-2xs font-arabic">
      <Skeleton variant="rect" className="w-full aspect-square rounded-2xl" />
      <div className="flex items-center justify-between mt-1">
        <Skeleton variant="text" className="w-20 h-4" />
        <Skeleton variant="text" className="w-12 h-4" />
      </div>
      <Skeleton variant="text" className="w-4/5 h-5" />
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#FAF8F3]">
        <Skeleton variant="text" className="w-24 h-6" />
        <Skeleton variant="circle" className="w-9 h-9" />
      </div>
    </div>
  );
};
