import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../ui/EmptyState';
import { PackageOpen } from 'lucide-react';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onQuickView?: (product: Product) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onClearFilters?: () => void;
  layoutColumns?: 2 | 3 | 4;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  onQuickView,
  emptyTitle = 'لم يتم العثور على أي مقتنيات مطابقة',
  emptyDescription = 'يرجى تعديل معايير البحث أو تصفية المنتجات لاستكشاف باقي عناصر المجموعة.',
  onClearFilters,
  layoutColumns = 4,
}) => {
  // Map layoutColumns to responsive Tailwind grid classes
  const getGridClass = () => {
    switch (layoutColumns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2 gap-8';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
      case 4:
      default:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';
    }
  };

  if (isLoading) {
    return (
      <div className={`grid ${getGridClass()} py-6`} dir="rtl">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`grid-skel-${i}`}
            className="flex flex-col bg-white border border-[#F0EAE1] overflow-hidden animate-pulse"
            style={{ borderRadius: '16px' }}
          >
            <div className="aspect-square bg-[#FCFAF7] w-full" />
            <div className="p-5 flex flex-col gap-3">
              <div className="h-3 bg-[#F0EAE1] rounded-full w-1/3" />
              <div className="h-4 bg-[#F0EAE1] rounded-full w-5/6" />
              <div className="flex justify-between items-center pt-4 border-t border-[#F0EAE1]">
                <div className="h-5 bg-[#F0EAE1] rounded-full w-24" />
                <div className="w-10 h-10 bg-[#F0EAE1] rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageOpen className="w-7 h-7 text-[#71717A]" />}
        title={emptyTitle}
        description={emptyDescription}
        actionText={onClearFilters ? 'إعادة ضبط الفلاتر' : undefined}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className={`grid ${getGridClass()}`} dir="rtl">
      {products.map((product, idx) => (
        <ProductCard
          key={`prod-grid-${product.id || idx}-${idx}`}
          product={product}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
};
