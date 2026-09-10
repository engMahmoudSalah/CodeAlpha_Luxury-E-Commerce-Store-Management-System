import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Image as ImageIcon,
  Link2,
  Check,
  Star,
  Sparkles
} from 'lucide-react';
import { AdminCollection } from '../../types';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<AdminCollection, 'id' | 'createdAt' | 'productsCount'>) => Promise<void>;
  collectionToEdit?: AdminCollection | null;
}

const PRESET_BANNERS = [
  {
    name: 'المجموعة الملكية',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'هدايا VIP',
    url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'نوادر العود',
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'روائع الأعياد',
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'مقتنيات التراث',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
  },
];

export const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  collectionToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');
  const [featured, setFeatured] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (collectionToEdit) {
      setTitle(collectionToEdit.title || '');
      setSlug(collectionToEdit.slug || '');
      setDescription(collectionToEdit.description || '');
      setImage(collectionToEdit.image || '');
      setStatus(collectionToEdit.status || 'active');
      setFeatured(collectionToEdit.featured || false);
    } else {
      setTitle('');
      setSlug('');
      setDescription('');
      setImage(PRESET_BANNERS[0].url);
      setStatus('active');
      setFeatured(false);
    }
    setErrors({});
  }, [collectionToEdit, isOpen]);

  if (!isOpen) return null;

  const generateSlugFromTitle = (val: string) => {
    return val
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0621-\u064A-]+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!collectionToEdit) {
      setSlug(generateSlugFromTitle(val));
    }
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'عنوان المجموعة مطلوب';
    if (!slug.trim()) newErrors.slug = 'الاسم اللطيف (Slug) مطلوب';
    if (!image.trim()) newErrors.image = 'رابط صورة الغلاف مطلوب';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await onSave({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        image: image.trim(),
        status,
        featured,
      });
      onClose();
    } catch (err: any) {
      console.error('Error saving collection:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="collection-modal-card"
        className="bg-white rounded-2xl border border-[#E8E3D8] shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E8E3D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#181818] font-arabic">
                {collectionToEdit ? 'تعديل المجموعة الملكية' : 'إنشاء مجموعة ملكية جديدة'}
              </h3>
              <p className="text-xs text-[#5A5852]">
                {collectionToEdit
                  ? `تعديل تفاصيل حملة "${collectionToEdit.title}"`
                  : 'أنشئ تشكيلة تسويقية حصرية للمناسبات ومقتنيات VIP'}
              </p>
            </div>
          </div>
          <button
            id="close-collection-modal-btn"
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#181818] hover:bg-[#F2EFE8] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#181818] mb-1.5 font-arabic">
                عنوان المجموعة <span className="text-rose-600">*</span>
              </label>
              <input
                id="collection-title-input"
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="مثال: المجموعة الملكية الخاصة"
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-[#181818] focus:outline-none transition-colors ${
                  errors.title
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-[#E8E3D8] focus:border-[#00875A]'
                }`}
              />
              {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#181818] mb-1.5 font-arabic flex items-center justify-between">
                <span>الاسم اللطيف (Slug)</span>
                <Link2 className="w-3.5 h-3.5 text-[#5A5852]" />
              </label>
              <input
                id="collection-slug-input"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="royal-collection"
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#FAF8F5] text-sm text-[#181818] focus:outline-none transition-colors text-left dir-ltr ${
                  errors.slug
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-[#E8E3D8] focus:border-[#00875A]'
                }`}
              />
              {errors.slug && <p className="text-xs text-rose-600 mt-1">{errors.slug}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#181818] mb-1.5 font-arabic">
              وصف التشكيلة والحملة
            </label>
            <textarea
              id="collection-description-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="قصة التشكيلة وما يميز القطع المختارة في هذه المجموعة الملكية..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-sm text-[#181818] focus:outline-none focus:border-[#00875A] transition-colors resize-none"
            />
          </div>

          {/* Banner Image */}
          <div>
            <label className="block text-xs font-bold text-[#181818] mb-1.5 font-arabic flex items-center justify-between">
              <span>رابط صورة البانر الرئيسي</span>
              <ImageIcon className="w-3.5 h-3.5 text-[#5A5852]" />
            </label>
            <div className="flex gap-2">
              <input
                id="collection-image-input"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className={`flex-1 px-3.5 py-2.5 rounded-xl border bg-white text-sm text-[#181818] focus:outline-none transition-colors text-left dir-ltr ${
                  errors.image
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-[#E8E3D8] focus:border-[#00875A]'
                }`}
              />
              {image && (
                <div className="w-16 h-11 rounded-xl border border-[#E8E3D8] overflow-hidden shrink-0 bg-[#FAF8F5]">
                  <img src={image} alt="Banner Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            {errors.image && <p className="text-xs text-rose-600 mt-1">{errors.image}</p>}

            {/* Presets */}
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-[#5A5852] block mb-1.5">
                بانرات فاخرة مقترحة:
              </span>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_BANNERS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={`group relative h-12 rounded-lg border overflow-hidden shrink-0 cursor-pointer transition-transform hover:scale-105 ${
                      image === preset.url
                        ? 'border-amber-600 ring-2 ring-amber-500/30'
                        : 'border-[#E8E3D8]'
                    }`}
                    title={preset.name}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    {image === preset.url && (
                      <div className="absolute inset-0 bg-amber-600/40 flex items-center justify-center text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status & Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8]">
            {/* Status Selector */}
            <div>
              <label className="block text-xs font-bold text-[#181818] mb-1.5 font-arabic">
                حالة المجموعة
              </label>
              <select
                id="collection-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] focus:outline-none focus:border-[#00875A] cursor-pointer"
              >
                <option value="active">نشطة ومتاحة في المتجر</option>
                <option value="draft">مسودة (غير منشورة)</option>
                <option value="archived">مؤرشفة</option>
              </select>
            </div>

            {/* Featured on Home */}
            <div className="flex items-center justify-between border-t sm:border-t-0 sm:border-r border-[#E8E3D8] sm:pr-4 pt-3 sm:pt-0">
              <div>
                <span className="text-xs font-bold text-[#181818] block font-arabic">
                  إبراز في الصفحة الرئيسية
                </span>
                <span className="text-[11px] text-[#5A5852]">عرض كبانر بارز VIP</span>
              </div>
              <button
                id="toggle-collection-featured-modal-btn"
                type="button"
                onClick={() => setFeatured(!featured)}
                className={`p-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  featured
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-white text-[#5A5852] border border-[#E8E3D8]'
                }`}
              >
                <Star
                  className={`w-4 h-4 ${
                    featured ? 'text-amber-500 fill-amber-500' : 'text-[#5A5852]'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E8E3D8] flex items-center justify-end gap-3">
            <button
              id="cancel-collection-modal-btn"
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-[#5A5852] text-sm font-bold hover:bg-[#F2EFE8] transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              id="submit-collection-modal-btn"
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#00875A] text-white text-sm font-bold hover:bg-[#00704A] transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{collectionToEdit ? 'حفظ التعديلات' : 'إنشاء المجموعة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
