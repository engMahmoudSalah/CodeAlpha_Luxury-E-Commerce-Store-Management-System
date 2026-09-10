import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ChevronLeft,
  Crown,
  X,
  Store
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ADMIN_NAV_SECTIONS } from '../../constants/navigation';
import { NavItem } from '../../types';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useAdmin();

  // Track expanded parent items
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    products: true,
  });

  const toggleSubMenu = (id: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    if (location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some((child) => location.pathname === child.path);
    }
    return location.pathname.startsWith(item.path);
  };

  const getBadgeClass = (color?: string) => {
    switch (color) {
      case 'green':
        return 'bg-[#E6F4EE] text-[#00875A] border border-[#00875A]/20';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'red':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'blue':
        return 'bg-amber-50 text-amber-800 border border-amber-200';
      default:
        return 'bg-[#F2EFE8] text-[#5A5852] border border-[#E8E3D8]';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 bg-[#181818] text-white flex flex-col transition-all duration-300 ease-in-out border-l border-[#262626] shadow-xl lg:shadow-none
        ${mobileSidebarOpen ? 'translate-x-0 w-72' : 'translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#262626] shrink-0">
          <Link
            to="/admin"
            className="flex items-center gap-3 overflow-hidden focus:outline-none"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-[#00875A] flex items-center justify-center text-white shrink-0 shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight font-arabic text-white">
                  فخامة
                </span>
                <span className="text-[10px] text-[#00E676] font-semibold tracking-wider uppercase">
                  لوحة الإدارة
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="p-2 text-neutral-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 no-scrollbar">
          {ADMIN_NAV_SECTIONS.map((section) => (
            <div key={section.id} className="space-y-1">
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <p className="px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 select-none">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item);
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = openSubMenus[item.id];

                  return (
                    <div key={item.id}>
                      {hasChildren && (!sidebarCollapsed || mobileSidebarOpen) ? (
                        <div>
                          <button
                            type="button"
                            onClick={() => toggleSubMenu(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                              active
                                ? 'bg-[#00875A]/15 text-[#00E676]'
                                : 'text-neutral-300 hover:bg-[#262626] hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                className={`w-4 h-4 shrink-0 transition-colors ${
                                  active
                                    ? 'text-[#00E676]'
                                    : 'text-neutral-400 group-hover:text-white'
                                }`}
                              />
                              <span className="truncate">{item.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.badge && (
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getBadgeClass(
                                    item.badgeColor
                                  )}`}
                                >
                                  {item.badge}
                                </span>
                              )}
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                              ) : (
                                <ChevronLeft className="w-3.5 h-3.5 text-neutral-400" />
                              )}
                            </div>
                          </button>

                          {/* Sub items */}
                          {isExpanded && (
                            <div className="mr-6 mt-1 space-y-1 border-r border-[#303030] pr-2">
                              {item.children!.map((child) => {
                                const childActive = location.pathname === child.path;
                                return (
                                  <Link
                                    key={child.id}
                                    to={child.path}
                                    onClick={() => setMobileSidebarOpen(false)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                      childActive
                                        ? 'bg-[#00875A] text-white font-semibold shadow-sm'
                                        : 'text-neutral-400 hover:text-white hover:bg-[#262626]'
                                    }`}
                                  >
                                    <span className="truncate">{child.title}</span>
                                    {child.badge && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#262626] text-neutral-300">
                                        {child.badge}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={item.path}
                          onClick={() => setMobileSidebarOpen(false)}
                          title={sidebarCollapsed ? item.title : undefined}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                            active
                              ? 'bg-[#00875A] text-white shadow-md shadow-[#00875A]/20'
                              : 'text-neutral-300 hover:bg-[#262626] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                active
                                  ? 'text-white'
                                  : 'text-neutral-400 group-hover:text-white'
                              }`}
                            />
                            {(!sidebarCollapsed || mobileSidebarOpen) && (
                              <span className="truncate">{item.title}</span>
                            )}
                          </div>
                          {(!sidebarCollapsed || mobileSidebarOpen) && item.badge && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                active
                                  ? 'bg-white/20 text-white'
                                  : getBadgeClass(item.badgeColor)
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#262626] shrink-0 space-y-2">
          {/* Customer Store Link */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-[#212121] hover:bg-[#2a2a2a] text-neutral-300 hover:text-white text-xs font-medium transition-colors border border-[#303030]"
            title="معاينة المتجر"
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4 text-[#00E676]" />
              {(!sidebarCollapsed || mobileSidebarOpen) && <span>عرض المتجر</span>}
            </div>
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            )}
          </Link>

          {/* Desktop Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="hidden lg:flex items-center justify-center w-full py-2 text-neutral-400 hover:text-white hover:bg-[#262626] rounded-xl transition-colors text-xs font-medium gap-2"
          >
            {sidebarCollapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <>
                <ChevronRight className="w-4 h-4" />
                <span>تصغير القائمة</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
