import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronLeft, ShieldCheck, CheckCircle2, Award, ArrowUpRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import heroMain from '../../assets/images/regenerated_image_1787114260183.jpg';

export const EditorialCollectionSection: React.FC = () => {
  const { addToCart } = useCart();

  return (
    <section className="w-full py-12 sm:py-20 bg-[#FAF8F3] font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Editorial Card */}
        <div className="relative rounded-[36px] sm:rounded-[48px] bg-[#121212] text-white overflow-hidden border border-[#262626] shadow-2xl p-6 sm:p-10 lg:p-14">
          
          {/* Subtle Ambient Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00875A]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFC700]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            {/* Right Column: Visual Stage with Layered Elements */}
            <div className="lg:col-span-6 relative flex items-center justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-lg aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden border border-white/15 shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=85"
                  alt="مجموعة فخامة إديت 2026"
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Overlay Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* Floating Craftsmanship Badge */}
                <div className="absolute bottom-5 inset-x-5 p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#00E676] font-bold block">إصدار استثنائي محدود</span>
                    <span className="text-xs sm:text-sm font-black text-white">LuxePro Carbon Acoustic Edition</span>
                  </div>
                  <span className="text-sm font-black text-[#FFC700] font-mono">
                    299.99 <span className="text-[10px] font-bold text-neutral-300">ر.س</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Left Column: Editorial Storytelling & Standards */}
            <div className="lg:col-span-6 flex flex-col gap-6 order-1 lg:order-2 text-right">
              
              <div className="inline-flex items-center gap-2 text-xs font-black text-[#00E676] select-none">
                <Sparkles className="w-4 h-4" />
                <span>THE FAKHAMA EDIT • إصدار الموسم</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.2] tracking-tight">
                حين تلتقي الحرفية اليدوية بالدقة الصوتية المعاصرة
              </h2>

              <p className="text-xs sm:text-sm lg:text-base text-neutral-300 leading-relaxed font-medium">
                في دار فخامة، لا نكتفي بتقديم المنتجات الفاخرة؛ بل نُخضع كل قطعة لاختبارات صارمة تضمن أصالتها الهندسية، جودة خاماتها المصنوعة من التيتانيوم النقي وألياف الكربون، وتناغمها مع نمط حياتك المتفرد.
              </p>

              {/* 3 Pillars of The Fakhama Edit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFC700]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>خامات معتمدة</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">تيتانيوم درجة 5 وكربون فايبر أصلي.</p>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFC700]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>صوت نقي Hi-Res</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">معايرة صوتية دقيقة من بيوت عالمية.</p>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFC700]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ضمان ممتد</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">سنتين من الحماية والصيانة الشاملة.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link to="/products/42">
                  <button
                    type="button"
                    className="px-7 py-3 rounded-full bg-[#00875A] hover:bg-[#007353] text-white font-black text-xs sm:text-sm transition-all shadow-lg hover:shadow-[#00875A]/30 cursor-pointer inline-flex items-center gap-2 group"
                  >
                    <span>اكتشف تفاصيل الإصدار</span>
                    <ChevronLeft className="w-4 h-4 text-white transition-transform group-hover:-translate-x-1" />
                  </button>
                </Link>

                <Link to="/about">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs sm:text-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>فلسفة الاختيار في فخامة</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300" />
                  </button>
                </Link>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
