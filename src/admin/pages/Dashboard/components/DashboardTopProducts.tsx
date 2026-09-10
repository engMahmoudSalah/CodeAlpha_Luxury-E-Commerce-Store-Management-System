import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowUpRight, TrendingUp, Package } from 'lucide-react';
import { AdminProduct } from '../../../types';
import { AdminCard } from '../../../components/ui/AdminCard';
import { AdminBadge } from '../../../components/ui/AdminBadge';
import { AdminSkeleton } from '../../../components/ui/AdminSkeleton';

interface DashboardTopProductsProps {
  products?: (AdminProduct & { revenue: number; conversionRate: number })[];
  loading?: boolean;
}

export const DashboardTopProducts: React.FC<DashboardTopProductsProps> = ({
  products = [],
  loading = false,
}) => {
  if (loading) {
    return (
      <AdminCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <AdminSkeleton className="h-6 w-32" />
          <AdminSkeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <AdminSkeleton key={`topprod-skel-${i}`} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </AdminCard>
    );
  }

  return (
    <AdminCard className="p-0 overflow-hidden">
      {/* Card Header */}
      <div className="p-5 flex items-center justify-between border-b border-[#F0ECE4]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#181818]">
              المنتجات الأكثر مبيعاً
            </h3>
            <p className="text-xs text-[#9E9A90] mt-0.5">
              أعلى المقتنيات طلباً وتحقيقاً للإيرادات
            </p>
          </div>
        </div>

        <Link
          to="/admin/products"
          className="text-xs font-bold text-[#00875A] hover:text-[#006E49] flex items-center gap-1 hover:underline"
        >
          <span>الكتالوج الكامل</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* List */}
      <div className="divide-y divide-[#F0ECE4]">
        {products.map((product, index) => (
          <div
            key={`top-prod-${product.id || index}-${index}`}
            className="p-4 flex items-center justify-between gap-3 hover:bg-[#FAF8F3] transition-colors"
          >
            {/* Left Info */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-5 font-mono font-bold text-xs text-[#9E9A90] text-center">
                0{index + 1}
              </span>
              <img
                src={product.image_url}
                alt={product.name}
                className="w-11 h-11 rounded-xl object-cover bg-[#FAF8F3] border border-[#E8E3D8] shrink-0"
              />
              <div className="min-w-0">
                <Link
                  to={`/admin/products`}
                  className="font-bold text-xs text-[#181818] hover:text-[#00875A] transition-colors truncate block"
                >
                  {product.name}
                </Link>
                <div className="flex items-center gap-2 text-[11px] text-[#9E9A90] mt-0.5">
                  <span>{product.category}</span>
                  <span>•</span>
                  <span>{Number(product?.price ?? 0).toLocaleString('ar-SA')} ر.س</span>
                </div>
              </div>
            </div>

            {/* Right Metrics */}
            <div className="text-left shrink-0">
              <p className="font-black text-xs text-[#181818]">
                {Number(product?.revenue ?? 0).toLocaleString('ar-SA')} ر.س
              </p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="text-[10px] text-[#00875A] font-bold bg-[#E6F4EE] px-1.5 py-0.5 rounded">
                  {product.salesCount} مبيعة
                </span>
                {product.stock <= product.lowStockThreshold && (
                  <AdminBadge variant="amber" size="sm">
                    مخزون: {product.stock}
                  </AdminBadge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
};
