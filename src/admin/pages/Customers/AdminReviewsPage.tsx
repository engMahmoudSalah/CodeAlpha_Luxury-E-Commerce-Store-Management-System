import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Filter,
  Search,
  MessageSquare,
  ShieldCheck,
  Package,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminReview } from '../../types';
import { commerceEventBus } from '../../../shared/events/commerceEvents';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await adminService.getReviews(activeTab);
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    const unsubUpdate = commerceEventBus.subscribe('REVIEW_UPDATED', () => {
      fetchReviews();
    });
    const unsubCreate = commerceEventBus.subscribe('REVIEW_CREATED', () => {
      fetchReviews();
    });
    return () => {
      unsubUpdate();
      unsubCreate();
    };
  }, [activeTab]);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleStatusChange = async (id: string, status: AdminReview['status']) => {
    try {
      await adminService.updateReviewStatus(id, status);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      showToast(
        status === 'approved'
          ? 'تم اعتماد التقييم ونشره في صفحة المنتج'
          : status === 'rejected'
          ? 'تم رفض التقييم وإخفاؤه'
          : 'تم تحويل التقييم إلى قيد المراجعة'
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا التقييم نهائياً؟')) return;
    try {
      await adminService.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast('تم حذف التقييم بنجاح');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReviews = useMemo(() => {
    if (!search.trim()) return reviews;
    const q = search.toLowerCase().trim();
    return reviews.filter(
      (r) =>
        r.productName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        (r.title && r.title.toLowerCase().includes(q))
    );
  }, [reviews, search]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / total).toFixed(1) : '5.0';
    const pending = reviews.filter((r) => r.status === 'pending').length;
    const approved = reviews.filter((r) => r.status === 'approved').length;
    return { total, avg, pending, approved };
  }, [reviews]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {feedback && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#00875A] text-white px-4 py-3 rounded-xl shadow-xl text-sm animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>لوحة التحكم</span>
            <span>/</span>
            <span className="text-amber-700 font-semibold">التقييمات والآراء</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
            إدارة التقييمات وآراء العملاء
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            مراجعة واعتماد تجارب عملاء فخامة والتحقق من مصداقية عمليات الشراء
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">متوسط الرضا العام</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.avg}</span>
            <span className="text-xs text-amber-500 font-semibold">من ٥ نجوم</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">بانتظار المراجعة</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-orange-500">{stats.pending}</span>
            <span className="text-xs text-slate-500">تقييمات جديدة</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">التقييمات المعتمدة</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#00875A] flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.approved}</span>
            <span className="text-xs text-emerald-600 font-semibold">منشورة بالمتجر</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">موثوقية المشتريات</span>
            <div className="w-9 h-9 rounded-xl bg-[#00875A]/10 text-[#00875A] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">100%</span>
            <span className="text-xs text-[#00875A] font-medium">مشتريات مؤكدة</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 w-fit">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: 'قيد المراجعة' },
            { id: 'approved', label: 'المعتمدة' },
            { id: 'rejected', label: 'المرفوضة' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالمنتج أو اسم العميل أو محتوى التقييم..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00875A]/20 focus:border-[#00875A] text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            جاري تحميل التقييمات...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            لا توجد تقييمات مطابقة لهذا الفلتر
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                {/* Product Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.productImage}
                      alt={r.productName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {r.productName}
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={`review-star-${i}`}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 dark:text-slate-700'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">
                          {r.rating}.0
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {r.status === 'approved' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-[#00875A] border border-emerald-500/20">
                      معتمد
                    </span>
                  ) : r.status === 'pending' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20">
                      بانتظار المراجعة
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 border border-red-500/20">
                      مرفوض
                    </span>
                  )}
                </div>

                {/* Review Body */}
                <div className="mt-3.5 space-y-1.5">
                  {r.title && (
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                      "{r.title}"
                    </h5>
                  )}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {r.comment}
                  </p>
                </div>
              </div>

              {/* Review Footer & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {r.customerName}
                    </span>
                    {r.verifiedPurchase && (
                      <span className="inline-flex items-center gap-0.5 mr-1.5 text-[10px] font-semibold text-emerald-600">
                        <ShieldCheck className="w-3 h-3" />
                        مشترٍ موثق
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">• {r.createdAt}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {r.status !== 'approved' && (
                    <button
                      onClick={() => handleStatusChange(r.id, 'approved')}
                      title="اعتماد ونشر"
                      className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-[#00875A] rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {r.status !== 'rejected' && (
                    <button
                      onClick={() => handleStatusChange(r.id, 'rejected')}
                      title="رفض التقييم"
                      className="p-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    title="حذف نهائي"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
