import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useOrder } from '../hooks/useOrders';
import { commerceStore } from '../shared/store/commerceStore';
import { commerceEventBus } from '../shared/events/commerceEvents';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Phone,
  ShieldCheck,
  Package,
  ChevronLeft
} from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams<{ id?: string }>();
  const initialId = params.id || searchParams.get('id') || '';
  const [orderInput, setOrderInput] = useState(initialId);
  const [queriedId, setQueriedId] = useState(initialId);

  useEffect(() => {
    if (initialId) {
      setOrderInput(initialId);
      setQueriedId(initialId);
    }
  }, [initialId]);

  const { data: order, isLoading, isError, refetch } = useOrder(queriedId, Boolean(queriedId));

  // Live updates from commerceEventBus
  useEffect(() => {
    const unsub = commerceEventBus.subscribe('ORDER_UPDATED', (updatedOrder) => {
      if (
        String(updatedOrder.id) === String(queriedId) ||
        updatedOrder.orderNumber === String(queriedId) ||
        updatedOrder.trackingNumber === String(queriedId)
      ) {
        refetch();
      }
    });
    return unsub;
  }, [queriedId, refetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = orderInput.trim();
    if (clean) {
      setQueriedId(clean);
      setSearchParams({ id: clean });
    }
  };

  // Find canonical order details if available
  const canonical = queriedId
    ? commerceStore.getOrderById(queriedId) ||
      commerceStore.getOrders().find(
        (o) =>
          String(o.id) === String(queriedId) ||
          o.orderNumber === String(queriedId) ||
          o.orderNumber === `ORD-${queriedId}` ||
          (o.trackingNumber && o.trackingNumber.toLowerCase() === queriedId.toLowerCase())
      )
    : undefined;

  const steps = canonical?.timeline && canonical.timeline.length > 0
    ? canonical.timeline.map((t) => ({
        title: t.title,
        time: new Date(t.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) + ' • ' + new Date(t.timestamp).toLocaleDateString('ar-SA'),
        status: 'completed',
        desc: t.description || `مسجل بواسطة: ${t.actor}`,
      }))
    : [
        { title: 'تم تأكيد وتوثيق الطلب', time: 'اليوم • 10:15 ص', status: 'completed', desc: 'تم التحقق من الدفع والبدء بتجهيز المقتنيات.' },
        { title: 'تغليف وتجهيز ملكي فاخر', time: 'اليوم • 02:40 م', status: order?.status !== 'pending' ? 'completed' : 'pending', desc: 'فحص الجودة الدقيق والتغليف في عبوات مخملية محمية.' },
        { title: 'في الطريق مع مندوب النخبة VIP', time: 'غداً • 08:30 ص', status: order?.status === 'shipped' || order?.status === 'delivered' ? 'completed' : order?.status === 'processing' ? 'active' : 'pending', desc: 'انطلقت الشحنة عبر النقل السريع بسيارة مخصصة.' },
        { title: 'تم التسليم وتوقيع الاستلام', time: 'الموعد المتوقع', status: order?.status === 'delivered' ? 'completed' : 'pending', desc: 'تسليم مباشر وآمن باليد للعميل مع إشعار بالاستلام.' }
      ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-20 font-arabic px-4 sm:px-6" dir="rtl">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-[#008F68]/10 border border-[#008F68]/20 flex items-center justify-center text-[#008F68] shadow-xs">
          <Truck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#111111] tracking-tight">تتبع مسار الشحنات المباشر</h1>
        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
          أدخل رقم طلبك للاطلاع على مسار الشحنة الفعلي وتوقيت وصول المندوب الخاص.
        </p>

        {/* Tracking Input Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full mt-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="مثال: ORD-9801 أو LX-0042 أو رقم بوليصة الشحن"
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
              className="w-full bg-white border border-[#E8E3D8] rounded-full pr-10 pl-4 py-3 text-xs text-[#111111] placeholder-neutral-400 focus:outline-none focus:border-[#008F68] shadow-2xs transition-all"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <Button type="submit" variant="primary">
            تتبع الشحنة
          </Button>
        </form>
      </div>

      {/* Tracking Result View */}
      {isLoading ? (
        <div className="p-12 flex justify-center"><Spinner size="lg" /></div>
      ) : queriedId && isError ? (
        <div className="p-8 rounded-3xl bg-white border border-rose-200 text-center flex flex-col items-center gap-3 shadow-2xs">
          <AlertCircle className="w-8 h-8 text-rose-600" />
          <h3 className="text-base font-black text-[#111111]">لم يتم العثور على رقم الشحنة</h3>
          <p className="text-xs text-neutral-500 max-w-sm">
            تعذر العثور على شحنة نشطة للطلب #{queriedId}. يرجى التحقق من الرقم في إشعار التأكيد أو في سجل حسابك.
          </p>
          <Link to="/orders" className="mt-2">
            <Button variant="secondary" size="sm">عرض سجل طلباتي</Button>
          </Link>
        </div>
      ) : order ? (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          {/* Status Header Banner */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-black text-[#111111] text-base">
                  طلب رقم {order.orderNumber || `LX-${order.id.toString().padStart(4, '0')}`}
                </span>
                <Badge variant="primary" size="md">{order.status === 'delivered' ? 'تم التسليم' : 'قيد النقل والتوصيل السريع'}</Badge>
              </div>
              <p className="text-xs text-neutral-400 mt-1 font-mono">
                الناقل: {canonical?.trackingCarrier || order.carrier || 'أسطول فخامة السريع'} (بوليصة: {canonical?.trackingNumber || order.trackingNumber || 'VIP-99201-SA'})
              </p>
            </div>

            <div className="sm:text-left">
              <span className="text-[11px] font-bold text-neutral-400 block">الموعد المتوقع للوصول</span>
              <span className="text-sm font-black text-[#008F68]">خلال 24 - 48 ساعة</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs">
            <h2 className="text-sm font-black text-[#111111] mb-6">محطات مسار التوصيل المباشر</h2>
            <div className="flex flex-col gap-6">
              {steps.map((st, idx) => (
                <div key={`track-step-${st.title}-${idx}`} className="flex items-start gap-4 relative">
                  {idx < steps.length - 1 && (
                    <div className="absolute right-4 top-8 bottom-0 w-0.5 bg-[#E8E3D8] -mb-6" />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      st.status === 'completed'
                        ? 'bg-[#008F68] text-white shadow-xs'
                        : st.status === 'active'
                        ? 'bg-[#008F68] text-white ring-4 ring-[#008F68]/20 animate-pulse'
                        : 'bg-[#FCFAF7] text-neutral-400 border border-[#E8E3D8]'
                    }`}
                  >
                    {st.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#FFC700]" />
                    ) : st.status === 'active' ? (
                      <Truck className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-[#111111]">{st.title}</p>
                      <span className="text-[11px] text-neutral-400 font-mono">{st.time}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items & Shipping Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E3D8] text-xs shadow-2xs">
              <h3 className="font-black text-[#111111] mb-3 border-b border-[#F0EAE1] pb-2">محتويات الشحنة</h3>
              <div className="flex flex-col divide-y divide-[#FAF8F3]">
                {order.items?.map((item, idx) => (
                  <div key={`track-item-${item.productId || idx}-${idx}`} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                    <span className="text-[#111111] font-bold truncate">{item.product_name || item.name || `مقتنى #${item.productId}`}</span>
                    <span className="text-neutral-400 font-mono">الكمية: {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E3D8] text-xs shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="font-black text-[#111111] mb-3 border-b border-[#F0EAE1] pb-2">عنوان الوجهة والتسليم</h3>
                <div className="flex items-start gap-2 text-neutral-600">
                  <MapPin className="w-4 h-4 text-[#008F68] shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-bold text-[#111111]">{order.shipping_address || 'توصيل مخصص وسريع'}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F0EAE1] flex items-center justify-between">
                <Link to={`/orders/${order.id}`} className="text-xs font-black text-[#008F68] hover:underline flex items-center gap-1">
                  <span>عرض تفاصيل الفاتورة الكاملة</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TrackOrderPage;
