import React from 'react';
import { DollarSign, Percent, TrendingUp, HelpCircle, ShieldCheck } from 'lucide-react';

interface ProductFormPricingTabProps {
  formData: {
    price: number | '';
    compareAtPrice?: number | '';
    costPrice?: number | '';
    taxIncluded?: boolean;
  };
  onChange: (field: string, value: any) => void;
}

export const ProductFormPricingTab: React.FC<ProductFormPricingTabProps> = ({
  formData,
  onChange,
}) => {
  const price = Number(formData.price) || 0;
  const compareAtPrice = Number(formData.compareAtPrice) || 0;
  const costPrice = Number(formData.costPrice) || 0;

  // Profit and Margin calculation
  const grossProfit = price - costPrice;
  const marginPercent = price > 0 && costPrice > 0 ? ((grossProfit / price) * 100).toFixed(1) : '0.0';
  const discountPercent =
    compareAtPrice > price ? (((compareAtPrice - price) / compareAtPrice) * 100).toFixed(0) : null;

  return (
    <div id="product-form-pricing-tab" className="space-y-6">
      {/* Price Inputs Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <DollarSign className="w-4 h-4 text-amber-600" />
          <span>هيكل التسعير وهوامش الأرباح</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Selling Price */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              سعر البيع النهائي (ر.س) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
                value={formData.price}
                onChange={(e) =>
                  onChange('price', e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full pl-4 pr-12 py-2.5 text-sm font-black font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                ر.س
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">السعر المعروض للعميل في المتجر</p>
          </div>

          {/* Compare at Price */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              السعر قبل الخصم (ر.س)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.compareAtPrice ?? ''}
                onChange={(e) =>
                  onChange(
                    'compareAtPrice',
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                className="w-full pl-4 pr-12 py-2.5 text-sm font-bold font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                ر.س
              </span>
            </div>
            {discountPercent && (
              <p className="text-[11px] text-emerald-600 font-bold mt-1">
                نسبة الخصم المحسوبة: {discountPercent}%
              </p>
            )}
          </div>

          {/* Cost Price */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              تكلفة المنتج على المتجر (ر.س)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.costPrice ?? ''}
                onChange={(e) =>
                  onChange('costPrice', e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full pl-4 pr-12 py-2.5 text-sm font-bold font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                ر.س
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">خاص بالإدارة لحساب الأرباح بدقة</p>
          </div>
        </div>

        {/* Tax checkbox */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.taxIncluded !== false}
              onChange={(e) => onChange('taxIncluded', e.target.checked)}
              className="w-4 h-4 rounded-md text-amber-600 focus:ring-amber-500 border-stone-300"
            />
            <span className="text-xs font-bold text-stone-800">
              السعر شامل ضريبة القيمة المضافة (15% VAT)
            </span>
          </label>
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>متوافق مع هيئة الزكاة والضريبة والجمارك</span>
          </span>
        </div>
      </div>

      {/* Financial Margin Live Card */}
      <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl border border-stone-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-amber-400">مؤشرات الربحية التلقائية</h4>
          </div>
          <span className="text-[11px] text-stone-400 font-mono">حسابات فورية</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-800">
          <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800">
            <span className="text-[11px] text-stone-400 block mb-1">صافي الربح للقطعة</span>
            <span
              className={`text-lg font-black font-mono ${
                grossProfit > 0
                  ? 'text-emerald-400'
                  : grossProfit < 0
                  ? 'text-rose-400'
                  : 'text-stone-300'
              }`}
            >
              {grossProfit.toLocaleString()} ر.س
            </span>
          </div>

          <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800">
            <span className="text-[11px] text-stone-400 block mb-1">هامش الربح الإجمالي</span>
            <span className="text-lg font-black font-mono text-amber-400">
              {marginPercent}%
            </span>
          </div>

          <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800">
            <span className="text-[11px] text-stone-400 block mb-1">العائد على التكلفة (Markup)</span>
            <span className="text-lg font-black font-mono text-stone-200">
              {costPrice > 0 ? `${((grossProfit / costPrice) * 100).toFixed(1)}%` : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
