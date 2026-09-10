import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useCategories, useCategoryCounts } from '../hooks/useProducts';
import { Product } from '../types';
import { ProductGrid } from '../components/product/ProductGrid';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { SearchAutocomplete } from '../components/product/SearchAutocomplete';
import { PriceRangeFilter } from '../components/product/PriceRangeFilter';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import {
  Filter,
  Search,
  LayoutGrid,
  List,
  RotateCcw,
  SlidersHorizontal,
  X,
  Package,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [layoutCols, setLayoutCols] = useState<2 | 3 | 4>(3);

  const currentCategory = searchParams.get('category');
  const currentSearch = searchParams.get('search');
  const currentMinPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const currentMaxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const currentSort = (searchParams.get('sort') || '') as any;
  const currentInStock = searchParams.get('instock') === 'true';
  const currentPage = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  const hasActiveFilters = Boolean(
    currentCategory || currentSearch || currentMinPrice || currentMaxPrice || currentSort || currentInStock
  );

  useEffect(() => {
    setSearchInput(currentSearch || '');
  }, [currentSearch]);

  const { data: categoriesData } = useCategories();
  const { data: categoryCountsData } = useCategoryCounts();

  const categories = ['all', ...(categoriesData || [])];

  const { data, isLoading, isFetching } = useProducts({
    category: currentCategory,
    search: currentSearch,
    minPrice: currentMinPrice,
    maxPrice: currentMaxPrice,
    sort: currentSort,
    instock: currentInStock,
    page: currentPage,
    limit: 12,
  });

  const products = data?.products || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 };

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === 'false') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const updatePriceParams = (min: number | undefined, max: number | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (min !== undefined) {
      next.set('minPrice', min.toString());
    } else {
      next.delete('minPrice');
    }
    if (max !== undefined) {
      next.set('maxPrice', max.toString());
    } else {
      next.delete('maxPrice');
    }
    next.delete('page');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
    setIsFilterOpen(false);
  };

  const getCategoryLabel = (cat: string) => {
    if (cat === 'all') return 'الكل';
    return cat;
  };

  const getCategoryCount = (cat: string) => {
    if (categoryCountsData?.counts) {
      return categoryCountsData.counts[cat] ?? 0;
    }
    return 0;
  };

  const getSortLabel = (sortVal: string) => {
    switch (sortVal) {
      case 'price_asc': return 'السعر: من الأقل للأعلى';
      case 'price_desc': return 'السعر: من الأعلى للأقل';
      case 'name_asc': return 'الاسم: أ - ي';
      case 'name_desc': return 'الاسم: ي - أ';
      case 'newest': return 'وصل حديثاً';
      default: return 'الترتيب المقترح';
    }
  };

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen py-10 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Advanced Toolbar (Search, Filter, Sort, View) */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#E8E3D8] p-4 sm:p-6 flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
            {/* Search Bar */}
            <div className="w-full lg:w-1/3 relative group">
              <div className="relative z-20">
                <SearchAutocomplete
                  value={searchInput}
                  onChange={setSearchInput}
                  onSubmit={(val) => {
                    setSearchInput(val);
                    updateParam('search', val);
                  }}
                  placeholder="ابحث عن الساعات، العطور، الحقائب..."
                  className="w-full pl-4 pr-12 py-3.5 bg-[#FAF8F3] border border-[#E8E3D8] rounded-2xl focus:ring-2 focus:ring-[#00875A] focus:border-[#00875A] transition-all font-arabic text-sm text-[#181818] group-hover:border-[#00875A]"
                />
              </div>
            </div>

            {/* Desktop Quick Category Tabs */}
            <div className="hidden lg:flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1 justify-center px-4">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateParam('category', cat)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                    (currentCategory || 'all') === cat
                      ? 'bg-[#00875A] text-white shadow-md'
                      : 'bg-[#FAF8F3] text-[#5A5852] hover:bg-[#E8E3D8] border border-[#E8E3D8]'
                  }`}
                >
                  {getCategoryLabel(cat)}
                  {cat !== 'all' && (
                    <span className="ml-1.5 text-xs opacity-70">({getCategoryCount(cat)})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Action Buttons (Filter Toggle, Sort, Grid Layout) */}
            <div className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border font-bold text-sm transition-all cursor-pointer ${
                  isFilterOpen
                    ? 'bg-[#00875A] text-white border-[#00875A] shadow-md'
                    : 'bg-white text-[#181818] border-[#E8E3D8] hover:bg-[#FAF8F3]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>تصفية متقدمة</span>
                {hasActiveFilters && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] mr-1">
                    !
                  </span>
                )}
              </button>

              <div className="relative group flex-1 lg:flex-none">
                <select
                  value={currentSort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E8E3D8] text-[#181818] py-3 pl-10 pr-4 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-[#00875A] cursor-pointer hover:bg-[#FAF8F3] transition-colors"
                >
                  <option value="">الترتيب الافتراضي</option>
                  <option value="price_asc">السعر: من الأقل للأعلى</option>
                  <option value="price_desc">السعر: من الأعلى للأقل</option>
                  <option value="newest">أحدث الإضافات</option>
                  <option value="name_asc">الاسم (أ-ي)</option>
                </select>
                <Filter className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Grid Layout Toggles (Desktop only) */}
              <div className="hidden lg:flex items-center bg-[#FAF8F3] rounded-2xl p-1 border border-[#E8E3D8]">
                <button
                  type="button"
                  onClick={() => setLayoutCols(2)}
                  title="عرض ثنائي"
                  className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                    layoutCols === 2
                      ? 'bg-[#00875A] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  ٢
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutCols(3)}
                  title="عرض ثلاثي"
                  className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                    layoutCols === 3
                      ? 'bg-[#00875A] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  ٣
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutCols(4)}
                  title="عرض رباعي"
                  className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                    layoutCols === 4
                      ? 'bg-[#00875A] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  ٤
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Advanced Filters Panel */}
          {isFilterOpen && (
            <div className="pt-6 border-t border-[#E8E3D8] grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4 duration-300">
              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-black text-[#181818] mb-4">التصنيف</h4>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="category_filter"
                          checked={(currentCategory || 'all') === cat}
                          onChange={() => updateParam('category', cat)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 rounded-md border-2 border-[#E8E3D8] group-hover:border-[#00875A] peer-checked:bg-[#00875A] peer-checked:border-[#00875A] transition-all"></div>
                        <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                            <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      <span className={`text-sm transition-colors ${
                        (currentCategory || 'all') === cat ? 'font-bold text-[#181818]' : 'text-neutral-600 group-hover:text-[#181818]'
                      }`}>
                        {getCategoryLabel(cat)}
                      </span>
                      {cat !== 'all' && (
                        <span className="mr-auto text-xs font-bold text-neutral-400">
                          {getCategoryCount(cat)}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h4 className="text-sm font-black text-[#181818] mb-4">نطاق السعر</h4>
                <PriceRangeFilter
                  minPrice={currentMinPrice}
                  maxPrice={currentMaxPrice}
                  onChange={updatePriceParams}
                />
              </div>

              {/* Availability Filter */}
              <div>
                <h4 className="text-sm font-black text-[#181818] mb-4">التوفر</h4>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={currentInStock}
                      onChange={(e) => updateParam('instock', e.target.checked ? 'true' : null)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-[#E8E3D8] group-hover:border-[#00875A] peer-checked:bg-[#00875A] peer-checked:border-[#00875A] transition-all"></div>
                    <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm text-neutral-600 group-hover:text-[#181818] transition-colors">
                    متوفر في المخزون فقط
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Active Filter Chips Row */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-2xl border border-[#E8E3D8] font-arabic shadow-sm">
            <span className="text-xs font-black text-neutral-500 ml-1">الفلاتر النشطة:</span>
            
            {currentCategory && currentCategory !== 'all' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F3] text-xs font-bold text-[#181818] rounded-full border border-[#E8E3D8]">
                <span>الفئة: {getCategoryLabel(currentCategory)}</span>
                <button
                  type="button"
                  onClick={() => updateParam('category', null)}
                  className="p-0.5 text-neutral-400 hover:text-red-600 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {currentSearch && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F3] text-xs font-bold text-[#181818] rounded-full border border-[#E8E3D8]">
                <span>البحث: &ldquo;{currentSearch}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateParam('search', null);
                  }}
                  className="p-0.5 text-neutral-400 hover:text-red-600 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {(currentMinPrice !== undefined || currentMaxPrice !== undefined) && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F3] text-xs font-bold text-[#181818] rounded-full border border-[#E8E3D8]">
                <span>
                  السعر: {currentMinPrice !== undefined ? `${currentMinPrice} ر.س` : '٠'} إلى{' '}
                  {currentMaxPrice !== undefined ? `${currentMaxPrice} ر.س` : 'غير محدد'}
                </span>
                <button
                  type="button"
                  onClick={() => updatePriceParams(undefined, undefined)}
                  className="p-0.5 text-neutral-400 hover:text-red-600 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {currentInStock && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F3] text-xs font-bold text-[#181818] rounded-full border border-[#E8E3D8]">
                <span>المتوفر فقط</span>
                <button
                  type="button"
                  onClick={() => updateParam('instock', null)}
                  className="p-0.5 text-neutral-400 hover:text-red-600 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {currentSort && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F3] text-xs font-bold text-[#181818] rounded-full border border-[#E8E3D8]">
                <span>{getSortLabel(currentSort)}</span>
                <button
                  type="button"
                  onClick={() => updateParam('sort', null)}
                  className="p-0.5 text-neutral-400 hover:text-red-600 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs font-black text-red-600 hover:text-red-700 mr-auto transition-colors cursor-pointer px-2 py-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط الكل</span>
            </button>
          </div>
        )}

        {/* Results Header Meta Counter */}
        <div className="flex items-center justify-between text-xs text-neutral-500 px-2 font-bold bg-white p-3 rounded-2xl border border-[#E8E3D8] shadow-sm">
          <div className="flex items-center gap-2 font-arabic">
            <Package className="w-4 h-4 text-[#00875A]" />
            <span>
              عرض <strong className="text-[#181818]">{products.length}</strong> من أصل{' '}
              <strong className="text-[#181818]">{pagination.total}</strong> مقتنى
            </span>
          </div>
          {isFetching && (
            <span className="text-[#00875A] text-xs font-black animate-pulse font-arabic bg-[#E6F3EF] px-2 py-1 rounded-full">
              جاري التحديث...
            </span>
          )}
        </div>

        {/* Main Product Grid */}
        {products.length === 0 && !isLoading ? (
          <div className="py-24 px-6 bg-white rounded-3xl border border-[#E8E3D8] text-center font-arabic flex flex-col items-center gap-6 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[#FAF8F3] border border-[#E8E3D8] flex items-center justify-center text-neutral-400">
              <Package className="w-10 h-10" />
            </div>
            <div className="max-w-md">
              <h3 className="text-xl font-black text-[#181818] mb-3">لم نجد أي مقتنيات مطابقة لخياراتك</h3>
              <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                جرّب إزالة بعض الفلاتر أو توسيع نطاق البحث والأسعار للوصول إلى كافة القطع الفاخرة المتاحة في المجموعة.
              </p>
              <Button variant="primary" size="md" onClick={handleClearFilters} leftIcon={<RotateCcw className="w-4 h-4" />}>
                إعادة ضبط جميع الفلاتر
              </Button>
            </div>
          </div>
        ) : (
          <ProductGrid
            products={products}
            isLoading={isLoading}
            onQuickView={(p) => setQuickViewProduct(p)}
            onClearFilters={hasActiveFilters ? handleClearFilters : undefined}
            layoutColumns={layoutCols}
          />
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="pt-8 pb-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => updateParam('page', page.toString())}
            />
          </div>
        )}
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
export default ProductsPage;
