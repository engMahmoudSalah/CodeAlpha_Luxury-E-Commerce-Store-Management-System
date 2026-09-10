import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  CheckCheck,
  ChevronDown,
  Plus,
  ExternalLink,
  Shield,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../../context/AuthContext';
import { AdminButton } from '../ui/AdminButton';

export const AdminHeader: React.FC = () => {
  const { logout } = useAuth();
  const {
    setMobileSidebarOpen,
    setCommandPaletteOpen,
    currentUser,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useAdmin();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#E8E3D8] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-all select-none">
      {/* Left side (Mobile Menu Button + Global Search Bar) */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 -mr-2 text-[#5A5852] hover:text-[#181818] hover:bg-[#F3EFE6] rounded-xl lg:hidden focus:outline-none"
          aria-label="فتح القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Button Trigger */}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full max-w-md flex items-center justify-between px-3.5 py-2 bg-[#FAF8F3] hover:bg-[#F3EFE6] text-[#6B6860] hover:text-[#181818] border border-[#E8E3D8] rounded-xl text-xs transition-colors cursor-pointer text-right group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#9E9A90] group-hover:text-[#00875A] transition-colors" />
            <span className="truncate">بحث سريع في المنصة...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-[#E8E3D8] rounded text-[#6B6860] font-mono">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right side Actions (Store Link, New Product, Notifications, Profile) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Product Button */}
        <Link to="/admin/products/new" className="hidden sm:inline-block">
          <AdminButton
            variant="primary"
            size="sm"
            icon={Plus}
          >
            إضافة منتج
          </AdminButton>
        </Link>

        {/* Store Preview Link */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-[#5A5852] hover:text-[#00875A] hover:bg-[#F3EFE6] rounded-xl transition-colors hidden md:flex items-center gap-1.5 text-xs font-semibold"
          title="معاينة المتجر للعملاء"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden lg:inline">عرض المتجر</span>
        </Link>

        <div className="h-6 w-[1px] bg-[#E8E3D8] hidden sm:block mx-1" />

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="p-2 text-[#5A5852] hover:text-[#181818] hover:bg-[#F3EFE6] rounded-xl relative transition-colors focus:outline-none"
            aria-label="التنبيهات والإشعارات"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00875A] ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Popover */}
          {notificationsOpen && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E8E3D8] shadow-xl z-50 overflow-hidden animate-fadeIn">
              <div className="p-4 border-b border-[#F0ECE4] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#181818]">الإشعارات</h4>
                  {unreadNotificationsCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 bg-[#E6F4EE] text-[#00875A] rounded-full font-bold">
                      {unreadNotificationsCount} جديد
                    </span>
                  )}
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllNotificationsAsRead()}
                    className="text-[11px] text-[#00875A] hover:underline flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>تحديد الكل كمقروء</span>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#F0ECE4]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#6B6860]">
                    لا توجد إشعارات حالياً
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3.5 hover:bg-[#FAF8F3] transition-colors cursor-pointer ${
                        !notif.read ? 'bg-[#F9F7F1]/80' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-[#181818]">
                          {notif.title}
                        </h5>
                        <span className="text-[10px] text-[#9E9A90] shrink-0">
                          {notif.createdAt}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B6860] mt-1 leading-snug">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-[#FAF8F3] border-t border-[#F0ECE4] text-center">
                <Link
                  to="/admin/orders"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-bold text-[#00875A] hover:underline"
                >
                  عرض جميع الطلبات والتنبيهات
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 pl-2.5 hover:bg-[#F3EFE6] rounded-xl transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#00875A] text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUser?.name?.charAt(0) || 'أ'
              )}
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#181818] leading-none">
                {currentUser?.name || 'المدير العام'}
              </p>
              <span className="text-[10px] text-[#00875A] font-semibold">
                مسؤول النظام
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#9E9A90]" />
          </button>

          {/* Profile Dropdown Popover */}
          {profileOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl border border-[#E8E3D8] shadow-xl z-50 overflow-hidden py-1.5 animate-fadeIn">
              <div className="px-4 py-3 border-b border-[#F0ECE4]">
                <p className="text-xs font-bold text-[#181818]">
                  {currentUser?.name || 'عبدالله السعدون'}
                </p>
                <p className="text-[11px] text-[#6B6860] truncate mt-0.5">
                  {currentUser?.email || 'admin@fakhama.sa'}
                </p>
              </div>

              <div className="py-1">
                <Link
                  to="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#181818] hover:bg-[#F3EFE6] transition-colors"
                >
                  <Shield className="w-4 h-4 text-[#6B6860]" />
                  <span>إعدادات الحساب</span>
                </Link>
                <Link
                  to="/account"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#181818] hover:bg-[#F3EFE6] transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-[#6B6860]" />
                  <span>حساب المتجر</span>
                </Link>
              </div>

              <div className="border-t border-[#F0ECE4] pt-1">
                <Link
                  to="/"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#5A5852] hover:bg-[#F3EFE6] transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-[#6B6860]" />
                  <span>العودة للمتجر</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-right font-bold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج من الإدارة</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
