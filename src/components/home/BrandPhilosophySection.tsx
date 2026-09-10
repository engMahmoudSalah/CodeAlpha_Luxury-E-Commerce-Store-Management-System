import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronLeft, ShieldCheck, HeartHandshake, Award, Feather } from 'lucide-react';
import rackGreen from '../../assets/tiles/rack_green.jpg';
import greyTshirtGreen from '../../assets/tiles/grey_tshirt_green.jpg';

export const BrandPhilosophySection: React.FC = () => {
  return (
    <section className="w-full py-12 sm:py-20 bg-[#FAF8F3] border-t border-[#E8E3D8] font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Right Column: Visual Composition with Layered Images */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full max-w-md">
              
              {/* Main Image */}
              <div className="rounded-[32px] overflow-hidden border border-[#E8E3D8] shadow-xl aspect-4/5 bg-white">
                <img
                  src={rackGreen}
                  alt="فلسفة دار فخامة"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Secondary Layered Card */}
              <div className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 w-48 sm:w-56 rounded-2xl overflow-hidden border-2 border-white shadow-2xl aspect-square bg-[#00875A]">
                <img
                  src={greyTshirtGreen}
                  alt="تفاصيل الحرفية"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Stat Badge */}
              <div className="absolute -top-4 -left-4 p-4 rounded-2xl bg-white border border-[#E8E3D8] shadow-lg text-right">
                <span className="text-2xl font-black text-[#181818] block font-mono">4.9 / 5.0</span>
                <span className="text-[10px] font-bold text-[#00875A]">تقييم نخبة المقتنين</span>
              </div>

            </div>
          </div>

          {/* Left Column: Brand Story & Philosophy */}
          <div className="lg:col-span-6 flex flex-col gap-5 text-right">
            
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#00875A]">
              <Feather className="w-4 h-4" />
              <span>فلسفة دار فخامة للمقتنيات</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#181818] leading-[1.25] tracking-tight">
              نحن لا نبيع منتجات عادية، بل نصنع معايير جديدة للاقتناء الراقي
            </h2>

            <p className="text-xs sm:text-sm text-[#5A5852] leading-relaxed">
              تأسست دار فخامة برؤية واضحة: سد الفجوة بين التقنية الحديثة والأناقة الكلاسيكية الخالدة. كل مقتنى متوفر في منصتنا يمر عبر سلسلة فحص دقيقة للجودة، الأصالة، وتجربة الاستخدام المريحة.
            </p>

            {/* 3 Core Brand Commitments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-[#E8E3D8]">
                <ShieldCheck className="w-5 h-5 text-[#00875A] mb-2" />
                <h4 className="text-xs sm:text-sm font-black text-[#181818]">انتقاء حصري وغير مكرر</h4>
                <p className="text-[11px] text-[#5A5852] mt-1">مجموعات مختارة بعناية لأصحاب الذوق النادر.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E8E3D8]">
                <Award className="w-5 h-5 text-[#00875A] mb-2" />
                <h4 className="text-xs sm:text-sm font-black text-[#181818]">خدمة كونسيرج مخصصة</h4>
                <p className="text-[11px] text-[#5A5852] mt-1">متابعة دقيقة لكل طلب مع دعم استشاري فوري.</p>
              </div>
            </div>

            {/* CTA to About */}
            <div className="pt-3">
              <Link to="/about">
                <button
                  type="button"
                  className="px-7 py-3 rounded-full bg-[#181818] hover:bg-[#00875A] text-white text-xs sm:text-sm font-black transition-all shadow-md cursor-pointer inline-flex items-center gap-2 group"
                >
                  <span>اقرأ قصة دار فخامة</span>
                  <ChevronLeft className="w-4 h-4 text-[#00E676] transition-transform group-hover:-translate-x-1" />
                </button>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
