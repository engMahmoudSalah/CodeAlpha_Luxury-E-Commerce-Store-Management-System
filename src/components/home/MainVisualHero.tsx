import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Sparkles, ShieldCheck, ShoppingBag, Award } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';

// Import local tiles & assets
import heroMain from '../../assets/images/regenerated_image_1787114260183.jpg';
import rackGreen from '../../assets/tiles/rack_green.jpg';
import blackTshirtGreen from '../../assets/tiles/black_tshirt_green.jpg';
import greyTshirtGreen from '../../assets/tiles/grey_tshirt_green.jpg';
import tshirtsGreen from '../../assets/tiles/tshirts_green.jpg';
import foldedShirtsPeach from '../../assets/tiles/folded_shirts_peach.jpg';
import foldedShirtsOnly from '../../assets/tiles/folded_shirts_only.jpg';
import fakhamaPeach from '../../assets/tiles/fakhama_brand_peach.jpg';
import tile0 from '../../assets/tiles/tile_0.jpg';
import tile1 from '../../assets/tiles/tile_1.jpg';
import tile2 from '../../assets/tiles/tile_2.jpg';
import tile3 from '../../assets/tiles/tile_3.jpg';

export interface HeroProductItem {
  id: string;
  productId?: number | string;
  link?: string;
  name: string;
  subtitle: string;
  category: string;
  price?: string;
  image?: string;
  tag?: string;
  tagColor?: string;
}

// Vibrant luxury color palettes for products without visible images
const VIBRANT_TILE_PALETTES = [
  {
    bg: 'bg-gradient-to-br from-[#00E676] via-[#00875A] to-[#021811]',
    tagColor: 'text-[#021811]',
    badgeBg: 'bg-[#021811]',
    titleColor: 'text-white',
    subtitleColor: 'text-emerald-100',
    priceColor: 'text-[#FFD700]',
    accentIcon: 'sparkles'
  },
  {
    bg: 'bg-gradient-to-br from-[#F5C400] via-[#D4AF37] to-[#111111]',
    tagColor: 'text-[#111111]',
    badgeBg: 'bg-[#111111]',
    titleColor: 'text-white',
    subtitleColor: 'text-amber-100',
    priceColor: 'text-[#00E676]',
    accentIcon: 'award'
  },
  {
    bg: 'bg-gradient-to-br from-[#111111] via-[#008F68] to-[#111111]',
    tagColor: 'text-[#00E676]',
    badgeBg: 'bg-[#00E676]',
    titleColor: 'text-white',
    subtitleColor: 'text-emerald-200',
    priceColor: 'text-[#F5C400]',
    accentIcon: 'bag'
  },
  {
    bg: 'bg-gradient-to-br from-[#881337] via-[#4C0519] to-[#0F172A]',
    tagColor: 'text-[#FECDD3]',
    badgeBg: 'bg-rose-950',
    titleColor: 'text-white',
    subtitleColor: 'text-rose-200',
    priceColor: 'text-[#F5C400]',
    accentIcon: 'shield'
  },
  {
    bg: 'bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617]',
    tagColor: 'text-[#38BDF8]',
    badgeBg: 'bg-slate-900',
    titleColor: 'text-white',
    subtitleColor: 'text-slate-300',
    priceColor: 'text-[#00E676]',
    accentIcon: 'sparkles'
  },
  {
    bg: 'bg-gradient-to-br from-[#581C87] via-[#3B0764] to-[#111111]',
    tagColor: 'text-[#E9D5FF]',
    badgeBg: 'bg-purple-950',
    titleColor: 'text-white',
    subtitleColor: 'text-purple-200',
    priceColor: 'text-[#F5C400]',
    accentIcon: 'award'
  },
  {
    bg: 'bg-gradient-to-br from-[#F9DCCB] via-[#E2A782] to-[#111111]',
    tagColor: 'text-[#111111]',
    badgeBg: 'bg-[#111111]',
    titleColor: 'text-white',
    subtitleColor: 'text-amber-100',
    priceColor: 'text-[#00E676]',
    accentIcon: 'bag'
  },
  {
    bg: 'bg-gradient-to-br from-[#0F766E] via-[#042F2E] to-[#111111]',
    tagColor: 'text-[#5EEAD4]',
    badgeBg: 'bg-teal-950',
    titleColor: 'text-white',
    subtitleColor: 'text-teal-200',
    priceColor: 'text-[#F5C400]',
    accentIcon: 'shield'
  }
];

// Initial rich pool of luxury product images across categories
const HERO_PRODUCT_POOL: HeroProductItem[] = [
  {
    id: 'p1',
    name: 'ساعة كرونوغراف الميكانيكية',
    subtitle: 'إصدار فاخر بدقة متناهية',
    category: 'الساعات الفاخرة',
    price: '٤,٩٥٠ ر.س',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    tag: 'كرونوغراف',
    tagColor: 'text-amber-300'
  },
  {
    id: 'p2',
    name: 'ساعة رويال كلاسيك',
    subtitle: 'مطلي بذهب 18 قيراط',
    category: 'الساعات الفاخرة',
    price: '٨,٢٠٠ ر.س',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    tag: 'إصدار ملكي',
    tagColor: 'text-yellow-400'
  },
  {
    id: 'p3',
    name: 'ساعة الفخامة السوداء',
    subtitle: 'تصميم مينيمال معاصر',
    category: 'الساعات الفاخرة',
    price: '٣,٤٠٠ ر.س',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80',
    tag: 'الأكثر طلباً',
    tagColor: 'text-[#00E676]'
  },
  {
    id: 'p4',
    name: 'ساعة هيريتج جلد طبيعي',
    subtitle: 'سوار من الجلد الملكي المعالج',
    category: 'الساعات الفاخرة',
    price: '٢,٨٥٠ ر.س',
    image: 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600&q=80',
    tag: 'جلد فاخر',
    tagColor: 'text-emerald-300'
  },
  {
    id: 'p5',
    name: 'سماعات هاي فاي ستوديو',
    subtitle: 'عزل صوتي احترافي محيطي',
    category: 'الأنظمة الصوتية',
    price: '٢,١٠٠ ر.س',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    tag: 'صوت محيطي',
    tagColor: 'text-sky-300'
  },
  {
    id: 'p6',
    name: 'سماعة خشب الجوز الأصيل',
    subtitle: 'صوت نقي بتقنية نادرة',
    category: 'الأنظمة الصوتية',
    price: '٣,٦٠٠ ر.س',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80',
    tag: 'إصدار نادِر',
    tagColor: 'text-amber-400'
  },
  {
    id: 'p7',
    name: 'سماعة أذن لاسلكية فاخرة',
    subtitle: 'حافظة شحن ألومنيوم معالجة',
    category: 'الأنظمة الصوتية',
    price: '١,٤٥٠ ر.س',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
    tag: 'تقنية عالية',
    tagColor: 'text-cyan-300'
  },
  {
    id: 'p8',
    name: 'تيشرت قطن أوفرسايزد أسود',
    subtitle: 'نسيج حك معالج فاخر',
    category: 'الأزياء',
    price: '٤٥٠ ر.س',
    image: blackTshirtGreen,
    tag: 'قطن ١٠٠٪',
    tagColor: 'text-white'
  },
  {
    id: 'p9',
    name: 'قمصان كتان ملكية مطوية',
    subtitle: 'ألوان صيفية مريحة وخفيفة',
    category: 'الأزياء',
    price: '٦٨٠ ر.س',
    image: foldedShirtsPeach,
    tag: 'تشكيلة الصيف',
    tagColor: 'text-[#00E676]'
  },
  {
    id: 'p10',
    name: 'مجموعة قمصان فخامة الكلاسيكية',
    subtitle: 'قصّات متناسقة معاصرة',
    category: 'الأزياء',
    price: '٨٩٠ ر.س',
    image: foldedShirtsOnly,
    tag: 'حصرية',
    tagColor: 'text-rose-300'
  },
  {
    id: 'p11',
    name: 'تيشرت قطن رمادي فاخر',
    subtitle: 'راحة فائقة وأناقة بسيطة',
    category: 'الأزياء',
    price: '٤٢٠ ر.س',
    image: greyTshirtGreen,
    tag: 'أنسجة نادرة',
    tagColor: 'text-emerald-300'
  },
  {
    id: 'p12',
    name: 'رف أزياء فخامة المعروض',
    subtitle: 'تشكيلة الموسم الجديد',
    category: 'الأزياء',
    price: '١,٢٥٠ ر.س',
    image: rackGreen,
    tag: 'الموسم الجديد',
    tagColor: 'text-[#00E676]'
  },
  {
    id: 'p13',
    name: 'مجموعة التيشرتات الملونة',
    subtitle: 'قطن فاخر خالي من الانكماش',
    category: 'الأزياء',
    price: '٥٥٠ ر.س',
    image: tshirtsGreen,
    tag: 'تشكيلة ملونة',
    tagColor: 'text-teal-300'
  },
  {
    id: 'p14',
    name: 'نظارة شمسية إيطالية فاخرة',
    subtitle: 'عدسات مستقطبة وحماية كاملة',
    category: 'الإكسسوارات',
    price: '١,٦٥٠ ر.س',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',
    tag: 'إيطالي معتمد',
    tagColor: 'text-amber-300'
  },
  {
    id: 'p15',
    name: 'عطر العود الملكي المعتمد',
    subtitle: 'تركيز نقي وفوحان يدوم طويلاً',
    category: 'العطور النادرة',
    price: '٢,٤٠٠ ر.س',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80',
    tag: 'عود أصيل',
    tagColor: 'text-[#00E676]'
  },
  {
    id: 'p16',
    name: 'عطر العنبر الذهبي الفاخر',
    subtitle: 'مزيج العود والعنبر المعتق',
    category: 'العطور النادرة',
    price: '١,٩٥٠ ر.س',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80',
    tag: 'عنبر معتق',
    tagColor: 'text-yellow-300'
  },
  {
    id: 'p17',
    name: 'محفظة جلد طبيعي مصنوعة يدوياً',
    subtitle: 'جلد إيطالي معالج بتقنية عالية',
    category: 'الإكسسوارات',
    price: '٧٥٠ ر.س',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
    tag: 'صنع يدوي',
    tagColor: 'text-amber-200'
  },
  {
    id: 'p18',
    name: 'حقيبة سفر جلدية فاخرة',
    subtitle: 'سعة ممتازة ومتانة للمسافات الطويلة',
    category: 'الإكسسوارات',
    price: '٣,٨٠٠ ر.س',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    tag: 'حقيبة سفر',
    tagColor: 'text-orange-300'
  },
  {
    id: 'p19',
    name: 'كاميرا لايكا الكلاسيكية',
    subtitle: 'عدسة المانية وحساس احترافي',
    category: 'الإلكترونيات',
    price: '١٤,٥٠٠ ر.س',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
    tag: 'إصدار لايكا',
    tagColor: 'text-red-400'
  },
  {
    id: 'p20',
    name: 'حذاء رياضي إصدار محدود',
    subtitle: 'تصميم حصري ومريح جداً',
    category: 'الأحذية الفاخرة',
    price: '١,٨٥٠ ر.س',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&q=80',
    tag: 'إصدار خاص',
    tagColor: 'text-purple-300'
  },
  {
    id: 'p21',
    name: 'حذاء جلد أبيض مينيمليست',
    subtitle: 'بساطة وأناقة مطلقة',
    category: 'الأحذية الفاخرة',
    price: '١,٤٠٠ ر.س',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
    tag: 'مينيمال',
    tagColor: 'text-emerald-300'
  },
  {
    id: 'p22',
    name: 'لوحة مفاتيح ميكانيكية ألومنيوم',
    subtitle: 'أداء عالي للعمل والاستخدام الشخصي',
    category: 'الإلكترونيات',
    price: '١,١٠٠ ر.س',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
    tag: 'ميكانيكية',
    tagColor: 'text-blue-300'
  },
  {
    id: 'p23',
    name: 'ساعة ذكية تقنية سوداء',
    subtitle: 'مراقبة علامات الصحة والرياضة',
    category: 'الساعات الفاخرة',
    price: '٢,٣٠٠ ر.س',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80',
    tag: 'ساعة ذكية',
    tagColor: 'text-cyan-300'
  },
  {
    id: 'p24',
    name: 'هودي الزمرد الدافئ',
    subtitle: 'خامات قطنية دافئة وأنيقة',
    category: 'الأزياء',
    price: '٦٥٠ ر.س',
    image: tile0,
    tag: 'هودي فاخر',
    tagColor: 'text-emerald-400'
  },
  {
    id: 'p25',
    name: 'حقيبة ظهر تكتيكية راقية',
    subtitle: 'مقاومة للماء ومصممة للتنقل',
    category: 'الإكسسوارات',
    price: '١,٣٥٠ ر.س',
    image: tile1,
    tag: 'تكتيكي راقي',
    tagColor: 'text-amber-300'
  },
  {
    id: 'p26',
    name: 'سترة الشتاء المقاومة للرياح',
    subtitle: 'عزل حراري وتصميم معاصر',
    category: 'الأزياء',
    price: '١,٩٥٠ ر.س',
    image: tile2,
    tag: 'مقاوم للبرودة',
    tagColor: 'text-sky-300'
  },
  {
    id: 'p27',
    name: 'إكسسوارات المكتب الملكية',
    subtitle: 'تنظيم للمساحة بلمسة فخمة',
    category: 'مقتنيات المساحات',
    price: '٨٥٠ ر.س',
    image: tile3,
    tag: 'مساحات فاخرة',
    tagColor: 'text-teal-300'
  },
  {
    id: 'p28',
    name: 'صندوق هدايا المقتنيات الملكي',
    subtitle: 'تغليف خاص مع ضمان الأصالة',
    category: 'الهدايا الفاخرة',
    price: '٣,٥٠٠ ر.س',
    image: heroMain,
    tag: 'صندوق فاخر',
    tagColor: 'text-[#00E676]'
  }
];

interface DynamicProductTileProps {
  tileIndex: number;
  initialProduct: HeroProductItem;
  pool: HeroProductItem[];
  isPlaying: boolean;
  aspectClass?: string;
}

/**
 * Individual Product Tile component that changes its product image
 * automatically with random intervals, different speeds, and crossfade transitions.
 */
const DynamicProductTile: React.FC<DynamicProductTileProps> = ({
  tileIndex,
  initialProduct,
  pool,
  isPlaying,
  aspectClass = 'aspect-square'
}) => {
  const [currentProduct, setCurrentProduct] = useState<HeroProductItem>(initialProduct);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset image error state whenever product changes
  useEffect(() => {
    setImageError(false);
  }, [currentProduct.id]);

  useEffect(() => {
    if (!isPlaying || isHovered || pool.length <= 1) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const scheduleNextSwap = () => {
      // Larger randomized time interval (between 5500ms and 12500ms) with staggered offsets
      const randomInterval = Math.floor(Math.random() * 7000) + 5500;
      const staggerOffset = (tileIndex * 850) % 3500;
      const delay = randomInterval + staggerOffset;

      timerRef.current = setTimeout(() => {
        setCurrentProduct((prev) => {
          // Select a random product from the pool that is different from current
          const filtered = pool.filter((p) => p.id !== prev.id);
          if (filtered.length === 0) return prev;
          const randomIndex = Math.floor(Math.random() * filtered.length);
          return filtered[randomIndex];
        });
        // Recursively schedule next swap with a new random time delay
        scheduleNextSwap();
      }, delay);
    };

    scheduleNextSwap();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, isHovered, pool, tileIndex]);

  const targetUrl = currentProduct.link || (currentProduct.productId ? `/products/${currentProduct.productId}` : '/products');

  // Palette selection for missing/broken image fallback
  const charCode = typeof currentProduct.id === 'string' ? currentProduct.id.charCodeAt(currentProduct.id.length - 1) : Number(currentProduct.id || 0);
  const paletteIndex = Math.abs(tileIndex + charCode) % VIBRANT_TILE_PALETTES.length;
  const palette = VIBRANT_TILE_PALETTES[paletteIndex];

  const hasValidImage = currentProduct.image && currentProduct.image.trim() !== '' && !imageError;

  return (
    <Link to={targetUrl} className="block w-full h-full">
      <motion.div
        whileHover={{ scale: 1.06, y: -3 }}
        transition={{ duration: 0.25 }}
        className={`relative ${aspectClass} rounded-[20px] sm:rounded-[26px] overflow-hidden border border-white/15 shadow-xl group bg-neutral-900 cursor-pointer select-none`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`hero-tile-${tileIndex}-${currentProduct.id}`}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.8 + ((tileIndex % 4) * 0.2), // Smooth 0.8s - 1.4s crossfade transitions
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="absolute inset-0 w-full h-full"
          >
            {hasValidImage ? (
              <>
                <img
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover object-center filter contrast-[1.05] group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  onError={() => setImageError(true)}
                />
                {/* Subtle Gradient Overlay for readable product labels */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent p-2.5 sm:p-3 flex flex-col justify-end">
                  {currentProduct.tag && (
                    <span className={`text-[8px] sm:text-[9px] font-bold ${currentProduct.tagColor || 'text-[#00E676]'} tracking-wider mb-0.5 block`}>
                      {currentProduct.tag}
                    </span>
                  )}
                  <span className="text-[10px] sm:text-xs font-black text-white leading-tight truncate block font-arabic">
                    {currentProduct.name}
                  </span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[8px] sm:text-[9px] text-neutral-300 font-medium truncate max-w-[60%] font-arabic">
                      {currentProduct.category}
                    </span>
                    {currentProduct.price && (
                      <span className="text-[8px] sm:text-[9px] text-[#00E676] font-extrabold shrink-0">
                        {currentProduct.price}
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Dynamic Vibrant Luxury Color Card (for missing/broken product images) */
              <div className={`w-full h-full ${palette.bg} p-2.5 sm:p-3 flex flex-col justify-between items-center text-center relative overflow-hidden font-arabic`}>
                {/* Subtle Radial Glow Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/50 pointer-events-none" />

                {/* Top Badge Header */}
                <div className="relative z-10 w-full flex justify-between items-center gap-1">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${palette.badgeBg} ${palette.badgeBg.includes('00E676') ? 'text-[#021811]' : 'text-white'}`}>
                    {currentProduct.tag || 'فخامة'}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-[#F5C400] shrink-0" />
                </div>

                {/* Center Brand Emblem & Title */}
                <div className="relative z-10 flex flex-col items-center my-auto px-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/30 border border-white/30 flex items-center justify-center mb-1 shadow-inner">
                    <span className="text-[10px] sm:text-xs font-black text-[#F5C400]">FA</span>
                  </div>
                  <span className={`text-[10px] sm:text-xs font-black leading-snug line-clamp-2 ${palette.titleColor}`}>
                    {currentProduct.name}
                  </span>
                </div>

                {/* Bottom Category & Price */}
                <div className="relative z-10 w-full flex items-center justify-between pt-1 border-t border-white/20 text-[8px] sm:text-[9px]">
                  <span className={`font-bold truncate max-w-[60%] ${palette.subtitleColor}`}>
                    {currentProduct.category}
                  </span>
                  {currentProduct.price && (
                    <span className={`font-black ${palette.priceColor}`}>
                      {currentProduct.price}
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Hover Highlight Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2 z-20 pointer-events-none">
          <span className="bg-[#00E676] text-[#021811] text-[9px] sm:text-[10px] font-black px-3 py-1 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 font-arabic">
            استكشف المقتنى
          </span>
        </div>
      </motion.div>
    </Link>
  );
};

export const MainVisualHero: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  // Fetch real API products if available to expand the pool dynamically
  const { data: apiProductsData } = useProducts({ limit: 30 });

  // Merge default curated luxury pool with API products
  const apiMapped: HeroProductItem[] = (apiProductsData?.products || []).map((p) => ({
    id: `api-${p.id}`,
    productId: p.id,
    link: `/products/${p.id}`,
    name: p.name,
    subtitle: p.description,
    category: p.category,
    price: `${Number(p?.price ?? 0).toLocaleString('ar-SA')} ر.س`,
    image: p.image_url,
    tag: p.category,
    tagColor: 'text-[#00E676]'
  }));

  const productPool = [...HERO_PRODUCT_POOL, ...apiMapped];

  // Pick initial distinct products for each tile
  const getInitialProduct = (index: number) => {
    return productPool[index % productPool.length];
  };

  return (
    <section
      className="w-full bg-[linear-gradient(180deg,#050505_0%,#050505_60%,#012A1D_78%,#00875A_88%,#00E676_94%,#FAF8F3_100%)] text-white -mt-[112px] lg:-mt-[128px] pt-28 sm:pt-32 lg:pt-36 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-arabic select-none z-10"
      dir="rtl"
      aria-label="الواجهة الرئيسية لمقتنيات فخامة"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E676]/10 blur-[140px] rounded-full pointer-events-none z-0" />

      {/* Outer Wrapper for Centered Visual Harmony */}
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
        
        {/* =========================================================================
            DYNAMIC MOSAIC TILES GRID (Product Images Auto-Swapping)
            ========================================================================= */}
        <div className="w-full overflow-x-auto no-scrollbar py-4 px-2 flex justify-center">
          <div className="min-w-0 sm:min-w-[880px] lg:min-w-none w-full max-w-6xl grid grid-cols-3 sm:grid-cols-7 gap-3 sm:gap-4 items-center justify-center">
            
            {/* COLUMN 1 (Far Left - 4 Product Tiles) */}
            <div className="hidden sm:flex flex-col gap-3 sm:gap-4">
              <DynamicProductTile
                tileIndex={0}
                initialProduct={getInitialProduct(0)}
                pool={productPool}
                isPlaying={isPlaying}
              />
              <DynamicProductTile
                tileIndex={1}
                initialProduct={getInitialProduct(1)}
                pool={productPool}
                isPlaying={isPlaying}
              />
              <DynamicProductTile
                tileIndex={2}
                initialProduct={getInitialProduct(2)}
                pool={productPool}
                isPlaying={isPlaying}
              />
              <DynamicProductTile
                tileIndex={3}
                initialProduct={getInitialProduct(3)}
                pool={productPool}
                isPlaying={isPlaying}
              />
            </div>

            {/* COLUMN 2 (Inner Left - 3 Product Tiles) */}
            <div className="hidden sm:flex flex-col gap-3 sm:gap-4">
              <DynamicProductTile
                tileIndex={4}
                initialProduct={getInitialProduct(4)}
                pool={productPool}
                isPlaying={isPlaying}
              />
              <DynamicProductTile
                tileIndex={5}
                initialProduct={getInitialProduct(5)}
                pool={productPool}
                isPlaying={isPlaying}
              />
              <DynamicProductTile
                tileIndex={6}
                initialProduct={getInitialProduct(6)}
                pool={productPool}
                isPlaying={isPlaying}
              />
            </div>

            {/* COLUMN 3 (Adjacent Left - 2 Product Tiles) */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <DynamicProductTile
                tileIndex={7}
                initialProduct={getInitialProduct(7)}
                pool={productPool}
                isPlaying={isPlaying}
              />
              <DynamicProductTile
                tileIndex={8}
                initialProduct={getInitialProduct(8)}
                pool={productPool}
                isPlaying={isPlaying}
              />
            </div>

            {/* =========================================================================
                COLUMN 4 (CENTER HIGHLIGHT - THE GIANT GREEN BRAND TILE)
                ========================================================================= */}
            <div className="flex flex-col items-center justify-center">
              <Link to="/products" className="block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52 bg-[#00E676] rounded-[28px] sm:rounded-[36px] p-4 sm:p-6 flex flex-col items-center justify-center text-center text-[#021811] shadow-[0_0_60px_rgba(0,230,118,0.4)] border-2 border-white/30 relative z-20 cursor-pointer group"
                >
                  {/* Center Monogram/Pattern */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#021811] flex items-center justify-center mb-2 group-hover:rotate-45 transition-transform duration-500">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#021811] text-[#00E676] rounded-lg flex items-center justify-center font-black text-xl sm:text-2xl shadow-inner">
                      FA
                    </div>
                  </div>

                  <span className="text-base sm:text-lg font-black tracking-tight text-[#021811] font-arabic">
                    فخامة
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#021811]/80 tracking-widest uppercase">
                    LUXE CLUB
                  </span>
                </motion.div>
              </Link>
            </div>

            {/* COLUMN 5 (Adjacent Right - 2 Product Tiles) */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <DynamicProductTile
                tileIndex={9}
                initialProduct={getInitialProduct(9)}
                pool={productPool}
                isPlaying={isPlaying}
              />
              <DynamicProductTile
                tileIndex={10}
                initialProduct={getInitialProduct(10)}
                pool={productPool}
                isPlaying={isPlaying}
              />
            </div>

            {/* COLUMN 6 (Inner Right - 3 Product Tiles) */}
            <div className="hidden sm:flex flex-col gap-3 sm:gap-4">
              <DynamicProductTile
                tileIndex={11}
                initialProduct={getInitialProduct(11)}
                pool={productPool}
                isPlaying={isPlaying}
              />
              <DynamicProductTile
                tileIndex={12}
                initialProduct={getInitialProduct(12)}
                pool={productPool}
                isPlaying={isPlaying}
              />
              <DynamicProductTile
                tileIndex={13}
                initialProduct={getInitialProduct(13)}
                pool={productPool}
                isPlaying={isPlaying}
              />
            </div>

            {/* COLUMN 7 (Far Right - 4 Product Tiles) */}
            <div className="hidden sm:flex flex-col gap-3 sm:gap-4">
              <DynamicProductTile
                tileIndex={14}
                initialProduct={getInitialProduct(14)}
                pool={productPool}
                isPlaying={isPlaying}
              />
              <DynamicProductTile
                tileIndex={15}
                initialProduct={getInitialProduct(15)}
                pool={productPool}
                isPlaying={isPlaying}
              />
              <DynamicProductTile
                tileIndex={16}
                initialProduct={getInitialProduct(16)}
                pool={productPool}
                isPlaying={isPlaying}
              />
              <DynamicProductTile
                tileIndex={17}
                initialProduct={getInitialProduct(17)}
                pool={productPool}
                isPlaying={isPlaying}
              />
            </div>

          </div>
        </div>

        {/* =========================================================================
            BOTTOM TYPOGRAPHY SECTION
            ========================================================================= */}
        <div className="mt-6 sm:mt-14 lg:mt-16 max-w-4xl mx-auto text-center px-4 flex flex-col items-center">
          
          {/* Main Giant Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.3] tracking-tight font-arabic">
            <span className="block text-white relative inline-block">
              تجربة تقتني بها أرقى
              <span className="absolute bottom-1 left-0 right-0 h-1 bg-[#00E676] rounded-full opacity-80" />
            </span>
            <span className="block text-neutral-100 mt-2 sm:mt-3">
              من دار فخامة المقتنيات الفاخرة
            </span>
          </h1>

          {/* Subtitle description */}
          <p className="mt-4 sm:mt-6 text-xs sm:text-base text-neutral-400 max-w-2xl font-medium leading-relaxed">
            مجموعة ملكية من الساعات النادرة، الأزياء الاستثنائية، والأنظمة الصوتية المصنوعة بدقة متناهية لأصحاب الذوق الأصيل.
          </p>

          {/* Call-to-action button */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/products">
              <button
                type="button"
                className="px-8 py-3.5 sm:px-10 sm:py-4 rounded-full bg-[#00E676] hover:bg-[#00c853] text-[#021811] active:scale-95 transition-all font-black text-xs sm:text-sm shadow-[0_0_35px_rgba(0,230,118,0.4)] cursor-pointer inline-flex items-center gap-2.5 group"
              >
                <span>تصفح كافة المقتنيات</span>
                <ChevronLeft className="w-4 h-4 text-[#021811] transition-transform group-hover:-translate-x-1" />
              </button>
            </Link>
          </div>

          {/* Trust Guarantees Bar */}
          <div className="mt-10 pt-8 border-t border-white/10 w-full max-w-3xl flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-bold text-white">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>أصالة معتمدة ١٠٠%</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span>شحن مؤمن وسريع</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>ضمان ملكي معتمد</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
