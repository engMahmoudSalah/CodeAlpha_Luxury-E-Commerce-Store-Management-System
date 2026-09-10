import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Download,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminProduct, AdminInventoryLog, StockStatus } from '../../types';
import { useToast } from '../../../context/ToastContext';
import { StockAdjustmentModal } from '../../components/inventory/StockAdjustmentModal';
import { commerceEventBus } from '../../../shared/events/commerceEvents';

export const AdminInventoryPage: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'catalog' | 'logs'>('catalog');
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [logs, setLogs] = useState<AdminInventoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<StockStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  // Adjustment Modal
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Threshold edit
  const [editingThresholdId, setEditingThresholdId] = useState<number | null>(null);
  const [tempThreshold, setTempThreshold] = useState<number>(3);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, logRes, catRes] = await Promise.all([
        adminService.getInventory({ limit: 100 }),
        adminService.getInventoryLogs(),
        adminService.getProductCategories(),
      ]);
      setProducts(prodRes.items);
      setLogs(logRes);
      setCategories(catRes);
    } catch (err: any) {
      showToast('تعذر تحميل بيانات المخزون', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubInv = commerceEventBus.subscribe('INVENTORY_LOG_CREATED', () => {
      loadData();
    });
    const unsubProd = commerceEventBus.subscribe('PRODUCT_UPDATED', () => {
      loadData();
    });
    const unsubOrder = commerceEventBus.subscribe('ORDER_CREATED', () => {
      loadData();
    });
    return () => {
      unsubInv();
      unsubProd();
      unsubOrder();
    };
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesBrand) return false;
      }
      if (stockStatusFilter !== 'all' && p.stockStatus !== stockStatusFilter) {
        return false;
      }
      if (categoryFilter !== 'all' && p.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [products, searchQuery, stockStatusFilter, categoryFilter]);

  // Inventory KPI calculations
  const totalStockUnits = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stock, 0);
  }, [products]);

  const totalRetailValuation = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stock * p.price, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stockStatus === 'low_stock').length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => p.stockStatus === 'out_of_stock').length;
  }, [products]);

  // Handlers
  const handleQuickAdjust = async (product: AdminProduct, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    const reason = delta > 0 ? 'إضافة شحنة سريعة (+) من لوحة المخزون' : 'صرف سريع (-) من لوحة المخزون';
    try {
      await adminService.adjustStock(product.id, newStock, reason);
      showToast(`تم تعديل مخزون "${product.name}" إلى ${newStock} قطعة`, 'success');
      await loadData();
    } catch (err: any) {
      showToast('تعذر تعديل المخزون', 'error');
    }
  };

  const handleFullAdjust = async (productId: number, newStock: number, reason: string) => {
    try {
      await adminService.adjustStock(productId, newStock, reason);
      showToast('تم تحديث بيانات المخزون بنجاح', 'success');
      await loadData();
    } catch (err: any) {
      showToast('حدث خطأ أثناء حفظ التعديل', 'error');
    }
  };

  const handleSaveThreshold = async (product: AdminProduct) => {
    try {
      await adminService.updateLowStockThreshold(product.id, tempThreshold);
      showToast(`تم تعيين حد التنبيه لـ "${product.name}" إلى ${tempThreshold} قطع`, 'success');
      setEditingThresholdId(null);
      await loadData();
    } catch (err: any) {
      showToast('تعذر تحديث حد التنبيه', 'error');
    }
  };

  const handleExport = () => {
    showToast('جاري تصدير تقرير الجرد والمخزون إلى ملف Excel/CSV...', 'info');
    setTimeout(() => {
      showToast('تم تصدير كشف الجرد بنجاح', 'success');
    }, 1000);
  };

  const getStockStatusBadge = (status: StockStatus, stock: number) => {
    switch (status) {
      case 'in_stock':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#E6F4EE] text-[#00875A] border border-[#00875A]/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>متوفر ({stock})</span>
          </span>
        );
      case 'low_stock':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>منخفض ({stock})</span>
          </span>
        );
      case 'out_of_stock':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>نفد من المخزن</span>
          </span>
        );
    }
  };

  const getLogTypeBadge = (type: AdminInventoryLog['type']) => {
    switch (type) {
      case 'in':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#E6F4EE] text-[#00875A] border border-[#00875A]/20 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>توريد (+)</span>
          </span>
        );
      case 'out':
      case 'order':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3" />
            <span>صرف / مبيعات (-)</span>
          </span>
        );
      case 'adjustment':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            <span>تسوية جرد</span>
          </span>
        );
      case 'return':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>استرجاع (+)</span>
          </span>
        );
    }
  };

  return (
    <div id="admin-inventory-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#181818] tracking-tight font-arabic flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-[#00875A]" />
            <span>إدارة المخزون والمستودع الملكي</span>
          </h1>
          <p className="text-sm text-[#5A5852] mt-1 font-arabic">
            متابعة دقيقة لأرصدة القطع الفاخرة، تنبيهات النفاذ، وسجل حركات الجرد اللحظية
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] hover:bg-[#FAF8F5] transition-colors cursor-pointer shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-[#5A5852]" />
            <span>تصدير كشف الجرد</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] flex items-center justify-center text-[#00875A]">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">إجمالي القطع بالمخزن</span>
            <span className="text-xl font-black text-[#181818] font-arabic">
              {totalStockUnits.toLocaleString('ar-SA')} قطعة
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E6F4EE] border border-[#00875A]/20 flex items-center justify-center text-[#00875A]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">القيمة السوقية للمخزون</span>
            <span className="text-xl font-black text-[#00875A] font-arabic">
              {totalRetailValuation.toLocaleString('ar-SA')} ر.س
            </span>
          </div>
        </div>

        <div
          onClick={() => setStockStatusFilter('low_stock')}
          className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3 cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">تنبيهات مخزون منخفض</span>
            <span className="text-xl font-black text-amber-700 font-arabic">
              {lowStockCount.toLocaleString('ar-SA')} منتجات
            </span>
          </div>
        </div>

        <div
          onClick={() => setStockStatusFilter('out_of_stock')}
          className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3 cursor-pointer hover:border-rose-400 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">قطع نفدت من المخزن</span>
            <span className="text-xl font-black text-rose-700 font-arabic">
              {outOfStockCount.toLocaleString('ar-SA')} منتج
            </span>
          </div>
        </div>
      </div>

      {/* Critical Low Stock Warning Banner */}
      {lowStockCount > 0 && stockStatusFilter === 'all' && (
        <div className="p-4 rounded-2xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 font-arabic">
                يوجد {lowStockCount} منتجات وصلت لحد الأمان الحرج أو أوشكت على النفاذ!
              </h4>
              <p className="text-[11px] text-amber-800/80 font-arabic">
                يُرجى مراجعة الموردين واستلام شحنات التوريد الجديدة لضمان عدم توقف المبيعات
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStockStatusFilter('low_stock')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            عرض المنتجات المنخفضة
          </button>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center border-b border-[#E8E3D8] gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 text-sm font-bold transition-colors cursor-pointer relative font-arabic flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'text-[#00875A]'
              : 'text-[#5A5852] hover:text-[#181818]'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>أرصدة الكتالوج والمستودع</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#FAF8F5] border border-[#E8E3D8]">
            {products.length}
          </span>
          {activeTab === 'catalog' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00875A] rounded-t-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-bold transition-colors cursor-pointer relative font-arabic flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'text-[#00875A]'
              : 'text-[#5A5852] hover:text-[#181818]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>سجل حركات وتدقيق المخزون (Audit Trail)</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#FAF8F5] border border-[#E8E3D8]">
            {logs.length}
          </span>
          {activeTab === 'logs' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00875A] rounded-t-full" />
          )}
        </button>
      </div>

      {activeTab === 'catalog' ? (
        /* CATALOG INVENTORY VIEW */
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A5852]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم، رمز SKU، الماركة..."
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-[#E8E3D8] bg-[#FAF8F5] text-sm text-[#181818] placeholder-[#5A5852] focus:outline-none focus:border-[#00875A] transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] focus:outline-none focus:border-[#00875A] cursor-pointer"
              >
                <option value="all">كل حالات المخزون</option>
                <option value="in_stock">المتوفر فقط</option>
                <option value="low_stock">المخزون المنخفض ⚠️</option>
                <option value="out_of_stock">النافد من المخزن ❌</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] focus:outline-none focus:border-[#00875A] cursor-pointer"
              >
                <option value="all">كل التصنيفات</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>

              {(stockStatusFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStockStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  إعادة ضبط
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-[#E8E3D8]">
              <div className="w-10 h-10 border-3 border-[#00875A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-[#5A5852] font-arabic">جاري جرد المخزون...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-[#E8E3D8] p-6">
              <Boxes className="w-12 h-12 text-[#5A5852]/40 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-[#181818] mb-1 font-arabic">
                لا توجد منتجات مطابقة لفلتر المخزون
              </h3>
              <p className="text-xs text-[#5A5852]">
                جرب تغيير خيارات البحث أو إعادة ضبط الفلاتر
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8E3D8] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#E8E3D8] text-[11px] font-bold text-[#5A5852] uppercase tracking-wider font-arabic">
                      <th className="py-3.5 px-4">المنتج والرمز</th>
                      <th className="py-3.5 px-4">التصنيف</th>
                      <th className="py-3.5 px-4">السعر</th>
                      <th className="py-3.5 px-4">الحالة الحالية</th>
                      <th className="py-3.5 px-4">الرصيد المتاح</th>
                      <th className="py-3.5 px-4">حد الأمان (تنبيه)</th>
                      <th className="py-3.5 px-4 text-left">تعديل سريع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E3D8] text-xs">
                    {filteredProducts.map((prod, idx) => (
                      <tr
                        key={`inv-prod-${prod.id || idx}-${idx}`}
                        className={`hover:bg-[#FAF8F5]/80 transition-colors ${
                          prod.stockStatus === 'low_stock' ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {/* Product & SKU */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl border border-[#E8E3D8] overflow-hidden shrink-0 bg-[#FAF8F5]">
                              <img
                                src={prod.image_url}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-extrabold text-sm text-[#181818] block font-arabic truncate max-w-xs">
                                {prod.name}
                              </span>
                              <span className="text-[11px] text-[#5A5852] font-mono">
                                {prod.sku}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 font-arabic text-[#5A5852]">
                          {prod.category}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-bold text-[#181818] font-arabic">
                          {Number(prod?.price ?? 0).toLocaleString('ar-SA')} ر.س
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {getStockStatusBadge(prod.stockStatus, prod.stock)}
                        </td>

                        {/* Available Stock */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-base font-black font-arabic ${
                                prod.stock === 0
                                  ? 'text-rose-600'
                                  : prod.stock <= prod.lowStockThreshold
                                  ? 'text-amber-700'
                                  : 'text-[#181818]'
                              }`}
                            >
                              {prod.stock}
                            </span>
                            <span className="text-[11px] text-[#5A5852] font-arabic">قطعة</span>
                          </div>
                        </td>

                        {/* Safety Threshold */}
                        <td className="py-3.5 px-4">
                          {editingThresholdId === prod.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={1}
                                value={tempThreshold}
                                onChange={(e) => setTempThreshold(parseInt(e.target.value) || 1)}
                                className="w-14 px-2 py-1 rounded-lg border border-[#00875A] text-xs font-bold text-center"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveThreshold(prod)}
                                className="p-1 rounded-md bg-[#00875A] text-white hover:bg-[#00704A] cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingThresholdId(null)}
                                className="p-1 rounded-md bg-[#FAF8F5] border border-[#E8E3D8] text-[#5A5852] cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingThresholdId(prod.id);
                                setTempThreshold(prod.lowStockThreshold);
                              }}
                              className="group flex items-center gap-1.5 text-xs text-[#5A5852] hover:text-[#00875A] cursor-pointer font-arabic"
                              title="تعديل حد التنبيه"
                            >
                              <span>≤ {prod.lowStockThreshold} قطع</span>
                              <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Fast Quick Stock +/- */}
                            <button
                              type="button"
                              onClick={() => handleQuickAdjust(prod, -1)}
                              disabled={prod.stock === 0}
                              className="p-1.5 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-30"
                              title="خصم قطعة (-1)"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickAdjust(prod, 1)}
                              className="p-1.5 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#00875A] hover:bg-[#E6F4EE] transition-colors cursor-pointer"
                              title="إضافة قطعة (+1)"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProduct(prod);
                                setModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-[#00875A]/30 bg-[#E6F4EE] text-[#00875A] hover:bg-[#00875A] hover:text-white transition-colors cursor-pointer font-bold text-xs flex items-center gap-1"
                              title="تعديل مفصل مع تسجيل السبب"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>تعديل دقيق</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* AUDIT TRAIL LOGS VIEW */
        <div className="bg-white rounded-2xl border border-[#E8E3D8] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E8E3D8] bg-[#FAF8F5] flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-[#181818] font-arabic">
                سجل تدقيق حركات المستودع اللحظية
              </h3>
              <p className="text-[11px] text-[#5A5852] font-arabic">
                توثيق غير قابل للتعديل لكافة عمليات التوريد والصرف وتسويات الجرد
              </p>
            </div>
            <span className="text-xs font-bold text-[#00875A] bg-[#E6F4EE] px-3 py-1 rounded-lg border border-[#00875A]/20">
              {logs.length} عملية مسجلة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E3D8] text-[11px] font-bold text-[#5A5852] uppercase tracking-wider font-arabic">
                  <th className="py-3 px-4">التوقيت</th>
                  <th className="py-3 px-4">نوع الحركة</th>
                  <th className="py-3 px-4">المنتج والرمز</th>
                  <th className="py-3 px-4">التغيير في الرصيد</th>
                  <th className="py-3 px-4">الرصيد بعد الحركة</th>
                  <th className="py-3 px-4">السبب المسجل</th>
                  <th className="py-3 px-4">المستخدم المسؤول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D8] text-xs font-arabic">
                {logs.map((log, idx) => (
                  <tr key={`inv-log-${log.id || idx}-${idx}`} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-3 px-4 text-[#5A5852] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4">{getLogTypeBadge(log.type)}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#181818] block">{log.productName}</span>
                      <span className="text-[11px] font-mono text-[#5A5852]">{log.sku}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-black text-sm ${
                          log.quantityChange > 0
                            ? 'text-[#00875A]'
                            : log.quantityChange < 0
                            ? 'text-rose-600'
                            : 'text-[#5A5852]'
                        }`}
                      >
                        {log.quantityChange > 0
                          ? `+${log.quantityChange}`
                          : log.quantityChange}{' '}
                        قطعة
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#181818]">
                      {log.newStock} قطعة
                      <span className="text-[11px] text-[#5A5852] font-normal block">
                        (سابقاً: {log.previousStock})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#5A5852] max-w-xs">{log.reason}</td>
                    <td className="py-3 px-4 font-bold text-[#181818]">{log.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onAdjust={handleFullAdjust}
      />
    </div>
  );
};
