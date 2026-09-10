import React from 'react';
import { Truck, CheckCircle2, Zap } from 'lucide-react';

interface FreeShippingProgressProps {
  currentSubtotal: number;
  threshold?: number;
}

export const FreeShippingProgress: React.FC<FreeShippingProgressProps> = ({
  currentSubtotal,
  threshold = 500,
}) => {
  const diff = threshold - currentSubtotal;
  const isFree = diff <= 0;
  const percentage = Math.min(100, Math.max(0, (currentSubtotal / threshold) * 100));

  return (
    <div className="rounded-3xl bg-[#FCFAF7] border border-[#F0EAE1] p-4 sm:p-5 flex flex-col gap-2.5 font-arabic shadow-2xs" dir="rtl">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-black text-[#111111]">
          {isFree ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#008F68]" />
              <span className="text-[#008F68]">تهانينا! طلبيتك مؤهلة للشحن المجاني السريع VIP</span>
            </>
          ) : (
            <>
              <Truck className="w-4 h-4 text-[#008F68]" />
              <span>
                أضف مقتنيات بقيمة{' '}
                <strong className="text-[#008F68] font-mono">
                  {Math.round(diff).toLocaleString('ar-SA')} ر.س
                </strong>{' '}
                للحصول على الشحن المجاني
              </span>
            </>
          )}
        </div>
        <span className="text-[11px] font-bold text-neutral-400 font-mono">
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-[#EAE5DC] rounded-full overflow-hidden relative">
        <div
          className="h-full bg-[#008F68] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
