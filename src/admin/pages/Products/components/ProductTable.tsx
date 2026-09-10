import React, { useState } from 'react';
import {
  MoreVertical,
  Edit3,
  Copy,
  Trash2,
  Eye,
  Package,
  Star,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminProduct, ProductStatus } from '../../../types';

interface ProductTableProps {
  products: AdminProduct[];
  selectedIds: number[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: number, checked: boolean) => void;
  onStatusChange: (id: number, status: ProductStatus) => void;
  onToggleFeatured: (id: number) => void;
  onDuplicate: (id: number) => void;
  onDelete: (product: AdminProduct) => void;
  onQuickStock: (product: AdminProduct) => void;
  onPreview: (product: AdminProduct) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (column: string) => void;
  isLoading: boolean;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onStatusChange,
  onToggleFeatured,
  onDuplicate,
  onDelete,
  onQuickStock,
  onPreview,
  sortBy,
  sortOrder,
  onSort,
  isLoading,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const isAllSelected = products.length > 0 && selectedIds.length === products.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < products.length;

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3 h-3 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-600" />
    );
  };

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            منشور
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            مسودة
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            مؤرشف
          </span>
        );
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500" />
            نفد المخزون
          </span>
        );
    }
  };

  const getStockStatusBadge = (product: AdminProduct) => {
    if (product.stock === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
          <XCircle className="w-3 h-3" />
          نفد (0)
        </span>
      );
    }
    if (product.stock <= product.lowStockThreshold) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          مخزون منخفض ({product.stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        متوفر ({product.stock})
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          {/* Table Head */}
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200 text-xs font-bold text-stone-600">
              <th className="py-3.5 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded-sm border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-4 min-w-[280px]">
                <button
                  onClick={() => onSort('name')}
                  className="group inline-flex items-center gap-1 hover:text-stone-900 transition-colors"
                >
                  <span>المنتج والرمز (SKU)</span>
                  {renderSortIcon('name')}
                </button>
              </th>
              <th className="py-3.5 px-4 min-w-[130px]">
                <button
                  onClick={() => onSort('category')}
                  className="group inline-flex items-center gap-1 hover:text-stone-900 transition-colors"
                >
                  <span>التصنيف والماركة</span>
                  {renderSortIcon('category')}
                </button>
              </th>
              <th className="py-3.5 px-4 min-w-[120px]">
                <button
                  onClick={() => onSort('price')}
                  className="group inline-flex items-center gap-1 hover:text-stone-900 transition-colors"
                >
                  <span>السعر (ر.س)</span>
                  {renderSortIcon('price')}
                </button>
              </th>
              <th className="py-3.5 px-4 min-w-[140px]">
                <button
                  onClick={() => onSort('stock')}
                  className="group inline-flex items-center gap-1 hover:text-stone-900 transition-colors"
                >
                  <span>حالة المخزون</span>
                  {renderSortIcon('stock')}
                </button>
              </th>
              <th className="py-3.5 px-4 min-w-[120px]">
                <button
                  onClick={() => onSort('status')}
                  className="group inline-flex items-center gap-1 hover:text-stone-900 transition-colors"
                >
                  <span>حالة النشر</span>
                  {renderSortIcon('status')}
                </button>
              </th>
              <th className="py-3.5 px-4 min-w-[100px] text-center">
                <button
                  onClick={() => onSort('salesCount')}
                  className="group inline-flex items-center gap-1 hover:text-stone-900 transition-colors justify-center"
                >
                  <span>المبيعات</span>
                  {renderSortIcon('salesCount')}
                </button>
              </th>
              <th className="py-3.5 px-4 w-28 text-center">إجراءات</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-stone-100 text-sm">
            {isLoading ? (
              // Loading Skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  <td className="py-4 px-4 text-center">
                    <div className="w-4 h-4 bg-stone-200 rounded-sm mx-auto" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-stone-200 rounded-lg shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="w-3/4 h-4 bg-stone-200 rounded-sm" />
                        <div className="w-1/3 h-3 bg-stone-200 rounded-sm" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-20 h-4 bg-stone-200 rounded-sm mb-1" />
                    <div className="w-16 h-3 bg-stone-200 rounded-sm" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-16 h-4 bg-stone-200 rounded-sm" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-24 h-6 bg-stone-200 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-16 h-6 bg-stone-200 rounded-full" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="w-10 h-4 bg-stone-200 rounded-sm mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="w-8 h-8 bg-stone-200 rounded-lg mx-auto" />
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={8} className="py-12 text-center text-stone-500">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-base font-bold text-stone-800">لا توجد منتجات تطابق الفلاتر المحددة</p>
                  <p className="text-xs text-stone-500 mt-1">
                    جرب البحث بكلمة أخرى أو قم بإعادة ضبط خيارات التصفية.
                  </p>
                </td>
              </tr>
            ) : (
              products.map((product, idx) => {
                const isSelected = selectedIds.includes(product.id);
                const isMenuOpen = activeMenuId === product.id;

                return (
                  <tr
                    key={`admin-tbl-prod-${product.id || idx}-${idx}`}
                    className={`hover:bg-amber-50/20 transition-colors ${
                      isSelected ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelectOne(product.id, e.target.checked)}
                        className="rounded-sm border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                    </td>

                    {/* Product Main Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div className="relative group/thumb shrink-0">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-stone-200 bg-stone-100"
                          />
                          <button
                            onClick={() => onToggleFeatured(product.id)}
                            className={`absolute -top-1.5 -right-1.5 p-1 rounded-full shadow-xs transition-transform hover:scale-110 ${
                              product.isFeatured
                                ? 'bg-amber-500 text-stone-950 font-bold'
                                : 'bg-stone-200 text-stone-400 hover:text-stone-700'
                            }`}
                            title={product.isFeatured ? 'منتج مميز في الواجهة' : 'تحديد كمنتج مميز'}
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Title & SKU & Tags */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onPreview(product)}
                              className="text-xs sm:text-sm font-bold text-stone-900 hover:text-amber-700 transition-colors text-right line-clamp-1 cursor-pointer"
                            >
                              {product.name}
                            </button>
                          </div>

                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-mono text-stone-400">
                              {product.sku}
                            </span>
                            {product.isFeatured && (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded-sm">
                                مميز
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Brand */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-stone-800">
                        {product.category}
                      </div>
                      <div className="text-xs text-amber-700 font-medium mt-0.5">
                        {product.brand}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs sm:text-sm font-bold font-mono text-stone-900">
                        {Number(product?.price ?? 0).toLocaleString('ar-SA')} ر.س
                      </div>
                      {product.compareAtPrice && (
                        <div className="text-xs font-mono line-through text-stone-400">
                          {Number(product?.compareAtPrice ?? 0).toLocaleString('ar-SA')} ر.س
                        </div>
                      )}
                      {product.costPrice && product.costPrice > 0 ? (
                        <div
                          className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm inline-block mt-0.5"
                          title={`التكلفة: ${product.costPrice} ر.س | صافي الربح: ${product.price - product.costPrice} ر.س`}
                        >
                          ربح: {(((product.price - product.costPrice) / product.price) * 100).toFixed(0)}%
                        </div>
                      ) : null}
                    </td>

                    {/* Stock status */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {getStockStatusBadge(product)}
                        <button
                          onClick={() => onQuickStock(product)}
                          className="p-1 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                          title="تعديل سريع للمخزون"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Publication Status */}
                    <td className="py-3.5 px-4">
                      <div className="relative inline-block">
                        <select
                          value={product.status}
                          onChange={(e) => onStatusChange(product.id, e.target.value as ProductStatus)}
                          className={`text-xs font-semibold rounded-full px-2.5 py-1 border transition-colors cursor-pointer appearance-none pl-6 pr-2 ${
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
                        <ChevronDown className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500" />
                      </div>
                    </td>

                    {/* Sales & Rating */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="text-xs font-mono font-bold text-stone-800">
                        {product.salesCount} طلب
                      </div>
                      <div className="flex items-center justify-center gap-1 text-[11px] text-stone-500 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{product.rating || 5.0}</span>
                      </div>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 px-4 text-center relative">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onPreview(product)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                          title="معاينة تفاصيل المنتج"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(isMenuOpen ? null : product.id)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                            title="خيارات إضافية"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="absolute left-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-40 text-right animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onPreview(product);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5 text-stone-400" />
                                  <span>معاينة سريعة</span>
                                </button>

                                <Link
                                  to={`/admin/products/edit/${product.id}`}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-stone-400" />
                                  <span>تعديل المنتج</span>
                                </Link>

                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onDuplicate(product.id);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                                  <span>نسخ المنتج</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onQuickStock(product);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
                                >
                                  <Package className="w-3.5 h-3.5 text-stone-400" />
                                  <span>تعديل المخزون</span>
                                </button>

                                <div className="border-t border-stone-100 my-1" />

                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onDelete(product);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  <span>حذف المنتج</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
