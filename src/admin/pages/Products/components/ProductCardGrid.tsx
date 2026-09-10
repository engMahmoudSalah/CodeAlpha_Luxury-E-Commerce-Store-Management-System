import React from 'react';
import {
  Sparkles,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Package,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminProduct, ProductStatus } from '../../../types';

interface ProductCardGridProps {
  products: AdminProduct[];
  selectedIds: number[];
  onSelectOne: (id: number, checked: boolean) => void;
  onStatusChange: (id: number, status: ProductStatus) => void;
  onToggleFeatured: (id: number) => void;
  onDuplicate: (id: number) => void;
  onDelete: (product: AdminProduct) => void;
  onQuickStock: (product: AdminProduct) => void;
  onPreview: (product: AdminProduct) => void;
  isLoading: boolean;
}

export const ProductCardGrid: React.FC<ProductCardGridProps> = ({
  products,
  selectedIds,
  onSelectOne,
  onStatusChange,
  onToggleFeatured,
  onDuplicate,
  onDelete,
  onQuickStock,
  onPreview,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`card-grid-skel-${i}`} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 animate-pulse">
            <div className="w-full aspect-4/3 bg-stone-200 rounded-xl" />
            <div className="w-3/4 h-4 bg-stone-200 rounded-sm" />
            <div className="w-1/2 h-3 bg-stone-200 rounded-sm" />
            <div className="flex justify-between pt-2">
              <div className="w-1/3 h-4 bg-stone-200 rounded-sm" />
              <div className="w-1/4 h-4 bg-stone-200 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
        <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <p className="text-base font-bold text-stone-800">لا توجد منتجات تطابق الفلاتر المحددة</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product, idx) => {
        const isSelected = selectedIds.includes(product.id);

        return (
          <div
            key={`admin-grid-prod-${product.id || idx}-${idx}`}
            className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-2xs hover:shadow-md ${
              isSelected ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-stone-200 hover:border-amber-300'
            }`}
          >
            {/* Top Image Box */}
            <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Top Bar inside image */}
              <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelectOne(product.id, e.target.checked)}
                  className="rounded-sm border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 bg-white/90 shadow-sm cursor-pointer"
                />

                {/* Featured Button */}
                <button
                  onClick={() => onToggleFeatured(product.id)}
                  className={`p-1.5 rounded-lg backdrop-blur-md shadow-sm transition-all ${
                    product.isFeatured
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-stone-900/60 text-white hover:bg-stone-900'
                  }`}
                  title={product.isFeatured ? 'منتج مميز' : 'تمييز المنتج'}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom tag inside image */}
              <div className="absolute bottom-2.5 right-2.5">
                <span className="text-[10px] font-bold text-stone-900 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs font-mono">
                  {product.sku}
                </span>
              </div>
            </div>

            {/* Content Box */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span className="font-semibold text-amber-700">{product.brand}</span>
                  <span className="text-stone-400">{product.category}</span>
                </div>

                <button
                  onClick={() => onPreview(product)}
                  className="text-sm font-bold text-stone-900 hover:text-amber-700 transition-colors text-right line-clamp-2 leading-snug cursor-pointer"
                >
                  {product.name}
                </button>
              </div>

              {/* Price & Stock info */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-black font-mono text-stone-900">
                    {Number(product?.price ?? 0).toLocaleString('ar-SA')}{' '}
                    <span className="text-xs font-normal text-stone-500">ر.س</span>
                  </div>

                  {product.compareAtPrice && (
                    <span className="text-xs font-mono line-through text-stone-400">
                      {Number(product?.compareAtPrice ?? 0).toLocaleString('ar-SA')}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => onQuickStock(product)}
                    className="flex items-center gap-1 font-semibold text-stone-700 hover:text-amber-700"
                  >
                    <Package className="w-3.5 h-3.5 text-stone-400" />
                    <span>المخزون: {product.stock}</span>
                  </button>

                  <div className="flex items-center gap-1 text-stone-500">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{product.rating || 5.0}</span>
                    <span className="text-stone-400">({product.salesCount})</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                {/* Status selector */}
                <select
                  value={product.status}
                  onChange={(e) => onStatusChange(product.id, e.target.value as ProductStatus)}
                  className={`text-[11px] font-semibold rounded-lg px-2 py-1 border transition-colors cursor-pointer ${
                    product.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : product.status === 'draft'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : product.status === 'archived'
                      ? 'bg-stone-100 text-stone-600 border-stone-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  <option value="published">منشور</option>
                  <option value="draft">مسودة</option>
                  <option value="out_of_stock">نفد المخزون</option>
                  <option value="archived">مؤرشف</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onPreview(product)}
                    className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                    title="معاينة"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDuplicate(product.id)}
                    className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                    title="نسخ"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(product)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
