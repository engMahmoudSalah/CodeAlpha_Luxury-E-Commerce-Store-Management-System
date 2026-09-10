import React, { useState, useEffect } from 'react';
import {
  LayoutTemplate,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Save,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Layers,
  Award,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { commerceStore } from '../../../shared/store/commerceStore';
import { commerceEventBus } from '../../../shared/events/commerceEvents';
import { HomepageSection } from '../../../shared/types/commerce';

export const AdminHomepageBuilderPage: React.FC = () => {
  const [sections, setSections] = useState<HomepageSection[]>(() => commerceStore.getHomepageSections());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSections(commerceStore.getHomepageSections());
    const unsub = commerceEventBus.subscribe('HOMEPAGE_UPDATED', (updatedSections) => {
      if (Array.isArray(updatedSections)) {
        setSections(updatedSections);
      }
    });
    return () => unsub();
  }, []);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...sections];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    setSections(copy);
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const copy = [...sections];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    setSections(copy);
  };

  const handleSave = () => {
    commerceStore.updateHomepageSections(sections);
    setToastMessage('تم تحديث ترتيب وتنسيق الصفحة الرئيسية وحفظها بنجاح');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#00875A] text-white px-4 py-3 rounded-xl shadow-xl text-sm animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>لوحة التحكم</span>
            <span>/</span>
            <span className="text-amber-700 font-semibold">إدارة الصفحة الرئيسية</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2 tracking-tight">
            <LayoutTemplate className="w-7 h-7 text-amber-600" />
            منسق الواجهة والصفحة الرئيسية
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            التحكم في ترتيب الأقسام، بنرات الإطلاق، وإبراز المجموعات الملكية
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-xs transition-all active:scale-98 text-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          حفظ الترتيب والتنسيق
        </button>
      </div>

      {/* Layout Sections List */}
      <div className="space-y-3">
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
              sec.enabled
                ? 'bg-white dark:bg-stone-900 border-[#E8E3D8] dark:border-stone-800 shadow-xs'
                : 'bg-[#FAF8F3] dark:bg-stone-900/40 border-[#E8E3D8] dark:border-stone-800/60 opacity-60'
            }`}
          >
            {/* Left Info & Reorder Controls */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1 rounded hover:bg-[#F2EFE8] dark:hover:bg-stone-800 text-[#9E9A90] hover:text-[#181818] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === sections.length - 1}
                  className="p-1 rounded hover:bg-[#F2EFE8] dark:hover:bg-stone-800 text-[#9E9A90] hover:text-[#181818] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#F2EFE8] dark:bg-stone-800 flex items-center justify-center text-[#181818] dark:text-stone-300 font-black text-sm">
                0{idx + 1}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#181818] dark:text-white">
                    {sec.title}
                  </h3>
                  {sec.itemCount && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#F2EFE8] dark:bg-stone-800 text-[#5A5852] dark:text-stone-400">
                      {sec.itemCount} عناصر
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B6860] dark:text-stone-400 mt-0.5">
                  {sec.subtitle}
                </p>
              </div>
            </div>

            {/* Right Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleSection(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sec.enabled
                    ? 'bg-[#00875A]/10 text-[#00875A] border border-[#00875A]/20'
                    : 'bg-[#F2EFE8] dark:bg-stone-800 text-[#6B6860]'
                }`}
              >
                {sec.enabled ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>ظاهر</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>مخفي</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badges Configuration Box */}
      <div className="bg-white dark:bg-stone-900 border border-[#E8E3D8] dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#181818] dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          شريط الضمانات والمزايا الملكية (VIP Perks)
        </h3>
        <p className="text-xs text-[#6B6860]">
          المزايا المعروضة أسفل السلايدر لتعزيز ثقة عملاء النخبة
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#FAF8F3] dark:bg-stone-800/50 border border-[#E8E3D8] dark:border-stone-800 flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-[#00875A] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[#181818] dark:text-white">ضمان أصالة ملكي</h4>
              <p className="text-[11px] text-[#6B6860] mt-0.5">شهادة منشأ موثقة وضمان عالمي مدى الحياة</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F3] dark:bg-stone-800/50 border border-[#E8E3D8] dark:border-stone-800 flex items-start gap-3">
            <Truck className="w-6 h-6 text-[#00875A] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[#181818] dark:text-white">شحن مصفح ومؤمن</h4>
              <p className="text-[11px] text-[#6B6860] mt-0.5">توصيل فاخر ومؤمن بالكامل حتى باب القصر</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F3] dark:bg-stone-800/50 border border-[#E8E3D8] dark:border-stone-800 flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[#181818] dark:text-white">كونسيرج خاص</h4>
              <p className="text-[11px] text-[#6B6860] mt-0.5">مستشار تسوق شخصي متاح على مدار الساعة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
