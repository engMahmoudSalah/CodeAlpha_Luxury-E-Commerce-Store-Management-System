import React, { useState } from 'react';
import { Navigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ShieldAlert, Lock, UserCheck, ArrowRight, LogOut, Store, Crown, Sparkles, CheckCircle2 } from 'lucide-react';
import { Spinner } from '../../../components/ui/Spinner';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useToast } from '../../../context/ToastContext';

export const AdminProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, status, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // 1. Initializing state
  if (status === 'initializing') {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6 gap-4 font-arabic" dir="rtl">
        <div className="w-14 h-14 rounded-2xl bg-[#00875A]/20 border border-[#00875A]/40 flex items-center justify-center text-[#00E676] shadow-lg">
          <Crown className="w-7 h-7 text-[#FFC700]" />
        </div>
        <Spinner size="lg" />
        <p className="text-sm font-semibold text-neutral-400">جاري التحقق المشفر من هوية وصلاحيات المشرف...</p>
      </div>
    );
  }

  // 2. Unauthenticated -> Redirect to /admin/login
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 3. Strict Admin Role Verification
  const isSuperOrAdmin = user.role === 'admin' || user.role === 'super_admin';

  // 4. Authenticated as normal customer (non-admin) -> Access Denied (Strict Zero-Trust)
  if (!isSuperOrAdmin) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-arabic" dir="rtl">
        <div className="w-full max-w-md bg-[#181818] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            تم رفض الوصول (403 Forbidden)
          </h2>
          <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
            الحساب المسجل (<span className="text-white font-medium">{user.email}</span>) لا يملك صلاحيات إدارية في منظومة مقتنيات فخامة. يتطلب الوصول حساباً معتمداً من المالك العام.
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 px-4 bg-[#262626] hover:bg-[#303030] text-neutral-200 hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#383838]"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج والتبديل لحساب مشرف</span>
            </button>

            <Link
              to="/"
              className="block w-full py-2.5 px-4 text-neutral-400 hover:text-white font-medium text-xs rounded-xl transition-colors"
            >
              العودة إلى واجهة المتجر
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 5. Authorized Admin -> render outlet or children
  return children ? <>{children}</> : <Outlet />;
};
