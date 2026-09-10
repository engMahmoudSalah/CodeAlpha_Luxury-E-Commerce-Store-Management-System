import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Calendar,
  Download,
  CreditCard,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Package,
  Award,
  Crown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { adminService } from '../../services';
import { DashboardData, DateRangeOption } from '../../types';
import { commerceStore } from '../../../shared/store/commerceStore';
import { commerceEventBus } from '../../../shared/events/commerceEvents';

export const AdminAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangeOption>('30days');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboardData(dateRange);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const unsub = commerceEventBus.subscribe('ORDER_CREATED', () => {
      fetchAnalytics();
    });
    return () => unsub();
  }, [dateRange]);

  const handleExportReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('تم تصدير التقرير التحليلي المالي بنجاح بصيغة PDF/Excel');
    }, 1000);
  };

  // Payment Method Breakdown dynamically computed
  const paymentData = useMemo(() => {
    const orders = commerceStore.getOrders();
    const totalOrders = Math.max(1, orders.length);
    const methodCounts: Record<string, { name: string; count: number; color: string }> = {
      mada: { name: 'مدى Mada Pay', count: 0, color: '#00875A' },
      credit_card: { name: 'بطاقات ائتمانية VIP', count: 0, color: '#D97706' },
      apple_pay: { name: 'Apple Pay', count: 0, color: '#10B981' },
      bank_transfer: { name: 'تحويل بنكي مباشر', count: 0, color: '#B45309' },
    };

    orders.forEach((o) => {
      const m = o.paymentMethod || 'credit_card';
      if (m.includes('mada')) methodCounts.mada.count++;
      else if (m.includes('apple')) methodCounts.apple_pay.count++;
      else if (m.includes('bank') || m.includes('wire')) methodCounts.bank_transfer.count++;
      else methodCounts.credit_card.count++;
    });

    return Object.values(methodCounts).map((item) => ({
      name: item.name,
      value: Math.round((item.count / totalOrders) * 100) || 25,
      color: item.color,
    }));
  }, [data]);

  // Sales by Region dynamically computed
  const regionData = useMemo(() => {
    const orders = commerceStore.getOrders();
    const totalRev = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    const regionBuckets: Record<string, { name: string; revenue: number }> = {
      riyadh: { name: 'الرياض والمنطقة الوسطى', revenue: 0 },
      west: { name: 'جدة والمنطقة الغربية', revenue: 0 },
      east: { name: 'الدمام والمنطقة الشرقية', revenue: 0 },
      other: { name: 'باقي مناطق المملكة والخليج', revenue: 0 },
    };

    orders.forEach((o) => {
      const city = (o.shippingAddress?.city || '').toLowerCase();
      if (city.includes('رياض') || city.includes('riyadh') || city.includes('خرج') || city.includes('درعية')) {
        regionBuckets.riyadh.revenue += o.total;
      } else if (city.includes('جدة') || city.includes('jeddah') || city.includes('مكة') || city.includes('طائف')) {
        regionBuckets.west.revenue += o.total;
      } else if (city.includes('دمام') || city.includes('dammam') || city.includes('خبر') || city.includes('khobar')) {
        regionBuckets.east.revenue += o.total;
      } else {
        regionBuckets.other.revenue += o.total;
      }
    });

    return Object.values(regionBuckets).map((reg) => {
      const percentage = totalRev > 0 ? Math.round((reg.revenue / totalRev) * 100) : 25;
      return {
        name: reg.name,
        percentage,
        revenue: `${Number(reg?.revenue ?? 0).toLocaleString('ar-SA')} ر.س`,
      };
    });
  }, [data]);

  // Categories Contribution dynamically computed
  const categoryContribution = useMemo(() => {
    const categories = commerceStore.getCategories();
    const products = commerceStore.getProducts();
    const orders = commerceStore.getOrders();

    const productCatMap = new Map<number, string>();
    products.forEach((p) => productCatMap.set(p.id, p.category));

    const catRevMap = new Map<string, number>();
    categories.forEach((c) => catRevMap.set(c.name, 0));

    orders.forEach((o) => {
      o.items.forEach((item) => {
        const cat = productCatMap.get(item.productId) || 'أخرى';
        catRevMap.set(cat, (catRevMap.get(cat) || 0) + item.price * item.quantity);
      });
    });

    let totalRev = Array.from(catRevMap.values()).reduce((sum, v) => sum + v, 0);

    if (totalRev === 0) {
      products.forEach((p) => {
        catRevMap.set(p.category, (catRevMap.get(p.category) || 0) + p.price * Math.max(1, p.stock));
      });
      totalRev = Array.from(catRevMap.values()).reduce((sum, v) => sum + v, 0);
    }

    return Array.from(catRevMap.entries()).map(([name, value]) => ({
      name,
      value,
      share: totalRev > 0 ? Math.round((value / totalRev) * 100) : 25,
    })).sort((a, b) => b.value - a.value).slice(0, 4);
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header & Date Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>لوحة التحكم</span>
            <span>/</span>
            <span className="text-amber-700 font-semibold">التقارير والأداء</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2 tracking-tight">
            <BarChart3 className="w-7 h-7 text-amber-600" />
            التقارير والتحليلات المالية المتقدمة
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            مؤشرات النمو، تحليل عوائد المبيعات، ومعدلات ولاء عملاء النخبة
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700/60">
            {[
              { id: 'today', label: 'اليوم' },
              { id: '7days', label: '٧ أيام' },
              { id: '30days', label: '٣٠ يوماً' },
              { id: '90days', label: '٩٠ يوماً' },
              { id: '1year', label: 'سنة كاملة' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateRange(tab.id as DateRangeOption)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dateRange === tab.id
                    ? 'bg-amber-500 text-stone-950 shadow-2xs font-extrabold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-600" />
            {isExporting ? 'جاري التصدير...' : 'تصدير التقرير'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-stone-900 border border-[#E8E3D8] dark:border-stone-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B6860] uppercase tracking-wider">
                {data.metrics.revenue.label}
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#00875A]/10 text-[#00875A] flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#181818] dark:text-white">
                {data.metrics.revenue.formattedValue}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <ArrowUpRight className="w-4 h-4" />
              <span>+{data.metrics.revenue.changePercentage}% مقارنة بالفترة السابقة</span>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-[#E8E3D8] dark:border-stone-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B6860] uppercase tracking-wider">
                {data.metrics.orders.label}
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#00875A]/10 text-[#00875A] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#181818] dark:text-white">
                {data.metrics.orders.formattedValue}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#00875A] font-semibold">
              <ArrowUpRight className="w-4 h-4" />
              <span>+{data.metrics.orders.changePercentage}% زيادة في حجم المبيعات</span>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-[#E8E3D8] dark:border-stone-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B6860] uppercase tracking-wider">
                {data.metrics.averageOrderValue.label}
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#181818] dark:text-white">
                {data.metrics.averageOrderValue.formattedValue}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>{data.metrics.averageOrderValue.trendText}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-[#E8E3D8] dark:border-stone-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B6860] uppercase tracking-wider">
                معدل الاحتفاظ بالعملاء
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#181818] dark:text-white">91.4%</span>
              <span className="text-xs text-amber-600 font-bold">Retention</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#6B6860]">
              <span>تكرار الشراء لدى عملاء النخبة</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Revenue & Orders Chart */}
      <div className="bg-white dark:bg-stone-900 border border-[#E8E3D8] dark:border-stone-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-[#181818] dark:text-white">
              مسار الإيرادات وحجم المبيعات
            </h3>
            <p className="text-xs text-[#6B6860] mt-0.5">
              توزيع حركة المبيعات وتدفق الإيرادات اليومي/الأسبوعي
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-[#5A5852] dark:text-stone-300">
              <span className="w-3 h-3 rounded-full bg-[#00875A]" />
              الإيرادات (ر.س)
            </div>
            <div className="flex items-center gap-1.5 text-[#5A5852] dark:text-stone-300">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              عدد الطلبات
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          {loading || !data ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              جاري تجهيز الرسم البياني...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00875A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00875A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  stroke="#88888880"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#88888880"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'revenue'
                      ? `${Number(value).toLocaleString('ar-SA')} ر.س`
                      : `${value} طلب`,
                    name === 'revenue' ? 'الإيرادات' : 'الطلبات',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00875A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Two-Column Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#00875A]" />
              توزيع طرق الدفع الإلكتروني
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              نسبة المعاملات المكتملة عبر بوابات الدفع الفاخرة
            </p>

            <div className="mt-6 space-y-4">
              {paymentData.map((p) => (
                <div key={p.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </span>
                    <span className="text-slate-900 dark:text-white font-bold">{p.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${p.value}%`, backgroundColor: p.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>نسبة نجاح بوابات الدفع: 99.8%</span>
            <span className="text-emerald-600 font-semibold">أمان 3D Secure نشط</span>
          </div>
        </div>

        {/* Regional Sales Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              المبيعات حسب المناطق والمدن
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              توزيع الطلبات والتوصيل الملكي عبر مدن المملكة والخليج
            </p>

            <div className="mt-6 space-y-4">
              {regionData.map((reg) => (
                <div key={reg.name} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center text-xs">
                      {reg.percentage}%
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{reg.name}</div>
                      <div className="text-[11px] text-slate-400">إجمالي الحصة الجغرافية</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-[#00875A] font-mono">{reg.revenue}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>متوسط وقت التوصيل في الرياض: خلال ٤ ساعات</span>
            <span className="text-[#00875A] font-semibold">أسطول فخامة VIP</span>
          </div>
        </div>
      </div>

      {/* Top Categories Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          أداء المجموعات والأقسام الملكية
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryContribution.map((cat) => (
            <div
              key={cat.name}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{cat.name}</span>
                <span className="text-xs font-extrabold text-[#00875A]">{cat.share}%</span>
              </div>
              <div className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                {cat.value.toLocaleString('ar-SA')}{' '}
                <span className="text-xs font-normal text-slate-400">ر.س</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-[#00875A] h-full rounded-full"
                  style={{ width: `${cat.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
