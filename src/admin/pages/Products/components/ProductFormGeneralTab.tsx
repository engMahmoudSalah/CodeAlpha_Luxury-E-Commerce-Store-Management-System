import React from 'react';
import { Tag, Bookmark, Sparkles, Plus, X } from 'lucide-react';
import { ProductStatus } from '../../../types';

interface ProductFormGeneralTabProps {
  formData: {
    name: string;
    slug: string;
    brand: string;
    category: string;
    subcategory?: string;
    shortDescription?: string;
    description: string;
    tags: string[];
    collections: string[];
    isFeatured: boolean;
    status: ProductStatus;
  };
  categories: { name: string; count: number }[];
  brands: string[];
  onChange: (field: string, value: any) => void;
  tagInput: string;
  setTagInput: (val: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  collectionInput: string;
  setCollectionInput: (val: string) => void;
  onAddCollection: () => void;
  onRemoveCollection: (col: string) => void;
  onGenerateSlug: () => void;
}

export const ProductFormGeneralTab: React.FC<ProductFormGeneralTabProps> = ({
  formData,
  categories,
  brands,
  onChange,
  tagInput,
  setTagInput,
  onAddTag,
  onRemoveTag,
  collectionInput,
  setCollectionInput,
  onAddCollection,
  onRemoveCollection,
  onGenerateSlug,
}) => {
  return (
    <div id="product-form-general-tab" className="space-y-6">
      {/* Basic Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Bookmark className="w-4 h-4 text-amber-600" />
          <span>المعلومات الأساسية للمنتج</span>
        </h3>

        {/* Product Title */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            اسم المنتج الملكي <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="مثال: مسبحة من حجر الكهرمان البلطيقي الأصيل مع شرابة فضة عيار 925"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Product Slug (URL) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-700">
              الرابط الدائم (Slug / URL Identifier) <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={onGenerateSlug}
              className="text-xs font-medium text-amber-700 hover:text-amber-800 underline"
            >
              توليد تلقائي من الاسم
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="baltic-amber-rosary-silver-tassel"
              value={formData.slug}
              onChange={(e) => onChange('slug', e.target.value)}
              className="w-full pl-4 pr-24 py-2 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-left dir-ltr"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-mono pointer-events-none">
              /products/
            </span>
          </div>
        </div>

        {/* Brand & Category Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              التصنيف الرئيسي <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                list="categories-list"
                required
                type="text"
                placeholder="اختر أو اكتب تصنيفاً..."
                value={formData.category}
                onChange={(e) => onChange('category', e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <datalist id="categories-list">
                {categories.map((c) => (
                  <option key={c.name} value={c.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              العلامة التجارية / الماركة <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                list="brands-list"
                required
                type="text"
                placeholder="اختر أو اكتب ماركة..."
                value={formData.brand}
                onChange={(e) => onChange('brand', e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <datalist id="brands-list">
                {brands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* Short Summary Description */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            الوصف المختصر (يظهر في بطاقة المنتج وقوائم المعاينة)
          </label>
          <input
            type="text"
            placeholder="موجز جذاب لا يتجاوز سطرين عن فخامة المنتج..."
            value={formData.shortDescription || ''}
            onChange={(e) => onChange('shortDescription', e.target.value)}
            className="w-full px-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Full Rich Description */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            الوصف التفصيلي والقصة الملكية للمنتج <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            placeholder="اشرح بالتفصيل المواد الطبيعية، دقة الحرفية اليدوية، الأبعاد، وتجربة الاقتناء الفاخرة..."
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            className="w-full p-4 text-xs leading-relaxed bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Organization & Tags Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Tag className="w-4 h-4 text-amber-600" />
          <span>المجموعات، الوسوم والتمييز</span>
        </h3>

        {/* Featured Toggle */}
        <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl border border-amber-200/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-stone-950 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">منتج مميز (Featured)</h4>
              <p className="text-[11px] text-stone-500">
                إبراز المنتج في الواجهة الرئيسية للمتجر وأقسام المختارات الملكية.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => onChange('isFeatured', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {/* Collections */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            المجموعات الموسمية والكتالوجات
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="مثال: المجموعة الملكية، هدايا VIP..."
              value={collectionInput}
              onChange={(e) => setCollectionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddCollection();
                }
              }}
              className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <button
              type="button"
              onClick={onAddCollection}
              className="px-3.5 py-2 text-xs font-bold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {formData.collections.map((col) => (
              <span
                key={col}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-medium"
              >
                <span>{col}</span>
                <button
                  type="button"
                  onClick={() => onRemoveCollection(col)}
                  className="text-amber-700 hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            وسوم البحث السريع (Tags)
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="مثال: كهرمان، فضة، نوادر، صنوبر..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddTag();
                }
              }}
              className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <button
              type="button"
              onClick={onAddTag}
              className="px-3.5 py-2 text-xs font-bold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg text-xs font-mono"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="text-stone-400 hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
