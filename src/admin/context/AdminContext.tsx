import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AdminNotification, BreadcrumbItem } from '../types';
import { adminService } from '../services';
import { useAuth } from '../../context/AuthContext';

interface AdminContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean | ((prev: boolean) => boolean)) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (val: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (val: boolean) => void;
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  currentUser: AdminUser | null;
  notifications: AdminNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('fakhama_admin_sidebar_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { label: 'الرئيسية', path: '/admin' },
  ]);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    localStorage.setItem('fakhama_admin_sidebar_collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Sync real Firebase authenticated user with Admin currentUser
  useEffect(() => {
    if (authUser) {
      const email = authUser.email?.trim().toLowerCase() || '';
      const isSuper = authUser.role === 'super_admin' || email.includes('mahmodsalah.2026') || email.includes('mahmodsalah2026');
      
      setCurrentUser({
        id: String(authUser.id),
        name: authUser.name || (isSuper ? 'المالك العام' : 'المشرف الرئيسي'),
        email: authUser.email || '',
        role: isSuper ? 'super_admin' : 'admin',
        status: 'active',
        createdAt: authUser.created_at || '2025-01-01T00:00:00Z',
        avatar: authUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        lastLogin: 'متصل الآن (Firebase Auth)',
      });
    } else {
      setCurrentUser(null);
    }
    adminService.getNotifications().then(setNotifications);
  }, [authUser]);

  // Global keyboard shortcut for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = async (id: string) => {
    await adminService.markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = async () => {
    await adminService.markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AdminContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        commandPaletteOpen,
        setCommandPaletteOpen,
        breadcrumbs,
        setBreadcrumbs,
        currentUser,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
