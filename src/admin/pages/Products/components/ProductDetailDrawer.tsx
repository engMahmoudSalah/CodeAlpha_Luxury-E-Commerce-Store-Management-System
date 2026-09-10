import React from 'react';
import {
  X,
  Star,
  Package,
  Tag,
  DollarSign,
  TrendingUp,
  ExternalLink,
  Edit3,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminProduct, ProductStatus } from '../../../types';

interface ProductDetailDrawerProps {
  product: AdminProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (productId: number, status: ProductStatus) => void;
  onToggleFeatured: (productId: number) => void;
  onOpenStockModal: (product: AdminProduct) => void;
}

export const ProductDetailDrawer: React.FC<ProductDetailDrawerProps> = ({
  product,
  isOpen,
  onClose,
  onStatusChange,
  onToggleFeatured,
  onOpenStockModal,
}) => {
  if (!isOpen || !product) return null;

  const profit = product.costPrice ? product.price - product.costPrice : null;
  const profitMargin = profit ? Math.round((profit / product.price) * 100) : null;

  return (
    <div
      id="product-detail-drawer"
      className="fixed inset-0 z-50 flex items-center justify-end bg-stone-950/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-xl h-full shadow-2xl border-r border-stone-200 flex flex-col overflow-hidden animate-in slide-in-from-left duration-250">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded-md">
              {product.sku}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                product.status === 'published'
                  ? 'bg-emerald-100 text-emerald-800'
                  : product.status === 'draft'
                  ? 'bg-amber-100 text-amber-800'
                  : product.status === 'archived'
                  ? 'bg-stone-200 text-stone-700'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {product.status === 'published'
                ? 'منشور في المتجر'
                : product.status === 'draft'
                ? 'مسودة غير منشورة'
                : product.status === 'archived'
                ? 'مؤرشف'
                : 'نفد المخزون'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/admin/products/edit/${product.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل كامل</span>
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Visual & Title */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 aspect-16/9 group">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onToggleFeatured(product.id)}
                className={`absolute top-3 left-3 p-2 rounded-xl backdrop-blur-md transition-all shadow-md ${
                  product.isFeatured
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-900/60 text-stone-200 hover:bg-stone-900'
                }`}
                title={product.isFeatured ? 'إلغاء التمييز' : 'تمييز المنتج'}
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            {/* Gallery thumbnails if present */}
            {product.galleryImages && product.galleryImages.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <img
                  src={product.image_url}
                  alt="Main"
                  className="w-14 h-14 rounded-lg object-cover border-2 border-amber-500 shrink-0"
                />
                {product.galleryImages.map((img, idx) => (
                  <img
                    key={`gallery-img-${idx}`}
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0 opacity-80 hover:opacity-100 transition-opacity"
                  />
                ))}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                <span className="font-semibold text-amber-700">{product.brand}</span>
                <span>•</span>
                <span>{product.category}</span>
              </div>
              <h2 className="text-lg font-bold text-stone-900 leading-snug">{product.name}</h2>
              {product.shortDescription && (
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}
            </div>
          </div>

          {/* Pricing & Financial Analysis */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-3">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span>البيانات المالية والتسعير</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-3 rounded-lg border border-stone-200">
                <span className="text-xs text-stone-500 block">سعر البيع</span>
                <span className="text-sm font-bold font-mono text-stone-900">
                  {Number(product?.price ?? 0).toLocaleString('ar-SA')} ر.س
                </span>
                {product.compareAtPrice && (
                  <span className="text-xs line-through text-stone-400 block font-mono">
                    {Number(product?.compareAtPrice ?? 0).toLocaleString('ar-SA')} ر.س
                  </span>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg border border-stone-200">
                <span className="text-xs text-stone-500 block">سعر التكلفة</span>
                <span className="text-sm font-bold font-mono text-stone-600">
                  {product.costPrice
                    ? `${Number(product?.costPrice ?? 0).toLocaleString('ar-SA')} ر.س`
                    : 'غير محدد'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-stone-200 col-span-2 sm:col-span-1">
                <span className="text-xs text-stone-500 block">هامش الربح</span>
                <span className="text-sm font-bold font-mono text-emerald-700">
                  {profitMargin !== null ? `${profitMargin}% (${profit?.toLocaleString('ar-SA')} ر.س)` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Inventory & Sales Performance */}
          <div className="grid grid-cols-2 gap-3">
            {/* Stock Box */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-stone-500" />
                  المخزون
                </span>
                <button
                  onClick={() => onOpenStockModal(product)}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline"
                >
                  تعديل
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-stone-900">{product.stock}</span>
                <span className="text-xs text-stone-500">قطعة متوفرة</span>
              </div>
              <p className="text-xs text-stone-500">
                حد التنبيه: <span className="font-mono font-medium">{product.lowStockThreshold}</span> قطع
              </p>
            </div>

            {/* Sales Volume */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                المبيعات والتقييم
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-amber-700">
                  {product.salesCount}
                </span>
                <span className="text-xs text-stone-500">طلب مكتمل</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-stone-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold">{product.rating || 5.0}</span>
                <span className="text-stone-400">({product.reviewsCount} تقييم)</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              الوصف التفصيلي
            </h4>
            <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              {product.description || 'لا يوجد وصف تفصيلي مسجل لهذا المنتج.'}
            </p>
          </div>

          {/* Tags & Collections */}
          <div className="space-y-3">
            {product.collections && product.collections.length > 0 && (
              <div>
                <span className="text-xs font-bold text-stone-700 block mb-1.5">المجموعات:</span>
                <div className="flex flex-wrap gap-1.5">
                  {product.collections.map((col) => (
                    <span
                      key={col}
                      className="px-2.5 py-1 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-medium"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div>
                <span className="text-xs font-bold text-stone-700 block mb-1.5">الوسوم:</span>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-stone-100 text-stone-600 rounded-md font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Metadata info */}
          <div className="pt-3 border-t border-stone-200 text-xs text-stone-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>تاريخ الإضافة:</span>
              <span className="font-mono">{new Date(product.createdAt).toLocaleDateString('ar-SA')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>آخر تعديل:</span>
              <span className="font-mono">{new Date(product.updatedAt).toLocaleDateString('ar-SA')}</span>
            </div>
          </div>
        </div>

        {/* Footer Quick Status Switcher */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-stone-700">تغيير الحالة السريعة:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onStatusChange(product.id, 'published')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                product.status === 'published'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-white text-stone-700 hover:bg-emerald-50 border border-stone-200'
              }`}
            >
              نشر
            </button>
            <button
              onClick={() => onStatusChange(product.id, 'draft')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                product.status === 'draft'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-white text-stone-700 hover:bg-amber-50 border border-stone-200'
              }`}
            >
              مسودة
            </button>
            <button
              onClick={() => onStatusChange(product.id, 'archived')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                product.status === 'archived'
                  ? 'bg-stone-800 text-white font-bold'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              أرشفة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
