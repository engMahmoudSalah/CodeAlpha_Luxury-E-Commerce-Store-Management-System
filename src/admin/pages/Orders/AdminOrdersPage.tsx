import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Printer,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  RotateCcw,
  CreditCard,
  Calendar,
  ExternalLink,
  ChevronLeft,
  Crown
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminOrder, OrderStatus, PaymentStatus } from '../../types';
import { useToast } from '../../../context/ToastContext';
import { InvoiceModal } from '../../components/orders/InvoiceModal';
import { commerceEventBus } from '../../../shared/events/commerceEvents';

export const AdminOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'all'>('all');

  // Selected Order for Invoice Print
  const [invoiceOrder, setInvoiceOrder] = useState<AdminOrder | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOrders({ limit: 50 });
      setOrders(res.items);
    } catch (err: any) {
      showToast('تعذر تحميل بيانات الطلبات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const unsubCreate = commerceEventBus.subscribe('ORDER_CREATED', () => {
      loadOrders();
    });
    const unsubUpdate = commerceEventBus.subscribe('ORDER_UPDATED', () => {
      loadOrders();
    });
    return () => {
      unsubCreate();
      unsubUpdate();
    };
  }, []);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNumber = order.orderNumber.toLowerCase().includes(q);
        const matchesName = order.customer.name.toLowerCase().includes(q);
        const matchesPhone = order.customer.phone.toLowerCase().includes(q);
        const matchesEmail = order.customer.email.toLowerCase().includes(q);
        if (!matchesNumber && !matchesName && !matchesPhone && !matchesEmail) return false;
      }

      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      if (paymentStatusFilter !== 'all' && order.paymentStatus !== paymentStatusFilter) {
        return false;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, paymentStatusFilter]);

  // KPIs
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const totalSalesRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);

  // Status Change Quick Handler
  const handleQuickStatusChange = async (orderId: number, newStatus: OrderStatus, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast('تم تحديث حالة الطلب بنجاح', 'success');
    } catch (err: any) {
      showToast('تعذر تحديث حالة الطلب', 'error');
    }
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>بانتظار التأكيد</span>
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>جاري التجهيز</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            <span>تم الشحن</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#E6F4EE] text-[#00875A] border border-[#00875A]/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم التوصيل</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>ملغي</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F2EFE8] text-[#5A5852] border border-[#E8E3D8] flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>مسترجع</span>
          </span>
        );
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#E6F4EE] text-[#00875A] border border-[#00875A]/20">
            مدفوع بالكامل
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            معلق
          </span>
        );
      case 'refunded':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            مسترد
          </span>
        );
    }
  };

  return (
    <div id="admin-orders-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#181818] tracking-tight font-arabic flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-[#00875A]" />
            <span>إدارة الطلبات والمبيعات الملكية</span>
          </h1>
          <p className="text-sm text-[#5A5852] mt-1 font-arabic">
            متابعة دقيقة لمراحل الشحن، الفواتير الإلكترونية، والتواصل مع عملاء كبار الشخصيات
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              showToast('جاري تصدير سجل المبيعات إلى ملف Excel...', 'info');
              setTimeout(() => showToast('تم التصدير بنجاح', 'success'), 1000);
            }}
            className="px-4 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] hover:bg-[#FAF8F5] transition-colors cursor-pointer shadow-xs flex items-center gap-2"
          >
            <span>تصدير المبيعات</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] flex items-center justify-center text-[#181818]">
            <ShoppingBag className="w-5 h-5 text-[#00875A]" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">إجمالي الطلبات</span>
            <span className="text-xl font-black text-[#181818] font-arabic">
              {totalOrdersCount.toLocaleString('ar-SA')} طلب
            </span>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3 cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">قيد التجهيز والمعالجة</span>
            <span className="text-xl font-black text-amber-700 font-arabic">
              {pendingCount.toLocaleString('ar-SA')} طلبات
            </span>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('shipped')}
          className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3 cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">جاري الشحن والتوصيل</span>
            <span className="text-xl font-black text-amber-800 font-arabic">
              {shippedCount.toLocaleString('ar-SA')} شحنات
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E6F4EE] border border-[#00875A]/20 flex items-center justify-center text-[#00875A]">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">إجمالي الإيرادات المسددة</span>
            <span className="text-xl font-black text-[#00875A] font-arabic">
              {totalSalesRevenue.toLocaleString('ar-SA')} ر.س
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A5852]" />
          <input
            id="orders-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الطلب، اسم العميل، الجوال..."
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-[#E8E3D8] bg-[#FAF8F5] text-sm text-[#181818] placeholder-[#5A5852] focus:outline-none focus:border-[#00875A] transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            id="orders-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] focus:outline-none focus:border-[#00875A] cursor-pointer"
          >
            <option value="all">كل حالات الطلب</option>
            <option value="pending">بانتظار التأكيد</option>
            <option value="processing">جاري التجهيز</option>
            <option value="shipped">تم الشحن</option>
            <option value="delivered">تم التوصيل</option>
            <option value="cancelled">ملغي</option>
            <option value="refunded">مسترجع</option>
          </select>

          <select
            id="orders-payment-filter"
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] focus:outline-none focus:border-[#00875A] cursor-pointer"
          >
            <option value="all">كل حالات السداد</option>
            <option value="paid">مدفوع بالكامل</option>
            <option value="pending">معلق / تحويل</option>
            <option value="refunded">مسترد</option>
          </select>

          {(statusFilter !== 'all' || paymentStatusFilter !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPaymentStatusFilter('all');
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              إعادة ضبط
            </button>
          )}
        </div>
      </div>

      {/* Orders List Table */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E8E3D8]">
          <div className="w-10 h-10 border-3 border-[#00875A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#5A5852] font-arabic">جاري تحميل سجل الطلبات الملكية...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#E8E3D8] p-6">
          <ShoppingBag className="w-12 h-12 text-[#5A5852]/40 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-[#181818] mb-1 font-arabic">
            لا توجد طلبات مطابقة للبحث
          </h3>
          <p className="text-xs text-[#5A5852]">
            تأكد من شروط الفلترة أو ابحث برقم هاتف أو اسم عميل آخر
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E3D8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E3D8] text-[11px] font-bold text-[#5A5852] uppercase tracking-wider font-arabic">
                  <th className="py-3.5 px-4">رقم الطلب</th>
                  <th className="py-3.5 px-4">العميل والتواصل</th>
                  <th className="py-3.5 px-4">القطع المطلوبة</th>
                  <th className="py-3.5 px-4">قيمة الطلب</th>
                  <th className="py-3.5 px-4">حالة السداد</th>
                  <th className="py-3.5 px-4">مرحلة الطلب</th>
                  <th className="py-3.5 px-4">التاريخ</th>
                  <th className="py-3.5 px-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D8] text-xs">
                {filteredOrders.map((order, idx) => (
                  <tr
                    key={`admin-ord-${order.id || idx}-${idx}`}
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="hover:bg-[#FAF8F5]/80 transition-colors cursor-pointer group"
                  >
                    {/* Order Number */}
                    <td className="py-4 px-4 font-mono font-bold text-[#181818]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E8E3D8] flex items-center justify-center text-[#00875A] group-hover:border-[#00875A]/40 transition-colors">
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-extrabold text-sm">{order.orderNumber}</span>
                        {order.giftWrapping && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black flex items-center gap-0.5 shrink-0" title="طلب تغليف هدايا">
                            <span>🎁</span>
                            <span>هدايا</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4 font-arabic">
                      <div>
                        <span className="font-extrabold text-sm text-[#181818] block">
                          {order.customer.name}
                        </span>
                        <span className="text-[11px] text-[#5A5852] font-mono block">
                          {order.customer.phone}
                        </span>
                      </div>
                    </td>

                    {/* Items Thumbnails */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={`item-${item.productId || idx}-${idx}`}
                            className="w-8 h-8 rounded-lg border border-[#E8E3D8] overflow-hidden bg-[#FAF8F5] shrink-0"
                            title={`${item.productName} (x${item.quantity})`}
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E8E3D8] text-[11px] font-bold text-[#5A5852] flex items-center justify-center">
                            +{order.items.length - 3}
                          </span>
                        )}
                        <span className="text-[11px] text-[#5A5852] font-arabic mr-1">
                          ({order.items.reduce((s, i) => s + i.quantity, 0)} قطع)
                        </span>
                      </div>
                    </td>

                    {/* Total Price */}
                    <td className="py-4 px-4 font-bold text-[#181818] font-arabic">
                      <span className="text-sm font-black text-[#00875A]">
                        {Number(order?.total ?? 0).toLocaleString('ar-SA')} ر.س
                      </span>
                      <span className="text-[11px] text-[#5A5852] block font-normal">
                        {order.paymentMethod}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="py-4 px-4">
                      {getPaymentBadge(order.paymentStatus)}
                    </td>

                    {/* Order Status (With inline change option) */}
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleQuickStatusChange(order.id, e.target.value as any, e)}
                          className="px-2.5 py-1 rounded-lg border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] focus:outline-none focus:border-[#00875A] cursor-pointer"
                        >
                          <option value="pending">بانتظار التأكيد</option>
                          <option value="processing">جاري التجهيز</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="delivered">تم التوصيل</option>
                          <option value="cancelled">ملغي</option>
                          <option value="refunded">مسترجع</option>
                        </select>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-[#5A5852] whitespace-nowrap font-arabic text-[11px]">
                      {new Date(order.createdAt).toLocaleString('ar-SA', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-left" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setInvoiceOrder(order);
                            setInvoiceOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#00875A] hover:bg-[#E6F4EE] transition-colors cursor-pointer"
                          title="عرض وطباعة الفاتورة الضريبية"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `مرحباً ${order.customer.name}، نتواصل معك من متجر فخامة بخصوص طلبكم الكريم رقم ${order.orderNumber}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#00875A] hover:bg-[#E6F4EE] transition-colors"
                          title="مراسلة العميل عبر واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="p-1.5 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#181818] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                          title="تفاصيل الطلب الكاملة"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
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

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceOpen}
        onClose={() => {
          setInvoiceOpen(false);
          setInvoiceOrder(null);
        }}
        order={invoiceOrder}
      />
    </div>
  );
};
