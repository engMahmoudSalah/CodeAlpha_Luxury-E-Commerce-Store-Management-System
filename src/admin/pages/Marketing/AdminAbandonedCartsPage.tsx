import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  MessageCircle,
  Mail,
  Smartphone,
  CheckCircle2,
  Clock,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Link,
  Copy,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminAbandonedCart } from '../../types';
import { useToast } from '../../../context/ToastContext';
import { commerceEventBus } from '../../../shared/events/commerceEvents';

export const AdminAbandonedCartsPage: React.FC = () => {
  const { showToast } = useToast();

  const [carts, setCarts] = useState<AdminAbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'abandoned' | 'contacted' | 'recovered'>('all');

  const loadCarts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAbandonedCarts();
      setCarts(data);
    } catch (err: any) {
      showToast('تعذر تحميل بيانات السلات المتروكة', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCarts();
    const unsubOrder = commerceEventBus.subscribe('ORDER_CREATED', () => {
      loadCarts();
    });
    const unsubCart = commerceEventBus.subscribe('ABANDONED_CART_UPDATED', () => {
      loadCarts();
    });
    return () => {
      unsubOrder();
      unsubCart();
    };
  }, []);

  // Filtered
  const filteredCarts = useMemo(() => {
    return carts.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.customer.name.toLowerCase().includes(q);
        const matchesPhone = c.customer.phone.toLowerCase().includes(q);
        const matchesEmail = c.customer.email.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesEmail) return false;
      }
      if (statusFilter !== 'all' && c.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [carts, searchQuery, statusFilter]);

  // KPIs
  const totalCarts = carts.length;
  const potentialRevenue = carts.reduce((sum, c) => sum + (c.status !== 'recovered' ? c.totalValue : 0), 0);
  const recoveredCount = carts.filter((c) => c.status === 'recovered').length;
  const recoveredRevenue = carts.reduce((sum, c) => sum + (c.status === 'recovered' ? c.totalValue : 0), 0);

  // Send Recovery Action
  const handleSendRecovery = async (cart: AdminAbandonedCart, channel: 'whatsapp' | 'sms' | 'email') => {
    try {
      await adminService.sendCartRecovery(cart.id, channel);
      const channelLabels = { whatsapp: 'واتساب', sms: 'رسالة نصية SMS', email: 'البريد الإلكتروني' };
      showToast(`تم إرسال تذكير السلة الملكية إلى ${cart.customer.name} عبر ${channelLabels[channel]}`, 'success');
      await loadCarts();
    } catch (err: any) {
      showToast('تعذر إرسال التذكير', 'error');
    }
  };

  const copyCartLink = (cart: AdminAbandonedCart) => {
    const url = `${window.location.origin}/cart?recovery=${cart.id}&coupon=VIP10`;
    navigator.clipboard.writeText(url);
    showToast('تم نسخ رابط استكمال الطلب مع كود الخصم VIP10', 'success');
  };

  return (
    <div id="admin-abandoned-carts-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#181818] tracking-tight font-arabic flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-[#00875A]" />
            <span>استرداد السلات المتروكة والفرص الضائعة</span>
          </h1>
          <p className="text-sm text-[#5A5852] mt-1 font-arabic">
            إعادة استهداف عملاء النخبة عبر قنوات التواصل الملكية وتقديم حوافز لإتمام الشراء
          </p>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] flex items-center justify-center text-[#181818]">
            <Clock className="w-5 h-5 text-[#5A5852]" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">إجمالي السلات المتروكة</span>
            <span className="text-xl font-black text-[#181818] font-arabic">
              {totalCarts} سلة
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">مبيعات قيد الاسترداد</span>
            <span className="text-xl font-black text-amber-700 font-arabic">
              {potentialRevenue.toLocaleString('ar-SA')} ر.س
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E6F4EE] border border-[#00875A]/20 flex items-center justify-center text-[#00875A]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">سلات تم استردادها بنجاح</span>
            <span className="text-xl font-black text-[#00875A] font-arabic">
              {recoveredCount} سلات
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E6F4EE] border border-[#00875A]/20 flex items-center justify-center text-[#00875A]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">قيمة المبيعات المستعادة</span>
            <span className="text-xl font-black text-[#00875A] font-arabic">
              {recoveredRevenue.toLocaleString('ar-SA')} ر.س
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A5852]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، الجوال، البريد..."
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-[#E8E3D8] bg-[#FAF8F5] text-sm text-[#181818] placeholder-[#5A5852] focus:outline-none focus:border-[#00875A]"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] focus:outline-none focus:border-[#00875A] cursor-pointer"
          >
            <option value="all">كل الحالات</option>
            <option value="abandoned">بانتظار التواصل</option>
            <option value="contacted">تم التواصل والتذكير</option>
            <option value="recovered">تم استكمال الطلب</option>
          </select>
        </div>
      </div>

      {/* Carts List Table */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E8E3D8]">
          <div className="w-10 h-10 border-3 border-[#00875A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#5A5852] font-arabic">جاري تحليل السلات المتروكة...</p>
        </div>
      ) : filteredCarts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#E8E3D8] p-6">
          <ShoppingBag className="w-12 h-12 text-[#5A5852]/40 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-[#181818] mb-1 font-arabic">
            لا توجد سلات متروكة مطابقة للبحث
          </h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E3D8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E3D8] text-[11px] font-bold text-[#5A5852] uppercase tracking-wider font-arabic">
                  <th className="py-3.5 px-4">العميل وبيانات التواصل</th>
                  <th className="py-3.5 px-4">القطع في السلة</th>
                  <th className="py-3.5 px-4">قيمة السلة</th>
                  <th className="py-3.5 px-4">توقيت الترك</th>
                  <th className="py-3.5 px-4">حالة الاستهداف</th>
                  <th className="py-3.5 px-4 text-left">إجراءات الاسترداد المباشر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D8] text-xs">
                {filteredCarts.map((cart, idx) => (
                  <tr key={`aban-cart-${cart.id || idx}-${idx}`} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    {/* Customer */}
                    <td className="py-4 px-4 font-arabic">
                      <div>
                        <span className="font-extrabold text-sm text-[#181818] block">
                          {cart.customer.name}
                        </span>
                        <span className="text-[11px] text-[#5A5852] font-mono block">
                          {cart.customer.phone}
                        </span>
                        <span className="text-[11px] text-[#5A5852] font-mono block">
                          {cart.customer.email}
                        </span>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        {cart.items.map((item, idx) => (
                          <div
                            key={`cart-item-${item.productId || idx}-${idx}`}
                            className="w-9 h-9 rounded-lg border border-[#E8E3D8] overflow-hidden bg-[#FAF8F5] shrink-0"
                            title={`${item.productName} (x${item.quantity})`}
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        <span className="text-xs text-[#5A5852] font-arabic mr-1">
                          ({cart.items.length} أصناف)
                        </span>
                      </div>
                    </td>

                    {/* Cart Total */}
                    <td className="py-4 px-4 font-bold text-[#181818] font-arabic">
                      <span className="text-sm font-black text-[#00875A]">
                        {Number(cart?.totalValue ?? 0).toLocaleString('ar-SA')} ر.س
                      </span>
                    </td>

                    {/* Abandoned Time */}
                    <td className="py-4 px-4 text-[#5A5852] font-arabic whitespace-nowrap">
                      {cart.abandonedAt}
                    </td>

                    {/* Recovery Status */}
                    <td className="py-4 px-4 font-arabic">
                      {cart.status === 'recovered' ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#E6F4EE] text-[#00875A] border border-[#00875A]/20 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تم الشراء والاسترداد</span>
                        </span>
                      ) : cart.status === 'contacted' ? (
                        <div>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-block mb-1">
                            تم إرسال {cart.recoverySentCount} تذكير
                          </span>
                          {cart.lastRecoverySentAt && (
                            <span className="text-[11px] text-[#5A5852] block font-normal">
                              {cart.lastRecoverySentAt}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FAF8F5] text-[#5A5852] border border-[#E8E3D8] inline-block">
                          لم يتم التواصل بعد
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        {cart.status !== 'recovered' && (
                          <>
                            {/* WhatsApp Direct Message with luxury copy */}
                            <a
                              href={`https://wa.me/${cart.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `مرحباً بك ${cart.customer.name}، لاحظنا بقاء مقتنياتك الملكية في السلة بمتجر فخامة. يسعدنا تقديم كود خصم VIP10 بنسبة 10% لإتمام طلبك عبر الرابط التالي: ${window.location.origin}/cart?recovery=${cart.id}`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => handleSendRecovery(cart, 'whatsapp')}
                              className="px-2.5 py-1.5 rounded-lg border border-[#00875A]/30 bg-[#E6F4EE] text-[#00875A] hover:bg-[#00875A] hover:text-white transition-colors text-xs font-bold flex items-center gap-1"
                              title="إرسال رسالة واتساب مع كود الخصم"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>واتساب</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => handleSendRecovery(cart, 'email')}
                              className="p-1.5 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#00875A] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                              title="إرسال بريد استرداد رسمي"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => copyCartLink(cart)}
                              className="p-1.5 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#181818] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                              title="نسخ رابط السلة المباشر"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
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
  );
};
