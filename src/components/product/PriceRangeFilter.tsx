import React, { useState, useEffect } from 'react';
import { DollarSign, Check, RotateCcw } from 'lucide-react';
import { usePriceRange } from '../../hooks/useProducts';

interface PriceRangeFilterProps {
  currentMin?: number;
  currentMax?: number;
  onChange: (min: number | undefined, max: number | undefined) => void;
  onClear: () => void;
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  currentMin,
  currentMax,
  onChange,
  onClear
}) => {
  const { data: dbRange } = usePriceRange();
  const minBound = dbRange?.min ?? 0;
  const maxBound = dbRange?.max ?? 10000;

  const [minVal, setMinVal] = useState<string>(currentMin !== undefined ? currentMin.toString() : '');
  const [maxVal, setMaxVal] = useState<string>(currentMax !== undefined ? currentMax.toString() : '');

  useEffect(() => {
    setMinVal(currentMin !== undefined ? currentMin.toString() : '');
    setMaxVal(currentMax !== undefined ? currentMax.toString() : '');
  }, [currentMin, currentMax]);

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsedMin = minVal.trim() !== '' ? Number(minVal) : undefined;
    const parsedMax = maxVal.trim() !== '' ? Number(maxVal) : undefined;
    onChange(parsedMin, parsedMax);
  };

  const handlePreset = (min?: number, max?: number) => {
    setMinVal(min !== undefined ? min.toString() : '');
    setMaxVal(max !== undefined ? max.toString() : '');
    onChange(min, max);
  };

  const hasActivePriceFilter = currentMin !== undefined || currentMax !== undefined;

  return (
    <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] font-arabic shadow-2xs">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
        <span className="text-xs font-black text-[#111111] flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-[#008F68]" />
          تصفية حسب نطاق السعر (ر.س)
        </span>
        {hasActivePriceFilter && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] font-bold text-neutral-400 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            إلغاء
          </button>
        )}
      </div>

      {/* Preset Quick Chips */}
      <div className="flex flex-wrap gap-1.5 mb-3.5">
        <button
          type="button"
          onClick={() => handlePreset(undefined, 1000)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
            currentMin === undefined && currentMax === 1000
              ? 'bg-[#008F68] text-white border-[#008F68]'
              : 'bg-[#FAF8F3] text-neutral-700 border-[#E8E3D8] hover:border-neutral-400'
          }`}
        >
          أقل من ١,٠٠٠ ر.س
        </button>
        <button
          type="button"
          onClick={() => handlePreset(1000, 5000)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
            currentMin === 1000 && currentMax === 5000
              ? 'bg-[#008F68] text-white border-[#008F68]'
              : 'bg-[#FAF8F3] text-neutral-700 border-[#E8E3D8] hover:border-neutral-400'
          }`}
        >
          ١,٠٠٠ - ٥,٠٠٠ ر.س
        </button>
        <button
          type="button"
          onClick={() => handlePreset(5000, undefined)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
            currentMin === 5000 && currentMax === undefined
              ? 'bg-[#008F68] text-white border-[#008F68]'
              : 'bg-[#FAF8F3] text-neutral-700 border-[#E8E3D8] hover:border-neutral-400'
          }`}
        >
          أكثر من ٥,٠٠٠ ر.س
        </button>
      </div>

      {/* Manual Inputs & Apply Button */}
      <form onSubmit={handleApply} className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="number"
            min={minBound}
            max={maxBound}
            placeholder={`من ${minBound}`}
            value={minVal}
            onChange={(e) => setMinVal(e.target.value)}
            className="w-full bg-[#FAF8F3] border border-[#E8E3D8] rounded-xl px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-[#008F68] text-center"
          />
        </div>
        <span className="text-neutral-400 text-xs font-bold">-</span>
        <div className="flex-1">
          <input
            type="number"
            min={minBound}
            max={maxBound}
            placeholder={`إلى ${maxBound}`}
            value={maxVal}
            onChange={(e) => setMaxVal(e.target.value)}
            className="w-full bg-[#FAF8F3] border border-[#E8E3D8] rounded-xl px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-[#008F68] text-center"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1.5 bg-[#008F68] hover:bg-[#007353] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
        >
          تطبيق
        </button>
      </form>
    </div>
  );
};
