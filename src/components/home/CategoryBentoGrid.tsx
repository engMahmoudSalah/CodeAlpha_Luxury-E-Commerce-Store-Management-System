import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Sparkles, ArrowUpLeft } from 'lucide-react';
import { commerceStore } from '../../shared/store/commerceStore';
import { commerceEventBus } from '../../shared/events/commerceEvents';

interface CategoryItem {
  id: string;
  name: string;
  categoryParam: string;
  tagline: string;
  description: string;
  image: string;
  itemCountLabel?: string;
  badge?: string;
  colSpan?: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-audio',
    name: 'الأنظمة الصوتية الفاخرة',
    categoryParam: 'Audio',
    tagline: 'Hi-Fi & Acoustic Masterpieces',
    description: 'سماعات رأس ومكبرات صوت استوديو بنقاء استثنائي وتصميم مريح.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    badge: 'الأعلى تقييماً',
    colSpan: 'lg:col-span-6'
  },
  {
    id: 'cat-wearables',
    name: 'الساعات والمقتنيات الذكية',
    categoryParam: 'Wearables',
    tagline: 'Precision Timepieces & Wearables',
    description: 'ساعات هجينة تدمج براعة الصياغة مع تكنولوجيا الاستشعار الحيوي.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    badge: 'تشكيلة حصرية',
    colSpan: 'lg:col-span-6'
  },
  {
    id: 'cat-electronics',
    name: 'الإلكترونيات المعاصرة',
    categoryParam: 'Electronics',
    tagline: 'Refined Visuals & Hardware',
    description: 'شاشات عرض احترافية وحلول شحن وعتاد مخصص للإنتاجية والرفاهية.',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    colSpan: 'lg:col-span-4'
  },
  {
    id: 'cat-home-office',
    name: 'مقتنيات المساحات الإبداعية',
    categoryParam: 'Home & Office',
    tagline: 'Workspace Elegance & Comfort',
    description: 'إضاءات مكتبية ذكية، منصات دعم الخيزران الطبيعي، ومستلزمات التركيز.',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    colSpan: 'lg:col-span-4'
  },
  {
    id: 'cat-accessories',
    name: 'الإكسسوارات والحقائب الملكية',
    categoryParam: 'Accessories',
    tagline: 'Luxury Leather & Tech Essentials',
    description: 'أغطية جلد نباتي، محطات شحن ماج سيف، وبطاريات سفر فائقة السرعة.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
    badge: 'جديد 2026',
    colSpan: 'lg:col-span-4'
  }
];

interface CategoryBentoGridProps {
  categoryCounts?: Record<string, number>;
}

export const CategoryBentoGrid: React.FC<CategoryBentoGridProps> = ({ categoryCounts }) => {
  const [dbCats, setDbCats] = useState(() => commerceStore.getCategories());

  useEffect(() => {
    const unsub = commerceEventBus.subscribe('CATEGORY_CREATED', () => {
      setDbCats(commerceStore.getCategories());
    });
    const unsub2 = commerceEventBus.subscribe('CATEGORY_UPDATED', () => {
      setDbCats(commerceStore.getCategories());
    });
    const unsub3 = commerceEventBus.subscribe('CATEGORY_DELETED', () => {
      setDbCats(commerceStore.getCategories());
    });
    return () => {
      unsub();
      unsub2();
      unsub3();
    };
  }, []);

  // Map dbCats to CategoryItems if available, blending with defaults
  const displayCategories: CategoryItem[] = dbCats.length > 0
    ? dbCats.slice(0, 6).map((c, idx) => {
        const matchingDefault = DEFAULT_CATEGORIES.find((d) => d.categoryParam.toLowerCase() === c.name.toLowerCase() || d.name.includes(c.name));
        const colSpan = idx === 0 || idx === 1 ? 'lg:col-span-6' : 'lg:col-span-4';
        return {
          id: String(c.id),
          name: c.name,
          categoryParam: c.name,
          tagline: c.slug ? c.slug.toUpperCase() : 'EXCLUSIVE COLLECTION',
          description: c.description || matchingDefault?.description || `استكشف أحدث مقتنيات ${c.name} الفاخرة المعتمدة.`,
          image: c.image || matchingDefault?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
          badge: idx === 0 ? 'الأكثر طلباً' : idx === 1 ? 'مجموعة ملكية' : undefined,
          colSpan,
        };
      })
    : DEFAULT_CATEGORIES;
  return (
    <section className="w-full py-10 sm:py-16 bg-[#FAF8F3] font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 border-b border-[#E8E3D8] pb-5">
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#00875A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مجموعات دار فخامة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#181818] tracking-tight">
              استكشف المقتنيات حسب الفئة
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5852] max-w-xl">
              تصفح التشكيلات المتنوعة المصممة خصيصاً لتمنحك توازناً استثنائياً في أسلوب حياتك ومساحتك.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-black text-[#00875A] hover:text-[#00704A] transition-colors group cursor-pointer"
          >
            <span>عرض كافة المجموعات</span>
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
          {displayCategories.map((cat, idx) => {
            const count = categoryCounts ? categoryCounts[cat.categoryParam] : undefined;

            return (
              <Link
                key={`cat-bento-${cat.id || idx}-${idx}`}
                to={`/products?category=${encodeURIComponent(cat.categoryParam)}`}
                className={`group relative rounded-[28px] overflow-hidden bg-[#181818] text-white border border-[#E8E3D8] min-h-[260px] sm:min-h-[300px] flex flex-col justify-end p-6 sm:p-8 transition-all duration-500 hover:shadow-xl hover:border-[#00875A]/60 ${
                  cat.colSpan || 'lg:col-span-6'
                }`}
              >
                {/* Background Image with Zoom & Dark Gradient */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108 opacity-75 group-hover:opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1E17] via-[#0D1E17]/60 to-transparent" />
                  <div className="absolute inset-0 bg-[#00875A]/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Top Badge & Corner Action Icon */}
                <div className="relative z-10 flex items-center justify-between gap-2 mb-auto pb-4">
                  {cat.badge ? (
                    <span className="text-[10px] sm:text-xs font-black px-3 py-1 bg-[#00875A] text-white rounded-full shadow-xs">
                      {cat.badge}
                    </span>
                  ) : count !== undefined ? (
                    <span className="text-[10px] sm:text-xs font-bold px-3 py-1 bg-black/60 backdrop-blur-md text-[#FAF8F3] border border-white/15 rounded-full">
                      {count} مقتنى
                    </span>
                  ) : (
                    <div />
                  )}

                  <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#00875A] text-white backdrop-blur-md flex items-center justify-center transition-colors duration-300 border border-white/15">
                    <ArrowUpLeft className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:-translate-x-0.5" />
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 flex flex-col gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#FFC700] tracking-wider uppercase">
                    {cat.tagline}
                  </span>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white group-hover:text-[#00E676] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed font-medium mt-1">
                    {cat.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
