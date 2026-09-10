import React, { useState, useEffect } from 'react';
import { X, Package, AlertTriangle, Check, Plus, Minus, Layers } from 'lucide-react';
import { AdminProduct } from '../../../types';

interface ProductQuickStockModalProps {
  product: AdminProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: number, newStock: number) => Promise<void>;
}

export const ProductQuickStockModal: React.FC<ProductQuickStockModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  const [stock, setStock] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setStock(product.stock);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleAdjust = (amount: number) => {
    setStock((prev) => Math.max(0, prev + amount));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(product.id, stock);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="product-quick-stock-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-700 border border-amber-200/60">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">تحديث كمية المخزون</h3>
              <p className="text-xs text-stone-500 font-mono">{product.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Product Snippet */}
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/70">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover border border-stone-200"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-stone-500">{product.category}</p>
              <h4 className="text-sm font-semibold text-stone-800 truncate">{product.name}</h4>
              <p className="text-xs text-amber-700 font-mono mt-0.5">
                السعر: {Number(product?.price ?? 0).toLocaleString('ar-SA')} ر.س
              </p>
            </div>
          </div>

          {/* Current Stock vs New Stock Counter */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700">
              الكمية المتوفرة في المستودع:
            </label>
            <div className="flex items-center justify-between bg-stone-50 p-2 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => handleAdjust(-1)}
                disabled={stock <= 0}
                className="w-10 h-10 flex items-center justify-center bg-white border border-stone-200 rounded-lg text-stone-700 hover:bg-stone-100 active:scale-95 transition-all disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 text-center text-xl font-bold font-mono text-stone-900 bg-transparent focus:outline-hidden"
              />

              <button
                type="button"
                onClick={() => handleAdjust(1)}
                className="w-10 h-10 flex items-center justify-center bg-white border border-stone-200 rounded-lg text-stone-700 hover:bg-stone-100 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Adjustment Increment Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">تعديل سريع:</span>
            {[-5, +5, +10, +25, +50].map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => handleAdjust(delta)}
                className="flex-1 py-1.5 text-xs font-mono font-medium bg-stone-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 border border-stone-200 rounded-lg text-stone-700 transition-colors"
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>

          {/* Stock Status Indicator Alert */}
          <div className="pt-1">
            {stock === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>تحذير: سيتم وضع علامة <strong>نفد المخزون</strong> على هذا المنتج في المتجر.</span>
              </div>
            ) : stock <= product.lowStockThreshold ? (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>تنبيه: الكمية ({stock}) أقل من أو تساوي حد التنبيه ({product.lowStockThreshold}).</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>المخزون كافٍ وسليم للمبيعات الفورية.</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSaving ? 'جارٍ الحفظ...' : 'حفظ التعديل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
