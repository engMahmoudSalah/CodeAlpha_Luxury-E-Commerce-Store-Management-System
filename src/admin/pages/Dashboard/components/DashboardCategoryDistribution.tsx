import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Layers } from 'lucide-react';
import { AdminCard } from '../../../components/ui/AdminCard';
import { AdminSkeleton } from '../../../components/ui/AdminSkeleton';
import { commerceStore } from '../../../../shared/store/commerceStore';

interface CategoryShare {
  name: string;
  value: number; // revenue in SAR
  percentage: number;
  color: string;
  itemsCount: number;
}

interface DashboardCategoryDistributionProps {
  loading?: boolean;
}

const CATEGORY_COLORS = ['#00875A', '#2563EB', '#7C3AED', '#D97706', '#059669', '#E11D48', '#8B5CF6'];

export const DashboardCategoryDistribution: React.FC<DashboardCategoryDistributionProps> = ({
  loading = false,
}) => {
  const categoryData: CategoryShare[] = useMemo(() => {
    const categories = commerceStore.getCategories();
    const products = commerceStore.getProducts();
    const orders = commerceStore.getOrders();

    // Map each product ID to category name
    const productCategoryMap = new Map<number, string>();
    products.forEach((p) => {
      productCategoryMap.set(p.id, p.category);
    });

    const categoryStats = new Map<string, { revenue: number; itemsSold: number }>();
    categories.forEach((c) => {
      categoryStats.set(c.name, { revenue: 0, itemsSold: 0 });
    });

    // Aggregate from real orders
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const catName = productCategoryMap.get(item.productId) || 'أخرى';
        const current = categoryStats.get(catName) || { revenue: 0, itemsSold: 0 };
        current.revenue += item.price * item.quantity;
        current.itemsSold += item.quantity;
        categoryStats.set(catName, current);
      });
    });

    let totalRev = Array.from(categoryStats.values()).reduce((sum, s) => sum + s.revenue, 0);

    // If no order revenue yet, aggregate by catalog product value
    if (totalRev === 0) {
      products.forEach((p) => {
        const current = categoryStats.get(p.category) || { revenue: 0, itemsSold: 0 };
        current.revenue += p.price * Math.max(1, p.stock);
        current.itemsSold += p.salesCount || 1;
        categoryStats.set(p.category, current);
      });
      totalRev = Array.from(categoryStats.values()).reduce((sum, s) => sum + s.revenue, 0);
    }

    const shares: CategoryShare[] = [];
    let colorIdx = 0;

    categoryStats.forEach((stat, catName) => {
      if (stat.revenue > 0 || stat.itemsSold > 0) {
        shares.push({
          name: catName,
          value: stat.revenue,
          percentage: totalRev > 0 ? Math.max(1, Math.round((stat.revenue / totalRev) * 100)) : 0,
          color: CATEGORY_COLORS[colorIdx % CATEGORY_COLORS.length],
          itemsCount: stat.itemsSold,
        });
        colorIdx++;
      }
    });

    // Sort by revenue descending
    return shares.sort((a, b) => b.value - a.value);
  }, []);

  const totalRevenue = useMemo(() => {
    return categoryData.reduce((sum, item) => sum + item.value, 0);
  }, [categoryData]);

  if (loading) {
    return (
      <AdminCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <AdminSkeleton className="h-6 w-36" />
          <AdminSkeleton className="h-4 w-16" />
        </div>
        <div className="h-48 w-full flex items-center justify-center">
          <AdminSkeleton className="h-36 w-36 rounded-full" />
        </div>
      </AdminCard>
    );
  }

  return (
    <AdminCard className="p-0 overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-[#F0ECE4]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#181818]">
              توزيع المبيعات حسب الفئة
            </h3>
            <p className="text-xs text-[#9E9A90] mt-0.5">
              نسبة مساهمة كل قسم في إجمالي المبيعات
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart */}
          <div className="md:col-span-5 h-48 sm:h-52 relative flex items-center justify-center" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as CategoryShare;
                      return (
                        <div className="bg-[#181818] text-white p-2.5 rounded-xl shadow-xl text-right text-xs font-arabic border border-white/10">
                          <p className="font-bold">{data.name}</p>
                          <p className="text-[#00875A] font-bold mt-1">
                            {data.value.toLocaleString('ar-SA')} ر.س ({data.percentage}%)
                          </p>
                          <p className="text-[10px] text-[#9E9A90] mt-0.5">
                            {data.itemsCount} قطعة مباعة
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] font-bold text-[#9E9A90]">إجمالي الإيرادات</span>
              <span className="text-xs sm:text-sm font-black text-[#181818]">
                {(totalRevenue / 1000).toFixed(0)}k ر.س
              </span>
            </div>
          </div>

          {/* Progress and Legend Breakdown */}
          <div className="md:col-span-7 space-y-3">
            {categoryData.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-bold text-[#181818]">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#6B6860]">
                      {cat.value.toLocaleString('ar-SA')} ر.س
                    </span>
                    <span className="font-bold text-[#181818] w-8 text-left">
                      %{cat.percentage}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[#FAF8F3] rounded-full overflow-hidden border border-[#E8E3D8]/50">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminCard>
  );
};
