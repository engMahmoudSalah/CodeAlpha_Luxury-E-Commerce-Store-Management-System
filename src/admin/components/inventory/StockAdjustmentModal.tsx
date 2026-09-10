import React, { useState, useEffect } from 'react';
import {
  X,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { AdminProduct } from '../../types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: AdminProduct | null;
  onAdjust: (productId: number, newStock: number, reason: string) => Promise<void>;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  product,
  onAdjust,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'set' | 'add' | 'subtract'>('set');
  const [value, setValue] = useState<number>(0);
  const [reason, setReason] = useState<string>('استلام شحنة استيراد وتوريد جديدة');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setAdjustmentType('set');
      setValue(product.stock);
      setReason('استلام شحنة توريد جديدة');
      setCustomReason('');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const currentStock = product.stock;
  let calculatedNewStock = currentStock;

  if (adjustmentType === 'set') {
    calculatedNewStock = Math.max(0, value);
  } else if (adjustmentType === 'add') {
    calculatedNewStock = currentStock + Math.max(0, value);
  } else if (adjustmentType === 'subtract') {
    calculatedNewStock = Math.max(0, currentStock - Math.max(0, value));
  }

  const stockDifference = calculatedNewStock - currentStock;

  const REASON_PRESETS = [
    'استلام شحنة توريد جديدة',
    'تسوية جرد دوري في المستودع',
    'إتلاف أو فحص جودة استثنائي',
    'تجهيز صالة عرض VIP',
    'استرجاع بضاعة من عميل',
    'سبب مخصص آخر',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'سبب مخصص آخر' ? customReason.trim() : reason;
    if (!finalReason) return;

    try {
      setIsSubmitting(true);
      await onAdjust(product.id, calculatedNewStock, finalReason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E8E3D8] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E3D8] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00875A]/10 border border-[#00875A]/20 flex items-center justify-center text-[#00875A]">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#181818] font-arabic">
                تعديل رصيد المخزون اليدوي
              </h2>
              <span className="text-xs text-[#5A5852] font-mono">
                {product.sku}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5A5852] hover:text-[#181818] hover:bg-[#E8E3D8]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Preview Card */}
        <div className="p-6 border-b border-[#E8E3D8] bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-xl border border-[#E8E3D8] overflow-hidden bg-[#FAF8F5] shrink-0">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[#181818] truncate font-arabic">
                {product.name}
              </h3>
              <p className="text-xs text-[#5A5852] mt-0.5 font-arabic">
                التصنيف: {product.category} • السعر: {Number(product?.price ?? 0).toLocaleString('ar-SA')} ر.س
              </p>
            </div>
            <div className="text-left bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E8E3D8]">
              <span className="text-[11px] text-[#5A5852] block font-arabic">الرصيد الحالي</span>
              <span className="text-base font-extrabold text-[#181818] font-arabic">
                {currentStock} قطع
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-[#181818] mb-2 font-arabic">
              طريقة التعديل
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('set');
                  setValue(currentStock);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  adjustmentType === 'set'
                    ? 'border-[#00875A] bg-[#00875A] text-white shadow-xs'
                    : 'border-[#E8E3D8] bg-[#FAF8F5] text-[#5A5852] hover:bg-white'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تعيين مباشر</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('add');
                  setValue(5);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  adjustmentType === 'add'
                    ? 'border-[#00875A] bg-[#00875A] text-white shadow-xs'
                    : 'border-[#E8E3D8] bg-[#FAF8F5] text-[#5A5852] hover:bg-white'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>إضافة وارد (+)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('subtract');
                  setValue(1);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  adjustmentType === 'subtract'
                    ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                    : 'border-[#E8E3D8] bg-[#FAF8F5] text-[#5A5852] hover:bg-white'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>خصم منصرف (-)</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-[#181818] mb-1.5 font-arabic">
              {adjustmentType === 'set'
                ? 'الكمية الإجمالية الجديدة'
                : adjustmentType === 'add'
                ? 'الكمية المضافة'
                : 'الكمية المخصومة'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                value={value}
                onChange={(e) => setValue(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-base font-extrabold text-[#181818] focus:outline-none focus:border-[#00875A]"
                autoFocus
              />
              <div className="flex items-center gap-1">
                {[1, 5, 10, 25].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      if (adjustmentType === 'set') setValue((prev) => prev + amt);
                      else setValue(amt);
                    }}
                    className="px-2.5 py-2 rounded-lg border border-[#E8E3D8] bg-[#FAF8F5] text-xs font-bold text-[#181818] hover:border-[#00875A] hover:bg-white transition-colors cursor-pointer"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison Strip */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] flex items-center justify-between text-xs font-arabic">
            <div>
              <span className="text-[#5A5852] block text-[11px]">الرصيد بعد التعديل</span>
              <span className="text-base font-black text-[#181818]">
                {calculatedNewStock} قطعة
              </span>
            </div>
            <div className="text-left">
              <span className="text-[#5A5852] block text-[11px]">فارق التغيير</span>
              <span
                className={`font-extrabold text-sm flex items-center gap-1 ${
                  stockDifference > 0
                    ? 'text-[#00875A]'
                    : stockDifference < 0
                    ? 'text-rose-600'
                    : 'text-[#5A5852]'
                }`}
              >
                {stockDifference > 0 ? `+${stockDifference}` : stockDifference} قطعة
              </span>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-bold text-[#181818] mb-1.5 font-arabic">
              سبب التعديل (سيتم تسجيله في سجل التدقيق)
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] focus:outline-none focus:border-[#00875A] cursor-pointer"
            >
              {REASON_PRESETS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {reason === 'سبب مخصص آخر' && (
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="اكتب سبب التعديل بالتفصيل..."
                className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-xs text-[#181818] focus:outline-none focus:border-[#00875A]"
                required
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E8E3D8] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#5A5852] hover:bg-[#FAF8F5] cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#00875A] text-white text-xs font-bold hover:bg-[#00704A] transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>حفظ وتحديث المخزون</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
