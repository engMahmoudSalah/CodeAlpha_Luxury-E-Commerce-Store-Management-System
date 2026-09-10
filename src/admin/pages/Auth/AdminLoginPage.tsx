import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Crown,
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Store
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { user, isAuthenticated, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determine redirect target
  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  // If already logged in as admin, redirect to destination
  useEffect(() => {
    if (isAuthenticated && user) {
      const isAdmin = user.role === 'admin' || user.role === 'super_admin';
      if (isAdmin) {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const authResult = await login({ email: email.trim(), password });
      if (authResult.role !== 'admin' && authResult.role !== 'super_admin') {
        setErrorMessage('هذا الحساب لا يملك صلاحيات إدارية (Access Denied).');
        return;
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Admin login error:', err);
      setErrorMessage(
        err?.message?.includes('auth/invalid-credential') || err?.message?.includes('user-not-found')
          ? 'بيانات الاعتماد غير صحيحة أو ليس لديك ترخيص بالإدارة.'
          : err?.message || 'تعذر تسجيل الدخول. يرجى التأكد من صحة بيانات الاعتماد.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    try {
      const authResult = await loginWithGoogle();
      if (authResult.role !== 'admin' && authResult.role !== 'super_admin') {
        setErrorMessage('حساب Google هذا غير مسجل كمشرف معتمد في المنظومة.');
        return;
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Google Admin login error:', err);
      setErrorMessage(err?.message || 'تعذر تسجيل الدخول عبر Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col justify-between font-arabic relative overflow-hidden" dir="rtl">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00875A]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#FFC700]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-3 text-white group">
          <div className="w-10 h-10 rounded-xl bg-[#00875A] flex items-center justify-center text-white shadow-lg shadow-[#00875A]/25">
            <Crown className="w-5 h-5 text-[#FFC700]" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight block">مقتنيات فخامة</span>
            <span className="text-[10px] text-[#00E676] font-bold tracking-widest uppercase">بوابة الإدارة والأمان</span>
          </div>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs border border-white/10 transition-colors"
        >
          <Store className="w-3.5 h-3.5 text-[#00E676]" />
          <span>العودة للمتجر</span>
        </Link>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-8">
        <div className="w-full max-w-md bg-[#181818] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* Card Top Icon */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#00875A]/20 border border-[#00875A]/40 flex items-center justify-center text-[#00E676] shadow-inner mb-3">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              تسجيل دخول المشرفين المعتمدين
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              وصول حصري ومشفّر للمشرفين عبر Firebase
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Sign In with Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full mb-4 py-3 px-4 bg-white hover:bg-neutral-100 text-[#181818] font-bold text-xs rounded-xl flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            <span>{googleLoading ? 'جاري التحقق عبر Google...' : 'الدخول عبر حساب Google المشرف'}</span>
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#262626]" />
            <span className="text-[11px] text-neutral-500 font-medium">أو عبر بيانات الاعتماد</span>
            <div className="flex-1 h-px bg-[#262626]" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                البريد الإلكتروني المعتمد للإدارة
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fakhama.sa"
                  dir="ltr"
                  className="w-full pl-3 pr-9 py-2.5 bg-[#212121] border border-[#333333] focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] rounded-xl text-xs text-white placeholder-neutral-500 outline-none transition-all text-left"
                  required
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                كلمة المرور المشفرة
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  dir="ltr"
                  className="w-full pl-3 pr-9 py-2.5 bg-[#212121] border border-[#333333] focus:border-[#00875A] focus:ring-1 focus:ring-[#00875A] rounded-xl text-xs text-white placeholder-neutral-500 outline-none transition-all text-left"
                  required
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00875A] hover:bg-[#00704A] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#00875A]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>جاري التحقق والمصادقة...</span>
              ) : (
                <>
                  <span>دخول لوحة التحكم المشفرة</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer System Status */}
      <footer className="p-6 text-center text-xs text-neutral-500 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-[#262626]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Firebase Authentication & Firestore RBAC Active</span>
        </div>
      </footer>
    </div>
  );
};
