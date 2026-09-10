import React, { useState, useMemo } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Plus,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';

interface MediaItem {
  id: string;
  title: string;
  url: string;
  category: 'products' | 'banners' | 'branding';
  size: string;
  dimensions: string;
  createdAt: string;
}

const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'med_1',
    title: 'ساعة رويال أوك روز قولد - واجهة كاملة',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80',
    category: 'products',
    size: '1.4 MB',
    dimensions: '1920x1080',
    createdAt: '2024-03-15',
  },
  {
    id: 'med_2',
    title: 'دهن عود كلمنتان ملكي معتق',
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&auto=format&fit=crop&q=80',
    category: 'products',
    size: '890 KB',
    dimensions: '1200x1200',
    createdAt: '2024-03-12',
  },
  {
    id: 'med_3',
    title: 'حقيبة سفر إيطالية جلد فاخر',
    url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&auto=format&fit=crop&q=80',
    category: 'products',
    size: '1.1 MB',
    dimensions: '1600x1200',
    createdAt: '2024-03-10',
  },
  {
    id: 'med_4',
    title: 'بنر العروض الملكية - رمضان وموسم الأعياد',
    url: 'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=1600&auto=format&fit=crop&q=80',
    category: 'banners',
    size: '2.3 MB',
    dimensions: '2560x1080',
    createdAt: '2024-03-01',
  },
  {
    id: 'med_5',
    title: 'سبحة كهرمان بولندي ملكي أصيل',
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&auto=format&fit=crop&q=80',
    category: 'products',
    size: '950 KB',
    dimensions: '1200x1200',
    createdAt: '2024-02-28',
  },
  {
    id: 'med_6',
    title: 'أزرار أكمام ذهب أبيض مرصعة بالألماس',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&auto=format&fit=crop&q=80',
    category: 'products',
    size: '1.2 MB',
    dimensions: '1500x1500',
    createdAt: '2024-02-20',
  },
];

export const AdminMediaLibraryPage: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [activeCategory, setActiveCategory] = useState<'all' | 'products' | 'banners' | 'branding'>('all');
  const [search, setSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadCat, setUploadCat] = useState<'products' | 'banners' | 'branding'>('products');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setToastMessage('تم نسخ رابط الصورة إلى الحافظة');
    setTimeout(() => {
      setCopiedId(null);
      setToastMessage(null);
    }, 2000);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الوسائط من المكتبة؟')) return;
    setMediaList((prev) => prev.filter((m) => m.id !== id));
    setToastMessage('تم حذف الوسائط بنجاح');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim() || !uploadTitle.trim()) return;

    const newItem: MediaItem = {
      id: `med_${Date.now()}`,
      title: uploadTitle.trim(),
      url: uploadUrl.trim(),
      category: uploadCat,
      size: '1.2 MB',
      dimensions: '1920x1080',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setMediaList([newItem, ...mediaList]);
    setUploadUrl('');
    setUploadTitle('');
    setIsUploading(false);
    setToastMessage('تمت إضافة الصورة بنجاح إلى مكتبة الوسائط');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredMedia = useMemo(() => {
    return mediaList.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        !search.trim() || item.title.toLowerCase().includes(search.toLowerCase().trim());
      return matchesCat && matchesSearch;
    });
  }, [mediaList, activeCategory, search]);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#00875A] text-white px-4 py-3 rounded-xl shadow-xl text-sm animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>لوحة التحكم</span>
            <span>/</span>
            <span className="text-amber-700 font-semibold">مكتبة الوسائط</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2 tracking-tight">
            <ImageIcon className="w-7 h-7 text-amber-600" />
            مكتبة الوسائط والصور الفاخرة
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            إدارة الصور بدقة Ultra-HD، بنرات الحملات، وشعارات العلامات التجارية
          </p>
        </div>
        <button
          onClick={() => setIsUploading(!isUploading)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-xs transition-all active:scale-98 text-xs cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'إغلاق نافذة الرفع' : 'رفع وسائط جديدة'}
        </button>
      </div>

      {/* Upload Drop/Form Drawer */}
      {isUploading && (
        <form
          onSubmit={handleUploadSubmit}
          className="p-6 bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-[#00875A] shadow-lg space-y-4"
        >
          <h3 className="text-sm font-bold text-[#181818] dark:text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#00875A]" />
            إضافة وسائط جديدة عبر الرابط المباشر
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1">
                اسم ووصف الصورة
              </label>
              <input
                type="text"
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="مثال: ساعة نوتيلوس رويال بلو"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1">
                رابط الصورة المباشر (URL)
              </label>
              <input
                type="url"
                required
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1">
                القسم / التصنيف
              </label>
              <select
                value={uploadCat}
                onChange={(e) => setUploadCat(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white"
              >
                <option value="products">صور منتجات (Products)</option>
                <option value="banners">بنرات وعروض (Banners)</option>
                <option value="branding">شعارات وهوية (Branding)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="px-4 py-2 rounded-xl border border-[#E8E3D8] text-[#5A5852] text-xs font-semibold hover:bg-[#FAF8F3] transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#00875A] hover:bg-[#00724C] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              إضافة إلى المكتبة
            </button>
          </div>
        </form>
      )}

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-[#F2EFE8] dark:bg-stone-800/80 rounded-2xl border border-[#E8E3D8] dark:border-stone-700/60 w-fit">
          {[
            { id: 'all', label: 'كافة الوسائط' },
            { id: 'products', label: 'صور المنتجات' },
            { id: 'banners', label: 'البنرات الإعلانية' },
            { id: 'branding', label: 'الشعارات والهوية' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-white dark:bg-stone-900 text-[#181818] dark:text-white shadow-xs'
                  : 'text-[#6B6860] dark:text-stone-400 hover:text-[#181818] dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9E9A90] absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن صورة بالاسم أو العلامة..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-white dark:bg-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00875A]/20 text-[#181818] dark:text-white"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredMedia.map((m) => (
          <div
            key={m.id}
            className="group relative bg-white dark:bg-stone-900 border border-[#E8E3D8] dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Image Thumbnail */}
            <div className="relative aspect-square w-full bg-[#FAF8F3] dark:bg-stone-800 overflow-hidden">
              <img
                src={m.url}
                alt={m.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleCopyUrl(m.id, m.url)}
                  title="نسخ الرابط"
                  className="p-2 bg-white/90 hover:bg-white text-stone-900 rounded-xl shadow-xs transition-all scale-90 hover:scale-100 cursor-pointer"
                >
                  {copiedId === m.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  title="حذف"
                  className="p-2 bg-white/90 hover:bg-red-50 text-red-600 rounded-xl shadow-xs transition-all scale-90 hover:scale-100 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Info Footer */}
            <div className="p-3 space-y-1">
              <h4 className="text-xs font-semibold text-[#181818] dark:text-white line-clamp-1">
                {m.title}
              </h4>
              <div className="flex items-center justify-between text-[10px] text-[#9E9A90]">
                <span>{m.dimensions}</span>
                <span>{m.size}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
