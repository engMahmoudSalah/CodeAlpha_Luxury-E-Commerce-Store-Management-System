import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../hooks/useOrders';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { commerceStore } from '../shared/store/commerceStore';
import { commerceEventBus } from '../shared/events/commerceEvents';
import { ReturnRequest } from '../shared/types/commerce';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import {
  Truck,
  CheckCircle2,
  ChevronLeft,
  MapPin,
  FileText,
  ShieldCheck,
  Package,
  Calendar,
  Clock,
  Printer,
  RotateCcw,
  XCircle,
  AlertCircle,
  HelpCircle,
  Info,
  DollarSign,
  Sparkles
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: order, isLoading, isError, refetch } = useOrder(id);

  // Return request state
  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [returnReason, setReturnReason] = useState('عيب مصنعي أو تلف في التغليف');
  const [returnCondition, setReturnCondition] = useState('sealed');
  const [refundPreference, setRefundPreference] = useState('original');
  const [returnNotes, setReturnNotes] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Cancel order state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('تغيير رأي قبل الشحن');
  const [isCancelling, setIsCancelling] = useState(false);

  // Check and load existing return request
  useEffect(() => {
    if (!id) return;
    const checkReturn = () => {
      const allReturns = commerceStore.getReturnRequests();
      const found = allReturns.find(
        (r) => String(r.orderId) === String(id) || String(r.orderId) === `ORD-${id}`
      );
      setReturnRequest(found || null);
    };

    checkReturn();

    const unsubReturn = commerceEventBus.subscribe('RETURN_REQUEST_UPDATED', () => {
      checkReturn();
      refetch();
    });

    const unsubOrder = commerceEventBus.subscribe('ORDER_UPDATED', (updated) => {
      if (String(updated.id) === String(id) || updated.orderNumber === String(id)) {
        refetch();
        checkReturn();
      }
    });

    return () => {
      unsubReturn();
      unsubOrder();
    };
  }, [id, refetch]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 font-arabic" dir="rtl">
        <Spinner size="lg" />
        <p className="text-sm font-black text-[#111111]">جاري تحميل تفاصيل الفاتورة الملكية...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="py-16 text-center max-w-md mx-auto font-arabic" dir="rtl">
        <h2 className="text-2xl font-black text-[#111111] mb-2 tracking-tight">لم يتم العثور على الطلب</h2>
        <p className="text-xs text-neutral-500 mb-6">
          تعذر العثور على سجل هذا الطلب في حسابك.
        </p>
        <Link to="/orders">
          <Button variant="primary" leftIcon={<ChevronLeft className="w-4 h-4" />}>
            العودة إلى سجل الطلبات
          </Button>
        </Link>
      </div>
    );
  }

  // Pre-select all items if none selected when opening return modal
  const handleOpenReturnModal = () => {
    if (order.items && order.items.length > 0) {
      setSelectedItemIds(order.items.map((i) => i.productId));
    }
    setReturnModalOpen(true);
  };

  const handleToggleSelectItem = (productId: number) => {
    setSelectedItemIds((prev) =>
      prev.includes(productId) ? prev.filter((p) => p !== productId) : [...prev, productId]
    );
  };

  // Submit return request
  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemIds.length === 0) {
      showToast('يرجى تحديد مقتنى واحد على الأقل للاسترجاع', 'warning');
      return;
    }

    setIsSubmittingReturn(true);
    try {
      const itemsToReturn = (order.items || [])
        .filter((i) => selectedItemIds.includes(i.productId))
        .map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          reason: returnReason,
        }));

      const refundAmount = (order.items || [])
        .filter((i) => selectedItemIds.includes(i.productId))
        .reduce((sum, i) => sum + (i.subtotal || i.price * i.quantity), 0);

      const newReturn = commerceStore.createReturnRequest({
        orderId: order.id,
        customerName: order.recipient_name || user?.name || 'عميل فخامة الملكي',
        customerEmail: user?.email || 'client@fakhama.com',
        items: itemsToReturn,
        status: 'pending_review',
        refundStatus: 'requested',
        refundAmount,
        reasonNotes: `السبب: ${returnReason}. حالة التغليف: ${returnCondition === 'sealed' ? 'مغلق ومحكم' : 'مفتوح بعناية'}. تفضيل الاسترداد: ${refundPreference === 'original' ? 'نفس البطاقة' : 'رصيد متجر VIP'}. ${returnNotes ? `ملاحظات العميل: ${returnNotes}` : ''}`,
      });

      commerceStore.addOrderTimelineEvent(
        order.id,
        'تم تقديم طلب استرجاع للمقتنيات',
        `طلب استرجاع رقم RET-${newReturn.id.replace('ret_', '')} بانتظار اعتماد الإدارة`,
        order.status,
        'العميل'
      );

      setReturnRequest(newReturn);
      setReturnModalOpen(false);
      showToast('تم تقديم طلب الاسترجاع بنجاح! سيتم التواصل معك من قبل فريق العناية الملكية VIP.', 'success');
      refetch();
    } catch (err) {
      showToast('حدث خطأ أثناء إرسال طلب الاسترجاع', 'error');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // Submit cancel order
  const handleConfirmCancelOrder = () => {
    setIsCancelling(true);
    try {
      commerceStore.cancelOrder(order.id, cancelReason);
      setCancelModalOpen(false);
      showToast('تم إلغاء الطلب وإعادة المقتنيات للمخزون بنجاح.', 'success');
      refetch();
    } catch {
      showToast('تعذر إلغاء الطلب حالياً', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const steps = [
    { title: 'تم استلام وتوثيق الطلب', desc: 'تم استلام الطلب وتأكيد الدفع المشفر', completed: true },
    { title: 'تجهيز وتغليف المقتنيات', desc: 'فحص الجودة الدقيق والتغليف الملكي المخملي', completed: order.status !== 'pending' && order.status !== 'cancelled' },
    { title: 'في الطريق مع الشاحن المعتمد', desc: 'تسليم الطرد للشحن السريع المخصص', completed: order.status === 'shipped' || order.status === 'delivered' },
    { title: 'تم التسليم والتوقيع', desc: 'استلام مباشر وتوقيع إيصال الاستلام', completed: order.status === 'delivered' }
  ];

  const returnStatusLabels: Record<string, { label: string; variant: 'warning' | 'primary' | 'success' | 'danger' }> = {
    pending_review: { label: 'قيد مراجعة الإدارة', variant: 'warning' },
    approved: { label: 'تمت الموافقة - بانتظار استلام المندوب', variant: 'primary' },
    item_received: { label: 'تم استلام الشحنة في المستودع', variant: 'primary' },
    refunded: { label: 'مكتمل وتم إرجاع المبلغ', variant: 'success' },
    rejected: { label: 'تم رفض طلب الاسترجاع', variant: 'danger' },
  };

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-5xl mx-auto font-arabic px-4 sm:px-6" dir="rtl">
      <Breadcrumbs
        items={[
          { label: 'سجل الطلبات', path: '/orders' },
          { label: `فاتورة طلب ${order.orderNumber || `LX-${order.id.toString().padStart(4, '0')}`}` }
        ]}
      />

      {/* Back link & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E3D8] pb-5">
        <div className="flex items-center gap-3">
          <Link to="/orders">
            <button className="p-2.5 rounded-full bg-white border border-[#E8E3D8] hover:bg-[#FCFAF7] text-[#111111] transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#111111]">
                طلب رقم {order.orderNumber || `LX-${order.id.toString().padStart(4, '0')}`}
              </h1>
              <Badge
                variant={
                  order.status === 'delivered'
                    ? 'success'
                    : order.status === 'shipped'
                    ? 'primary'
                    : order.status === 'cancelled'
                    ? 'danger'
                    : (order.status as string) === 'returned'
                    ? 'warning'
                    : 'neutral'
                }
                size="md"
              >
                {order.status === 'delivered'
                  ? 'تم التسليم'
                  : order.status === 'shipped'
                  ? 'في الطريق'
                  : order.status === 'cancelled'
                  ? 'ملغي'
                  : (order.status as string) === 'returned'
                  ? 'تم الاسترجاع'
                  : 'قيد التجهيز'}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              تاريخ التسجيل: {new Date(order.created_at).toLocaleDateString('ar-SA')} الساعة {new Date(order.created_at).toLocaleTimeString('ar-SA')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2.5 rounded-full bg-white border border-[#E8E3D8] hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer"
            title="طباعة الفاتورة"
          >
            <Printer className="w-4 h-4" />
          </button>

          {order.status !== 'cancelled' && (
            <Link to={`/track-order?id=${order.orderNumber || order.trackingNumber || order.id}`}>
              <Button variant="secondary" size="sm" leftIcon={<Truck className="w-3.5 h-3.5" />}>
                تتبع الشحنة
              </Button>
            </Link>
          )}

          {/* Action: Cancel Order (Only when pending) */}
          {order.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
              leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              إلغاء الطلب
            </Button>
          )}

          {/* Action: Return Request Button */}
          {!returnRequest && order.status !== 'cancelled' && (order.status as string) !== 'returned' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenReturnModal}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              طلب استرجاع / استبدال
            </Button>
          )}
        </div>
      </div>

      {/* Return Request Active Banner (If Exists) */}
      {returnRequest && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#111111]">
                  طلب استرجاع مسجل #{returnRequest.id.replace('ret_', 'RET-')}
                </h3>
                {returnStatusLabels[returnRequest.status] && (
                  <Badge variant={returnStatusLabels[returnRequest.status].variant} size="sm">
                    {returnStatusLabels[returnRequest.status].label}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                {returnRequest.reasonNotes || 'طلبك قيد المتابعة مع قسم الجودة والعناية بالعملاء.'}
              </p>
              {returnRequest.refundAmount && returnRequest.refundAmount > 0 && (
                <p className="text-xs font-black text-[#008F68] mt-1 font-mono">
                  المبلغ المستحق للاسترداد: {Number(returnRequest.refundAmount).toLocaleString('ar-SA')} ر.س
                </p>
              )}
            </div>
          </div>
          <div className="text-left shrink-0">
            <span className="text-[11px] text-neutral-400 font-mono">
              بتاريخ: {new Date(returnRequest.createdAt).toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>
      )}

      {/* Cancelled Banner */}
      {order.status === 'cancelled' && (
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs font-black text-rose-800">
            تم إلغاء هذا الطلب وإعادة المنتجات إلى المخزون. إذا تم خصم أي مبالغ سيتم إعادتها إلى وسيلة الدفع.
          </p>
        </div>
      )}

      {/* Progress Stepper Timeline */}
      {order.status !== 'cancelled' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs">
          <h2 className="text-sm font-black text-[#111111] mb-6">
            مراحل شحن وتجهيز الطلب
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2 relative">
            {steps.map((st, idx) => (
              <div key={`step-${st.title}-${idx}`} className="flex flex-col items-start sm:items-center text-right sm:text-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    st.completed
                      ? 'bg-[#008F68] text-white shadow-xs'
                      : 'bg-[#FCFAF7] text-neutral-400 border border-[#E8E3D8]'
                  }`}
                >
                  {st.completed ? <CheckCircle2 className="w-5 h-5 text-[#FFC700]" /> : idx + 1}
                </div>
                <div>
                  <p className={`text-xs font-black ${st.completed ? 'text-[#111111]' : 'text-neutral-400'}`}>
                    {st.title}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item Breakdown & Address Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Right in RTL: Items List */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E8E3D8] pb-3">
              <h3 className="text-sm font-black text-[#111111]">
                المقتنيات المطلوبة ({order.items?.length || 0})
              </h3>
              {!returnRequest && order.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={handleOpenReturnModal}
                  className="text-xs text-[#008F68] font-black hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  طلب استرجاع لقطعة معينة
                </button>
              )}
            </div>

            <div className="flex flex-col divide-y divide-[#F0EAE1]">
              {order.items?.map((item, idx) => (
                <div key={`item-${item.productId || idx}-${idx}`} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name || 'Item'}
                        className="w-12 h-12 rounded-2xl bg-[#FCFAF7] p-1 border border-[#E8E3D8] object-contain mix-blend-multiply"
                      />
                    )}
                    <div>
                      <p className="text-xs font-black text-[#111111]">{item.product_name || item.name || `مقتنى #${item.productId}`}</p>
                      <p className="text-[11px] text-neutral-500 font-bold font-mono">الكمية: {item.quantity} × {Number(item?.price ?? 0).toLocaleString('ar-SA')} ر.س</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#111111] font-mono">{Number(item?.subtotal ?? (item.price * item.quantity)).toLocaleString('ar-SA')} ر.س</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Left in RTL: Summary & Shipping details */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs flex flex-col gap-4 text-xs">
            <h3 className="text-sm font-black text-[#111111] border-b border-[#E8E3D8] pb-3">
              وجهة وعنوان التوصيل
            </h3>
            <div className="flex items-start gap-2.5 text-[#111111]">
              <MapPin className="w-4 h-4 text-[#008F68] shrink-0 mt-0.5" />
              <p className="leading-relaxed font-bold">{order.shipping_address || 'توصيل مخصص وسريع'}</p>
            </div>

            <h3 className="text-sm font-black text-[#111111] border-b border-[#E8E3D8] pb-3 pt-2">
              الملخص المالي للفاتورة
            </h3>
            <div className="flex flex-col gap-2 text-neutral-500">
              <div className="flex justify-between">
                <span>المجموع الفرعي للمقتنيات</span>
                <span className="font-black text-[#111111] font-mono">
                  {Number(order.subtotal ?? ((order.total || 0) * 0.85)).toLocaleString('ar-SA')} ر.س
                </span>
              </div>
              <div className="flex justify-between">
                <span>ضريبة القيمة المضافة (15%)</span>
                <span className="font-black text-[#111111] font-mono">
                  {Number(order.taxTotal ?? ((order.total || 0) * 0.15)).toLocaleString('ar-SA')} ر.س
                </span>
              </div>
              <div className="flex justify-between">
                <span>الشحن والتوصيل</span>
                <span className="font-black text-[#008F68]">
                  {order.shippingFee === 0 || order.shippingFee === undefined
                    ? 'مجاني (VIP)'
                    : `${Number(order.shippingFee).toLocaleString('ar-SA')} ر.س`}
                </span>
              </div>
              {Boolean(order.discountTotal && order.discountTotal > 0) && (
                <div className="flex justify-between text-[#008F68]">
                  <span>خصم الكوبون {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span className="font-black font-mono">- {Number(order.discountTotal).toLocaleString('ar-SA')} ر.س</span>
                </div>
              )}
              {Boolean(order.storeCreditApplied && order.storeCreditApplied > 0) && (
                <div className="flex justify-between text-[#008F68]">
                  <span>رصيد المحفظة المستخدم</span>
                  <span className="font-black font-mono">- {Number(order.storeCreditApplied).toLocaleString('ar-SA')} ر.س</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-[#E8E3D8] text-sm">
                <span className="font-black text-[#111111]">المجموع النهائي</span>
                <span className="text-base font-black text-[#111111] font-mono">{Number(order?.total ?? 0).toLocaleString('ar-SA')} ر.س</span>
              </div>
            </div>

            <div className="mt-2 p-3 bg-[#FCFAF7] rounded-2xl border border-[#E8E3D8] flex items-center gap-2 text-[10px] text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-[#008F68] shrink-0" />
              <span>فاتورة ضريبية معتمدة ومطابقة لمتطلبات هيئة الزكاة والضريبة والجمارك (ZATCA).</span>
            </div>

            {/* Tracking Status Pill (If Assigned) */}
            {order.trackingNumber && (
              <div className="p-4 rounded-2xl bg-[#008F68]/5 border border-[#008F68]/20 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold block">رقم بوليصة الشحن</span>
                  <span className="font-mono font-black text-[#111111]">{order.trackingNumber}</span>
                  {order.carrier && <span className="text-[10px] text-[#008F68] mr-2">({order.carrier})</span>}
                </div>
                <Link to={`/track-order?id=${order.trackingNumber}`}>
                  <Button size="xs" variant="primary">تتبع المسار</Button>
                </Link>
              </div>
            )}

            {/* Royal Gift Packaging Card */}
            {order.giftWrapping && (
              <div className="p-4 rounded-2xl bg-[#FAF6EC] border border-amber-300 flex flex-col gap-2 text-xs text-amber-900 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>تغليف الهدايا الملكي المخملي</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-800">
                    مرفق VIP
                  </span>
                </div>
                {order.giftMessage ? (
                  <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200 text-neutral-800 italic">
                    <span className="text-[10px] font-bold text-amber-700 block not-italic mb-0.5">رسالة الإهداء:</span>
                    "{order.giftMessage}"
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-800">تغليف مخملي فاخر مع شريط حريري وكرت فارغ.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RETURN REQUEST MODAL */}
      {/* ========================================================================= */}
      {returnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-arabic" dir="rtl">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E8E3D8] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E8E3D8] flex items-center justify-between bg-[#FCFAF7]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#008F68]/10 text-[#008F68] flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#111111]">طلب استرجاع أو استبدال مقتنى</h3>
                  <p className="text-[11px] text-neutral-500">الطلب رقم LX-{order.id.toString().padStart(4, '0')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-200/50 text-neutral-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitReturn} className="p-6 flex flex-col gap-4 text-xs">
              {/* Select Items */}
              <div>
                <label className="block text-xs font-black text-[#111111] mb-2">
                  حدد المقتنيات المراد استرجاعها:
                </label>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                  {order.items?.map((item, idx) => {
                    const isSelected = selectedItemIds.includes(item.productId);
                    return (
                      <label
                        key={`ord-dtl-item-${item.productId || idx}-${idx}`}
                        onClick={() => handleToggleSelectItem(item.productId)}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#008F68]/5 border-[#008F68] text-[#111111]'
                            : 'bg-white border-[#E8E3D8] text-neutral-600 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-[#008F68] focus:ring-[#008F68]"
                          />
                          <span className="font-bold">{item.product_name || item.name || `مقتنى #${item.productId}`}</span>
                        </div>
                        <span className="font-mono font-black">{Number(item.price).toLocaleString('ar-SA')} ر.س</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-black text-[#111111] mb-1.5">
                  سبب الاسترجاع أو الاستبدال:
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#FCFAF7] border border-[#E8E3D8] font-bold text-[#111111] focus:ring-2 focus:ring-[#008F68]"
                >
                  <option value="عيب مصنعي أو تلف في التغليف">عيب مصنعي أو تلف في التغليف</option>
                  <option value="مقاس أو أبعاد غير ملائمة">مقاس أو أبعاد غير ملائمة</option>
                  <option value="المقتنى يختلف عن الوصف أو الصور">المقتنى يختلف عن الوصف أو الصور</option>
                  <option value="استبدال بموديل أو لون آخر">استبدال بموديل أو لون آخر</option>
                  <option value="تراجع عن الشراء (ضمن الضمان الذهبي)">تراجع عن الشراء (ضمن الضمان الذهبي)</option>
                </select>
              </div>

              {/* Item Condition */}
              <div>
                <label className="block text-xs font-black text-[#111111] mb-1.5">
                  حالة المنتج الحالية:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReturnCondition('sealed')}
                    className={`p-2.5 rounded-2xl border text-center font-bold transition-all ${
                      returnCondition === 'sealed'
                        ? 'bg-[#008F68] text-white border-[#008F68]'
                        : 'bg-[#FCFAF7] border-[#E8E3D8] text-neutral-600'
                    }`}
                  >
                    مغلف بغلاف المصنع
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnCondition('opened')}
                    className={`p-2.5 rounded-2xl border text-center font-bold transition-all ${
                      returnCondition === 'opened'
                        ? 'bg-[#008F68] text-white border-[#008F68]'
                        : 'bg-[#FCFAF7] border-[#E8E3D8] text-neutral-600'
                    }`}
                  >
                    تم الفتح بحالة ممتازة
                  </button>
                </div>
              </div>

              {/* Refund Preference */}
              <div>
                <label className="block text-xs font-black text-[#111111] mb-1.5">
                  طريقة استرداد القيمة:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRefundPreference('original')}
                    className={`p-2.5 rounded-2xl border text-center font-bold transition-all ${
                      refundPreference === 'original'
                        ? 'bg-[#008F68] text-white border-[#008F68]'
                        : 'bg-[#FCFAF7] border-[#E8E3D8] text-neutral-600'
                    }`}
                  >
                    إلى نفس وسيلة الدفع
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundPreference('store_credit')}
                    className={`p-2.5 rounded-2xl border text-center font-bold transition-all ${
                      refundPreference === 'store_credit'
                        ? 'bg-[#008F68] text-white border-[#008F68]'
                        : 'bg-[#FCFAF7] border-[#E8E3D8] text-neutral-600'
                    }`}
                  >
                    رصيد محفظة VIP (+5% بونص)
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-black text-[#111111] mb-1.5">
                  تفاصيل إضافية أو ملاحظات:
                </label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="اكتب أي ملاحظات أو تفاصيل تود إبلاغ فريق خدمة العملاء بها..."
                  className="w-full p-3 rounded-2xl bg-[#FCFAF7] border border-[#E8E3D8] font-bold text-[#111111] focus:ring-2 focus:ring-[#008F68]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E3D8]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setReturnModalOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingReturn}
                >
                  إرسال طلب الاسترجاع للإدارة
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CANCEL ORDER MODAL */}
      {/* ========================================================================= */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-arabic" dir="rtl">
          <div className="bg-white rounded-3xl max-w-md w-full border border-rose-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-rose-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-rose-950">تأكيد إلغاء الطلب</h3>
                  <p className="text-[11px] text-rose-700">طلب رقم LX-{order.id.toString().padStart(4, '0')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-200/50 text-neutral-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 text-xs">
              <p className="text-neutral-600 leading-relaxed">
                هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ سيتم استرجاع المقتنيات مباشرة إلى مخزون المتجر وإلغاء تجهيز الشحنة.
              </p>

              <div>
                <label className="block text-xs font-black text-[#111111] mb-1.5">
                  سبب الإلغاء:
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#FCFAF7] border border-[#E8E3D8] font-bold text-[#111111]"
                >
                  <option value="تغيير رأي قبل الشحن">تغيير رأي قبل الشحن</option>
                  <option value="طلب مقتنيات أخرى بالخطأ">طلب مقتنيات أخرى بالخطأ</option>
                  <option value="تغيير عنوان التوصيل أو طريقة الدفع">تغيير عنوان التوصيل أو طريقة الدفع</option>
                  <option value="أخرى">سبب آخر</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E3D8]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setCancelModalOpen(false)}
                >
                  تراجع
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmCancelOrder}
                  isLoading={isCancelling}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  تأكيد الإلغاء النهائي
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;

