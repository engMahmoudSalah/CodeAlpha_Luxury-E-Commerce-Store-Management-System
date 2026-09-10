import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw,
  Plus,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Download
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services';
import { DashboardData, DateRangeOption, OrderStatus } from '../../types';
import { AdminPageHeader } from '../../components/layout/AdminPageHeader';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminBadge } from '../../components/ui/AdminBadge';
import { DashboardQuickActions } from './components/DashboardQuickActions';
import { DashboardMetricsGrid } from './components/DashboardMetricsGrid';
import { DashboardSalesChart } from './components/DashboardSalesChart';
import { DashboardRecentOrders } from './components/DashboardRecentOrders';
import { DashboardTopProducts } from './components/DashboardTopProducts';
import { DashboardLowStock } from './components/DashboardLowStock';
import { DashboardUrgentActions } from './components/DashboardUrgentActions';
import { DashboardCategoryDistribution } from './components/DashboardCategoryDistribution';
import { DashboardRegionalSales } from './components/DashboardRegionalSales';
import { DashboardLiveActivity } from './components/DashboardLiveActivity';
import { commerceEventBus } from '../../../shared/events/commerceEvents';

export const AdminDashboardPage: React.FC = () => {
  const { setBreadcrumbs } = useAdmin();
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRangeOption>('7days');

  // Sync breadcrumbs
  useEffect(() => {
    setBreadcrumbs([
      { label: 'لوحة التحكم', active: true },
    ]);
  }, [setBreadcrumbs]);

  // Load Dashboard Data
  const loadDashboard = useCallback(async (range: DateRangeOption, isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const result = await adminService.getDashboardData(range);
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch when range changes or commerce state changes
  useEffect(() => {
    loadDashboard(selectedRange);
    const unsubOrder = commerceEventBus.subscribe('ORDER_CREATED', () => {
      loadDashboard(selectedRange, true);
    });
    const unsubOrderUp = commerceEventBus.subscribe('ORDER_UPDATED', () => {
      loadDashboard(selectedRange, true);
    });
    const unsubProd = commerceEventBus.subscribe('PRODUCT_UPDATED', () => {
      loadDashboard(selectedRange, true);
    });
    const unsubInv = commerceEventBus.subscribe('INVENTORY_LOG_CREATED', () => {
      loadDashboard(selectedRange, true);
    });
    const unsubCust = commerceEventBus.subscribe('CUSTOMER_UPDATED', () => {
      loadDashboard(selectedRange, true);
    });
    return () => {
      unsubOrder();
      unsubOrderUp();
      unsubProd();
      unsubInv();
      unsubCust();
    };
  }, [selectedRange, loadDashboard]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard(selectedRange, true);
    showToast({
      title: 'تم تحديث البيانات',
      message: 'تمت مزامنة كافة مؤشرات ومبيعات المتجر اللحظية بنجاح.',
      type: 'success',
    });
  };

  const handleExportReport = () => {
    if (!data) return;
    const reportData = `مؤشر,القيمة,النمو
إجمالي الإيرادات,${data.metrics.revenue.value} ر.س,${data.metrics.revenue.changePercentage}%
عدد الطلبات,${data.metrics.orders.value},${data.metrics.orders.changePercentage}%
متوسط قيمة الطلب (AOV),${data.metrics.averageOrderValue.value} ر.س,${data.metrics.averageOrderValue.changePercentage}%
القطع المباعة,${data.metrics.totalSales.value},${data.metrics.totalSales.changePercentage}%
العملاء النشطون,${data.metrics.customers.value},${data.metrics.customers.changePercentage}%`;

    const blob = new Blob(['\uFEFF' + reportData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Fakhama-Executive-Report-${selectedRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      title: 'تم تصدير التقرير',
      message: 'تم إنشاء وتنزيل التقرير التنفيذي بصيغة CSV بنجاح.',
      type: 'success',
    });
  };

  const handleUpdateOrderStatus = async (orderId: number, status: OrderStatus): Promise<boolean> => {
    const success = await adminService.updateOrderStatus(orderId, status);
    if (success && data) {
      setData({
        ...data,
        recentOrders: data.recentOrders.map((o) =>
          o.id === orderId ? { ...o, status } : o
        ),
      });
      showToast({
        title: 'تم تحديث حالة الطلب',
        message: `تم تحديث حالة الطلب #${orderId} بنجاح.`,
        type: 'success',
      });
    }
    return success;
  };

  const handleUpdateStock = async (productId: number, newStock: number): Promise<boolean> => {
    const success = await adminService.updateProductStock(productId, newStock);
    if (success && data) {
      setData({
        ...data,
        lowStockProducts: data.lowStockProducts.filter((p) =>
          p.id === productId ? newStock <= p.lowStockThreshold : true
        ),
      });
      showToast({
        title: 'تم تزويد المخزون',
        message: `تم ضبط الكمية إلى ${newStock} وحدة بنجاح.`,
        type: 'success',
      });
    }
    return success;
  };

  if (error) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="لوحة التحكم الرئيسية"
          subtitle="متابعة فورية للمبيعات والمخزون والطلبات"
        />
        <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#181818]">فشل تحميل بيانات لوحة التحكم</h3>
          <p className="text-xs text-[#6B6860] max-w-md mx-auto">{error}</p>
          <AdminButton
            variant="primary"
            size="sm"
            onClick={() => loadDashboard(selectedRange)}
            icon={RefreshCw}
          >
            إعادة المحاولة
          </AdminButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-8">
      {/* Page Header */}
      <AdminPageHeader
        title="لوحة الإدارة والتحكم"
        subtitle="نظرة شاملة وفورية على المبيعات، نمو الإيرادات، والمستودع"
        badge={
          <AdminBadge variant="green" dot>
            النظام يعمل بكفاءة
          </AdminBadge>
        }
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <AdminButton
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportReport}
            >
              تصدير التقرير
            </AdminButton>

            <AdminButton
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              isLoading={refreshing}
              onClick={handleRefresh}
            >
              تحديث
            </AdminButton>

            <Link to="/admin/products/new">
              <AdminButton
                variant="primary"
                size="sm"
                icon={Plus}
              >
                إضافة منتج
              </AdminButton>
            </Link>
          </div>
        }
      />

      {/* Quick Action Navigation Strip */}
      <section>
        <DashboardQuickActions />
      </section>

      {/* Urgent Operational Alerts Hub */}
      <section>
        <DashboardUrgentActions loading={loading} />
      </section>

      {/* Overview Metrics KPIs */}
      <section>
        <DashboardMetricsGrid
          metrics={data?.metrics}
          loading={loading}
        />
      </section>

      {/* Sales Overview Chart */}
      <section>
        <DashboardSalesChart
          data={data?.chartData}
          loading={loading}
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
        />
      </section>

      {/* Two Column Layout: Recent Orders + (Top Products & Low Stock Alerts) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Orders (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          <DashboardRecentOrders
            orders={data?.recentOrders}
            loading={loading}
            onUpdateStatus={handleUpdateOrderStatus}
          />

          <DashboardLiveActivity loading={loading} />
        </div>

        {/* Right Column: Top Products, Low Stock, Regional & Categories (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <DashboardTopProducts
            products={data?.topProducts}
            loading={loading}
          />

          <DashboardLowStock
            products={data?.lowStockProducts}
            loading={loading}
            onUpdateStock={handleUpdateStock}
          />

          <DashboardCategoryDistribution loading={loading} />

          <DashboardRegionalSales loading={loading} />
        </div>
      </section>
    </div>
  );
};

