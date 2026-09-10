import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const AdminSkeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-[#EDE8DE] rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
};

export const AdminTableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 6,
}) => {
  return (
    <div className="w-full space-y-3">
      {/* Table Header Skeleton */}
      <div className="flex gap-4 p-4 bg-[#F5F2EA] rounded-xl border border-[#E8E3D8]">
        {Array.from({ length: cols }).map((_, i) => (
          <AdminSkeleton key={`th-${i}`} className="h-4 flex-1" />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={`tr-${r}`}
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#F0ECE4]"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <AdminSkeleton
              key={`td-${r}-${c}`}
              className={`h-4 ${c === 0 ? 'w-10 h-10 rounded-lg shrink-0' : 'flex-1'}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const AdminCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E3D8] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <AdminSkeleton className="h-5 w-32" />
        <AdminSkeleton className="h-8 w-20 rounded-lg" />
      </div>
      <AdminSkeleton className="h-10 w-24" />
      <AdminSkeleton className="h-3 w-48" />
    </div>
  );
};
