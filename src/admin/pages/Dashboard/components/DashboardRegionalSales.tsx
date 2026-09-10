import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { AdminCard } from '../../../components/ui/AdminCard';
import { AdminSkeleton } from '../../../components/ui/AdminSkeleton';
import { commerceStore } from '../../../../shared/store/commerceStore';

interface RegionData {
  region: string;
  cities: string;
  revenue: number;
  orders: number;
  percentage: number;
  growth: string;
}

interface DashboardRegionalSalesProps {
  loading?: boolean;
}

export const DashboardRegionalSales: React.FC<DashboardRegionalSalesProps> = ({
  loading = false,
}) => {
  const regions: RegionData[] = useMemo(() => {
    const orders = commerceStore.getOrders();
    const totalRev = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrdersCount = orders.length;

    // Define regions
    const regionBuckets: Record<string, { cities: string; revenue: number; orders: number; growth: string }> = {
      'منطقة الرياض': { cities: 'الرياض، الدرعية، الخرج', revenue: 0, orders: 0, growth: '+18%' },
      'منطقة مكة المكرمة': { cities: 'جدة، مكة المكرمة، الطائف', revenue: 0, orders: 0, growth: '+14%' },
      'المنطقة الشرقية': { cities: 'الخبر، الدمام، الظهران، الأحساء', revenue: 0, orders: 0, growth: '+22%' },
      'باقي مناطق المملكة والخليج': { cities: 'المدينة، أبها، القصيم، دبي، الكويت', revenue: 0, orders: 0, growth: '+8%' },
    };

    orders.forEach((o) => {
      const city = (o.shippingAddress?.city || '').toLowerCase();
      const country = (o.shippingAddress?.country || '').toLowerCase();

      if (city.includes('رياض') || city.includes('riyadh') || city.includes('خرج') || city.includes('درعية')) {
        regionBuckets['منطقة الرياض'].revenue += o.total;
        regionBuckets['منطقة الرياض'].orders += 1;
      } else if (city.includes('جدة') || city.includes('jeddah') || city.includes('مكة') || city.includes('طائف')) {
        regionBuckets['منطقة مكة المكرمة'].revenue += o.total;
        regionBuckets['منطقة مكة المكرمة'].orders += 1;
      } else if (city.includes('دمام') || city.includes('dammam') || city.includes('خبر') || city.includes('khobar') || city.includes('أحساء') || city.includes('ظهران')) {
        regionBuckets['المنطقة الشرقية'].revenue += o.total;
        regionBuckets['المنطقة الشرقية'].orders += 1;
      } else {
        regionBuckets['باقي مناطق المملكة والخليج'].revenue += o.total;
        regionBuckets['باقي مناطق المملكة والخليج'].orders += 1;
      }
    });

    return Object.entries(regionBuckets).map(([region, data]) => {
      const percentage = totalRev > 0 ? Math.round((data.revenue / totalRev) * 100) : (totalOrdersCount > 0 ? Math.round((data.orders / totalOrdersCount) * 100) : 25);
      return {
        region,
        cities: data.cities,
        revenue: data.revenue,
        orders: data.orders,
        percentage,
        growth: data.growth,
      };
    });
  }, []);

  if (loading) {
    return (
      <AdminCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <AdminSkeleton className="h-6 w-36" />
          <AdminSkeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <AdminSkeleton key={`reg-sales-skel-${i}`} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </AdminCard>
    );
  }

  return (
    <AdminCard className="p-0 overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-[#F0ECE4]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#181818]">
              التوزيع الجغرافي للمبيعات
            </h3>
            <p className="text-xs text-[#9E9A90] mt-0.5">
              تركز طلبات النخبة في مناطق المملكة والخليج
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#00875A] bg-[#E6F4EE] px-2 py-0.5 rounded-full">
          المملكة والخليج
        </span>
      </div>

      {/* Regions list */}
      <div className="p-5 space-y-4">
        {regions.map((reg, idx) => (
          <div key={`region-${reg.region || idx}`} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#181818]">{reg.region}</span>
                <span className="text-[11px] text-[#9E9A90] block sm:inline sm:mr-2">
                  ({reg.cities})
                </span>
              </div>
              <div className="text-left shrink-0">
                <span className="font-bold text-[#181818]">
                  {Number(reg?.revenue ?? 0).toLocaleString('ar-SA')} ر.س
                </span>
                <span className="text-[10px] font-bold text-[#00875A] mr-2">
                  {reg.growth}
                </span>
              </div>
            </div>

            {/* Custom progress */}
            <div className="w-full h-2 bg-[#FAF8F3] rounded-full overflow-hidden border border-[#E8E3D8]/60 flex">
              <div
                className="h-full bg-[#00875A] rounded-full transition-all duration-700"
                style={{ width: `${reg.percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#9E9A90]">
              <span>{reg.orders} طلب مسجل</span>
              <span>{reg.percentage}% من المبيعات</span>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
};
