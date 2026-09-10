import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  XCircle,
  Package,
  MapPin,
  Phone,
  User,
  CreditCard
} from 'lucide-react';
import { AdminOrder, OrderStatus } from '../../../types';
import { AdminCard } from '../../../components/ui/AdminCard';
import { AdminBadge } from '../../../components/ui/AdminBadge';
import { AdminButton } from '../../../components/ui/AdminButton';
import { AdminModal } from '../../../components/ui/AdminModal';
import { AdminSkeleton } from '../../../components/ui/AdminSkeleton';
import { AdminEmptyState } from '../../../components/ui/AdminEmptyState';

interface DashboardRecentOrdersProps {
  orders?: AdminOrder[];
  loading?: boolean;
  onUpdateStatus?: (orderId: number, status: OrderStatus) => Promise<boolean>;
}

export const DashboardRecentOrders: React.FC<DashboardRecentOrdersProps> = ({
  orders = [],
  loading = false,
  onUpdateStatus,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <AdminBadge variant="amber" icon={Clock}>بانتظار المعالجة</AdminBadge>;
      case 'processing':
        return <AdminBadge variant="primary" icon={Package}>قيد التجهيز</AdminBadge>;
      case 'shipped':
        return <AdminBadge variant="warning" icon={Truck}>تم الشحن</AdminBadge>;
      case 'delivered':
        return <AdminBadge variant="green" icon={CheckCircle}>تم التوصيل</AdminBadge>;
      case 'cancelled':
        return <AdminBadge variant="red" icon={XCircle}>ملغي</AdminBadge>;
      case 'returned':
        return <AdminBadge variant="neutral" icon={AlertCircle}>مرتجع</AdminBadge>;
      default:
        return <AdminBadge variant="neutral">{status}</AdminBadge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <AdminBadge variant="green" dot>مدفوع</AdminBadge>;
      case 'pending':
        return <AdminBadge variant="amber" dot>معلق</AdminBadge>;
      case 'failed':
        return <AdminBadge variant="red" dot>فشل الدفع</AdminBadge>;
      case 'refunded':
        return <AdminBadge variant="neutral" dot>مسترجع</AdminBadge>;
      default:
        return <AdminBadge variant="neutral">{status}</AdminBadge>;
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!selectedOrder || !onUpdateStatus) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(selectedOrder.id, newStatus);
      setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <AdminSkeleton className="h-6 w-36" />
          <AdminSkeleton className="h-8 w-24" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <AdminSkeleton key={`rec-order-skel-${i}`} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </AdminCard>
    );
  }

  return (
    <>
      <AdminCard className="p-0 overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 flex items-center justify-between border-b border-[#F0ECE4]">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#181818]">
              أحدث الطلبات
            </h3>
            <p className="text-xs text-[#9E9A90] mt-0.5">
              متابعة مباشرة لعمليات الشراء والتحصيل
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="text-xs font-bold text-[#00875A] hover:text-[#006E49] flex items-center gap-1 hover:underline"
          >
            <span>جميع الطلبات</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Table Content */}
        {orders.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              title="لا توجد طلبات حديثة"
              description="ستظهر هنا كافة طلبات العملاء فور إتمامها في المتجر"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#FAF8F3] text-[#6B6860] border-b border-[#E8E3D8] font-bold">
                <tr>
                  <th className="py-3 px-4 font-bold">رقم الطلب</th>
                  <th className="py-3 px-4 font-bold">العميل</th>
                  <th className="py-3 px-4 font-bold">التاريخ والوقت</th>
                  <th className="py-3 px-4 font-bold">الإجمالي</th>
                  <th className="py-3 px-4 font-bold">حالة الدفع</th>
                  <th className="py-3 px-4 font-bold">حالة الطلب</th>
                  <th className="py-3 px-4 font-bold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE4]">
                {orders.map((order, idx) => (
                  <tr
                    key={`rec-ord-${order.id || idx}-${idx}`}
                    className="hover:bg-[#FAF8F3] transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-3 px-4 font-bold text-[#181818] font-mono">
                      #{order.orderNumber}
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-[#181818] group-hover:text-[#00875A] transition-colors">
                          {order.customer.name}
                        </p>
                        <p className="text-[11px] text-[#9E9A90]">
                          {order.customer.phone}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[#6B6860]">
                      {new Date(order.createdAt).toLocaleString('ar-SA', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4 font-black text-[#181818]">
                      {Number(order?.total ?? 0).toLocaleString('ar-SA')} ر.س
                    </td>

                    <td className="py-3 px-4">
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </td>

                    <td className="py-3 px-4">
                      {getOrderStatusBadge(order.status)}
                    </td>

                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <AdminButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        icon={Eye}
                        className="text-xs"
                      >
                        معاينة
                      </AdminButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Quick Order Details Modal */}
      {selectedOrder && (
        <AdminModal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`تفاصيل الطلب #${selectedOrder.orderNumber}`}
          subtitle={`تاريخ الطلب: ${new Date(selectedOrder.createdAt).toLocaleDateString('ar-SA')}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B6860]">تغيير الحالة:</span>
                <select
                  disabled={isUpdating}
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  className="text-xs bg-[#FAF8F3] border border-[#E8E3D8] rounded-xl px-2.5 py-1.5 font-bold text-[#181818] focus:outline-none focus:border-[#00875A]"
                >
                  <option value="pending">بانتظار المعالجة</option>
                  <option value="processing">قيد التجهيز والتغليف</option>
                  <option value="shipped">تم الشحن للتوصيل</option>
                  <option value="delivered">تم التسليم للعميل</option>
                  <option value="cancelled">إلغاء الطلب</option>
                  <option value="returned">طلب مرتجع</option>
                </select>
              </div>

              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                إغلاق
              </AdminButton>
            </div>
          }
        >
          <div className="space-y-6 text-xs text-[#181818]">
            {/* Customer & Shipping Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Box */}
              <div className="p-3.5 bg-[#FAF8F3] rounded-2xl border border-[#E8E3D8] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#181818]">
                  <User className="w-4 h-4 text-[#00875A]" />
                  <span>بيانات العميل</span>
                </div>
                <div className="space-y-1 text-[#6B6860]">
                  <p className="font-semibold text-[#181818]">{selectedOrder.customer.name}</p>
                  <p>{selectedOrder.customer.email}</p>
                  <p className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#9E9A90]" />
                    <span>{selectedOrder.customer.phone}</span>
                  </p>
                </div>
              </div>

              {/* Shipping Box */}
              <div className="p-3.5 bg-[#FAF8F3] rounded-2xl border border-[#E8E3D8] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#181818]">
                  <MapPin className="w-4 h-4 text-[#00875A]" />
                  <span>عنوان التوصيل</span>
                </div>
                <div className="space-y-1 text-[#6B6860]">
                  <p>{selectedOrder.shippingAddress.addressLine1}</p>
                  <p>{selectedOrder.shippingAddress.city}، {selectedOrder.shippingAddress.country}</p>
                  {selectedOrder.trackingNumber && (
                    <p className="text-[11px] font-mono font-bold text-[#00875A]">
                      رقم التتبع: {selectedOrder.trackingNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items List */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#181818] text-xs">
                المنتجات المطلوبة ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-[#F0ECE4] border border-[#E8E3D8] rounded-2xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={`recent-item-${item.productId || idx}-${idx}`} className="p-3 flex items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-10 h-10 rounded-lg object-cover bg-[#FAF8F3] border border-[#E8E3D8]"
                      />
                      <div>
                        <p className="font-bold text-[#181818]">{item.productName}</p>
                        <p className="text-[11px] text-[#9E9A90]">
                          الكمية: {item.quantity} × {Number(item?.unitPrice ?? 0).toLocaleString('ar-SA')} ر.س
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-[#181818]">
                      {Number(item?.totalPrice ?? 0).toLocaleString('ar-SA')} ر.س
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-[#FAF8F3] rounded-2xl border border-[#E8E3D8] space-y-2">
              <div className="flex justify-between text-[#6B6860]">
                <span>المجموع الفرعي</span>
                <span>{Number(selectedOrder?.subtotal ?? 0).toLocaleString('ar-SA')} ر.س</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-[#00875A]">
                  <span>الخصم المطبق</span>
                  <span>- {Number(selectedOrder?.discount ?? 0).toLocaleString('ar-SA')} ر.س</span>
                </div>
              )}
              <div className="flex justify-between text-[#6B6860]">
                <span>ضريبة القيمة المضافة (15%)</span>
                <span>{Number(selectedOrder?.tax ?? 0).toLocaleString('ar-SA')} ر.س</span>
              </div>
              <div className="flex justify-between text-[#6B6860]">
                <span>الشحن والتوصيل</span>
                <span>{selectedOrder.shipping === 0 ? 'مجاني (شحن ملكي)' : `${selectedOrder.shipping} ر.س`}</span>
              </div>
              <div className="pt-2 border-t border-[#E8E3D8] flex justify-between font-black text-sm text-[#181818]">
                <span>الإجمالي النهائي</span>
                <span className="text-[#00875A]">{Number(selectedOrder?.total ?? 0).toLocaleString('ar-SA')} ر.س</span>
              </div>
            </div>
          </div>
        </AdminModal>
      )}
    </>
  );
};
