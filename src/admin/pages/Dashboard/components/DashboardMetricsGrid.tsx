import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  CreditCard,
  Percent
} from 'lucide-react';
import { DashboardMetrics } from '../../../types';
import { AdminCard } from '../../../components/ui/AdminCard';
import { AdminSkeleton } from '../../../components/ui/AdminSkeleton';

interface DashboardMetricsGridProps {
  metrics?: DashboardMetrics;
  loading?: boolean;
}

export const DashboardMetricsGrid: React.FC<DashboardMetricsGridProps> = ({
  metrics,
  loading = false,
}) => {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <AdminCard key={`metric-skel-${i}`} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <AdminSkeleton className="h-4 w-20" />
              <AdminSkeleton className="h-8 w-8 rounded-lg" />
            </div>
            <AdminSkeleton className="h-7 w-28" />
            <AdminSkeleton className="h-3.5 w-32" />
          </AdminCard>
        ))}
      </div>
    );
  }

  const items = [
    {
      data: metrics.revenue,
      icon: DollarSign,
      iconBg: 'bg-[#E6F4EE] text-[#00875A]',
      highlight: true,
    },
    {
      data: metrics.orders,
      icon: ShoppingBag,
      iconBg: 'bg-[#00875A]/10 text-[#00875A]',
    },
    {
      data: metrics.totalSales,
      icon: CreditCard,
      iconBg: 'bg-amber-500/10 text-amber-700',
    },
    {
      data: metrics.averageOrderValue,
      icon: Percent,
      iconBg: 'bg-amber-50 text-amber-700',
    },
    {
      data: metrics.customers,
      icon: Users,
      iconBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      data: metrics.products,
      icon: Package,
      iconBg: 'bg-stone-100 text-stone-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {items.map((item, index) => {
        const { data, icon: Icon, iconBg, highlight } = item;
        return (
          <AdminCard
            key={`metric-card-${data.id || index}`}
            className={`p-4 transition-all hover:shadow-md ${
              highlight
                ? 'ring-1 ring-[#00875A]/20 bg-gradient-to-b from-white to-[#F7FBF9]'
                : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#6B6860] line-clamp-1">
                {data.label}
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Metric Value */}
            <div className="mt-2.5">
              <div className="text-lg sm:text-xl font-black text-[#181818] tracking-tight">
                {data.formattedValue}
              </div>
            </div>

            {/* Growth Trend */}
            <div className="mt-2 flex items-center gap-1.5 text-[11px]">
              <span
                className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-md ${
                  data.isPositive
                    ? 'bg-[#E6F4EE] text-[#00875A]'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                {data.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>%{Math.abs(data.changePercentage)}</span>
              </span>
              <span className="text-[#9E9A90] truncate text-[10px]">
                {data.trendText}
              </span>
            </div>
          </AdminCard>
        );
      })}
    </div>
  );
};
