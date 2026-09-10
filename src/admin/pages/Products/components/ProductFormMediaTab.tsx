import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Trash2, Star, UploadCloud, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface ProductFormMediaTabProps {
  primaryImage: string;
  galleryImages: string[];
  onChangePrimaryImage: (url: string) => void;
  onAddGalleryImage: (url: string) => void;
  onRemoveGalleryImage: (index: number) => void;
  onSetAsPrimary: (index: number) => void;
}

export const ProductFormMediaTab: React.FC<ProductFormMediaTabProps> = ({
  primaryImage,
  galleryImages,
  onChangePrimaryImage,
  onAddGalleryImage,
  onRemoveGalleryImage,
  onSetAsPrimary,
}) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [urlInputError, setUrlInputError] = useState('');

  // Sample curated luxury product image presets for quick testing
  const samplePresets = [
    {
      title: 'مسبحة كهرمان بلطيقي',
      url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'عود كمبودي معتق',
      url: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'ساعة يد كلاسيكية فاخرة',
      url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'خاتم عقيق يماني كبدي',
      url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'عطر ملكي عنبر دخاني',
      url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleAddUrl = () => {
    if (!newImageUrl.trim()) {
      setUrlInputError('يرجى إدخال رابط الصورة أولاً');
      return;
    }
    try {
      new URL(newImageUrl);
      if (!primaryImage) {
        onChangePrimaryImage(newImageUrl);
      } else {
        onAddGalleryImage(newImageUrl);
      }
      setNewImageUrl('');
      setUrlInputError('');
    } catch {
      setUrlInputError('الرابط المدخل غير صالح، يرجى التأكد من كتابة رابط URL يبدأ بـ http:// أو https://');
    }
  };

  return (
    <div id="product-form-media-tab" className="space-y-6">
      {/* Media Upload & URL Input Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <ImageIcon className="w-4 h-4 text-amber-600" />
          <span>إدارة ألبوم الصور الملكي</span>
        </h3>

        {/* URL Input Box */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            إضافة صورة عبر الرابط المباشر (Image URL)
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://images.unsplash.com/... أو رابط الصورة المباشر"
                value={newImageUrl}
                onChange={(e) => {
                  setNewImageUrl(e.target.value);
                  setUrlInputError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
                className="w-full pr-9 pl-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-left dir-ltr"
              />
            </div>
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-4 py-2.5 text-xs font-bold bg-amber-500 text-stone-950 rounded-xl hover:bg-amber-400 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>إدراج في الألبوم</span>
            </button>
          </div>
          {urlInputError && (
            <p className="text-[11px] text-rose-500 font-medium mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{urlInputError}</span>
            </p>
          )}
        </div>

        {/* Quick Sample Presets */}
        <div>
          <span className="text-[11px] font-bold text-stone-500 block mb-2">
            صور مقترحة عالية الدقة للتجربة السريعة:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePresets.map((preset, idx) => (
              <button
                key={`preset-${idx}`}
                type="button"
                onClick={() => {
                  if (!primaryImage) {
                    onChangePrimaryImage(preset.url);
                  } else {
                    onAddGalleryImage(preset.url);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-amber-50 hover:border-amber-200 border border-stone-200 rounded-lg text-xs text-stone-700 transition-colors"
              >
                <img
                  src={preset.url}
                  alt={preset.title}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{preset.title}</span>
                <Plus className="w-3 h-3 text-stone-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Cover & Gallery Showcase */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
        <h3 className="text-sm font-bold text-stone-900 flex items-center justify-between border-b border-stone-100 pb-3">
          <span>معاينة معرض الصور</span>
          <span className="text-xs text-stone-500 font-normal">
            إجمالي الصور: {(primaryImage ? 1 : 0) + galleryImages.length}
          </span>
        </h3>

        {/* Primary Cover Image */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-2">
            الصورة الرئيسية للغلاف (Primary Cover Image) <span className="text-rose-500">*</span>
          </label>
          {primaryImage ? (
            <div className="relative group w-full max-w-sm h-64 rounded-2xl overflow-hidden border-2 border-amber-500 bg-stone-900 shadow-md">
              <img
                src={primaryImage}
                alt="الصورة الرئيسية"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500 text-stone-950 text-[11px] font-bold rounded-lg shadow-sm flex items-center gap-1">
                <Star className="w-3 h-3 fill-stone-950" />
                <span>الغلاف الأساسي</span>
              </div>
              <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onChangePrimaryImage('')}
                  className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-500 shadow-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>إزالة الغلاف</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-sm h-48 border-2 border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center p-6 text-center bg-stone-50 text-stone-400">
              <UploadCloud className="w-8 h-8 text-stone-300 mb-2" />
              <p className="text-xs font-bold text-stone-600">لا توجد صورة رئيسية محددة</p>
              <p className="text-[11px] text-stone-400 mt-1">
                أدخل رابط صورة بالأعلى لتعيينها كصورة رئيسية للمنتج
              </p>
            </div>
          )}
        </div>

        {/* Gallery Images List */}
        <div className="pt-4 border-t border-stone-100">
          <label className="block text-xs font-bold text-stone-700 mb-3">
            صور إضافية للمنتج (معرض الصور / Gallery)
          </label>
          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {galleryImages.map((imgUrl, index) => (
                <div
                  key={`gallery-url-${index}`}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-900 shadow-2xs"
                >
                  <img
                    src={imgUrl}
                    alt={`صورة إضافية ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => onSetAsPrimary(index)}
                      title="تعيين كصورة رئيسية"
                      className="px-2 py-1 bg-amber-500 text-stone-950 rounded-lg text-[10px] font-bold shadow-xs hover:bg-amber-400 w-full text-center"
                    >
                      تعيين كغلاف
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveGalleryImage(index)}
                      title="حذف الصورة"
                      className="p-1.5 bg-rose-600 text-white rounded-lg text-[10px] hover:bg-rose-500 shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 italic bg-stone-50 p-4 rounded-xl border border-stone-200/60 text-center">
              لم يتم إضافة صور إضافية للمعرض بعد. يمكنك إضافة زوايا مختلفة للمنتج أو لقطات مقربة.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
