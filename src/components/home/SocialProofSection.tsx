import React, { useState } from 'react';
import { StarRating } from '../ui/StarRating';
import { Sparkles, Quote, ChevronLeft, ChevronRight, CheckCircle2, Award } from 'lucide-react';

interface Testimonial {
  id: string;
  author: string;
  city: string;
  rating: number;
  productName: string;
  comment: string;
  date: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    author: 'عبدالرحمن السديري',
    city: 'الرياض',
    rating: 5,
    productName: 'AeroPulse Wireless Headphones',
    comment:
      'نقاء صوت استثنائي وعزل هجين مذهل في السفر والمكتب. التغليف الملكي وسرعة التوصيل تعكس احترافية دار فخامة الحقيقية.',
    date: 'منذ أسبوعين'
  },
  {
    id: 't-2',
    author: 'م. فهد الغامدي',
    city: 'جدة',
    rating: 5,
    productName: 'Horizon Fit Smartwatch Series 5',
    comment:
      'الساعة تجمع بين خامة التيتانيوم الفاخرة والبطارية التي تدوم طويلاً. تجربة شراء راقية تستحق كل التقدير.',
    date: 'منذ 3 أسابيع'
  },
  {
    id: 't-3',
    author: 'سارة المنصور',
    city: 'الخبر',
    rating: 5,
    productName: 'LuxePro Carbon Studio Headphones',
    comment:
      'أفضل استثمار في مساحتي الصوتية. نقاء الترددات وخفة الوزن بفضل ألياف الكربون جعلتني أعتمدها في كل جلسات الاستماع.',
    date: 'منذ شهر'
  },
  {
    id: 't-4',
    author: 'خالد بن ناصر',
    city: 'الدمام',
    rating: 5,
    productName: 'Executive Leather Laptop Sleeve',
    comment:
      'جودة الجلد النباتي والبطانة المخملية تحمي جهازي بأناقة. خدمة عملاء راقية وسرعة في الرد.',
    date: 'منذ شهرين'
  }
];

export const SocialProofSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section className="w-full py-12 sm:py-16 bg-[#FCFAF7] border-t border-[#E8E3D8] font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 pb-5 border-b border-[#E8E3D8]">
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#00875A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ثقة النخبة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#181818] tracking-tight">
              آراء وتجارب مقتني دار فخامة
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5852] max-w-xl">
              شهادات موثقة من عملائنا الذين شاركونا تجربة اقتناء المقتنيات النادرة والخدمة الاستثنائية.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full bg-white border border-[#E8E3D8] hover:border-[#00875A] text-[#181818] hover:text-[#00875A] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              aria-label="الرأي السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full bg-white border border-[#E8E3D8] hover:border-[#00875A] text-[#181818] hover:text-[#00875A] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              aria-label="الرأي التالي"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={`social-proof-${item.id || idx}-${idx}`}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs hover:border-[#00875A]/40 transition-all duration-300 relative group"
            >
              <div className="flex flex-col gap-3">
                {/* Top Quote & Rating */}
                <div className="flex items-center justify-between">
                  <StarRating rating={item.rating} size="sm" />
                  <Quote className="w-5 h-5 text-[#00875A]/25 group-hover:text-[#00875A] transition-colors" />
                </div>

                {/* Comment */}
                <p className="text-xs text-[#181818] leading-relaxed font-medium mt-1">
                  "{item.comment}"
                </p>
              </div>

              {/* Author & Product Purchased */}
              <div className="pt-4 mt-4 border-t border-[#F0EAE1] flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#181818]">{item.author}</span>
                  <span className="text-[10px] text-[#5A5852]">{item.city}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#00875A] font-bold truncate max-w-[150px]">{item.productName}</span>
                  <span className="text-neutral-400 font-mono">{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
