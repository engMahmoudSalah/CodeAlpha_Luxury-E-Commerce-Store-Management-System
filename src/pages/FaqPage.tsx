import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles, ShieldCheck, Truck, CreditCard, RotateCcw, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const FaqPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const categories = [
    {
      name: 'الشحن والتوصيل السريع',
      icon: Truck,
      faqs: [
        {
          q: 'كم تستغرق مدة تجهيز وشحن الطلبات داخل المملكة وخارجها؟',
          a: 'تتم معالجة وتجهيز الطلبات المسجلة قبل الساعة 2:00 ظهراً في نفس اليوم. يستغرق التوصيل داخل الرياض والمدن الرئيسية 24 - 48 ساعة، وباقي مناطق المملكة خلال يومين إلى 3 أيام عمل عبر أسطول النخبة المعتمد.'
        },
        {
          q: 'هل الشحن مجاني لجميع الطلبات؟',
          a: 'نعم، يقدم متجر فخامة شحناً سريعاً مجانياً ومؤمناً بالكامل لجميع الطلبات التي تتجاوز قيمتها 500 ريال سعودي، بالإضافة إلى شحن مجاني دائم لأعضاء النخبة VIP.'
        },
        {
          q: 'هل يمكنني تتبع خط سير الشحنة لحظياً بدون تسجيل الدخول؟',
          a: 'نعم بالتأكيد! يمكنك التوجه إلى صفحة تتبع الشحنة وإدخال رقم مرجع الطلب الخاص بك (مثل 1001 أو LX-0042) للاطلاع فوراً على المحطات وموقع المندوب.'
        }
      ]
    },
    {
      name: 'الضمان والأصالة المعتمدة',
      icon: ShieldCheck,
      faqs: [
        {
          q: 'هل جميع المقتنيات أصلية وموثقة بشهادات فحص رسمية؟',
          a: 'جميع مقتنيات فخامة أصلية بنسبة 100% ومستوردة مباشرة من المصانع والدور العريقة، وتأتي مصحوبة بشهادة أصالة ورقم تسلسلي موثق وبطاقة ضمان معتمدة.'
        },
        {
          q: 'ما هي شروط وتفاصيل الضمان الشامل لمدة سنتين (24 شهراً)؟',
          a: 'يشمل الضمان الشامل صيانة وإصلاح واستبدال فوري لأي عيب مصنعي أو فني دون أي تكلفة إضافية على العميل، مع توفير مندوب استلام وتسليم خاص من باب المنزل.'
        }
      ]
    },
    {
      name: 'الدفع والأقساط الميسرة',
      icon: CreditCard,
      faqs: [
        {
          q: 'ما هي وسائل الدفع الإلكترونية المتاحة في المتجر؟',
          a: 'نقبل بطاقات مدى، فيزا، ماستركارد، Apple Pay، والتقسيط على 4 دفعات بدون فوائد عبر تابي وتمارا، بالإضافة إلى الدفع عند الاستلام VIP.'
        },
        {
          q: 'كيف تضمنون حماية وسرية البيانات المصرفية؟',
          a: 'تتم كافة المعاملات عبر بوابات مصرفية معتمدة من البنك المركزي السعودي (SAMA) بتشفير 256-bit SSL فائق الأمان، ولا نقوم بتخزين أي أرقام بطاقات حساسة على خوادمنا.'
        }
      ]
    },
    {
      name: 'الاسترجاع وتجربة الـ 30 يوماً',
      icon: RotateCcw,
      faqs: [
        {
          q: 'ما هي سياسة الاسترجاع وتجربة الـ 30 يوماً الذهبية؟',
          a: 'نمنحك 30 يوماً كاملة لمعاينة مقتنياتك. في حال رغبتك بالاسترجاع لأي سبب، يتكفل المتجر بكافة مصاريف الشحن العكسي مع إعادة كامل المبلغ المدفوع لحسابك فوراً.'
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10 pb-20 font-arabic px-4 sm:px-6" dir="rtl">
      {/* Top Banner */}
      <div className="text-center flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-[#008F68]/10 border border-[#008F68]/20 flex items-center justify-center text-[#008F68] shadow-xs">
          <HelpCircle className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008F68]/10 text-[#008F68] text-xs font-black">
          <Sparkles className="w-3.5 h-3.5" />
          <span>مركز المعرفة والمساعدة الملكي</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#111111] tracking-tight">الأسئلة الشائعة والاستفسارات</h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg leading-relaxed">
          إجابات شاملة ومفصلة حول إجراءات الطلب، بروتوكولات الشحن والتوصيل، شهادات الضمان، وسياسة الاسترجاع السلس.
        </p>
      </div>

      {/* Accordion List grouped by category */}
      <div className="flex flex-col gap-8">
        {categories.map((category, catIdx) => {
          const CategoryIcon = category.icon;
          return (
            <div key={`faq-cat-${category.name}-${catIdx}`} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-black text-[#111111] border-b border-[#E8E3D8] pb-2">
                <CategoryIcon className="w-4 h-4 text-[#008F68]" />
                <span>{category.name}</span>
              </div>

              <div className="flex flex-col gap-3">
                {category.faqs.map((faq, faqIdx) => {
                  const globalIdx = catIdx * 10 + faqIdx;
                  const isOpen = openIdx === globalIdx;

                  return (
                    <div
                      key={`faq-item-${catIdx}-${faqIdx}`}
                      className="rounded-3xl bg-white border border-[#E8E3D8] overflow-hidden shadow-2xs transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIdx(isOpen ? null : globalIdx)}
                        className="w-full p-5 sm:p-6 text-right flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FCFAF7] transition-colors"
                      >
                        <span className="text-xs sm:text-sm font-black text-[#111111] leading-relaxed">
                          {faq.q}
                        </span>
                        <div
                          className={`w-7 h-7 rounded-full bg-[#FAF8F3] border border-[#E8E3D8] flex items-center justify-center text-neutral-500 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 bg-[#008F68] text-white border-[#008F68]' : ''
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-[#F0EAE1] bg-[#FCFAF7]/50 animate-in fade-in duration-200">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Support Contact Box */}
      <div className="p-8 rounded-3xl bg-linear-to-l from-[#008F68] to-[#0A3D2F] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div>
          <h3 className="text-base sm:text-lg font-black">هل لديك استفسار خاص لم تجده هنا؟</h3>
          <p className="text-xs text-white/80 mt-1">مستشارو فخامة متاحون على مدار الساعة لخدمتك والإجابة على تساؤلاتك.</p>
        </div>
        <Link to="/about">
          <Button variant="secondary" size="md" className="bg-white text-[#111111] hover:bg-white/90 border-none">
            تواصل مع مستشار الاقتناء
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default FaqPage;
