import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Plus,
  Percent,
  DollarSign,
  Truck,
  Calendar,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit2,
  X,
  Search,
  Sparkles,
  Award,
  AlertCircle
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminCoupon, DiscountType } from '../../types';
import { commerceEventBus } from '../../../shared/events/commerceEvents';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as DiscountType,
    discountValue: 15,
    minOrderValue: 1000,
    maxDiscountAmount: 500,
    usageLimit: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active' as const,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    const unsub = commerceEventBus.subscribe('COUPON_UPDATED', () => {
      fetchCoupons();
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 15,
      minOrderValue: 1000,
      maxDiscountAmount: 500,
      usageLimit: 100,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: AdminCoupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      usageLimit: coupon.usageLimit || 0,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      status: coupon.status,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await adminService.toggleCouponStatus(id);
      setCoupons((prev) => prev.map((c) => (c.id === id ? updated : c)));
      showToast(updated.status === 'active' ? 'تم تفعيل الكوبون' : 'تم تعطيل الكوبون');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكوبون الترويجي؟')) return;
    try {
      await adminService.deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      showToast('تم حذف الكوبون بنجاح');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) return;

    try {
      if (editingCoupon) {
        const updated = await adminService.updateCoupon(editingCoupon.id, {
          code: formData.code.toUpperCase().trim(),
          description: formData.description,
          discountType: formData.discountType,
          discountValue: Number(formData.discountValue),
          minOrderValue: Number(formData.minOrderValue) || undefined,
          maxDiscountAmount: Number(formData.maxDiscountAmount) || undefined,
          usageLimit: Number(formData.usageLimit) || undefined,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status,
        });
        setCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        showToast('تم تحديث بيانات الكوبون بنجاح');
      } else {
        const created = await adminService.createCoupon({
          code: formData.code.toUpperCase().trim(),
          description: formData.description,
          discountType: formData.discountType,
          discountValue: Number(formData.discountValue),
          minOrderValue: Number(formData.minOrderValue) || undefined,
          maxDiscountAmount: Number(formData.maxDiscountAmount) || undefined,
          usageLimit: Number(formData.usageLimit) || undefined,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status,
        });
        setCoupons((prev) => [created, ...prev]);
        showToast('تم إنشاء الكوبون الترويجي بنجاح');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCoupons = useMemo(() => {
    if (!search.trim()) return coupons;
    const q = search.toLowerCase().trim();
    return coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [coupons, search]);

  // KPI Calculations
  const stats = useMemo(() => {
    const active = coupons.filter((c) => c.status === 'active').length;
    const totalUses = coupons.reduce((acc, c) => acc + c.usageCount, 0);
    return { total: coupons.length, active, totalUses };
  }, [coupons]);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#00875A] text-white px-4 py-3 rounded-xl shadow-xl text-sm animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>لوحة التحكم</span>
            <span>/</span>
            <span className="text-amber-700 font-semibold">قسائم التخفيض</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Tag className="w-7 h-7 text-amber-600" />
            قسائم وكوبونات الخصم
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            إنشاء وإدارة رموز التخفيض الحصرية للنخبة والحملات التسويقية
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-xs transition-all active:scale-98 text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إنشاء كود خصم جديد
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">الكوبونات النشطة</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#00875A] flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.active}</span>
            <span className="text-xs text-emerald-600 font-medium">جاهزة للاستخدام بالمتجر</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">إجمالي مرات الاستخدام</span>
            <div className="w-9 h-9 rounded-xl bg-[#00875A]/10 text-[#00875A] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalUses}</span>
            <span className="text-xs text-slate-500">عملية شراء تم تطبيق الخصم عليها</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">إجمالي الكوبونات المسجلة</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-slate-500">كوبونات تاريخية ومجدولة</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برمز الكوبون أو الوصف..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#00875A]/20 focus:border-[#00875A] text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            جاري تحميل الكوبونات...
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            لا توجد كوبونات تطابق البحث
          </div>
        ) : (
          filteredCoupons.map((c, idx) => {
            const isPercentage = c.discountType === 'percentage';
            const isFreeShipping = c.discountType === 'free_shipping';
            const usagePercent = c.usageLimit ? Math.min(100, Math.round((c.usageCount / c.usageLimit) * 100)) : null;

            return (
              <div
                key={`coupon-${c.id || idx}-${idx}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all relative overflow-hidden group"
              >
                {/* Top Badge & Discount Type */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        c.status === 'active'
                          ? 'bg-emerald-500/10 text-[#00875A] border border-emerald-500/20'
                          : c.status === 'expired'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          : 'bg-red-500/10 text-red-600 border border-red-500/20'
                      }`}
                    >
                      {c.status === 'active' ? 'نشط' : c.status === 'expired' ? 'منتهي' : 'معطل'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(c.id)}
                        title="تغيير حالة الكوبون"
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {c.status === 'active' ? (
                          <ToggleRight className="w-5 h-5 text-[#00875A]" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        title="تعديل"
                        className="p-1 text-slate-400 hover:text-[#00875A]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        title="حذف"
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Coupon Code Block */}
                  <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                    <span className="font-mono font-black text-lg text-slate-900 dark:text-white tracking-wider">
                      {c.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(c.code)}
                      className="p-1.5 text-slate-500 hover:text-[#00875A] rounded-lg transition-colors flex items-center gap-1 text-xs"
                    >
                      {copiedCode === c.code ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Discount Value Display */}
                  <div className="mt-3">
                    <div className="text-base font-extrabold text-slate-900 dark:text-white">
                      {isFreeShipping ? (
                        <span className="text-[#00875A] flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          شحن مجاني لكافة الطلبات
                        </span>
                      ) : isPercentage ? (
                        <span className="text-amber-500">خصم {c.discountValue}٪ على الطلب</span>
                      ) : (
                        <span className="text-[#00875A]">خصم بقيمة {c.discountValue} ر.س</span>
                      )}
                    </div>
                    {c.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {c.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Details & Usage Bar */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>استخدم: {c.usageCount} مرة</span>
                    {c.usageLimit && <span>الحد: {c.usageLimit} مرة</span>}
                  </div>

                  {usagePercent !== null && (
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#00875A] h-full rounded-full transition-all"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      ينتهي: {c.endDate}
                    </span>
                    {c.minOrderValue && <span>أدنى طلب: {c.minOrderValue} ر.س</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#00875A]" />
                {editingCoupon ? 'تعديل كوبون الخصم' : 'إنشاء كوبون خصم جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  رمز الكوبون (Code) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="مثال: ROYAL20"
                  className="w-full font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  الوصف التسويقي
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="مثال: خصم حصري لكبار عملاء النخبة"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    نوع الخصم
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed_amount">مبلغ ثابت (ر.س)</option>
                    <option value="free_shipping">شحن مجاني</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    قيمة الخصم {formData.discountType === 'percentage' ? '(%)' : '(ر.س)'}
                  </label>
                  <input
                    type="number"
                    disabled={formData.discountType === 'free_shipping'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    أدنى قيمة للطلب (ر.س)
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    الحد الأقصى للاستخدام (مرات)
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    placeholder="100"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    تاريخ البدء
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    تاريخ الانتهاء
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#00875A] hover:bg-[#00724C] text-white text-sm font-semibold shadow-xs"
                >
                  {editingCoupon ? 'تحديث الكوبون' : 'حفظ الكوبون'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
