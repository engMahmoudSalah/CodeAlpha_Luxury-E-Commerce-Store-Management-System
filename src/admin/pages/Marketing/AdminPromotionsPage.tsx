import React, { useState, useEffect, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Image,
  Eye,
  MousePointer,
  Calendar,
  Trash2,
  Edit2,
  X,
  Check,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Sparkles,
  Layers,
  Layout
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminPromotion } from '../../types';
import { commerceEventBus } from '../../../shared/events/commerceEvents';

export const AdminPromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPromo, setEditingPromo] = useState<AdminPromotion | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: '',
    type: 'hero_slide' as AdminPromotion['type'],
    imageUrl: '',
    linkUrl: '/products',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active' as const,
  });

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPromotions();
      setPromotions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
    const unsub = commerceEventBus.subscribe('PROMOTION_UPDATED', () => {
      fetchPromotions();
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingPromo(null);
    setFormData({
      title: '',
      subtitle: '',
      badge: 'حصري',
      type: 'hero_slide',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop&q=80',
      linkUrl: '/products',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: AdminPromotion) => {
    setEditingPromo(p);
    setFormData({
      title: p.title,
      subtitle: p.subtitle || '',
      badge: p.badge || '',
      type: p.type,
      imageUrl: p.imageUrl || '',
      linkUrl: p.linkUrl,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const target = promotions.find((p) => p.id === id);
      if (!target) return;
      const nextStatus = target.status === 'active' ? 'disabled' : 'active';
      const updated = await adminService.updatePromotion(id, { status: nextStatus });
      setPromotions((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast(nextStatus === 'active' ? 'تم تفعيل الحملة' : 'تم إيقاف الحملة');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الحملة التسويقية؟')) return;
    try {
      await adminService.deletePromotion(id);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      showToast('تم حذف الحملة بنجاح');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (editingPromo) {
        const updated = await adminService.updatePromotion(editingPromo.id, formData);
        setPromotions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast('تم تحديث الحملة بنجاح');
      } else {
        const created = await adminService.createPromotion(formData);
        setPromotions((prev) => [created, ...prev]);
        showToast('تم إطلاق الحملة الترويجية بنجاح');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const stats = useMemo(() => {
    const active = promotions.filter((p) => p.status === 'active').length;
    const views = promotions.reduce((acc, p) => acc + p.viewsCount, 0);
    const clicks = promotions.reduce((acc, p) => acc + p.clicksCount, 0);
    const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0';
    return { active, views, clicks, ctr };
  }, [promotions]);

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
            <span className="text-amber-700 font-semibold">الحملات الترويجية</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Megaphone className="w-7 h-7 text-amber-600" />
            الحملات الإعلانية والبنرات الترويجية
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            إدارة بنرات الواجهة الرئيسية، أشرطة التنبيه العلوية، والخصومات الموسمية
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-xs transition-all active:scale-98 text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إضافة بنر / حملة جديدة
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">الحملات النشطة</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#00875A] flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.active}</span>
            <span className="text-xs text-emerald-600 font-medium">معروضة حالياً</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">إجمالي المشاهدات</span>
            <div className="w-9 h-9 rounded-xl bg-[#00875A]/10 text-[#00875A] flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.views.toLocaleString('ar-SA')}
            </span>
            <span className="text-xs text-slate-500">مشاهدة</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">إجمالي النقرات</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <MousePointer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.clicks.toLocaleString('ar-SA')}
            </span>
            <span className="text-xs text-slate-500">نقرة</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">معدل التحويل (CTR)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.ctr}%</span>
            <span className="text-xs text-emerald-600 font-semibold">تفاعل ممتاز</span>
          </div>
        </div>
      </div>

      {/* Promotions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            جاري تحميل الحملات الترويجية...
          </div>
        ) : promotions.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            لا توجد حملات تسويقية حالياً
          </div>
        ) : (
          promotions.map((promo, idx) => (
            <div
              key={`promo-${promo.id || idx}-${idx}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                {/* Banner Visual Preview */}
                {promo.imageUrl ? (
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={promo.imageUrl}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    {promo.badge && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                        {promo.badge}
                      </span>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-white">
                      {promo.type === 'hero_slide'
                        ? 'سلايدر رئيسي'
                        : promo.type === 'announcement_bar'
                        ? 'شريط تنبيه'
                        : 'بانر قسم'}
                    </span>
                    <div className="absolute bottom-3 right-3 left-3 text-white">
                      <h4 className="font-bold text-sm line-clamp-1">{promo.title}</h4>
                      {promo.subtitle && (
                        <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                          {promo.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-radial from-slate-900 to-slate-950 text-white border-b border-slate-800 min-h-[11rem] flex flex-col justify-center">
                    <span className="text-xs font-bold text-amber-400 mb-1">
                      {promo.type === 'announcement_bar' ? 'شريط التنبيه العلوي' : 'إعلان نصي'}
                    </span>
                    <h4 className="font-bold text-sm leading-relaxed">{promo.title}</h4>
                  </div>
                )}

                {/* Body Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {promo.startDate} إلى {promo.endDate}
                    </span>
                    <span
                      className={`font-semibold ${
                        promo.status === 'active' ? 'text-[#00875A]' : 'text-slate-400'
                      }`}
                    >
                      {promo.status === 'active' ? '● نشطة' : '○ معطلة'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-[11px] text-slate-400">المشاهدات</div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">
                        {promo.viewsCount.toLocaleString('ar-SA')}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-[11px] text-slate-400">النقرات</div>
                      <div className="text-sm font-black text-[#00875A] mt-0.5">
                        {promo.clicksCount.toLocaleString('ar-SA')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleToggleStatus(promo.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900"
                >
                  {promo.status === 'active' ? (
                    <ToggleRight className="w-6 h-6 text-[#00875A]" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-400" />
                  )}
                  <span>{promo.status === 'active' ? 'مفعل' : 'معطل'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(promo)}
                    className="p-2 text-slate-400 hover:text-[#00875A] rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Promotion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#00875A]" />
                {editingPromo ? 'تعديل الحملة الترويجية' : 'إضافة حملة أو بنر جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  عنوان الحملة الرئيسي *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: روائع العود والساعات الملكية لعام ٢٠٢٤"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    نوع الإعلان
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="hero_slide">سلايدر رئيسي (Hero)</option>
                    <option value="announcement_bar">شريط إعلان علوي</option>
                    <option value="category_banner">بانر قسم أو مجموعة</option>
                    <option value="popup">نافذة منبثقة (Popup)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    الشارة الترويجية (Badge)
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="مثال: حصري، لفترة محدودة"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  العنوان الفرعي
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="مثال: إصدارات خاصة لأصحاب الذوق الرفيع"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  رابط الصورة (URL)
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  رابط الوجهة (Link Target)
                </label>
                <input
                  type="text"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="/products?collection=the-royal-collection"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono text-xs"
                />
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
                  {editingPromo ? 'تحديث الحملة' : 'نشر الحملة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
