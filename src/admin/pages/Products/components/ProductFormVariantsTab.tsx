import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit3, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import { ProductOption, ProductVariant } from '../../../types';

interface ProductFormVariantsTabProps {
  hasVariants: boolean;
  onToggleHasVariants: (enabled: boolean) => void;
  options: ProductOption[];
  variants: ProductVariant[];
  basePrice: number;
  baseSku: string;
  onChangeOptions: (options: ProductOption[]) => void;
  onChangeVariants: (variants: ProductVariant[]) => void;
}

export const ProductFormVariantsTab: React.FC<ProductFormVariantsTabProps> = ({
  hasVariants,
  onToggleHasVariants,
  options,
  variants,
  basePrice,
  baseSku,
  onChangeOptions,
  onChangeVariants,
}) => {
  // Option creation state
  const [optionName, setOptionName] = useState('');
  const [optionValueInput, setOptionValueInput] = useState('');
  const [tempValues, setTempValues] = useState<string[]>([]);

  // Preset suggestions for options
  const optionPresets = [
    { name: 'المقاس / الحجم', values: ['صغير (8 ملم)', 'متوسط (10 ملم)', 'كبير (12 ملم)'] },
    { name: 'العيار / النقاوة', values: ['فضة عيار 925', 'فضة عيار 999', 'ذهب عيار 18', 'ذهب عيار 21'] },
    { name: 'لون الحجر', values: ['أصفر عسلي', 'أبيض شجري', 'أحمر كبدي', 'أسود ملكي'] },
    { name: 'نوع التغليف', values: ['علبة مخمل فاخرة', 'صندوق خشبي ملكي محفور'] },
  ];

  const handleAddTempValue = () => {
    if (!optionValueInput.trim()) return;
    if (!tempValues.includes(optionValueInput.trim())) {
      setTempValues((prev) => [...prev, optionValueInput.trim()]);
    }
    setOptionValueInput('');
  };

  const handleRemoveTempValue = (val: string) => {
    setTempValues((prev) => prev.filter((v) => v !== val));
  };

  const handleSaveOption = () => {
    if (!optionName.trim() || tempValues.length === 0) return;

    const newOption: ProductOption = {
      id: `opt_${Date.now()}`,
      name: optionName.trim(),
      values: tempValues,
    };

    const updatedOptions = [...options, newOption];
    onChangeOptions(updatedOptions);

    // Re-generate variant combinations
    generateVariantsFromOptions(updatedOptions);

    // Reset inputs
    setOptionName('');
    setTempValues([]);
    setOptionValueInput('');
  };

  const handleRemoveOption = (optionId: string) => {
    const updated = options.filter((o) => o.id !== optionId);
    onChangeOptions(updated);
    if (updated.length === 0) {
      onChangeVariants([]);
    } else {
      generateVariantsFromOptions(updated);
    }
  };

  // Generate Cartesian Product of all option values
  const generateVariantsFromOptions = (opts: ProductOption[]) => {
    if (opts.length === 0) {
      onChangeVariants([]);
      return;
    }

    const combinations: { name: string; value: string }[][] = [[]];

    for (const opt of opts) {
      const currentCombs = [...combinations];
      combinations.length = 0; // clear

      for (const comb of currentCombs) {
        for (const val of opt.values) {
          combinations.push([...comb, { name: opt.name, value: val }]);
        }
      }
    }

    const newVariants: ProductVariant[] = combinations.map((comb, idx) => {
      const title = comb.map((c) => c.value).join(' / ');
      const skuSuffix = comb
        .map((c) => c.value.slice(0, 3).toUpperCase().replace(/\s/g, ''))
        .join('-');

      return {
        id: `var_${idx + 1}_${Date.now()}`,
        title,
        sku: `${baseSku || 'FKH'}-${idx + 1}`,
        options: comb,
        price: basePrice || 0,
        stock: 5,
      };
    });

    onChangeVariants(newVariants);
  };

  const handleUpdateVariantField = (
    variantId: string,
    field: keyof ProductVariant,
    value: any
  ) => {
    const updated = variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v));
    onChangeVariants(updated);
  };

  return (
    <div id="product-form-variants-tab" className="space-y-6">
      {/* Enable Variants Toggle */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-100 text-stone-800 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                الخيارات والمتغيرات (Variants & Options)
              </h3>
              <p className="text-xs text-stone-500">
                تفعيل المقاسات، الألوان، العيارات، أو الأوزان المختلفة لنفس المنتج مع أسعار ومخزون مستقل.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => onToggleHasVariants(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {!hasVariants && (
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/60 text-xs text-stone-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-stone-400 shrink-0" />
            <span>هذا المنتج متاح كقطعة واحدة بدون خيارات متعددة (Standard Single Product).</span>
          </div>
        )}
      </div>

      {hasVariants && (
        <>
          {/* Options Manager */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
            <h4 className="text-xs font-bold text-stone-900 border-b border-stone-100 pb-3">
              ١. تحديد خصائص وخيارات المنتج (Options)
            </h4>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] font-bold text-stone-500 block mb-2">
                قوالب خيارات سريعة:
              </span>
              <div className="flex flex-wrap gap-2">
                {optionPresets.map((preset, idx) => (
                  <button
                    key={`preset-${idx}`}
                    type="button"
                    onClick={() => {
                      setOptionName(preset.name);
                      setTempValues(preset.values);
                    }}
                    className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-200"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Add New Option Form */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    اسم الخيار (مثال: المقاس، اللون، العيار)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: مقاس حبات المسبحة"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    إضافة قيم الخيار
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="اكتب القيمة واضغط إضافة أو Enter"
                      value={optionValueInput}
                      onChange={(e) => setOptionValueInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTempValue();
                        }
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTempValue}
                      className="px-3 py-2 bg-stone-800 text-white rounded-xl text-xs font-bold hover:bg-stone-700"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
              </div>

              {/* Temp values tags */}
              {tempValues.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-200">
                  {tempValues.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs text-stone-800"
                    >
                      <span>{v}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTempValue(v)}
                        className="text-stone-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!optionName.trim() || tempValues.length === 0}
                  onClick={handleSaveOption}
                  className="px-4 py-2 bg-amber-500 text-stone-950 text-xs font-bold rounded-xl hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                >
                  حفظ الخيار وتوليد التركيبات
                </button>
              </div>
            </div>

            {/* List of Active Options */}
            {options.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-700 block">الخيارات المطبقة:</span>
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-3 bg-white border border-stone-200 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-stone-900">{opt.name}: </span>
                      <span className="text-xs text-stone-500">
                        {opt.values.join(' ، ')} ({opt.values.length} قيم)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(opt.id)}
                      className="text-rose-600 hover:text-rose-700 p-1 rounded-md text-xs font-bold"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generated Variants Table */}
          {variants.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h4 className="text-xs font-bold text-stone-900">
                  ٢. جدول أسعار ومخزون المتغيرات المولدة ({variants.length} خيار متاح)
                </h4>
                <button
                  type="button"
                  onClick={() => generateVariantsFromOptions(options)}
                  className="text-xs text-amber-700 font-medium hover:underline"
                >
                  إعادة توليد وتصفير
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full text-right text-xs">
                  <thead className="bg-stone-100/75 text-stone-600 font-bold border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">الخيار</th>
                      <th className="py-2.5 px-3">رمز المخزون (SKU)</th>
                      <th className="py-2.5 px-3">السعر (ر.س)</th>
                      <th className="py-2.5 px-3">السعر المقارن</th>
                      <th className="py-2.5 px-3">الكمية المتوفرة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {variants.map((v) => (
                      <tr key={v.id} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-3 font-bold text-stone-900">
                          {v.title}
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) =>
                              handleUpdateVariantField(v.id, 'sku', e.target.value.toUpperCase())
                            }
                            className="w-28 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={v.price}
                            onChange={(e) =>
                              handleUpdateVariantField(v.id, 'price', Number(e.target.value))
                            }
                            className="w-24 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="—"
                            value={v.compareAtPrice ?? ''}
                            onChange={(e) =>
                              handleUpdateVariantField(
                                v.id,
                                'compareAtPrice',
                                e.target.value === '' ? undefined : Number(e.target.value)
                              )
                            }
                            className="w-24 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) =>
                              handleUpdateVariantField(v.id, 'stock', Number(e.target.value))
                            }
                            className="w-20 px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
