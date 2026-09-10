import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Package,
  Layers,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Download,
  Upload,
  Sparkles,
  FileSpreadsheet,
  Check,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminProduct, ProductFilterParams, ProductStatus } from '../../types';
import { adminService } from '../../services';
import { ProductTableToolbar } from './components/ProductTableToolbar';
import { ProductTable } from './components/ProductTable';
import { ProductCardGrid } from './components/ProductCardGrid';
import { ProductPagination } from './components/ProductPagination';
import { ProductBulkActionsBar } from './components/ProductBulkActionsBar';
import { ProductQuickStockModal } from './components/ProductQuickStockModal';
import { ProductDeleteConfirmModal } from './components/ProductDeleteConfirmModal';
import { ProductDetailDrawer } from './components/ProductDetailDrawer';
import { commerceEventBus } from '../../../shared/events/commerceEvents';

export const AdminProductsPage: React.FC = () => {
  // Products & Query State
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // Filtering & Pagination State
  const [filters, setFilters] = useState<ProductFilterParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: 'all',
    stockStatus: 'all',
    category: 'all',
    brand: 'all',
    search: '',
  });

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals & Drawer State
  const [stockModalProduct, setStockModalProduct] = useState<AdminProduct | null>(null);
  const [previewProduct, setPreviewProduct] = useState<AdminProduct | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    product?: AdminProduct;
    isBulk?: boolean;
  }>({ isOpen: false });

  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch Categories & Brands
  const loadMetadata = async () => {
    try {
      const [cats, brs] = await Promise.all([
        adminService.getProductCategories(),
        adminService.getProductBrands(),
      ]);
      setCategories(cats);
      setBrands(brs);
    } catch (err) {
      console.error('Failed to load categories/brands:', err);
    }
  };

  // Main Fetch Function
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.getProducts(filters);
      setProducts(result.data);
      setTotalCount(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      showToast('حدث خطأ أثناء تحميل المنتجات', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    fetchProducts();
    const unsubProd = commerceEventBus.subscribe('PRODUCT_UPDATED', () => {
      fetchProducts();
      loadMetadata();
    });
    const unsubNew = commerceEventBus.subscribe('PRODUCT_CREATED', () => {
      fetchProducts();
      loadMetadata();
    });
    const unsubDel = commerceEventBus.subscribe('PRODUCT_DELETED', () => {
      fetchProducts();
      loadMetadata();
    });
    const unsubOrder = commerceEventBus.subscribe('ORDER_CREATED', () => {
      fetchProducts();
    });
    return () => {
      unsubProd();
      unsubNew();
      unsubDel();
      unsubOrder();
    };
  }, [fetchProducts]);

  // Filter Handlers
  const handleFilterChange = (newFilters: Partial<ProductFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setSelectedIds([]); // Reset selection on filter change
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: 'all',
      stockStatus: 'all',
      category: 'all',
      brand: 'all',
      search: '',
    });
    setSelectedIds([]);
  };

  const handleSort = (column: string) => {
    setFilters((prev) => {
      const isCurrent = prev.sortBy === column;
      const nextOrder = isCurrent && prev.sortOrder === 'asc' ? 'desc' : 'asc';
      return { ...prev, sortBy: column, sortOrder: nextOrder, page: 1 };
    });
  };

  // Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // Single Action Handlers
  const handleStatusChange = async (productId: number, status: ProductStatus) => {
    try {
      await adminService.updateProductStatus(productId, status);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status } : p))
      );
      if (previewProduct?.id === productId) {
        setPreviewProduct((prev) => (prev ? { ...prev, status } : null));
      }
      showToast('تم تحديث حالة المنتج بنجاح');
      loadMetadata();
    } catch (err) {
      showToast('تعذر تحديث الحالة', 'error');
    }
  };

  const handleToggleFeatured = async (productId: number) => {
    try {
      await adminService.toggleProductFeatured(productId);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p))
      );
      if (previewProduct?.id === productId) {
        setPreviewProduct((prev) =>
          prev ? { ...prev, isFeatured: !prev.isFeatured } : null
        );
      }
      showToast('تم تحديث حالة التمييز');
    } catch (err) {
      showToast('تعذر تغيير حالة التمييز', 'error');
    }
  };

  const handleDuplicate = async (productId: number) => {
    try {
      const duplicated = await adminService.duplicateProduct(productId);
      showToast(`تم نسخ المنتج: "${duplicated.name}" كمسودة جديدة`);
      fetchProducts();
      loadMetadata();
    } catch (err) {
      showToast('تعذر نسخ المنتج', 'error');
    }
  };

  const handleSaveStock = async (productId: number, newStock: number) => {
    try {
      await adminService.updateProductStock(productId, newStock);
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            const stockStatus =
              newStock === 0
                ? 'out_of_stock'
                : newStock <= p.lowStockThreshold
                ? 'low_stock'
                : 'in_stock';
            return { ...p, stock: newStock, stockStatus };
          }
          return p;
        })
      );
      if (previewProduct?.id === productId) {
        setPreviewProduct((prev) =>
          prev ? { ...prev, stock: newStock } : null
        );
      }
      showToast('تم تحديث كمية المخزون في المستودع');
    } catch (err) {
      showToast('تعذر تحديث المخزون', 'error');
    }
  };

  // Delete Handlers
  const handleDeleteConfirm = async () => {
    setIsBulkProcessing(true);
    try {
      if (deleteModalState.isBulk) {
        await adminService.bulkDeleteProducts(selectedIds);
        showToast(`تم حذف ${selectedIds.length} منتجات بنجاح`);
        setSelectedIds([]);
      } else if (deleteModalState.product) {
        await adminService.deleteProduct(deleteModalState.product.id);
        showToast(`تم حذف المنتج "${deleteModalState.product.name}"`);
      }
      setDeleteModalState({ isOpen: false });
      fetchProducts();
      loadMetadata();
    } catch (err) {
      showToast('حدث خطأ أثناء الحذف', 'error');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk Actions
  const handleBulkStatusChange = async (status: ProductStatus) => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      await adminService.bulkUpdateProductStatus(selectedIds, status);
      showToast(`تم تحديث حالة ${selectedIds.length} منتجات`);
      setSelectedIds([]);
      fetchProducts();
      loadMetadata();
    } catch (err) {
      showToast('تعذر تحديث حالة المنتجات المحددة', 'error');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Export Data Handler (CSV file download)
  const handleExportData = () => {
    const itemsToExport = selectedIds.length > 0
      ? products.filter((p) => selectedIds.includes(p.id))
      : products;

    const headers = ['ID', 'الاسم', 'SKU', 'التصنيف', 'الماركة', 'السعر', 'المخزون', 'الحالة', 'المبيعات'];
    const csvRows = [
      headers.join(','),
      ...itemsToExport.map((p) =>
        [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          p.sku,
          `"${p.category}"`,
          `"${p.brand}"`,
          p.price,
          p.stock,
          p.status,
          p.salesCount,
        ].join(',')
      ),
    ];

    const blob = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fakhama_products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`تم تصدير ملف ${itemsToExport.length} منتج بنجاح`);
  };

  // Summary Metrics calculations
  const totalProducts = categories.reduce((acc, c) => acc + c.count, 0) || totalCount;
  const inStockCount = products.filter((p) => p.stockStatus === 'in_stock').length;
  const lowStockCount = products.filter((p) => p.stockStatus === 'low_stock').length;
  const outOfStockCount = products.filter((p) => p.stockStatus === 'out_of_stock').length;

  return (
    <div id="admin-products-page" className="space-y-6">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 text-rose-100 border border-rose-700'
              : toastMessage.type === 'info'
              ? 'bg-stone-900 text-amber-300 border border-stone-700'
              : 'bg-emerald-900 text-emerald-100 border border-emerald-700'
          }`}
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>لوحة التحكم</span>
            <span>/</span>
            <span className="text-amber-700 font-semibold">إدارة المنتجات</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            المقتنيات والمنتجات الفاخرة
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            إدارة الكتالوج الملكي، التسعير، التحكم بكميات المستودع، ونشر المنتجات.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-stone-500" />
            <span>تصدير Excel/CSV</span>
          </button>

          <Link
            to="/admin/products/new"
            id="add-new-product-button"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج فاخر</span>
          </Link>
        </div>
      </div>

      {/* KPI Quick Counter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-stone-100 text-stone-700 rounded-lg">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 block">إجمالي المنتجات</span>
            <span className="text-lg font-black font-mono text-stone-900">{totalCount}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 block">متوفر ومكتمل</span>
            <span className="text-lg font-black font-mono text-emerald-700">{inStockCount}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 block">مخزون منخفض</span>
            <span className="text-lg font-black font-mono text-amber-700">{lowStockCount}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 block">نفد المخزون</span>
            <span className="text-lg font-black font-mono text-rose-700">{outOfStockCount}</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <ProductTableToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        categories={categories}
        brands={brands}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={fetchProducts}
        onExport={handleExportData}
        onImport={() => showToast('خاصية استيراد المنتجات من ملف CSV متاحة', 'info')}
        totalCount={totalCount}
        isLoading={isLoading}
      />

      {/* Product Content (Table or Grid) */}
      {viewMode === 'table' ? (
        <ProductTable
          products={products}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onStatusChange={handleStatusChange}
          onToggleFeatured={handleToggleFeatured}
          onDuplicate={handleDuplicate}
          onDelete={(product) => setDeleteModalState({ isOpen: true, product })}
          onQuickStock={(product) => setStockModalProduct(product)}
          onPreview={(product) => setPreviewProduct(product)}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSort={handleSort}
          isLoading={isLoading}
        />
      ) : (
        <ProductCardGrid
          products={products}
          selectedIds={selectedIds}
          onSelectOne={handleSelectOne}
          onStatusChange={handleStatusChange}
          onToggleFeatured={handleToggleFeatured}
          onDuplicate={handleDuplicate}
          onDelete={(product) => setDeleteModalState({ isOpen: true, product })}
          onQuickStock={(product) => setStockModalProduct(product)}
          onPreview={(product) => setPreviewProduct(product)}
          isLoading={isLoading}
        />
      )}

      {/* Pagination */}
      <ProductPagination
        currentPage={filters.page || 1}
        totalPages={totalPages}
        totalItems={totalCount}
        limit={filters.limit || 10}
        onPageChange={(page) => handleFilterChange({ page })}
        onLimitChange={(limit) => handleFilterChange({ limit, page: 1 })}
      />

      {/* Floating Bulk Actions Bar */}
      <ProductBulkActionsBar
        selectedCount={selectedIds.length}
        totalVisible={products.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkDelete={() =>
          setDeleteModalState({ isOpen: true, isBulk: true })
        }
        onBulkExport={handleExportData}
        isProcessing={isBulkProcessing}
      />

      {/* Quick Stock Modal */}
      <ProductQuickStockModal
        product={stockModalProduct}
        isOpen={Boolean(stockModalProduct)}
        onClose={() => setStockModalProduct(null)}
        onSave={handleSaveStock}
      />

      {/* Delete Confirmation Modal */}
      <ProductDeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false })}
        onConfirm={handleDeleteConfirm}
        title={deleteModalState.product?.name}
        itemCount={deleteModalState.isBulk ? selectedIds.length : 1}
        isProcessing={isBulkProcessing}
      />

      {/* Detail Preview Drawer */}
      <ProductDetailDrawer
        product={previewProduct}
        isOpen={Boolean(previewProduct)}
        onClose={() => setPreviewProduct(null)}
        onStatusChange={handleStatusChange}
        onToggleFeatured={handleToggleFeatured}
        onOpenStockModal={(p) => {
          setPreviewProduct(null);
          setStockModalProduct(p);
        }}
      />
    </div>
  );
};
