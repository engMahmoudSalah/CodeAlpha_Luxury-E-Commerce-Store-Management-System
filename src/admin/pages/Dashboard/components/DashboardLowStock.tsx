import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Boxes, ArrowUpRight, Plus, Check } from 'lucide-react';
import { AdminProduct } from '../../../types';
import { AdminCard } from '../../../components/ui/AdminCard';
import { AdminBadge } from '../../../components/ui/AdminBadge';
import { AdminButton } from '../../../components/ui/AdminButton';
import { AdminModal } from '../../../components/ui/AdminModal';
import { AdminSkeleton } from '../../../components/ui/AdminSkeleton';

interface DashboardLowStockProps {
  products?: AdminProduct[];
  loading?: boolean;
  onUpdateStock?: (productId: number, newStock: number) => Promise<boolean>;
}

export const DashboardLowStock: React.FC<DashboardLowStockProps> = ({
  products = [],
  loading = false,
  onUpdateStock,
}) => {
  const [restockProduct, setRestockProduct] = useState<AdminProduct | null>(null);
  const [addedUnits, setAddedUnits] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct || !onUpdateStock) return;
    setIsSubmitting(true);
    try {
      const newTotal = restockProduct.stock + addedUnits;
      await onUpdateStock(restockProduct.id, newTotal);
      setRestockProduct(null);
      setAddedUnits(10);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <AdminSkeleton className="h-6 w-36" />
          <AdminSkeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <AdminSkeleton key={`lowstock-skel-${i}`} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </AdminCard>
    );
  }

  return (
    <>
      <AdminCard className="p-0 overflow-hidden">
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-[#F0ECE4]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#181818]">
                  تنبيهات نواقص المخزون
                </h3>
                {products.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 font-bold rounded-full">
                    {products.length} منتجات
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9E9A90] mt-0.5">
                منتجات أوشكت على النفاد وتحتاج إعادة طلب
              </p>
            </div>
          </div>

          <Link
            to="/admin/inventory"
            className="text-xs font-bold text-[#00875A] hover:text-[#006E49] flex items-center gap-1 hover:underline"
          >
            <span>المستودع</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Items */}
        {products.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B6860]">
            المخزون مستقر تماماً ولا توجد نواقص حالية
          </div>
        ) : (
          <div className="divide-y divide-[#F0ECE4]">
            {products.map((product, idx) => {
              const isZero = product.stock === 0;
              return (
                <div
                  key={`low-stock-${product.id || idx}-${idx}`}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-[#FAF8F3] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-10 h-10 rounded-xl object-cover bg-[#FAF8F3] border border-[#E8E3D8] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#181818] truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#9E9A90] mt-0.5">
                        <span className="font-mono">{product.sku}</span>
                        <span>•</span>
                        <span>الحد الأدنى: {product.lowStockThreshold}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <AdminBadge variant={isZero ? 'red' : 'amber'} dot>
                      {isZero ? 'نفد بالكامل (0)' : `متبقي ${product.stock}`}
                    </AdminBadge>

                    <AdminButton
                      variant="secondary"
                      size="sm"
                      icon={Plus}
                      onClick={() => setRestockProduct(product)}
                      className="text-xs"
                    >
                      تزويد
                    </AdminButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminCard>

      {/* Instant Restock Modal */}
      {restockProduct && (
        <AdminModal
          isOpen={Boolean(restockProduct)}
          onClose={() => setRestockProduct(null)}
          title="تزويد مخزون المنتج"
          subtitle={restockProduct.name}
          size="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() => setRestockProduct(null)}
                disabled={isSubmitting}
              >
                إلغاء
              </AdminButton>
              <AdminButton
                variant="primary"
                size="sm"
                icon={Check}
                isLoading={isSubmitting}
                onClick={handleRestockSubmit}
              >
                تأكيد التزويد
              </AdminButton>
            </div>
          }
        >
          <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs text-[#181818]">
            <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#E8E3D8] flex items-center justify-between">
              <span className="text-[#6B6860]">المخزون الحالي:</span>
              <span className="font-bold text-sm text-[#181818]">
                {restockProduct.stock} قطع
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#181818] mb-1.5">
                الكمية الإضافية المراد إدخالها للمستودع:
              </label>
              <input
                type="number"
                min={1}
                max={500}
                required
                value={addedUnits}
                onChange={(e) => setAddedUnits(Number(e.target.value))}
                className="w-full bg-white border border-[#E8E3D8] rounded-xl px-3 py-2 text-sm font-bold text-[#181818] focus:outline-none focus:border-[#00875A]"
              />
              <p className="text-[11px] text-[#9E9A90] mt-1">
                سيصبح إجمالي المخزون بعد العملية: {restockProduct.stock + addedUnits} قطعة
              </p>
            </div>
          </form>
        </AdminModal>
      )}
    </>
  );
};
