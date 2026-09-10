import React from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useOrder } from '../hooks/useOrders';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import {
  CheckCircle2,
  Truck,
  ShoppingBag,
  FileText,
  Sparkles,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const params = useParams<{ id?: string }>();
  const orderId = params.id || searchParams.get('id') || '';
  const { data: order, isLoading } = useOrder(orderId, Boolean(orderId));

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 flex flex-col gap-8 font-arabic px-4" dir="rtl">
      {/* Hero Confirmation Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E8E3D8] text-center flex flex-col items-center gap-4 shadow-2xs">
        <div className="w-16 h-16 rounded-full bg-[#008F68] flex items-center justify-center text-[#FFC700] mb-2 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-[#008F68] bg-[#008F68]/10 px-3 py-1 rounded-full">
          تم توثيق وتأكيد طلبك بنجاح
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-[#111111] tracking-tight">
          شكراً لاختيارك متجر فخامة
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg leading-relaxed">
          تم استلام طلبك وتأكيد الدفع المشفر بنجاح، ويجري الآن فحصه وتغليفه في العلب المخملية الملكية لضمان وصوله بأعلى معايير الجودة والسرعة.
        </p>

        {orderId && (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FCFAF7] border border-[#E8E3D8] text-xs text-[#111111] mt-2">
            <span className="text-neutral-400">رقم مرجع الطلب:</span>
            <strong className="text-[#111111] font-black font-mono">
              {order?.orderNumber || (orderId.toString().startsWith('ORD-') ? orderId : `ORD-${orderId}`)}
            </strong>
          </div>
        )}
      </div>

      {/* Order Details Breakdown */}
      {isLoading ? (
        <div className="p-12 flex justify-center"><Spinner /></div>
      ) : order ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3D8] flex flex-col gap-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E3D8] pb-4">
            <div>
              <h2 className="text-base font-black text-[#111111]">ملخص الطلب والمقتنيات</h2>
              <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                تاريخ التسجيل: {new Date(order.created_at).toLocaleDateString('ar-SA')}
              </p>
            </div>
            <Badge variant="success" size="md">
              الحالة: {order.status === 'delivered' ? 'تم التسليم' : order.status === 'processing' ? 'قيد التجهيز' : 'مؤكد وموثق'}
            </Badge>
          </div>

          {/* Items Preview */}
          {order.items && order.items.length > 0 && (
            <div className="flex flex-col divide-y divide-[#FAF8F3]">
              {order.items.map((item, idx) => (
                <div key={`order-success-item-${item.productId || idx}-${idx}`} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name || 'Product'}
                        className="w-12 h-12 rounded-2xl bg-[#FCFAF7] object-contain p-1 border border-[#E8E3D8] mix-blend-multiply"
                      />
                    )}
                    <div>
                      <p className="text-xs font-black text-[#111111]">{item.product_name || item.name || `مقتنى #${item.productId}`}</p>
                      <p className="text-[11px] text-neutral-400 font-bold font-mono">الكمية: {item.quantity} × {Number(item?.price ?? 0).toLocaleString('ar-SA')} ر.س</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#111111] font-mono">{Number(item?.subtotal ?? 0).toLocaleString('ar-SA')} ر.س</span>
                </div>
              ))}
            </div>
          )}

          {/* Royal Gift Wrapping Confirmation (If Selected) */}
          {order.giftWrapping && (
            <div className="p-4 rounded-2xl bg-[#FAF6EC] border border-amber-300 flex flex-col gap-2 text-xs text-amber-900 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-amber-950">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>تغليف الهدايا الملكي المخملي</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-800">
                  مرفق مع الطلب
                </span>
              </div>
              {order.giftMessage ? (
                <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200 text-neutral-800 italic">
                  <span className="text-[10px] font-bold text-amber-700 block not-italic mb-0.5">رسالة الإهداء المرفقة:</span>
                  "{order.giftMessage}"
                </div>
              ) : (
                <p className="text-[11px] text-amber-800">سيتم تغليف مقتنياتك في علب مخملية فاخرة مع شريط حريري وكرت إهداء فارغ.</p>
              )}
            </div>
          )}

          {/* Shipping destination & total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#FCFAF7] border border-[#E8E3D8] text-xs">
            <div>
              <span className="text-neutral-400 font-bold text-[11px] block mb-1">
                عنوان التوصيل
              </span>
              <p className="text-[#111111] font-bold">{order.shipping_address || 'توصيل مخصص وسريع'}</p>
            </div>
            <div className="sm:text-left">
              <span className="text-neutral-400 font-bold text-[11px] block mb-1">
                إجمالي المبلغ المدفوع
              </span>
              <p className="text-xl font-black text-[#111111] font-mono">{Number(order?.total ?? 0).toLocaleString('ar-SA')} <span className="text-xs font-sans text-neutral-400">ر.س</span></p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to={`/track-order?id=${order?.orderNumber || orderId || ''}`} className="w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Truck className="w-4 h-4" />}
            className="w-full"
          >
            تتبع الشحنة مباشرة
          </Button>
        </Link>
        <Link to="/orders" className="w-full sm:w-auto">
          <Button
            variant="secondary"
            size="lg"
            leftIcon={<FileText className="w-4 h-4" />}
            className="w-full"
          >
            سجل المقتنيات
          </Button>
        </Link>
        <Link to="/" className="w-full sm:w-auto">
          <Button
            variant="outline"
            size="lg"
            leftIcon={<ShoppingBag className="w-4 h-4" />}
            className="w-full"
          >
            متابعة التسوق
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
