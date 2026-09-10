import React from 'react';
import { Search, Globe, Sparkles } from 'lucide-react';
import { ProductSEO } from '../../../types';

interface ProductFormSEOTabProps {
  seo?: ProductSEO;
  productName: string;
  productDescription: string;
  slug: string;
  onChangeSEO: (seo: ProductSEO) => void;
}

export const ProductFormSEOTab: React.FC<ProductFormSEOTabProps> = ({
  seo = {} as ProductSEO,
  productName,
  productDescription,
  slug,
  onChangeSEO,
}) => {
  const metaTitle = seo.metaTitle || productName;
  const metaDescription = seo.metaDescription || productDescription.slice(0, 160);

  const handleAutoFillSEO = () => {
    onChangeSEO({
      metaTitle: productName ? `${productName} | متجر فخامة للمقتنيات الملكية` : '',
      metaDescription: productDescription ? productDescription.slice(0, 155) : '',
      canonicalUrl: slug ? `https://fakhama.com/products/${slug}` : '',
    });
  };

  return (
    <div id="product-form-seo-tab" className="space-y-6">
      {/* SEO Form Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-600" />
            <span>تهيئة محركات البحث (SEO & Google Meta Tags)</span>
          </h3>
          <button
            type="button"
            onClick={handleAutoFillSEO}
            className="text-xs text-amber-700 font-medium hover:underline inline-flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>توليد تلقائي من بيانات المنتج</span>
          </button>
        </div>

        {/* Meta Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-700">
              عنوان الصفحة في محركات البحث (Meta Title)
            </label>
            <span
              className={`text-[11px] font-mono ${
                (seo.metaTitle?.length || 0) > 60 ? 'text-amber-600' : 'text-stone-400'
              }`}
            >
              {seo.metaTitle?.length || 0} / 60 حرف (موصى به)
            </span>
          </div>
          <input
            type="text"
            placeholder={productName || 'عنوان جذاب يتضمن الكلمات المفتاحية...'}
            value={seo.metaTitle || ''}
            onChange={(e) => onChangeSEO({ ...seo, metaTitle: e.target.value })}
            className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-700">
              الوصف لمحركات البحث ومواقع التواصل (Meta Description)
            </label>
            <span
              className={`text-[11px] font-mono ${
                (seo.metaDescription?.length || 0) > 160 ? 'text-amber-600' : 'text-stone-400'
              }`}
            >
              {seo.metaDescription?.length || 0} / 160 حرف (موصى به)
            </span>
          </div>
          <textarea
            rows={3}
            placeholder={
              productDescription.slice(0, 160) ||
              'ملخص جذاب يظهر تحت العنوان في نتائج بحث قوقل لجذب النقرات...'
            }
            value={seo.metaDescription || ''}
            onChange={(e) => onChangeSEO({ ...seo, metaDescription: e.target.value })}
            className="w-full p-4 text-xs leading-relaxed bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Canonical URL */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            الرابط الأساسي الثابت (Canonical URL)
          </label>
          <input
            type="url"
            placeholder={`https://fakhama.com/products/${slug || 'product-slug'}`}
            value={seo.canonicalUrl || ''}
            onChange={(e) => onChangeSEO({ ...seo, canonicalUrl: e.target.value })}
            className="w-full px-4 py-2.5 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-left dir-ltr"
          />
        </div>
      </div>

      {/* Google SERP Live Snippet Preview */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <h4 className="text-xs font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>معاينة نتيجة البحث المباشرة على محرك Google</span>
        </h4>

        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 max-w-2xl font-sans text-right space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-mono dir-ltr text-left">
            <span>https://fakhama.com</span>
            <span>›</span>
            <span>products</span>
            <span>›</span>
            <span className="text-stone-700 font-bold">{slug || 'sample-slug'}</span>
          </div>

          <h5 className="text-base font-bold text-[#00875A] hover:underline cursor-pointer">
            {metaTitle || 'عنوان المنتج الفاخر | متجر فخامة الملكي'}
          </h5>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {metaDescription ||
              'اقتنِ أجود المقتنيات الملكية النادرة مع تغليف فاخر وضمان أصالة معتمد وشحن سريع إلى كافة دول الخليج.'}
          </p>
        </div>
      </div>
    </div>
  );
};
