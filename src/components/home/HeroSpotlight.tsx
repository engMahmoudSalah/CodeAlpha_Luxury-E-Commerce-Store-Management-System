import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../../types';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Award,
  ArrowUpRight,
  ShoppingBag,
  Eye
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

// Visual assets
import heroMain from '../../assets/images/regenerated_image_1787114260183.jpg';
import blackTshirtGreen from '../../assets/tiles/black_tshirt_green.jpg';
import greyTshirtGreen from '../../assets/tiles/grey_tshirt_green.jpg';
import rackGreen from '../../assets/tiles/rack_green.jpg';
import tshirtsGreen from '../../assets/tiles/tshirts_green.jpg';

interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  highlight: string;
  description: string;
  primaryCta: { label: string; link: string };
  secondaryCta?: { label: string; link: string };
  image: string;
  product?: {
    id: number;
    name: string;
    price: number;
    category: string;
  };
  accentColor: string;
  badgeLabel: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    tag: 'دار فخامة للمقتنيات الفاخرة • إصدار 2026',
    title: 'تجسيد الأناقة الخالدة والدقة الهندسية',
    highlight: 'في كل تفصيل',
    description:
      'ننتقي بعناية استثنائية أندر الأنظمة الصوتية، الساعات الهجينة، والأزياء الراقية لنمنحك تجربة اقتناء تليق بذوقك الرفيع.',
    primaryCta: { label: 'استكشف المجموعات الحصرية', link: '/products' },
    secondaryCta: { label: 'الأكثر مبيعاً', link: '/products?sort=newest' },
    image: heroMain,
    product: {
      id: 1,
      name: 'AeroPulse Wireless Noise-Canceling Headphones',
      price: 199.99,
      category: 'الأنظمة الصوتية'
    },
    accentColor: '#00E676',
    badgeLabel: 'المجموعة الملكية'
  },
  {
    id: 'slide-2',
    tag: 'الأجهزة الصوتية عالية النقاء • Hi-Res Audio',
    title: 'صوت غامر يأخذك إلى قلب الأداء الحي',
    highlight: 'بنقاء لا مثيل له',
    description:
      'سماعات رأس ومكبرات صوت مزودة بمحركات البريليوم المتقدمة وعزل الضوضاء الهجين لتجربة استماع ملكية.',
    primaryCta: { label: 'اكتشف الأنظمة الصوتية', link: '/products?category=Audio' },
    secondaryCta: { label: 'مقارنة الموديلات', link: '/compare' },
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=85',
    product: {
      id: 42,
      name: 'LuxePro Carbon Fiber Studio Headphones',
      price: 299.99,
      category: 'Audio'
    },
    accentColor: '#FFC700',
    badgeLabel: 'إصدار استثنائي'
  },
  {
    id: 'slide-3',
    tag: 'الساعات الفاخرة والتقنيات القابلة للارتداء',
    title: 'ساعات تجمع بين الفخامة الكلاسيكية',
    highlight: 'والذكاء المعاصر',
    description:
      'هيكل من التيتانيوم الممشط وزجاج الياقوت المقاوم للخدش مع مستشعرات صحية متقدمة تدوم لأيام.',
    primaryCta: { label: 'استكشف الساعات', link: '/products?category=Wearables' },
    secondaryCta: { label: 'جميع المقتنيات', link: '/products' },
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=85',
    product: {
      id: 6,
      name: 'Horizon Fit Smartwatch Series 5',
      price: 149.99,
      category: 'Wearables'
    },
    accentColor: '#00E676',
    badgeLabel: 'جديد الموسم'
  }
];

interface HeroSpotlightProps {
  onQuickView?: (product: Product) => void;
  featuredProducts?: Product[];
}

export const HeroSpotlight: React.FC<HeroSpotlightProps> = ({ onQuickView, featuredProducts }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { addToCart } = useCart();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isAutoPlaying) {
      timerRef.current = setInterval(nextSlide, 7000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, nextSlide]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="w-full relative overflow-hidden bg-[#FAF8F3] pt-3 pb-8 sm:pb-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Luxury Hero Card Container */}
        <div 
          className="relative rounded-[32px] sm:rounded-[44px] bg-[#021811] text-white overflow-hidden border border-[#083827] shadow-2xl min-h-[500px] sm:min-h-[540px] lg:min-h-[580px] flex flex-col justify-between"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Subtle Background Glows & Geometry */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Top right emerald flare */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#00875A]/25 rounded-full blur-3xl" />
            {/* Bottom left gold aura */}
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#FFC700]/10 rounded-full blur-3xl" />
            
            {/* Geometric accents in brand green */}
            <div className="absolute top-0 left-0 w-full lg:w-1/2 h-full opacity-40">
              <div className="absolute -top-16 -left-16 w-64 h-64 bg-[#00E676] rounded-tr-full opacity-20" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00875A] [clip-path:polygon(0_100%,100%_100%,0_0)] opacity-15" />
            </div>

            {/* Pattern Grid Overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(#FFFFFF 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            />
          </div>

          {/* Top Info Bar inside Hero */}
          <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-pulse" />
              <span className="text-[11px] sm:text-xs font-black tracking-widest text-[#E8E3D8]/90 font-arabic">
                {slide.tag}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] sm:text-xs font-bold text-[#00E676] bg-[#00E676]/10 px-3 py-1 rounded-full border border-[#00E676]/30">
                {slide.badgeLabel}
              </span>
            </div>
          </div>

          {/* Center Main Stage (Split Layout: Text & Image) */}
          <div className="relative z-10 px-6 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1">
            
            {/* Right Column: Editorial Copy & CTAs */}
            <div className="lg:col-span-7 flex flex-col justify-center text-right font-arabic">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`spotlight-copy-${slide.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="flex flex-col gap-4"
                >
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.2] tracking-tight">
                    <span>{slide.title} </span>
                    <span className="text-[#00E676] drop-shadow-sm">{slide.highlight}</span>
                  </h1>

                  <p className="text-xs sm:text-sm lg:text-base text-neutral-300 leading-relaxed max-w-xl font-medium">
                    {slide.description}
                  </p>

                  {/* Primary & Secondary Action CTAs */}
                  <div className="pt-4 sm:pt-6 flex flex-wrap items-center gap-3 sm:gap-4">
                    <Link to={slide.primaryCta.link}>
                      <button
                        type="button"
                        className="px-7 py-3.5 rounded-full bg-white text-[#021811] hover:bg-[#FAF8F3] active:scale-95 transition-all font-black text-xs sm:text-sm shadow-xl hover:shadow-white/20 cursor-pointer inline-flex items-center gap-2.5 group"
                      >
                        <span>{slide.primaryCta.label}</span>
                        <ChevronLeft className="w-4 h-4 text-[#00875A] transition-transform group-hover:-translate-x-1" />
                      </button>
                    </Link>

                    {slide.secondaryCta && (
                      <Link to={slide.secondaryCta.link}>
                        <button
                          type="button"
                          className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 active:scale-95 transition-all font-bold text-xs sm:text-sm cursor-pointer inline-flex items-center gap-2 backdrop-blur-xs"
                        >
                          <span>{slide.secondaryCta.label}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300" />
                        </button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Left Column: Spotlight Image Showcase & Floating Product Badge */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`spotlight-img-${slide.id}`}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="relative w-full max-w-md aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-radial from-emerald-950/60 to-black group"
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* Gradient bottom overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  {/* Floating Product Quick Snapshot */}
                  {slide.product && (
                    <div className="absolute bottom-4 inset-x-4 p-3.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-between gap-3 shadow-xl">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-[#00E676] font-bold">مقتنى مميز من المعرض</span>
                        <span className="text-xs font-black truncate text-white">{slide.product.name}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs font-bold text-[#FFC700] font-mono">
                            {Number(slide.product?.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link to={`/products/${slide.product.id}`}>
                          <button
                            type="button"
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                            title="عرض التفاصيل الكاملة"
                            aria-label="عرض تفاصيل المقتنى"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <button
                          type="button"
                          onClick={() => slide.product && addToCart(slide.product.id, 1)}
                          className="px-3 py-2 rounded-xl bg-[#00875A] hover:bg-[#007353] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          title="إضافة للحقيبة"
                          aria-label="إضافة للحقيبة"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">اقتنِ</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

          {/* Bottom Bar: Slider Pagination & Trust Guarantees */}
          <div className="relative z-10 p-6 sm:p-8 lg:px-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/20 backdrop-blur-xs">
            
            {/* Slider Navigation & Dots */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prevSlide}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="الشريحة السابقة"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={`spotlight-dot-${s.id}`}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`الانتقال إلى شريحة ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentSlide
                        ? 'w-8 bg-[#00E676]'
                        : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={nextSlide}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="الشريحة التالية"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Mini Guarantees in Hero */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 text-[10px] sm:text-xs font-bold text-neutral-300 select-none">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
                <span>أصالة معتمدة 100%</span>
              </div>
              <span className="text-emerald-800 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#00E676]" />
                <span>توصيل ملكي سريع</span>
              </div>
              <span className="text-emerald-800 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#00E676]" />
                <span>ضمان ذهبي سنتين</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
