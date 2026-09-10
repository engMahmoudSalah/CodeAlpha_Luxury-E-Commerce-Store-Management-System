import React from 'react';
import { Package, Barcode, AlertTriangle, Truck, Scale, ShieldCheck } from 'lucide-react';

interface ProductFormInventoryTabProps {
  formData: {
    sku: string;
    barcode?: string;
    stock: number | '';
    lowStockThreshold: number | '';
    weight?: number | '';
    dimensions?: { length?: number | ''; width?: number | ''; height?: number | '' };
  };
  onChange: (field: string, value: any) => void;
  onGenerateSKU: () => void;
}

export const ProductFormInventoryTab: React.FC<ProductFormInventoryTabProps> = ({
  formData,
  onChange,
  onGenerateSKU,
}) => {
  return (
    <div id="product-form-inventory-tab" className="space-y-6">
      {/* Inventory Identifiers Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Barcode className="w-4 h-4 text-amber-600" />
          <span>الترميز والمخزون في المستودع</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* SKU */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700">
                رمز تعريف المخزون (SKU) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={onGenerateSKU}
                className="text-xs font-medium text-amber-700 hover:text-amber-800 underline"
              >
                توليد تلقائي
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="مثال: FKH-RSY-092"
              value={formData.sku}
              onChange={(e) => onChange('sku', e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 text-xs font-mono font-bold bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-left dir-ltr uppercase"
            />
            <p className="text-[11px] text-stone-400 mt-1">كود مميز لكل منتج لتتبع الشحنات</p>
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              الباركود الدولي (EAN / UPC / Barcode)
            </label>
            <input
              type="text"
              placeholder="مثال: 6281001234567"
              value={formData.barcode || ''}
              onChange={(e) => onChange('barcode', e.target.value)}
              className="w-full px-4 py-2.5 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-left dir-ltr"
            />
            <p className="text-[11px] text-stone-400 mt-1">مسح سريع عبر أجهزة قراءة الباركود</p>
          </div>
        </div>

        {/* Stock Quantities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-stone-100">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              الكمية المتوفرة حالياً في المستودع <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                required
                placeholder="0"
                value={formData.stock}
                onChange={(e) =>
                  onChange('stock', e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full pl-4 pr-12 py-2.5 text-sm font-black font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                قطعة
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              حد التنبيه بانخفاض المخزون (Low Stock Threshold)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder="3"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  onChange(
                    'lowStockThreshold',
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                className="w-full pl-4 pr-12 py-2.5 text-sm font-bold font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                قطعة
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              سيظهر تنبيه باللون البرتقالي عندما يصل المخزون لهذا الحد
            </p>
          </div>
        </div>
      </div>

      {/* Shipping & Dimensions Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Truck className="w-4 h-4 text-amber-600" />
          <span>أبعاد الشحن والوزن (لحساب رسوم التوصيل والجمارك)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Weight */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              الوزن الإجمالي (جم / جرام)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder="مثال: 450"
                value={formData.weight ?? ''}
                onChange={(e) =>
                  onChange('weight', e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full pl-4 pr-10 py-2 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                جم
              </span>
            </div>
          </div>

          {/* Length */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              الطول (سم)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder="15"
                value={formData.dimensions?.length ?? ''}
                onChange={(e) =>
                  onChange('dimensions', {
                    ...formData.dimensions,
                    length: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                className="w-full pl-4 pr-10 py-2 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                سم
              </span>
            </div>
          </div>

          {/* Width */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              العرض (سم)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder="10"
                value={formData.dimensions?.width ?? ''}
                onChange={(e) =>
                  onChange('dimensions', {
                    ...formData.dimensions,
                    width: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                className="w-full pl-4 pr-10 py-2 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                سم
              </span>
            </div>
          </div>

          {/* Height */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              الارتفاع (سم)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder="5"
                value={formData.dimensions?.height ?? ''}
                onChange={(e) =>
                  onChange('dimensions', {
                    ...formData.dimensions,
                    height: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                className="w-full pl-4 pr-10 py-2 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                سم
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
