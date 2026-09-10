import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Printer,
  ShoppingBag,
  Clock,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  MessageCircle,
  Copy,
  Plus,
  Edit2,
  Crown,
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminOrder, OrderStatus, PaymentStatus } from '../../types';
import { useToast } from '../../../context/ToastContext';
import { InvoiceModal } from '../../components/orders/InvoiceModal';
import { commerceEventBus } from '../../../shared/events/commerceEvents';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & States
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Tracking info modal
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [carrierInput, setCarrierInput] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [isSavingTracking, setIsSavingTracking] = useState(false);

  // Cancel order modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const loadOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await adminService.getOrderById(parseInt(id));
      if (!data) {
        showToast('الطلب غير موجود', 'error');
        navigate('/admin/orders');
        return;
      }
      setOrder(data);
      setCarrierInput(data.shippingCarrier || 'أرامكس Aramex');
      setTrackingNumberInput(data.trackingNumber || '');
    } catch (err: any) {
      showToast('تعذر تحميل تفاصيل الطلب', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    const unsub = commerceEventBus.subscribe('ORDER_UPDATED', (updated) => {
      if (id && (String(updated.id) === String(id) || updated.orderNumber === String(id))) {
        loadOrder();
      }
    });
    return unsub;
  }, [id]);

  if (loading || !order) {
    return (
      <div className="py-24 text-center bg-white rounded-3xl border border-[#E8E3D8]">
        <div className="w-10 h-10 border-3 border-[#00875A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-[#5A5852] font-arabic">جاري تحميل تفاصيل الطلب الملكي...</p>
      </div>
    );
  }

  // Handlers
  const handleUpdateStatus = async (status: OrderStatus, noteText?: string) => {
    try {
      await adminService.updateOrderStatus(order.id, status, noteText);
      showToast(`تم تحديث حالة الطلب إلى "${status}" بنجاح`, 'success');
      await loadOrder();
    } catch (err: any) {
      showToast('تعذر تحديث الحالة', 'error');
    }
  };

  const handleUpdatePayment = async (payStatus: PaymentStatus) => {
    try {
      await adminService.updatePaymentStatus(order.id, payStatus);
      showToast(`تم تحديث حالة السداد إلى "${payStatus === 'paid' ? 'مدفوع' : 'معلق'}"`, 'success');
      await loadOrder();
    } catch (err: any) {
      showToast('تعذر تحديث حالة الدفع', 'error');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      setIsAddingNote(true);
      await adminService.addOrderTimelineEvent(order.id, 'ملاحظة إدارية داخلية', newNote.trim());
      showToast('تمت إضافة الملاحظة لسجل الطلب', 'success');
      setNewNote('');
      await loadOrder();
    } catch (err: any) {
      showToast('تعذر حفظ الملاحظة', 'error');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingTracking(true);
      await adminService.updateOrderShippingInfo(order.id, trackingNumberInput.trim(), carrierInput.trim());
      // Also advance to shipped if not shipped yet
      if (order.status === 'pending' || order.status === 'processing') {
        await adminService.updateOrderStatus(order.id, 'shipped', `تم إصدار بوليصة الشحن (${carrierInput})`);
      }
      showToast('تم حفظ وتحديث بيانات الشحن والتتبع', 'success');
      setTrackingModalOpen(false);
      await loadOrder();
    } catch (err: any) {
      showToast('تعذر حفظ بيانات الشحن', 'error');
    } finally {
      setIsSavingTracking(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return;
    try {
      setIsCancelling(true);
      await adminService.cancelOrder(order.id, cancelReason.trim());
      showToast('تم إلغاء الطلب بنجاح', 'success');
      setCancelModalOpen(false);
      await loadOrder();
    } catch (err: any) {
      showToast('تعذر إلغاء الطلب', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const copyAddress = () => {
    const fullAddr = `${order.customer.name}\n${order.customer.phone}\n${order.shippingAddress.addressLine1}، ${order.shippingAddress.city}، ${order.shippingAddress.country}`;
    navigator.clipboard.writeText(fullAddr);
    showToast('تم نسخ عنوان الشحن للحافظة', 'success');
  };

  // Status Stepper Steps
  const STEPS: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'pending', label: 'تم الاستلام', icon: Clock },
    { status: 'processing', label: 'جاري التجهيز', icon: PackageCheck },
    { status: 'shipped', label: 'تم الشحن', icon: Truck },
    { status: 'delivered', label: 'تم التسليم', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      default:
        return -1;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div id="admin-order-detail-page" className="space-y-6">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="p-2 rounded-xl border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#181818] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            title="العودة لقائمة الطلبات"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-[#181818] tracking-tight font-mono">
                {order.orderNumber}
              </h1>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FAF8F5] text-[#181818] border border-[#E8E3D8] font-arabic">
                طلب متجر فخامة VIP
              </span>
            </div>
            <p className="text-xs text-[#5A5852] mt-0.5 font-arabic">
              تم الإنشاء: {new Date(order.createdAt).toLocaleString('ar-SA', { dateStyle: 'full', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setInvoiceOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] hover:bg-[#FAF8F5] transition-colors cursor-pointer shadow-xs flex items-center gap-2 font-arabic"
          >
            <Printer className="w-4 h-4 text-[#5A5852]" />
            <span>طباعة الفاتورة الضريبية</span>
          </button>

          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1.5 font-arabic"
            >
              <XCircle className="w-4 h-4" />
              <span>إلغاء الطلب</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Order Stepper Card */}
      {order.status !== 'cancelled' && order.status !== 'refunded' ? (
        <div className="bg-white p-6 rounded-3xl border border-[#E8E3D8] shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;

              return (
                <div key={step.status} className="flex-1 w-full flex items-center">
                  <div
                    onClick={() => handleUpdateStatus(step.status)}
                    className={`flex items-center gap-3 p-2 rounded-2xl cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-[#E6F4EE] border border-[#00875A]/30 pr-3 pl-4 shadow-xs'
                        : isCompleted
                        ? 'text-[#00875A]'
                        : 'text-[#5A5852]/60 hover:text-[#181818]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                        isCompleted
                          ? 'bg-[#00875A] text-white shadow-xs'
                          : 'bg-[#FAF8F5] border border-[#E8E3D8] text-[#5A5852]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#5A5852] block font-arabic font-normal">
                        المرحلة {idx + 1}
                      </span>
                      <span className={`text-xs font-bold font-arabic block ${isCurrent ? 'text-[#00875A]' : 'text-[#181818]'}`}>
                        {step.label}
                      </span>
                    </div>
                  </div>

                  {idx < STEPS.length - 1 && (
                    <div
                      className={`hidden md:block flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                        currentStepIdx > idx ? 'bg-[#00875A]' : 'bg-[#E8E3D8]'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-800 font-arabic">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold">هذا الطلب في حالة ({order.status === 'cancelled' ? 'ملغي' : 'مسترجع'})</h4>
            <p className="text-[11px] text-rose-700/80">تم إيقاف مسار الشحن والتوصيل لهذا الطلب</p>
          </div>
        </div>
      )}

      {/* Main Grid: Left sidebar summary + Right detailed sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RIGHT (2 cols): Ordered Items + Shipment & Tracking + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ordered Products Card */}
          <div className="bg-white rounded-3xl border border-[#E8E3D8] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E3D8] mb-4">
              <h2 className="text-base font-extrabold text-[#181818] font-arabic flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#00875A]" />
                <span>القطع والمقتنيات المطلوبة ({order.items.length})</span>
              </h2>
              <span className="text-xs font-bold text-[#5A5852] font-arabic">
                إجمالي الكمية: {order.items.reduce((s, i) => s + i.quantity, 0)} قطعة
              </span>
            </div>

            <div className="divide-y divide-[#E8E3D8]">
              {order.items.map((item, idx) => (
                <div key={`order-item-${item.productId || idx}-${idx}`} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-16 h-16 rounded-2xl border border-[#E8E3D8] overflow-hidden bg-[#FAF8F5] shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-sm text-[#181818] font-arabic truncate">
                        {item.productName}
                      </h3>
                      {item.sku && (
                        <span className="text-[11px] font-mono text-[#5A5852] block">
                          SKU: {item.sku}
                        </span>
                      )}
                      <span className="text-xs text-[#5A5852] font-arabic mt-1 block">
                        سعر القطعة: {Number(item?.unitPrice ?? 0).toLocaleString('ar-SA')} ر.س
                      </span>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-xs text-[#5A5852] block font-arabic">
                      الكمية: <strong className="text-[#181818] font-mono">{item.quantity}</strong>
                    </span>
                    <span className="text-base font-black text-[#00875A] font-arabic">
                      {Number(item?.totalPrice ?? 0).toLocaleString('ar-SA')} ر.س
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics & Tracking Card */}
          <div className="bg-white rounded-3xl border border-[#E8E3D8] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E3D8] mb-4">
              <h2 className="text-base font-extrabold text-[#181818] font-arabic flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#00875A]" />
                <span>الشحن وبوليصة التتبع</span>
              </h2>

              <button
                type="button"
                onClick={() => setTrackingModalOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-[#00875A]/20 bg-[#E6F4EE] text-[#00875A] text-xs font-bold hover:bg-[#00875A] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{order.trackingNumber ? 'تحديث بوليصة الشحن' : 'إضافة بوليصة شحن'}</span>
              </button>
            </div>

            {order.trackingNumber ? (
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E3D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-arabic">
                <div>
                  <span className="text-xs text-[#5A5852] block">شركة الشحن والتوصيل</span>
                  <span className="font-extrabold text-sm text-[#181818]">
                    {order.shippingCarrier || 'توصيل فخامة الملكي VIP'}
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-[#5A5852]">رقم التتبع:</span>
                    <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded-lg border border-[#E8E3D8] text-[#181818]">
                      {order.trackingNumber}
                    </span>
                  </div>
                </div>

                <a
                  href={`https://track.smsaexpress.com/?tracknumbers=${order.trackingNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8E3D8] text-xs font-bold text-[#00875A] hover:bg-[#E6F4EE] transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>تتبع الشحنة المباشر</span>
                </a>
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl bg-[#FAF8F5] border border-dashed border-[#E8E3D8]">
                <Truck className="w-8 h-8 text-[#5A5852]/40 mx-auto mb-2" />
                <p className="text-xs font-bold text-[#181818] font-arabic">
                  لم يتم إصدار بوليصة شحن لهذا الطلب بعد
                </p>
                <p className="text-[11px] text-[#5A5852] font-arabic mt-0.5">
                  انقر على زر "إضافة بوليصة شحن" لربط شركة التوصيل وتحديث العميل
                </p>
              </div>
            )}
          </div>

          {/* Timeline & Notes Card */}
          <div className="bg-white rounded-3xl border border-[#E8E3D8] p-6 shadow-xs space-y-6">
            <h2 className="text-base font-extrabold text-[#181818] font-arabic flex items-center gap-2 pb-4 border-b border-[#E8E3D8]">
              <Clock className="w-5 h-5 text-[#00875A]" />
              <span>سجل أحداث وملاحظات الطلب اللحظية</span>
            </h2>

            {/* Timeline Stream */}
            <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:right-3.5 before:w-0.5 before:bg-[#E8E3D8]">
              {order.timeline.map((event, idx) => (
                <div key={`timeline-${event.timestamp || idx}-${idx}`} className="relative pr-8 font-arabic">
                  <div className="absolute right-1.5 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#00875A]" />
                  <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E3D8]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-extrabold text-[#181818]">{event.status}</span>
                      <span className="text-[#5A5852] font-mono text-[11px]">{event.timestamp}</span>
                    </div>
                    {event.note && (
                      <p className="text-xs text-[#5A5852] leading-relaxed mt-1 bg-white p-2 rounded-xl border border-[#E8E3D8]/60">
                        {event.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Internal Note */}
            <form onSubmit={handleAddNote} className="pt-4 border-t border-[#E8E3D8] space-y-2">
              <label className="block text-xs font-bold text-[#181818] font-arabic">
                إضافة ملاحظة إدارية داخلية (مرئية للمشرفين فقط)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="اكتب ملاحظة حول اتصال العميل، تغليف خاص، إلخ..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8E3D8] bg-[#FAF8F5] text-xs text-[#181818] focus:outline-none focus:border-[#00875A]"
                />
                <button
                  type="submit"
                  disabled={isAddingNote || !newNote.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#00875A] text-white text-xs font-bold hover:bg-[#00704A] transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إضافة</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* LEFT (1 col): Customer + Shipping + Financial Breakdown */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="bg-white rounded-3xl border border-[#E8E3D8] p-6 shadow-xs font-arabic space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3D8]">
              <h3 className="font-extrabold text-sm text-[#181818] flex items-center gap-2">
                <User className="w-4 h-4 text-[#00875A]" />
                <span>بيانات العميل</span>
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-500" />
                <span>عضوية VIP</span>
              </span>
            </div>

            <div>
              <h4 className="font-extrabold text-base text-[#181818]">{order.customer.name}</h4>
              <p className="text-xs text-[#5A5852] mt-1 font-mono">{order.customer.email}</p>
              <p className="text-xs text-[#5A5852] font-mono">{order.customer.phone}</p>
            </div>

            {/* Quick Customer Communication */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `مرحباً ${order.customer.name}، بخصوص طلبكم رقم ${order.orderNumber} من متجر فخامة`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-xl border border-[#00875A]/20 bg-[#E6F4EE] text-[#00875A] text-xs font-bold hover:bg-[#00875A] hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>واتساب</span>
              </a>

              <a
                href={`tel:${order.customer.phone}`}
                className="py-2 px-3 rounded-xl border border-[#E8E3D8] bg-[#FAF8F5] text-[#181818] text-xs font-bold hover:bg-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>اتصال هاتف</span>
              </a>
            </div>
          </div>

          {/* Royal Gift Wrapping Card (If Selected) */}
          {order.giftWrapping && (
            <div className="bg-[#FAF6EC] rounded-3xl border border-amber-300 p-6 shadow-xs font-arabic space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                <h3 className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>تغليف الهدايا الملكي</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-800 border border-amber-300 uppercase">
                  نشط VIP
                </span>
              </div>
              <div className="text-xs space-y-3">
                <div className="text-neutral-700 leading-relaxed">
                  <p className="font-bold text-amber-800 mb-1">رسالة بطاقة الإهداء الملكية:</p>
                  {order.giftMessage ? (
                    <div className="p-3 bg-white/80 rounded-2xl border border-amber-100 italic text-[#111111] shadow-xs relative">
                      <span className="absolute -top-2 right-4 bg-amber-500 text-white rounded-full p-1 text-[9px] scale-75">✍️</span>
                      "{order.giftMessage}"
                    </div>
                  ) : (
                    <span className="text-amber-600/70 italic">العميل لم يكتب رسالة للبطاقة (جاهزة للكتابة اليدوية)</span>
                  )}
                </div>
                <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-[11px] text-amber-900 flex items-start gap-2 font-bold leading-relaxed">
                  <span>🎁</span>
                  <span>تنبيه التجهيز: يرجى تغليف كافة مقتنيات هذا الطلب بورق الهدايا الفاخر والحرير وإرفاق بطاقة الإهداء المطبوعة أعلاه قبل تسليمها لشركة الشحن.</span>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Address Card */}
          <div className="bg-white rounded-3xl border border-[#E8E3D8] p-6 shadow-xs font-arabic space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3D8]">
              <h3 className="font-extrabold text-sm text-[#181818] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00875A]" />
                <span>عنوان التوصيل</span>
              </h3>
              <button
                type="button"
                onClick={copyAddress}
                className="text-[11px] font-bold text-[#00875A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>نسخ العنوان</span>
              </button>
            </div>

            <div className="text-xs space-y-1.5 text-[#5A5852]">
              <p className="font-bold text-[#181818]">{order.shippingAddress.recipientName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>
                {order.shippingAddress.city}، {order.shippingAddress.country}
                {order.shippingAddress.postalCode && ` (${order.shippingAddress.postalCode})`}
              </p>
              <p className="font-mono">{order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="bg-white rounded-3xl border border-[#E8E3D8] p-6 shadow-xs font-arabic space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3D8]">
              <h3 className="font-extrabold text-sm text-[#181818] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#00875A]" />
                <span>الملخص المالي والسداد</span>
              </h3>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  order.paymentStatus === 'paid'
                    ? 'bg-[#E6F4EE] text-[#00875A] border border-[#00875A]/20'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {order.paymentStatus === 'paid' ? 'مسدد بالكامل' : 'معلق'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#5A5852]">
                <span>المجموع الفرعي:</span>
                <span className="font-bold font-mono text-[#181818]">
                  {Number(order?.subtotal ?? 0).toLocaleString('ar-SA')} ر.س
                </span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-[#00875A]">
                  <span>خصم كوبون ترويجي:</span>
                  <span className="font-bold font-mono">
                    -{Number(order?.discount ?? 0).toLocaleString('ar-SA')} ر.س
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[#5A5852]">
                <span>الشحن الملكي:</span>
                <span className="font-bold font-mono text-[#181818]">
                  {order.shipping === 0 ? 'مجاني' : `${Number(order?.shipping ?? 0).toLocaleString('ar-SA')} ر.س`}
                </span>
              </div>

              <div className="flex justify-between text-[#5A5852]">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span className="font-bold font-mono text-[#181818]">
                  {Number(order?.tax ?? 0).toLocaleString('ar-SA')} ر.س
                </span>
              </div>

              <div className="pt-3 border-t border-[#E8E3D8] flex justify-between text-base font-black text-[#181818]">
                <span>الإجمالي النهائي:</span>
                <span className="text-[#00875A] font-mono">
                  {Number(order?.total ?? 0).toLocaleString('ar-SA')} ر.س
                </span>
              </div>

              <div className="pt-2 text-[11px] text-[#5A5852]">
                <span>طريقة الدفع: </span>
                <strong className="text-[#181818]">{order.paymentMethod}</strong>
              </div>
            </div>

            {order.paymentStatus !== 'paid' && (
              <button
                type="button"
                onClick={() => handleUpdatePayment('paid')}
                className="w-full py-2.5 rounded-xl bg-[#00875A] text-white text-xs font-bold hover:bg-[#00704A] transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد استلام المبلغ (تحويل بنكي)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tracking Modal */}
      {trackingModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8E3D8] shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 font-arabic">
            <h3 className="font-extrabold text-base text-[#181818] mb-1">
              تحديث بيانات الشحن والتتبع
            </h3>
            <p className="text-xs text-[#5A5852] mb-4">
              أدخل اسم الناقل ورقم البوليصة لتزويد العميل برابط التتبع المباشر
            </p>

            <form onSubmit={handleSaveTracking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#181818] mb-1">شركة الشحن</label>
                <select
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] focus:outline-none focus:border-[#00875A]"
                >
                  <option value="توصيل فخامة الملكي الخاص">توصيل فخامة الملكي الخاص (VIP Concierge)</option>
                  <option value="سمسا SMSA Express">سمسا SMSA Express</option>
                  <option value="أرامكس Aramex">أرامكس Aramex</option>
                  <option value="دي إتش إل DHL Express">دي إتش إل DHL Express</option>
                  <option value="سبل SPL البريد السعودي">سبل SPL البريد السعودي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#181818] mb-1">رقم البوليصة / التتبع</label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="مثال: SA-VIP-99120"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-xs font-mono text-[#181818] focus:outline-none focus:border-[#00875A]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#5A5852] hover:bg-[#FAF8F5] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingTracking}
                  className="px-5 py-2 rounded-xl bg-[#00875A] text-white text-xs font-bold hover:bg-[#00704A] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  حفظ وتحديث الحالة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8E3D8] shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 font-arabic">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-extrabold text-base text-[#181818] mb-1">
              تأكيد إلغاء الطلب #{order.orderNumber}
            </h3>
            <p className="text-xs text-[#5A5852] mb-4">
              يرجى تحديد سبب الإلغاء ليتم تسجيله في سجل الطلب وإشعار العميل
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="سبب الإلغاء (طلب العميل، عدم توفر بالمعايير، إلخ)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-xs text-[#181818] focus:outline-none focus:border-rose-600"
              />

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#5A5852] hover:bg-[#FAF8F5] cursor-pointer"
                >
                  تراجع
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={isCancelling || !cancelReason.trim()}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isCancelling ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>تأكيد الإلغاء</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        order={order}
      />
    </div>
  );
};
