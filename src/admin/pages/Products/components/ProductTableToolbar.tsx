import React from 'react';
import {
  Search,
  Filter,
  X,
  RotateCw,
  Download,
  Upload,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { ProductFilterParams, ProductStatus, StockStatus } from '../../../types';

interface ProductTableToolbarProps {
  filters: ProductFilterParams;
  onFilterChange: (newFilters: Partial<ProductFilterParams>) => void;
  onResetFilters: () => void;
  categories: { name: string; count: number }[];
  brands: string[];
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  onRefresh: () => void;
  onExport: () => void;
  onImport: () => void;
  totalCount: number;
  isLoading: boolean;
}

export const ProductTableToolbar: React.FC<ProductTableToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  categories,
  brands,
  viewMode,
  onViewModeChange,
  onRefresh,
  onExport,
  onImport,
  totalCount,
  isLoading,
}) => {
  const statusTabs: { label: string; value: ProductStatus | 'all' }[] = [
    { label: 'جميع المنتجات', value: 'all' },
    { label: 'المنشورة', value: 'published' },
    { label: 'المسودات', value: 'draft' },
    { label: 'نفد المخزون', value: 'out_of_stock' },
    { label: 'المؤرشفة', value: 'archived' },
  ];

  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.status && filters.status !== 'all') ||
    (filters.stockStatus && filters.stockStatus !== 'all') ||
    (filters.category && filters.category !== 'all') ||
    (filters.brand && filters.brand !== 'all') ||
    filters.isFeatured !== undefined
  );

  return (
    <div id="product-table-toolbar" className="space-y-4">
      {/* Top Row: Search, Main Filters, View Mode, Exports */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            id="product-search-input"
            type="text"
            placeholder="بحث بالاسم، رمز SKU، الماركة، أو الوسوم..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="w-full pl-9 pr-10 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '', page: 1 })}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
              title="مسح البحث"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            id="category-filter-select"
            value={filters.category || 'all'}
            onChange={(e) => onFilterChange({ category: e.target.value, page: 1 })}
            className="px-3 py-2 text-xs font-medium bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">كل التصنيفات ({categories.reduce((acc, c) => acc + c.count, 0)})</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            id="stock-filter-select"
            value={filters.stockStatus || 'all'}
            onChange={(e) =>
              onFilterChange({ stockStatus: e.target.value as StockStatus | 'all', page: 1 })
            }
            className="px-3 py-2 text-xs font-medium bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">حالة المخزون (الكل)</option>
            <option value="in_stock">متوفر بالمستودع</option>
            <option value="low_stock">مخزون منخفض ⚠️</option>
            <option value="out_of_stock">نفد من المخزون ❌</option>
          </select>

          {/* Sort By */}
          <select
            id="sort-by-select"
            value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              onFilterChange({ sortBy, sortOrder: sortOrder as 'asc' | 'desc', page: 1 });
            }}
            className="px-3 py-2 text-xs font-medium bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="createdAt-desc">الأحدث إضافة</option>
            <option value="price-desc">السعر: من الأعلى للأقل</option>
            <option value="price-asc">السعر: من الأقل للأعلى</option>
            <option value="salesCount-desc">الأكثر مبيعاً</option>
            <option value="rating-desc">الأعلى تقييماً</option>
            <option value="stock-desc">الأعلى كمية مخزون</option>
            <option value="stock-asc">الأقل كمية مخزون</option>
          </select>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-amber-700 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="عرض جدولي"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-amber-700 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="عرض شبكي (بطاقات)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Export & Refresh */}
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors"
            title="تصدير بيانات المنتجات CSV/JSON"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">تصدير</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-stone-500 hover:text-stone-800 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors disabled:opacity-50"
            title="تحديث القائمة"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Status Quick Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {statusTabs.map((tab) => {
            const isActive = (filters.status || 'all') === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onFilterChange({ status: tab.value, page: 1 })}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-stone-900 text-amber-400 shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          <button
            onClick={() =>
              onFilterChange({
                isFeatured: filters.isFeatured === true ? undefined : true,
                page: 1,
              })
            }
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filters.isFeatured === true
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-amber-50 border border-stone-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>المميزة فقط</span>
          </button>
        </div>

        {/* Reset filters if active */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 hover:bg-rose-50 rounded-md transition-colors"
          >
            <X className="w-3 h-3" />
            <span>إعادة ضبط الفلاتر</span>
          </button>
        )}
      </div>
    </div>
  );
};
