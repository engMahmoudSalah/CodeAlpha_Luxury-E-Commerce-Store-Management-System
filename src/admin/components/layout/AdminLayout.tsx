import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminProvider, useAdmin } from '../../context/AdminContext';
import { ToastProvider } from '../../context/ToastContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminCommandPalette } from './AdminCommandPalette';

const AdminLayoutContent: React.FC = () => {
  const { sidebarCollapsed } = useAdmin();

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#181818] font-arabic antialiased selection:bg-[#00875A]/20 selection:text-[#00875A] relative flex" dir="rtl">
      {/* Sidebar Component */}
      <AdminSidebar />

      {/* Main Content Column */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:mr-20' : 'lg:mr-64'
        }`}
      >
        {/* Top Header */}
        <AdminHeader />

        {/* Dynamic Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Admin Footer Bar */}
        <footer className="py-4 px-6 border-t border-[#E8E3D8] bg-white text-xs text-[#9E9A90] flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
          <p>© {new Date().getFullYear()} مقتنيات فخامة — منظومة الإدارة والتجارة الإلكترونية</p>
          <div className="flex items-center gap-4 text-[11px] text-[#6B6860]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              النظام متصل سحابياً مع Firebase & Backend
            </span>
            <span>الإصدار 1.0.0</span>
          </div>
        </footer>
      </div>

      {/* Global Command Search Modal (Cmd+K) */}
      <AdminCommandPalette />
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  return (
    <ToastProvider>
      <AdminProvider>
        <AdminLayoutContent />
      </AdminProvider>
    </ToastProvider>
  );
};
