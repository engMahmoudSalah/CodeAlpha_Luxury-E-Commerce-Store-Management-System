import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Check, ShieldCheck, Mail, Crown } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const VipClubSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setIsSubscribed(true);
      showToast('أهلاً بك في نادي فخامة الملكي. تم تسجيل اشتراكك بنجاح.', 'success');
      setEmail('');
    }
  };

  return (
    <section className="w-full py-12 sm:py-20 bg-[#FAF8F3] font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Luxury VIP Invitation Card */}
        <div className="relative rounded-[36px] sm:rounded-[48px] bg-radial from-[#04281C] via-[#021811] to-[#010D09] text-white p-8 sm:p-12 lg:p-16 border border-[#083827] shadow-2xl overflow-hidden text-center flex flex-col items-center justify-center">
          
          {/* Ambient Lighting Accents */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#00E676]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#FFC700]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Crown Icon / Badge */}
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-[#FFC700] mb-5 shadow-lg">
            <Crown className="w-7 h-7" />
          </div>

          <div className="relative z-10 inline-flex items-center gap-1.5 text-xs font-black text-[#00E676] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>عضوية نادي فخامة الخاصة • PRIVATE LUXE CLUB</span>
          </div>

          <h2 className="relative z-10 text-2xl sm:text-4xl lg:text-5xl font-black text-white max-w-2xl leading-[1.25] tracking-tight">
            كن أول من يقتني الإصدارات الحصرية والقطع النادرة
          </h2>

          <p className="relative z-10 text-xs sm:text-sm lg:text-base text-neutral-300 max-w-xl mt-4 mb-8 leading-relaxed font-medium">
            انضم إلى نخبة أعضاء دار فخامة واستمتع بأولوية الحجز في المجموعات المحدودة، دعوات المعارض الخاصة، واستشارات الاقتناء المجانية.
          </p>

          {/* Email Subscription Form */}
          <form
            onSubmit={handleSubscribe}
            className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md"
          >
            <div className="relative w-full">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني للانضمام..."
                className="w-full h-12 sm:h-13 bg-white/10 border border-white/20 rounded-full px-5 pr-12 text-xs sm:text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-[#00E676] focus:bg-white/15 transition-all text-right font-medium backdrop-blur-md"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute right-4.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto h-12 sm:h-13 px-8 rounded-full bg-white text-[#021811] hover:bg-[#FAF8F3] active:scale-95 text-xs sm:text-sm font-black transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2 shrink-0 group"
            >
              <span>{isSubscribed ? 'تم الانضمام ✓' : 'انضم الآن'}</span>
              {isSubscribed ? (
                <Check className="w-4 h-4 text-[#00875A]" />
              ) : (
                <ArrowLeft className="w-4 h-4 text-[#00875A] transition-transform group-hover:-translate-x-1" />
              )}
            </button>
          </form>

          {/* Privacy and Trust note */}
          <div className="relative z-10 mt-6 flex items-center justify-center gap-2 text-[11px] text-neutral-400 font-medium select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
            <span>نحترم خصوصيتك بالكامل • لا نرسل رسائل غير مرغوب فيها</span>
          </div>

        </div>

      </div>
    </section>
  );
};
