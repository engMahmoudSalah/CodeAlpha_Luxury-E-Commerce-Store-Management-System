import React from 'react';
import { FileText, ShieldCheck, Scale, Lock, RefreshCw } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-20 text-neutral-600 text-xs leading-relaxed font-arabic px-4 sm:px-6" dir="rtl">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-3 border-b border-[#E8E3D8] pb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#008F68]/10 border border-[#008F68]/20 flex items-center justify-center text-[#008F68] shadow-xs">
          <FileText className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#111111] tracking-tight">
          الشروط والأحكام وسياسة الخصوصية الملكية
        </h1>
        <p className="text-neutral-400">
          آخر تحديث: 2026 • الإرشادات التنظيمية والأمنية المعتمدة لمتجر فخامة
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <section className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-[#008F68] font-black text-sm">
            <Lock className="w-4 h-4" />
            <h2 className="text-[#111111]">١. أمان البيانات وجلسات المستخدم</h2>
          </div>
          <p className="text-neutral-500 leading-relaxed pr-6">
            يلتزم متجر فخامة بحماية بيانات وحسابات العملاء من خلال معايير أمنية صارمة وجلسات مشفرة 256-bit SSL تضمن خصوصية وسرية المعاملات المالية والمقتنيات. لا نقوم بتخزين أي أرقام بطاقات حساسة على خوادمنا.
          </p>
        </section>

        <section className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-[#008F68] font-black text-sm">
            <Scale className="w-4 h-4" />
            <h2 className="text-[#111111]">٢. الأسعار والمعاملات المالية</h2>
          </div>
          <p className="text-neutral-500 leading-relaxed pr-6">
            جميع الأسعار المعروضة في المتجر موضحة بالريال السعودي (ر.س) وتشمل ضريبة القيمة المضافة (15% ZATCA). يتم تفويض المدفوعات بشكل فوري وموثق عبر شبكة المدفوعات الوطنية السعودية وبوابات الدفع المعتمدة.
          </p>
        </section>

        <section className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-[#008F68] font-black text-sm">
            <ShieldCheck className="w-4 h-4" />
            <h2 className="text-[#111111]">٣. شروط الضمان الشامل والأصالة (سنتين)</h2>
          </div>
          <p className="text-neutral-500 leading-relaxed pr-6">
            تخضع كافة الساعات والأجهزة والإلكترونيات لضمان شامل لمدة 24 شهراً من تاريخ الشراء، يغطي الصيانة والإصلاح والاستبدال عند وجود أي عيب مصنعي، مع توفير أسطول استلام خاص من منزل العميل.
          </p>
        </section>

        <section className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-[#008F68] font-black text-sm">
            <RefreshCw className="w-4 h-4" />
            <h2 className="text-[#111111]">٤. سياسة التجربة والاسترجاع الذهبي (٣٠ يوماً)</h2>
          </div>
          <p className="text-neutral-500 leading-relaxed pr-6">
            يحق للعميل استرجاع أو استبدال المقتنيات خلال 30 يوماً من تاريخ الاستلام شريطة أن تكون بحالتها الأصلية وعلبتها المخملية، ويتكفل المتجر بكافة رسوم الشحن وإعادة كامل المبلغ خلال 48 ساعة من استلام الطرد.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
