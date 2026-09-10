import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StarRating } from '../components/ui/StarRating';
import { EmptyState } from '../components/ui/EmptyState';
import {
  GitCompare,
  Trash2,
  ShoppingBag,
  X,
  ShieldCheck,
  Truck,
  Sparkles,
  Award,
  CheckCircle2
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const { data: productsData } = useProducts({ limit: 100 });
  const navigate = useNavigate();

  const products = useMemo(() => {
    if (!productsData?.products) return [];
    return productsData.products.filter((p) => compareList.includes(p.id));
  }, [productsData, compareList]);

  if (compareList.length === 0) {
    return (
      <div className="py-16 font-arabic max-w-2xl mx-auto px-4 text-center" dir="rtl">
        <EmptyState
          icon={<GitCompare className="w-10 h-10 text-[#008F68]" />}
          title="لا توجد مقتنيات للمقارنة حالياً"
          description="يمكنك مقارنة المواصفات والأسعار وفترات الضمان جنباً إلى جنب بإضافة حتى 4 مقتنيات من المعرض."
          actionText="تصفح المعرض واكتشف المقتنيات"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-8 pb-20 font-arabic" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8E3D8] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black px-2.5 py-0.5 bg-[#008F68]/10 text-[#008F68] rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              أداة التحليل والمقارنة
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">مقارنة المقتنيات الملكية</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            مقارنة دقيقة للمواصفات والأسعار وفترات الضمان ومستوى الأصالة جنباً إلى جنب.
          </p>
        </div>

        <button
          onClick={clearCompare}
          className="text-xs text-neutral-500 hover:text-rose-600 font-bold flex items-center gap-1.5 cursor-pointer transition-colors p-2 bg-white rounded-full border border-[#E8E3D8] px-4 py-2 shadow-2xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>تفريغ المقارنة ({products.length})</span>
        </button>
      </div>

      {/* Comparison Table Grid */}
      <div className="overflow-x-auto rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E8E3D8] bg-[#FAF8F3]">
              <th className="p-4 sm:p-6 w-48 font-black text-neutral-400 text-[11px] align-top">
                تفاصيل المقتنى
              </th>
              {products.map((p, idx) => (
                <th key={`cmp-head-${idx}-${p.id}`} className="p-4 sm:p-6 min-w-[240px] max-w-[280px] align-top">
                  <div className="flex flex-col gap-3">
                    <div className="relative aspect-square w-full rounded-2xl bg-[#FCFAF7] p-4 border border-[#E8E3D8] flex items-center justify-center">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                      />
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="absolute top-2 left-2 p-2 rounded-full bg-white text-neutral-500 hover:text-rose-600 border border-[#E8E3D8] cursor-pointer shadow-xs transition-colors"
                        title="إزالة من المقارنة"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <Link
                        to={`/products/${p.id}`}
                        className="text-sm font-black text-[#111111] hover:text-[#008F68] line-clamp-2 block transition-colors leading-snug"
                      >
                        {p.name}
                      </Link>
                      <span className="text-base font-black text-[#111111] block mt-1 font-mono">
                        {Number(p?.price ?? 0).toLocaleString('ar-SA')} <span className="text-xs font-sans text-neutral-400">ر.س</span>
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      disabled={p.stock <= 0}
                      onClick={() => addToCart(p.id, 1)}
                      leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                    >
                      إضافة للحقيبة
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#FAF8F3] text-[#111111]">
            {/* Category */}
            <tr className="hover:bg-[#FAF8F3] transition-colors">
              <td className="p-4 sm:px-6 font-bold text-neutral-400 bg-[#FAF8F3]">المجموعة / التصنيف</td>
              {products.map((p, idx) => (
                <td key={`cmp-cat-${idx}-${p.id}`} className="p-4 sm:px-6 font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-[#008F68]/10 text-[#008F68] text-[11px] font-black">
                    {p.category}
                  </span>
                </td>
              ))}
            </tr>

            {/* SKU */}
            <tr className="hover:bg-[#FAF8F3] transition-colors">
              <td className="p-4 sm:px-6 font-bold text-neutral-400 bg-[#FAF8F3]">الرمز المرجعي الملكي</td>
              {products.map((p, idx) => (
                <td key={`cmp-sku-${idx}-${p.id}`} className="p-4 sm:px-6 font-mono text-[#111111] font-black">
                  LX-{p.id.toString().padStart(4, '0')}
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr className="hover:bg-[#FAF8F3] transition-colors">
              <td className="p-4 sm:px-6 font-bold text-neutral-400 bg-[#FAF8F3]">تقييم المقتنين</td>
              {products.map((p, idx) => {
                const numericId = typeof p.id === 'number' ? p.id : (p.id ? String(p.id).charCodeAt(0) : 1);
                const rating = 4.0 + ((numericId * 7) % 10) / 10;
                return (
                  <td key={`cmp-rate-${idx}-${p.id}`} className="p-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <StarRating rating={rating} size="sm" />
                      <span className="font-black text-[#111111] font-mono">{Number(rating ?? 0).toLocaleString('ar-SA', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Stock Availability */}
            <tr className="hover:bg-[#FAF8F3] transition-colors">
              <td className="p-4 sm:px-6 font-bold text-neutral-400 bg-[#FAF8F3]">حالة التوفر بالمخزون</td>
              {products.map((p, idx) => (
                <td key={`cmp-stock-${idx}-${p.id}`} className="p-4 sm:px-6">
                  {p.stock > 0 ? (
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      متوفر في المستودع الملكي
                    </span>
                  ) : (
                    <span className="text-xs font-black text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                      نفد المخزون مؤقتاً
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Warranty */}
            <tr className="hover:bg-[#FAF8F3] transition-colors">
              <td className="p-4 sm:px-6 font-bold text-neutral-400 bg-[#FAF8F3]">فترة الضمان والصيانة</td>
              {products.map((p, idx) => (
                <td key={`cmp-warranty-${idx}-${p.id}`} className="p-4 sm:px-6">
                  <div className="flex items-center gap-1.5 text-[#008F68] font-black">
                    <ShieldCheck className="w-4 h-4" />
                    <span>ضمان شامل سنتين (24 شهراً)</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Shipping */}
            <tr className="hover:bg-[#FAF8F3] transition-colors">
              <td className="p-4 sm:px-6 font-bold text-neutral-400 bg-[#FAF8F3]">سرعة الشحن والتوصيل</td>
              {products.map((p, idx) => (
                <td key={`cmp-ship-${idx}-${p.id}`} className="p-4 sm:px-6">
                  <div className="flex items-center gap-1.5 text-neutral-700">
                    <Truck className="w-4 h-4 text-[#008F68]" />
                    <span>شحن سريع مخصص 24 - 48 ساعة</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Gift Wrapping */}
            <tr className="hover:bg-[#FAF8F3] transition-colors">
              <td className="p-4 sm:px-6 font-bold text-neutral-400 bg-[#FAF8F3]">التغليف الملكي</td>
              {products.map((p, idx) => (
                <td key={`cmp-gift-${idx}-${p.id}`} className="p-4 sm:px-6">
                  <div className="flex items-center gap-1.5 text-[#FFC700] font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#008F68]" />
                    <span className="text-neutral-800">مشمول بعلبة مخملية وبطاقة إهداء</span>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;
