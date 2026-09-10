import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { DashboardChartPoint, DateRangeOption } from '../../../types';
import { AdminCard } from '../../../components/ui/AdminCard';
import { AdminSkeleton } from '../../../components/ui/AdminSkeleton';

interface DashboardSalesChartProps {
  data?: DashboardChartPoint[];
  loading?: boolean;
  selectedRange: DateRangeOption;
  onRangeChange: (range: DateRangeOption) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

type ChartMetric = 'revenue' | 'orders' | 'sales';

export const DashboardSalesChart: React.FC<DashboardSalesChartProps> = ({
  data = [],
  loading = false,
  selectedRange,
  onRangeChange,
  onRefresh,
  isRefreshing = false,
}) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('revenue');

  const rangeOptions: { label: string; value: DateRangeOption }[] = [
    { label: 'اليوم', value: 'today' },
    { label: '٧ أيام', value: '7days' },
    { label: '٣٠ يوماً', value: '30days' },
    { label: '٩٠ يوماً', value: '90days' },
    { label: 'سنة', value: '1year' },
  ];

  const metricConfigs = {
    revenue: {
      label: 'الإيرادات المالية',
      unit: 'ر.س',
      color: '#00875A',
      gradientId: 'colorRevenue',
      formatter: (val: number) => `${val.toLocaleString('ar-SA')} ر.س`,
    },
    orders: {
      label: 'عدد الطلبات',
      unit: 'طلب',
      color: '#2563EB',
      gradientId: 'colorOrders',
      formatter: (val: number) => `${val.toLocaleString('ar-SA')} طلب`,
    },
    sales: {
      label: 'القطع المباعة',
      unit: 'قطعة',
      color: '#7C3AED',
      gradientId: 'colorSales',
      formatter: (val: number) => `${val.toLocaleString('ar-SA')} قطعة`,
    },
  };

  const currentConfig = metricConfigs[activeMetric];

  // Calculate totals in the chart dataset
  const totalInView = data.reduce((acc, curr) => acc + (curr[activeMetric] || 0), 0);

  if (loading) {
    return (
      <AdminCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <AdminSkeleton className="h-6 w-40" />
          <AdminSkeleton className="h-9 w-64 rounded-xl" />
        </div>
        <AdminSkeleton className="h-72 w-full rounded-xl" />
      </AdminCard>
    );
  }

  return (
    <AdminCard className="p-5 sm:p-6 transition-all">
      {/* Chart Top Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[#F0ECE4]">
        {/* Title & Metric Tabs */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-[#181818]">
              نظرة عامة على المبيعات والأداء
            </h2>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-1 text-[#9E9A90] hover:text-[#00875A] transition-colors rounded-lg focus:outline-none"
                title="تحديث البيانات"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00875A]' : ''}`}
                />
              </button>
            )}
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F3] rounded-xl border border-[#E8E3D8] w-fit">
            <button
              type="button"
              onClick={() => setActiveMetric('revenue')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeMetric === 'revenue'
                  ? 'bg-white text-[#00875A] shadow-xs'
                  : 'text-[#6B6860] hover:text-[#181818]'
              }`}
            >
              الإيرادات
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('orders')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeMetric === 'orders'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-[#6B6860] hover:text-[#181818]'
              }`}
            >
              الطلبات
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('sales')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeMetric === 'sales'
                  ? 'bg-white text-[#7C3AED] shadow-xs'
                  : 'text-[#6B6860] hover:text-[#181818]'
              }`}
            >
              القطع المباعة
            </button>
          </div>
        </div>

        {/* Date Range Selector & Summary */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Metric Summary */}
          <div className="text-right pl-3 border-l border-[#F0ECE4] hidden sm:block">
            <span className="text-[10px] font-medium text-[#9E9A90] block">
              إجمالي الفترة المحددة
            </span>
            <span className="text-sm font-black text-[#181818]">
              {currentConfig.formatter(totalInView)}
            </span>
          </div>

          {/* Range Buttons */}
          <div className="flex items-center gap-1 bg-[#FAF8F3] p-1 rounded-xl border border-[#E8E3D8]">
            {rangeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onRangeChange(opt.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  selectedRange === opt.value
                    ? 'bg-[#181818] text-white font-bold shadow-xs'
                    : 'text-[#6B6860] hover:text-[#181818]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="pt-6 h-72 sm:h-80 w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id={currentConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0ECE4" />

            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={{ stroke: '#E8E3D8' }}
              tick={{ fill: '#9E9A90', fontSize: 11 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#9E9A90', fontSize: 11 }}
              tickFormatter={(val) => {
                if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                return val;
              }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const point = payload[0].payload as DashboardChartPoint;
                  return (
                    <div className="bg-[#181818] text-white p-3 rounded-xl shadow-xl text-right text-xs space-y-1 font-arabic border border-white/10">
                      <p className="text-[11px] text-[#C2BEB4]">{point.formattedDate}</p>
                      <div className="pt-1 border-t border-white/10 space-y-1">
                        <p className="font-bold flex items-center justify-between gap-3">
                          <span className="text-[#00875A] font-medium">الإيرادات:</span>
                          <span>{Number(point?.revenue ?? 0).toLocaleString('ar-SA')} ر.س</span>
                        </p>
                        <p className="flex items-center justify-between gap-3 text-[#D6D2C8]">
                          <span className="text-emerald-400 font-medium">الطلبات:</span>
                          <span>{point.orders} طلب</span>
                        </p>
                        <p className="flex items-center justify-between gap-3 text-[#D6D2C8]">
                          <span className="text-amber-400 font-medium">القطع:</span>
                          <span>{point.sales} قطعة</span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={currentConfig.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${currentConfig.gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AdminCard>
  );
};
