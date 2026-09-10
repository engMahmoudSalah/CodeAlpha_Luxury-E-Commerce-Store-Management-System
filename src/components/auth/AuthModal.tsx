import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mail, Lock, User, Phone, Sparkles, Loader2 } from 'lucide-react';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, openAuthModal, login, loginWithGoogle, register } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const fillDemoUser = () => {
    setLoginEmail('alex@luxestore.com');
    setLoginPassword('demo1234');
    setLoginError(null);
  };

  const handleGoogleAuth = async () => {
    setLoginError(null);
    setRegError(null);
    try {
      setIsGoogleLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      const msg = err.message || 'تعذر استكمال تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.';
      if (authModalTab === 'login') {
        setLoginError(msg);
      } else {
        setRegError(msg);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail || !loginPassword) {
      setLoginError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    try {
      setIsLoggingIn(true);
      await login({ email: loginEmail, password: loginPassword });
    } catch (err: any) {
      setLoginError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات المدخلة أو استخدام Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('يرجى ملء جميع الحقول الإلزامية.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('يجب ألا تقل كلمة المرور عن 6 أحرف أو أرقام.');
      return;
    }

    try {
      setIsRegistering(true);
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim() || undefined
      });
    } catch (err: any) {
      setRegError(err.message || 'فشل إنشاء الحساب. قد يكون هذا البريد مسجلاً مسبقاً.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      maxWidth="md"
      id="auth-modal"
    >
      <div className="flex flex-col gap-5 font-arabic" dir="rtl">
        {/* Modal Header Tabs */}
        <div className="flex items-center justify-center p-1 rounded-full bg-[#FAF8F3] border border-[#E8E3D8] max-w-xs mx-auto">
          <button
            onClick={() => openAuthModal('login')}
            className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
              authModalTab === 'login'
                ? 'bg-[#00875A] text-white shadow-2xs'
                : 'text-[#5A5852] hover:text-[#181818]'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => openAuthModal('register')}
            className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
              authModalTab === 'register'
                ? 'bg-[#00875A] text-white shadow-2xs'
                : 'text-[#5A5852] hover:text-[#181818]'
            }`}
          >
            عضوية جديدة
          </button>
        </div>

        {/* Tab 1: Login */}
        {authModalTab === 'login' ? (
          <div className="flex flex-col gap-4">
            {loginError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold leading-relaxed">
                {loginError}
              </div>
            )}

            {/* Quick Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-[#FAF8F3] border-2 border-[#E8E3D8] hover:border-[#00875A]/40 text-[#181818] font-black text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#00875A]" />
              ) : (
                <GoogleIcon className="w-5 h-5 shrink-0" />
              )}
              <span>المتابعة السريعة بحساب Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="w-full border-t border-[#E8E3D8]" />
              <span className="bg-white px-3 text-[11px] text-[#8C887F] font-bold absolute">
                أو بالبريد الإلكتروني وكلمة المرور
              </span>
            </div>

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
              <Input
                label="البريد الإلكتروني"
                type="email"
                placeholder="name@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                rightIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
                required
              />

              <Input
                label="كلمة المرور"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                rightIcon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
                required
              />

              <div className="flex items-center justify-between mt-1">
                <button
                  type="button"
                  onClick={fillDemoUser}
                  className="inline-flex items-center gap-1.5 text-xs text-[#181818] hover:text-amber-700 font-bold cursor-pointer transition-colors bg-[#FAF8F3] px-3 py-1.5 rounded-full border border-[#E8E3D8]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FFC700]" />
                  تعبئة حساب تجريبي سريع
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoggingIn}
                className="w-full mt-2"
              >
                الدخول إلى المتجر
              </Button>

              <p className="text-xs text-center text-[#5A5852] mt-2 font-medium">
                ليس لديك حساب عضوية بعد؟{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="text-[#181818] underline font-extrabold cursor-pointer"
                >
                  سجل عضويتك الآن
                </button>
              </p>
            </form>
          </div>
        ) : (
          /* Tab 2: Register */
          <div className="flex flex-col gap-4">
            {regError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold leading-relaxed">
                {regError}
              </div>
            )}

            {/* Quick Google Sign Up Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-[#FAF8F3] border-2 border-[#E8E3D8] hover:border-[#00875A]/40 text-[#181818] font-black text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#00875A]" />
              ) : (
                <GoogleIcon className="w-5 h-5 shrink-0" />
              )}
              <span>إنشاء الحساب فوراً بحساب Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="w-full border-t border-[#E8E3D8]" />
              <span className="bg-white px-3 text-[11px] text-[#8C887F] font-bold absolute">
                أو إنشاء حساب بالبريد الإلكتروني
              </span>
            </div>

            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5">
              <Input
                label="الاسم الكامل"
                type="text"
                placeholder="مثال: عبد العزيز المنصور"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                rightIcon={<User className="w-4 h-4" />}
                autoComplete="name"
                required
              />

              <Input
                label="البريد الإلكتروني"
                type="email"
                placeholder="you@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                rightIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
                required
              />

              <Input
                label="رقم الجوال (اختياري)"
                type="tel"
                placeholder="+966 5X XXX XXXX"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                rightIcon={<Phone className="w-4 h-4" />}
                autoComplete="tel"
              />

              <Input
                label="كلمة المرور الجديدة"
                type="password"
                placeholder="6 أحرف على الأقل"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                rightIcon={<Lock className="w-4 h-4" />}
                autoComplete="new-password"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isRegistering}
                className="w-full mt-2"
              >
                إتمام إنشاء الحساب
              </Button>

              <p className="text-xs text-center text-[#5A5852] mt-2 font-medium">
                لديك حساب مسجل بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-[#181818] underline font-extrabold cursor-pointer"
                >
                  تسجيل الدخول
                </button>
              </p>
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
};


