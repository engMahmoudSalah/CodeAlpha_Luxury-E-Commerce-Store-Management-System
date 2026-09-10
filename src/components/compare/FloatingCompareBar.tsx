import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import { useProducts } from '../../hooks/useProducts';
import { GitCompare, X, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

export const FloatingCompareBar: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { data: productsData } = useProducts({ limit: 100 });

  if (compareList.length === 0) return null;

  const compareProducts = (productsData?.products || []).filter((p) =>
    compareList.includes(p.id)
  );

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-[#181818] text-white border border-[#2E2E2E] rounded-full p-2.5 sm:p-3.5 shadow-2xl flex items-center justify-between gap-4 font-arabic" dir="rtl">
      <div className="flex items-center gap-3 overflow-x-auto py-0.5">
        <div className="flex items-center gap-2 pl-3 border-l border-[#333333] shrink-0">
          <GitCompare className="w-4 h-4 text-[#FFC700]" />
          <span className="text-xs font-bold text-white whitespace-nowrap">
            مقارنة المواصفات ({compareList.length}/4)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {compareProducts.map((product, idx) => (
            <div
              key={`float-cmp-${product.id || idx}-${idx}`}
              className="relative w-10 h-10 rounded-full bg-white p-1 border border-[#333333] shrink-0 flex items-center justify-center group overflow-hidden"
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
              <button
                onClick={() => removeFromCompare(product.id)}
                aria-label="إزالة العنصر من المقارنة"
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 text-white flex items-center justify-center text-[10px] cursor-pointer transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={clearCompare}
          className="text-xs text-[#A8A49A] hover:text-white font-bold px-2 py-1 transition-colors cursor-pointer"
        >
          تفريغ
        </button>
        <Link to="/compare">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            المقارنة الآن
          </Button>
        </Link>
      </div>
    </div>
  );
};


