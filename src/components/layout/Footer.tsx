import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, CreditCard, Award, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { commerceStore } from '../../shared/store/commerceStore';
import { commerceEventBus } from '../../shared/events/commerceEvents';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [categories, setCategories] = useState(() => commerceStore.getCategories());
  const [settings, setSettings] = useState(() => commerceStore.getStoreSettings());
  const { showToast } = useToast();

  useEffect(() => {
    const unsubCat = commerceEventBus.subscribe('CATEGORY_CREATED', () => {
      setCategories(commerceStore.getCategories());
    });
    const unsubCatUp = commerceEventBus.subscribe('CATEGORY_UPDATED', () => {
      setCategories(commerceStore.getCategories());
    });
    const unsubCatDel = commerceEventBus.subscribe('CATEGORY_DELETED', () => {
      setCategories(commerceStore.getCategories());
    });
    const unsubSet = commerceEventBus.subscribe('SETTINGS_UPDATED', (newSet) => {
      setSettings(newSet);
    });

    return () => {
      unsubCat();
      unsubCatUp();
      unsubCatDel();
      unsubSet();
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      const res = commerceStore.addNewsletterSubscriber(email);
      if (res) {
        setIsSubscribed(true);
        showToast('تم انضمامك إلى مجتمع فخامة للمقتنيات بنجاح.', 'success');
        setEmail('');
      } else {
        showToast('أنت مشترك بالفعل في نشرتنا البريدية.', 'info');
      }
    }
  };

  return (
    <footer className="w-full bg-[#121212] border-t border-[#262626] text-white text-xs mt-auto font-arabic" dir="rtl">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-[#00704A] bg-[#00875A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-[#FFC700] shrink-0">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">أصالة معتمدة 100%</p>
              <p className="text-[11px] text-white/80 mt-0.5">منتجات ومقتنيات رسمية موثقة</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-[#FFC700] shrink-0">
              <Lock className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">دفع مشفر وآمن</p>
              <p className="text-[11px] text-white/80 mt-0.5">معالجة فورية عبر بروتوكولات بنكية</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-[#FFC700] shrink-0">
              <CreditCard className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">خيارات دفع متنوعة</p>
              <p className="text-[11px] text-white/80 mt-0.5">مدى، أبل باي، فيزا، ماستركارد</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-[#FFC700] shrink-0">
              <Award className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">ضمان ذهبي سنتين</p>
              <p className="text-[11px] text-white/80 mt-0.5">صيانة معتمدة واستبدال فوري</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links & VIP Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Description & Newsletter */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-arabic flex items-center gap-1.5">
              {settings?.storeName || 'فخامة'} <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#00875A] text-white">لوكس</span>
            </span>
          </Link>
          <p className="text-neutral-400 leading-relaxed max-w-sm text-xs sm:text-sm">
            {settings?.tagline || 'المنصة الرائدة لاقتناء أحدث الإبداعات الصوتية، الساعات الفاخرة، والتقنيات المختارة بعناية لأصحاب الذوق الرفيع.'}
          </p>

          {/* Legal Compliance Badges (VAT & CR) */}
          {(settings?.vatNumber || settings?.commercialRegister) && (
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-neutral-400 font-mono">
              {settings.vatNumber && (
                <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                  <span className="text-neutral-500 font-sans">الرقم الضريبي:</span>
                  <span className="text-neutral-300 font-bold">{settings.vatNumber}</span>
                </span>
              )}
              {settings.commercialRegister && (
                <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                  <span className="text-neutral-500 font-sans">سجل تجاري:</span>
                  <span className="text-neutral-300 font-bold">{settings.commercialRegister}</span>
                </span>
              )}
            </div>
          )}

          <div className="mt-2">
            <p className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
              <span>نشرة {settings?.storeName || 'فخامة'} الأسبوعية</span>
              <span className="text-[#FFC700]">✦</span>
            </p>
            <p className="text-[11px] text-neutral-400 mb-3">اشترك لتصلك تحليلات المقتنيات وأحدث العروض الخاصة قبل الجميع.</p>
            <form onSubmit={handleSubscribe} className="flex max-w-md gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني..."
                className="flex-1 bg-[#1A1A1A] border border-[#333333] rounded-full px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00875A]"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-[#00875A] hover:bg-[#00704A] text-white font-bold text-xs rounded-full transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                <span>{isSubscribed ? 'تم الاشتراك' : 'اشتراك'}</span>
                {isSubscribed ? <Check className="w-3.5 h-3.5 text-[#FFC700]" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white tracking-wider text-xs mb-3 pb-1.5 border-b border-[#262626]">المجموعات</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-neutral-400">
            <li><Link to="/products" className="hover:text-[#00875A] transition-colors">جميع المقتنيات</Link></li>
            {categories.slice(0, 4).map((c) => (
              <li key={`footer-cat-${c.id}`}>
                <Link to={`/products?category=${encodeURIComponent(c.name)}`} className="hover:text-[#00875A] transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
            <li><Link to="/compare" className="hover:text-[#00875A] transition-colors">دليل المقارنة</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white tracking-wider text-xs mb-3 pb-1.5 border-b border-[#262626]">خدمات الأعضاء</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-neutral-400">
            <li><Link to="/account" className="hover:text-[#00875A] transition-colors">الملف الشخصي</Link></li>
            <li><Link to="/orders" className="hover:text-[#00875A] transition-colors">طلباتي السابقة</Link></li>
            <li><Link to="/track-order" className="hover:text-[#00875A] transition-colors">تتبع الشحنة المباشر</Link></li>
            <li><Link to="/wishlist" className="hover:text-[#00875A] transition-colors">قائمة الرغبات</Link></li>
            <li><Link to="/cart" className="hover:text-[#00875A] transition-colors">حقيبة التسوق</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white tracking-wider text-xs mb-3 pb-1.5 border-b border-[#262626]">عن المنصة</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-neutral-400">
            <li><Link to="/about" className="hover:text-[#00875A] transition-colors">فلسفة المنصة</Link></li>
            <li><Link to="/faq" className="hover:text-[#00875A] transition-colors">الأسئلة الشائعة وسياسة الشحن</Link></li>
            <li><Link to="/contact" className="hover:text-[#00875A] transition-colors">اتصل بنا والدعم</Link></li>
            <li><Link to="/terms" className="hover:text-[#00875A] transition-colors">الشروط والأحكام والخصوصية</Link></li>
            <li>
              <Link to="/admin" className="text-[#00E676] hover:text-[#FFC700] transition-colors font-bold inline-flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>بوابة المشرفين (Admin Portal)</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[#262626] py-5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500">
        <p>© {new Date().getFullYear()} {settings?.storeName || 'منصة فخامة لوكس'}. جميع الحقوق محفوظة.</p>
        <p className="flex items-center gap-3">
          <Link to="/terms" className="hover:text-neutral-300 transition-colors">الخصوصية والأمان</Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-neutral-300 transition-colors">حقوق الملكية الفكرية</Link>
          <span>•</span>
          <Link to="/faq" className="hover:text-neutral-300 transition-colors">سياسة الضمان</Link>
        </p>
      </div>
    </footer>
  );
};
