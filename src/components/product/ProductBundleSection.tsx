import React, { useState } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Equal, ShoppingBag, Sparkles, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProductBundleSectionProps {
  currentProduct: Product;
  companionProducts: Product[];
}

export const ProductBundleSection: React.FC<ProductBundleSectionProps> = ({
  currentProduct,
  companionProducts,
}) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const bundleCompanion = companionProducts.length > 0 ? companionProducts[0] : null;
  const [includeCompanion, setIncludeCompanion] = useState(true);

  if (!bundleCompanion) return null;

  const currentPrice = Number(currentProduct.price) || 0;
  const companionPrice = Number(bundleCompanion.price) || 0;
  const originalTotalPrice = currentPrice + companionPrice;
  const bundleDiscount = 0.10; // 10% discount
  const bundleTotalPrice = Math.round(originalTotalPrice * (1 - bundleDiscount));
  const savings = originalTotalPrice - bundleTotalPrice;

  const handleAddBundle = () => {
    addToCart(currentProduct.id, 1);
    if (includeCompanion) {
      addToCart(bundleCompanion.id, 1);
      showToast('تمت إضافة حزمة المقتنيات المتكاملة إلى حقيبة التسوق بخصم 10%!', 'success');
    } else {
      showToast('تمت إضافة المقتنى إلى حقيبة التسوق.', 'success');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8E3D8] p-6 sm:p-8 font-arabic shadow-2xs" dir="rtl">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
        <Sparkles className="w-4 h-4 text-[#FFC700]" />
        <h3 className="text-base font-black text-[#111111]">
          يُشترى معاً عادةً (حزمة المقتنيات المتكاملة)
        </h3>
        <span className="mr-auto text-[10px] font-black px-2.5 py-0.5 bg-[#008F68]/10 text-[#008F68] rounded-full">
          وفر 10% مع هذه الحزمة
        </span>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Products Visual Row */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-start">
          {/* Main Product Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FCFAF7] border border-[#F0EAE1] min-w-[200px] max-w-xs">
            <div className="w-14 h-14 rounded-xl bg-white border border-[#E8E3D8] p-1.5 shrink-0 flex items-center justify-center">
              <img
                src={currentProduct.image_url}
                alt={currentProduct.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-neutral-400 block">المقتنى الأساسي</span>
              <p className="text-xs font-black text-[#111111] truncate">{currentProduct.name}</p>
              <span className="text-xs font-black text-[#008F68]">{currentPrice.toLocaleString('ar-SA')} ر.س</span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-[#FCFAF7] border border-[#E8E3D8] flex items-center justify-center text-neutral-500 font-bold shrink-0">
            <Plus className="w-4 h-4" />
          </div>

          {/* Companion Product Card */}
          <div
            onClick={() => setIncludeCompanion(!includeCompanion)}
            className={`flex items-center gap-3 p-3 rounded-2xl border min-w-[200px] max-w-xs cursor-pointer transition-all ${
              includeCompanion
                ? 'bg-[#FCFAF7] border-[#008F68] ring-1 ring-[#008F68]'
                : 'bg-neutral-50 border-dashed border-neutral-300 opacity-60'
            }`}
          >
            <div className="w-14 h-14 rounded-xl bg-white border border-[#E8E3D8] p-1.5 shrink-0 flex items-center justify-center relative">
              <img
                src={bundleCompanion.image_url}
                alt={bundleCompanion.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply"
              />
              <div
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                  includeCompanion ? 'bg-[#008F68] text-white' : 'bg-neutral-300 text-white'
                }`}
              >
                ✓
              </div>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-neutral-400 block">مقتنى مكمل</span>
              <p className="text-xs font-black text-[#111111] truncate">{bundleCompanion.name}</p>
              <span className="text-xs font-black text-[#008F68]">{companionPrice.toLocaleString('ar-SA')} ر.س</span>
            </div>
          </div>
        </div>

        {/* Bundle Price and Buy CTA */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-end justify-between gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
          <div className="text-right">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-[#111111]">
                {(includeCompanion ? bundleTotalPrice : currentPrice).toLocaleString('ar-SA')} ر.س
              </span>
              {includeCompanion && (
                <span className="text-xs text-neutral-400 line-through font-bold">
                  {originalTotalPrice.toLocaleString('ar-SA')} ر.س
                </span>
              )}
            </div>
            {includeCompanion && (
              <span className="text-[11px] font-bold text-[#008F68] block">
                توفير بقيمة {savings.toLocaleString('ar-SA')} ر.س
              </span>
            )}
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleAddBundle}
            leftIcon={<ShoppingBag className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            {includeCompanion ? 'إضافة الحزمة معاً إلى الحقيبة' : 'إضافة المقتنى الأساسي فقط'}
          </Button>
        </div>
      </div>
    </div>
  );
};
