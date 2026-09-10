import React from 'react';
import { ShieldCheck, Truck, Award, RotateCcw, Sparkles } from 'lucide-react';

interface TrustFeatureItem {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

export const TrustFeatures: React.FC = () => {
  const features: TrustFeatureItem[] = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#00875A]" />,
      title: 'أصالة معتمدة 100%',
      subtitle: 'مقتنيات أصلية مباشرة من بيوت التصميم المعتمدة'
    },
    {
      icon: <Truck className="w-5 h-5 text-[#00875A]" />,
      title: 'شحن ملكي مؤمّن وسريع',
      subtitle: 'توصيل مجاني للطلبات فوق 500 ر.س مع تتبع لحظي'
    },
    {
      icon: <Award className="w-5 h-5 text-[#00875A]" />,
      title: 'ضمان ذهبي ممتد لسنتين',
      subtitle: 'تغطية شاملة وصيانة متخصصة واستبدال فوري'
    },
    {
      icon: <RotateCcw className="w-5 h-5 text-[#00875A]" />,
      title: 'استرجاع واستبدال مرن',
      subtitle: 'خدمة كونسيرج مخصصة للإرجاع خلال 14 يوماً'
    }
  ];

  return (
    <section className="w-full py-6 sm:py-8 bg-[#FAF8F3] border-y border-[#E8E3D8]/80 font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((item, index) => (
            <div
              key={`feature-${index}`}
              className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#E8E3D8] shadow-2xs hover:border-[#00875A]/40 transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#00875A]/10 border border-[#00875A]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                {item.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-[#181818] tracking-tight group-hover:text-[#00875A] transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-[#5A5852] mt-0.5 leading-snug truncate">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
