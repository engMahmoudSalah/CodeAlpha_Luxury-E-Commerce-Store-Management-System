import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { commerceStore } from '../shared/store/commerceStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Package,
  Truck,
  ChevronLeft,
  ShoppingBag,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { data: orders = [], isLoading } = useOrders();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = !searchQuery.trim() || order.id.toString().includes(searchQuery.trim());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <Badge variant="success" size="md">تم التسليم والتوقيع</Badge>;
      case 'shipped':
        return <Badge variant="primary" size="md">في الطريق مع المندوب</Badge>;
      case 'processing':
        return <Badge variant="warning" size="md">قيد التجهيز والتغليف</Badge>;
      case 'cancelled':
        return <Badge variant="danger" size="md">ملغي</Badge>;
      case 'returned':
        return <Badge variant="warning" size="md">تم الاسترجاع ورد المبلغ</Badge>;
      case 'refunded':
        return <Badge variant="success" size="md">مسترد</Badge>;
      default:
        return <Badge variant="neutral" size="md">{status}</Badge>;
    }
  };

  const statusMap: { [key: string]: string } = {
    all: 'كافة الطلبات',
    pending: 'قيد الانتظار',
    processing: 'قيد التجهيز',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    returned: 'تم الاسترجاع',
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 font-arabic" dir="rtl">
        <Spinner size="lg" />
        <p className="text-sm font-black text-[#111111]">جاري استرجاع سجل المقتنيات والطلبات...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-8 pb-20 font-arabic" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8E3D8] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black px-2.5 py-0.5 bg-[#008F68]/10 text-[#008F68] rounded-full">
              السجل الملكي المعتمد
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">سجل المقتنيات والطلبات</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            متابعة حالة شحن مقتنياتك وتفاصيل فواتيرها وتتبع مسار المندوب المباشر.
          </p>
        </div>

        <Link to="/">
          <Button variant="secondary" size="sm" rightIcon={<ShoppingBag className="w-4 h-4" />}>
            استكشاف المعرض
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-[#E8E3D8] shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'pending', 'processing', 'shipped', 'delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#008F68] text-white shadow-xs'
                  : 'bg-[#FCFAF7] text-neutral-600 hover:text-[#111111] border border-[#E8E3D8]'
              }`}
            >
              {statusMap[st] || st}
            </button>
          ))}
        </div>

        {/* Search Order Reference */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="بحث برقم الطلب (مثال: 1001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FCFAF7] border border-[#E8E3D8] rounded-full pr-9 pl-4 py-2 text-xs text-[#111111] placeholder-neutral-400 focus:outline-none focus:border-[#008F68] transition-all"
          />
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-10 h-10 text-neutral-400" />}
          title="لم يتم العثور على طلبات"
          description={
            statusFilter !== 'all'
              ? `لا توجد لديك طلبات حالياً بالحالة المختارة.`
              : "لم تقم بتسجيل أي طلبات مقتنيات بعد."
          }
          actionText="تصفح المعرض واقتنِ الآن"
          onAction={() => window.location.assign('/')}
        />
      ) : (
        <div className="flex flex-col gap-5">
          {filteredOrders.map((order, idx) => (
            <div
              key={`usr-ord-${order.id || idx}-${idx}`}
              className="rounded-3xl bg-white border border-[#E8E3D8] p-6 sm:p-7 shadow-2xs flex flex-col gap-4 hover:border-[#008F68]/50 transition-all"
            >
              {/* Order Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E3D8] pb-4 text-xs">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-black text-[#111111] text-sm">
                    طلب رقم {order.orderNumber || (String(order.id).startsWith('ORD-') ? order.id : `ORD-${order.id}`)}
                  </span>
                  {getStatusBadge(order.status)}
                  {order.giftWrapping && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                      🎁 تغليف هدايا ملكي
                    </span>
                  )}
                  {(() => {
                    const ret = commerceStore.getReturnRequests().find(
                      (r) => String(r.orderId) === String(order.id) || String(r.orderId) === `ORD-${order.id}`
                    );
                    if (!ret) return null;
                    return (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        <RotateCcw className="w-3 h-3" />
                        طلب استرجاع: {ret.status === 'pending_review' ? 'قيد المراجعة' : ret.status === 'approved' ? 'مقبول' : ret.status === 'refunded' ? 'مسترجع' : 'مرفوض'}
                      </span>
                    );
                  })()}
                </div>

                <div className="flex items-center gap-4 text-neutral-500">
                  <span>تاريخ التسجيل: {new Date(order.created_at).toLocaleDateString('ar-SA')}</span>
                  <span>•</span>
                  <span className="font-black text-[#111111] text-sm font-mono">{Number(order?.total ?? 0).toLocaleString('ar-SA')} ر.س</span>
                </div>
              </div>

              {/* Order Items Preview */}
              {order.items && order.items.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto py-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={`orders-item-${item.productId || idx}-${idx}`}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-[#FCFAF7] border border-[#E8E3D8] shrink-0 max-w-xs"
                    >
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name || 'Product'}
                          className="w-11 h-11 rounded-xl object-contain bg-white p-1 shrink-0 border border-[#E8E3D8] mix-blend-multiply"
                        />
                      )}
                      <div className="min-w-0 pl-2">
                        <p className="text-xs font-black text-[#111111] truncate">{item.product_name || item.name || `مقتنى #${item.productId}`}</p>
                        <p className="text-[11px] text-neutral-500 font-bold font-mono">
                          {item.quantity} × {Number(item.price || 0).toLocaleString('ar-SA')} ر.س
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[#F0EAE1]">
                <div className="text-xs text-neutral-500">
                  العنوان: <span className="font-bold text-[#111111]">{order.shipping_address || 'توصيل مخصص وسريع'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/track-order?id=${order.orderNumber || order.id}`}>
                    <Button variant="secondary" size="sm" leftIcon={<Truck className="w-3.5 h-3.5 text-[#008F68]" />}>
                      تتبع الشحنة
                    </Button>
                  </Link>

                  <Link to={`/orders/${order.id}`}>
                    <Button variant="primary" size="sm" leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}>
                      تفاصيل الفاتورة
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
