import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronLeft, ShieldCheck, Truck, Award, Gift } from 'lucide-react';
import { commerceStore } from '../../shared/store/commerceStore';
import { commerceEventBus } from '../../shared/events/commerceEvents';
import { Promotion } from '../../shared/types/commerce';

// Import visual assets for the models / figures
import blackTshirtGreen from '../../assets/tiles/black_tshirt_green.jpg';
import greyTshirtGreen from '../../assets/tiles/grey_tshirt_green.jpg';
import rackGreen from '../../assets/tiles/rack_green.jpg';
import tshirtsGreen from '../../assets/tiles/tshirts_green.jpg';
import heroMain from '../../assets/images/regenerated_image_1787114260183.jpg';

export const ThmanyahHeroSection: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>(() =>
    commerceStore.getPromotions().filter((p) => p.isActive)
  );

  useEffect(() => {
    const unsub = commerceEventBus.subscribe('PROMOTION_UPDATED', () => {
      setPromotions(commerceStore.getPromotions().filter((p) => p.isActive));
    });
    return () => unsub();
  }, []);

  // Find promotion of type 'hero_slide' or fallback to the first active promo
  const activePromo = promotions.find((p) => p.type === 'hero_slide') || promotions[0];

  const title = activePromo?.title || 'أفضل تجربة تقتني بها أرقى المقتنيات الفاخرة من دار فخامة';
  const subtitle = activePromo?.subtitle || 'إصدارات دار فخامة الرسمية لعام 2026';
  const badgeText = activePromo?.badgeText || 'إصدارات دار فخامة الرسمية لعام 2026';
  const linkUrl = activePromo?.linkUrl || '/products';
  const heroImage = activePromo?.imageUrl || heroMain;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8" dir="rtl">
      {/* Outer Banner Container with Reduced Height and Padding */}
      <div className="rounded-[32px] sm:rounded-[40px] bg-[#021811] text-white relative overflow-hidden border border-[#083827] shadow-2xl min-h-[300px] sm:min-h-[340px] lg:min-h-[360px] flex items-center p-6 sm:p-8 lg:p-10">
        
        {/* LIME GREEN GEOMETRIC ABSTRACT BACKGROUND PATTERNS (Left side in RTL) */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-1/2 pointer-events-none overflow-hidden z-0">
          {/* Top-left quarter circle arc */}
          <div className="absolute -top-12 -left-12 w-48 h-48 sm:w-64 sm:h-64 bg-[#00E676] rounded-tr-full opacity-95" />
          
          {/* Bottom-left diagonal triangle */}
          <div className="absolute bottom-0 left-0 w-56 h-56 sm:w-72 sm:h-72 bg-[#00E676] [clip-path:polygon(0_100%,100%_100%,0_0)] opacity-90" />
          
          {/* Middle geometric sector */}
          <div className="absolute top-1/4 left-32 w-36 h-36 bg-[#00E676] [clip-path:polygon(100%_0,0_100%,100%_100%)] opacity-95" />
        </div>

        {/* 2. MAIN GRID CONTENT */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
          
          {/* LEFT SIDE: 5 MODELS SHOWCASE (Reduced Height to match banner) */}
          <div className="lg:col-span-5 order-2 lg:order-1 relative flex items-end justify-center lg:justify-start h-[180px] sm:h-[220px] lg:h-[260px] pt-2">
            <div className="relative w-full max-w-md flex items-end justify-center gap-1 sm:gap-2">
              
              {/* Model 1 (Outer Left) */}
              <div className="w-1/5 h-[65%] rounded-t-2xl overflow-hidden border border-emerald-900/60 shadow-lg transform -rotate-3 transition-transform hover:scale-105 bg-[#00875A]">
                <img src={tshirtsGreen} alt="طاقم فخامة" className="w-full h-full object-cover object-top" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              </div>

              {/* Model 2 (Inner Left) */}
              <div className="w-1/5 h-[80%] rounded-t-2xl overflow-hidden border border-emerald-800/80 shadow-xl z-10 transform -rotate-1 transition-transform hover:scale-105 bg-[#00875A]">
                <img src={greyTshirtGreen} alt="أزياء فخامة" className="w-full h-full object-cover object-top" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              </div>

              {/* Model 3 (Centerpiece Figure) */}
              <div className="w-1/4 h-[100%] rounded-t-2xl overflow-hidden border-2 border-[#00E676] shadow-2xl z-20 transition-transform hover:scale-105 bg-black">
                <img src={heroImage} alt="فخامة للمقتنيات" className="w-full h-full object-cover object-top" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              </div>

              {/* Model 4 (Inner Right) */}
              <div className="w-1/5 h-[80%] rounded-t-2xl overflow-hidden border border-emerald-800/80 shadow-xl z-10 transform rotate-1 transition-transform hover:scale-105 bg-[#00875A]">
                <img src={blackTshirtGreen} alt="تيشرت فخامة" className="w-full h-full object-cover object-top" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              </div>

              {/* Model 5 (Outer Right) */}
              <div className="w-1/5 h-[65%] rounded-t-2xl overflow-hidden border border-emerald-900/60 shadow-lg transform rotate-3 transition-transform hover:scale-105 bg-[#00875A]">
                <img src={rackGreen} alt="تشكيلة فخامة" className="w-full h-full object-cover object-top" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              </div>

            </div>
          </div>

          {/* RIGHT SIDE: TYPOGRAPHY + PILL BUTTON + PARTNER LOGOS */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center text-right font-arabic">
            
            {/* Elegant Subtitle Badge */}
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-[#00E676] mb-3 select-none">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{badgeText || subtitle}</span>
            </div>

            {/* Giant Headline taking full width of its column */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight w-full max-w-none block">
              {title}
            </h2>

            {/* White Pill Button with arrow icon */}
            <div className="pt-4 sm:pt-5">
              <Link to={linkUrl}>
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-full bg-white text-[#021811] hover:bg-neutral-100 transition-all font-black text-xs sm:text-sm shadow-lg cursor-pointer inline-flex items-center gap-2 group"
                >
                  <span>{activePromo?.ctaText || 'تصفح التشكيلة الحصرية'}</span>
                  <ChevronLeft className="w-4 h-4 text-[#00E676] transition-transform group-hover:-translate-x-1" />
                </button>
              </Link>
            </div>

            {/* Premium Trust Signals for E-commerce Luxury */}
            <div className="pt-8 sm:pt-10 flex flex-wrap items-center justify-start gap-4 text-[10px] sm:text-xs font-bold text-neutral-300 select-none">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00E676]" />
                <span>أصالة معتمدة 100%</span>
              </div>
              <span className="text-emerald-700 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#00E676]" />
                <span>شحن سريع ومؤمن كلياً</span>
              </div>
              <span className="text-emerald-700 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#00E676]" />
                <span>ضمان ذهبي ممتد لسنتين</span>
              </div>
              <span className="text-emerald-700 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#00E676]" />
                <span>تغليف ملكي فاخر ومجاني</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
