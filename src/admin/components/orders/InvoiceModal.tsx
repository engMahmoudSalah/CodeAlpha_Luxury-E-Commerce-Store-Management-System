import React from 'react';
import {
  X,
  Printer,
  Download,
  Crown,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { AdminOrder } from '../../types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrder | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl border border-[#E8E3D8] shadow-2xl max-w-3xl w-full overflow-hidden print:border-none print:shadow-none print:max-w-full">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E3D8] bg-[#FAF8F5] print:hidden">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#181818] font-arabic">
            <Crown className="w-5 h-5 text-amber-600" />
            <span>فاتورة ضريبية ملكية رسمية #{order.orderNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#00875A] text-white text-xs font-bold hover:bg-[#00704A] transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#5A5852] hover:text-[#181818] hover:bg-[#E8E3D8]/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Canvas */}
        <div className="p-8 sm:p-12 space-y-8 font-arabic bg-white text-[#181818]" id="printable-invoice">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-[#E8E3D8]">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <Crown className="w-7 h-7 text-[#00875A]" />
                <span className="text-2xl font-black tracking-tight text-[#181818]">فخامة</span>
                <span className="text-xs tracking-widest text-[#00875A] font-bold uppercase bg-[#E6F4EE] px-2 py-0.5 rounded border border-[#00875A]/20">
                  ROYAL STORE
                </span>
              </div>
              <p className="text-xs text-[#5A5852] max-w-xs leading-relaxed">
                متجر فخامة للمقتنيات الملكية والساعات والعطور الفاخرة
                <br />
                المملكة العربية السعودية - الرياض، حي حطين
              </p>
              <div className="text-[11px] text-[#5A5852] mt-2 space-y-0.5">
                <p>الرقم الضريبي (VAT): <span className="font-mono font-bold text-[#181818]">310294819200003</span></p>
                <p>السجل التجاري: <span className="font-mono font-bold text-[#181818]">1010894210</span></p>
              </div>
            </div>

            <div className="text-left sm:text-right bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E3D8] min-w-[220px]">
              <span className="text-xs font-bold text-[#00875A] block mb-1">فاتورة ضريبية مبسطة</span>
              <h2 className="text-lg font-black text-[#181818] font-mono">{order.orderNumber}</h2>
              <div className="text-xs text-[#5A5852] mt-2 space-y-1">
                <p>تاريخ الإصدار: <span className="font-bold text-[#181818]">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</span></p>
                <p>حالة الدفع: <span className="font-bold text-[#00875A]">تم السداد الإلكتروني</span></p>
                <p>طريقة الدفع: <span className="font-bold text-[#181818]">{order.paymentMethod}</span></p>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E3D8]">
            <div>
              <span className="text-xs font-bold text-[#5A5852] block mb-1">بيانات العميل المستلم</span>
              <h3 className="text-sm font-extrabold text-[#181818]">{order.customer.name}</h3>
              <p className="text-xs text-[#5A5852] mt-1 flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-[#00875A]" />
                <span>{order.customer.phone}</span>
              </p>
              <p className="text-xs text-[#5A5852] flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-[#00875A]" />
                <span>{order.customer.email}</span>
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-[#5A5852] block mb-1">عنوان الشحن والتوصيل</span>
              <p className="text-xs font-bold text-[#181818] leading-relaxed flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#00875A] shrink-0 mt-0.5" />
                <span>
                  {order.shippingAddress.addressLine1}، {order.shippingAddress.city}،{' '}
                  {order.shippingAddress.country}
                  {order.shippingAddress.postalCode ? ` (${order.shippingAddress.postalCode})` : ''}
                </span>
              </p>
              {order.trackingNumber && (
                <div className="mt-2 text-xs text-[#5A5852]">
                  <span>بوليصة الشحن: </span>
                  <span className="font-mono font-bold text-[#181818] bg-white px-2 py-0.5 rounded border border-[#E8E3D8]">
                    {order.shippingCarrier} - {order.trackingNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Royal Gift Packaging Notice on Invoice */}
          {order.giftWrapping && (
            <div className="p-4 rounded-2xl bg-[#FAF6EC] border border-amber-300 text-xs text-amber-950 font-arabic space-y-1.5">
              <div className="flex items-center justify-between font-extrabold text-amber-900">
                <span>🎁 مرفق: خدمة التغليف الملكي المخملي وبطاقة الإهداء VIP</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded">مشمول</span>
              </div>
              {order.giftMessage && (
                <p className="text-[11px] italic bg-white/70 p-2 rounded-xl border border-amber-200">
                  <span className="font-bold not-italic text-amber-800 ml-1">نص بطاقة الإهداء:</span>
                  "{order.giftMessage}"
                </p>
              )}
            </div>
          )}

          {/* Items Table */}
          <div className="overflow-hidden rounded-2xl border border-[#E8E3D8]">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E3D8] font-bold text-[#5A5852]">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">المنتج الملكي والوصف</th>
                  <th className="py-3 px-4 text-center">الكمية</th>
                  <th className="py-3 px-4 text-left">سعر الوحدة</th>
                  <th className="py-3 px-4 text-left">المجموع الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D8]">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F5]/50">
                    <td className="py-3 px-4 text-[#5A5852] font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-[#181818]">
                      {item.productName}
                      {item.sku && (
                        <span className="text-[11px] font-mono text-[#5A5852] block font-normal">
                          رمز القطعة: {item.sku}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-left font-bold font-mono">
                      {Number(item?.unitPrice ?? 0).toLocaleString('ar-SA')} ر.س
                    </td>
                    <td className="py-3 px-4 text-left font-black text-[#00875A] font-mono">
                      {Number(item?.totalPrice ?? 0).toLocaleString('ar-SA')} ر.س
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Breakdown & Verification */}
          <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-4">
            <div className="flex items-center gap-4 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E3D8] w-full sm:w-auto">
              <div className="w-16 h-16 bg-white p-2 rounded-xl border border-[#E8E3D8] flex items-center justify-center">
                <QrCode className="w-full h-full text-[#181818]" />
              </div>
              <div className="text-[11px] text-[#5A5852] space-y-0.5">
                <span className="font-bold text-[#00875A] block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>فاتورة إلكترونية معتمدة من هيئة الزكاة والضريبة</span>
                </span>
                <p>رمز التحقق الرقمي المشفر ZATCA Compliant</p>
                <p className="font-mono">FKM-{order.id}-{order.orderNumber}</p>
              </div>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-[#5A5852]">
                <span>المجموع الفرعي:</span>
                <span className="font-bold font-mono text-[#181818]">
                  {Number(order?.subtotal ?? 0).toLocaleString('ar-SA')} ر.س
                </span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-[#00875A]">
                  <span>خصم كود الترويجي VIP:</span>
                  <span className="font-bold font-mono">
                    -{Number(order?.discount ?? 0).toLocaleString('ar-SA')} ر.س
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[#5A5852]">
                <span>رسوم الشحن والتوصيل الملكي:</span>
                <span className="font-bold font-mono text-[#181818]">
                  {order.shipping === 0 ? 'مجاني' : `${Number(order?.shipping ?? 0).toLocaleString('ar-SA')} ر.س`}
                </span>
              </div>

              <div className="flex justify-between text-[#5A5852]">
                <span>ضريبة القيمة المضافة (15% شملت):</span>
                <span className="font-bold font-mono text-[#181818]">
                  {Number(order?.tax ?? 0).toLocaleString('ar-SA')} ر.س
                </span>
              </div>

              <div className="pt-2 border-t border-[#E8E3D8] flex justify-between text-sm font-black text-[#181818]">
                <span>الإجمالي النهائي المستحق:</span>
                <span className="text-base text-[#00875A] font-mono">
                  {Number(order?.total ?? 0).toLocaleString('ar-SA')} ر.س
                </span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="pt-6 border-t border-[#E8E3D8] text-[11px] text-[#5A5852] text-center space-y-1">
            <p className="font-bold text-[#181818]">شكراً لاختياركم متجر فخامة للمقتنيات الملكية</p>
            <p>
              يحق للعميل الاستبدال والاسترجاع خلال 14 يوماً من تاريخ الاستلام وفقاً للشروط والأحكام.
              خدمة كبار الشخصيات: 920000000 • البريد: vip@fakhama.sa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
