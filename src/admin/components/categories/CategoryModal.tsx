import React, { useState, useEffect } from 'react';
import {
  X,
  FolderTree,
  Image as ImageIcon,
  Sparkles,
  Link2,
  ListOrdered,
  Eye,
  EyeOff,
  Check,
  Star,
  Layers
} from 'lucide-react';
import { AdminCategory } from '../../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<AdminCategory, 'id' | 'createdAt' | 'productCount'>) => Promise<void>;
  categoryToEdit?: AdminCategory | null;
  parentCategories: AdminCategory[];
}

const PRESET_IMAGES = [
  {
    name: 'ساعات فاخرة',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'عود وبخور',
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'جلديات وحقائب',
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'إكسسوارات ونظارات',
    url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'أقلام ومكتبيات',
    url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'مجوهرات وأحجار',
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'أطقم هدايا',
    url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'أنتيك وديكور',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80',
  },
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryToEdit,
  parentCategories,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [status, setStatus] = useState<'active' | 'hidden'>('active');
  const [featured, setFeatured] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || '');
      setSlug(categoryToEdit.slug || '');
      setDescription(categoryToEdit.description || '');
      setImage(categoryToEdit.image || '');
      setParentId(categoryToEdit.parentId || '');
      setDisplayOrder(categoryToEdit.displayOrder || 1);
      setStatus(categoryToEdit.status || 'active');
      setFeatured(categoryToEdit.featured || false);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setImage(PRESET_IMAGES[0].url);
      setParentId('');
      setDisplayOrder(parentCategories.length + 1);
      setStatus('active');
      setFeatured(false);
    }
    setErrors({});
  }, [categoryToEdit, isOpen, parentCategories.length]);

  if (!isOpen) return null;

  const generateSlugFromName = (val: string) => {
    return val
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0621-\u064A-]+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!categoryToEdit) {
      setSlug(generateSlugFromName(val));
    }
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'اسم التصنيف مطلوب';
    if (!slug.trim()) newErrors.slug = 'الاسم اللطيف (Slug) مطلوب';
    if (!image.trim()) newErrors.image = 'رابط الصورة مطلوب';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await onSave({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        image: image.trim(),
        parentId: parentId || undefined,
        displayOrder: Number(displayOrder) || 1,
        status,
        featured,
      });
      onClose();
    } catch (err: any) {
      console.error('Error saving category:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter out the current category being edited from parent choices to avoid cyclic reference
  const availableParents = parentCategories.filter(
    (cat) => !categoryToEdit || cat.id !== categoryToEdit.id
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="category-modal-card"
        className="bg-white rounded-2xl border border-[#E8E3D8] shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E8E3D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00875A]/10 text-[#00875A] flex items-center justify-center font-bold">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#181818] font-arabic">
                {categoryToEdit ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
              </h3>
              <p className="text-xs text-[#5A5852]">
                {categoryToEdit
                  ? `تعديل بيانات تصنيف "${categoryToEdit.name}"`
                  : 'أنشئ تصنيفاً رئيسياً أو فرعياً جديداً للكتالوج'}
              </p>
            </div>
          </div>
          <button
            id="close-category-modal-btn"
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#181818] hover:bg-[#F2EFE8] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Name & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#181818] mb-1.5 font-arabic">
                اسم التصنيف <span className="text-rose-600">*</span>
              </label>
              <input
                id="category-name-input"
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="مثال: ساعات فاخرة"
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-[#181818] focus:outline-none transition-colors ${
                  errors.name
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-[#E8E3D8] focus:border-[#00875A]'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#181818] mb-1.5 font-arabic flex items-center justify-between">
                <span>الاسم اللطيف (Slug)</span>
                <Link2 className="w-3.5 h-3.5 text-[#5A5852]" />
              </label>
              <input
                id="category-slug-input"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="luxury-watches"
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#FAF8F5] text-sm text-[#181818] focus:outline-none transition-colors text-left dir-ltr ${
                  errors.slug
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-[#E8E3D8] focus:border-[#00875A]'
                }`}
              />
              {errors.slug && <p className="text-xs text-rose-600 mt-1">{errors.slug}</p>}
            </div>
          </div>

          {/* Parent Hierarchy & Display Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#181818] mb-1.5 font-arabic flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#00875A]" />
                <span>التصنيف الأب (التبعية)</span>
              </label>
              <select
                id="category-parent-select"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-sm text-[#181818] focus:outline-none focus:border-[#00875A] transition-colors cursor-pointer"
              >
                <option value="">(تصنيف رئيسي أساسي)</option>
                {availableParents.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    📁 {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#181818] mb-1.5 font-arabic flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-[#00875A]" />
                <span>ترتيب العرض</span>
              </label>
              <input
                id="category-display-order-input"
                type="number"
                min="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-sm text-[#181818] focus:outline-none focus:border-[#00875A] transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#181818] mb-1.5 font-arabic">
              الوصف المختصر للتصنيف
            </label>
            <textarea
              id="category-description-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف فاخر يظهر في صفحة التصنيف ومحركات البحث..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-sm text-[#181818] focus:outline-none focus:border-[#00875A] transition-colors resize-none"
            />
          </div>

          {/* Cover Image & Presets */}
          <div>
            <label className="block text-xs font-bold text-[#181818] mb-1.5 font-arabic flex items-center justify-between">
              <span>رابط صورة الغلاف</span>
              <ImageIcon className="w-3.5 h-3.5 text-[#5A5852]" />
            </label>
            <div className="flex gap-2">
              <input
                id="category-image-input"
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
                <div className="w-11 h-11 rounded-xl border border-[#E8E3D8] overflow-hidden shrink-0 bg-[#FAF8F5]">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            {errors.image && <p className="text-xs text-rose-600 mt-1">{errors.image}</p>}

            {/* Quick preset thumbnail picker */}
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-[#5A5852] block mb-1.5">
                أو اختر من المعرض الفاخر المقترح:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={`group relative w-12 h-12 rounded-lg border overflow-hidden shrink-0 cursor-pointer transition-transform hover:scale-105 ${
                      image === preset.url
                        ? 'border-[#00875A] ring-2 ring-[#00875A]/30'
                        : 'border-[#E8E3D8]'
                    }`}
                    title={preset.name}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    {image === preset.url && (
                      <div className="absolute inset-0 bg-[#00875A]/40 flex items-center justify-center text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status & Featured Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8]">
            {/* Status */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#181818] block font-arabic">
                  حالة الظهور
                </span>
                <span className="text-[11px] text-[#5A5852]">
                  {status === 'active' ? 'مرئي في المتجر' : 'مخفي عن الزوار'}
                </span>
              </div>
              <button
                id="toggle-category-status-modal-btn"
                type="button"
                onClick={() => setStatus(status === 'active' ? 'hidden' : 'active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  status === 'active'
                    ? 'bg-[#E6F4EE] text-[#00875A] border border-[#00875A]/20'
                    : 'bg-[#F2EFE8] text-[#5A5852] border border-[#E8E3D8]'
                }`}
              >
                {status === 'active' ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>نشط</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>مخفي</span>
                  </>
                )}
              </button>
            </div>

            {/* Featured */}
            <div className="flex items-center justify-between border-t sm:border-t-0 sm:border-r border-[#E8E3D8] sm:pr-4 pt-3 sm:pt-0">
              <div>
                <span className="text-xs font-bold text-[#181818] block font-arabic">
                  تصنيف مميز
                </span>
                <span className="text-[11px] text-[#5A5852]">
                  {featured ? 'يظهر في الصفحة الرئيسية' : 'تصنيف عادي'}
                </span>
              </div>
              <button
                id="toggle-category-featured-modal-btn"
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
              id="cancel-category-modal-btn"
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-[#5A5852] text-sm font-bold hover:bg-[#F2EFE8] transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              id="submit-category-modal-btn"
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#00875A] text-white text-sm font-bold hover:bg-[#00704A] transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{categoryToEdit ? 'حفظ التعديلات' : 'إنشاء التصنيف'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
