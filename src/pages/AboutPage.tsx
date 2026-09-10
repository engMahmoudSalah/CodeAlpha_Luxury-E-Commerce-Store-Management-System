import React from 'react';
import { Sparkles, ShieldCheck, Award, Zap, Crown, CheckCircle2, HeartHandshake, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-12 pb-20 font-arabic px-4 sm:px-6" dir="rtl">
      {/* Hero Section */}
      <section className="text-center flex flex-col items-center gap-4 py-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#008F68]/10 text-[#008F68] text-xs font-black">
          <Sparkles className="w-3.5 h-3.5" />
          <span>عن متجر فخامة • الرؤية والرسالة</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight leading-tight max-w-3xl">
          صياغة معايير الفخامة العصرية والأصالة المعتمدة
        </h1>
        <p className="text-xs sm:text-base text-neutral-500 max-w-2xl leading-relaxed">
          تأسس متجر فخامة ليكون الوجهة الأولى لعشاق التميز، حيث ننتقي بدقة متناهية أندر الساعات الفاخرة، والإلكترونيات الذكية الدقيقة، والملحقات الصوتية الراقية المصممة للباحثين عن الأداء الفائق والذوق الرفيع.
        </p>
      </section>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-7 rounded-3xl bg-white border border-[#E8E3D8] flex flex-col gap-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#008F68]/10 text-[#008F68] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-[#111111]">انتقاء دقيق ومعايير صارمة</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            يتم فحص واختبار كل قطعة ومقتنى عبر بروتوكول هندسي وفيزيائي دقيق لضمان أعلى درجات المتانة والجودة الاستثنائية.
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-white border border-[#E8E3D8] flex flex-col gap-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FFC700]/20 text-amber-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-[#111111]">أصالة موثقة وضمان سنتين</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            جميع المقتنيات تأتي بأرقام تسلسلية موثقة رسمياً مع شهادات أصالة دولية وضمان شامل لمدة 24 شهراً يشمل الاستبدال الفوري.
          </p>
        </div>

        <div className="p-7 rounded-3xl bg-white border border-[#E8E3D8] flex flex-col gap-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#FFC700] flex items-center justify-center">
            <Crown className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-[#111111]">خدمة النخبة وتغليف ملكي</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            تصل مقتنياتك في عبوات مخملية فاخرة محكمة الإغلاق مع بطاقات إهداء مخصصة وشحن سريع مباشر لباب المنزل.
          </p>
        </div>
      </div>

      {/* Brand Values Story */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-1/2">
          <div className="w-full aspect-4/3 rounded-2xl bg-[#FAF8F3] border border-[#E8E3D8] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800"
              alt="Luxe Experience"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-4 text-right">
          <span className="text-xs font-black text-[#008F68] uppercase tracking-wider">تجربة اقتناء لا مثيل لها</span>
          <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
            نحن لا نبيع منتجات، بل نصنع تجارب تدوم لأجيال
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            منذ انطلاقتنا، وضعنا نصب أعيننا إعادة تعريف تجربة التسوق الفاخر في المملكة والشرق الأوسط عبر الجمع بين أحدث تقنيات التجارة الرقمية والخدمة الشخصية الرفيعة.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
              <CheckCircle2 className="w-4 h-4 text-[#008F68]" />
              <span>فحص جودة معتمد 100%</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
              <CheckCircle2 className="w-4 h-4 text-[#008F68]" />
              <span>توصيل VIP سريع ومؤمن</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
              <CheckCircle2 className="w-4 h-4 text-[#008F68]" />
              <span>استرجاع مجاني خلال 30 يوماً</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
              <CheckCircle2 className="w-4 h-4 text-[#008F68]" />
              <span>دعم فني استشاري 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-linear-to-l from-[#008F68] to-[#0A3D2F] text-white text-center flex flex-col items-center gap-4 shadow-md">
        <h2 className="text-2xl sm:text-3xl font-black">استكشف التشكيلة الحصرية</h2>
        <p className="text-xs sm:text-sm text-white/80 max-w-md">
          تصفح المعرض الكامل لمقتنياتنا الملكية واكتشف التجربة الاستثنائية التي تلبي تطلعاتك.
        </p>
        <Link to="/">
          <Button variant="secondary" size="lg" className="bg-white text-[#111111] hover:bg-white/90 border-none mt-2">
            تصفح المعرض الآن
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
