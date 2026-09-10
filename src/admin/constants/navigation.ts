import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  Layers,
  ShoppingBag,
  ShoppingCart,
  RotateCcw,
  Users,
  Star,
  TicketPercent,
  Megaphone,
  Sparkles,
  LayoutTemplate,
  Image as ImageIcon,
  BarChart3,
  Settings,
  Sliders,
  Bell,
  MessageSquare
} from 'lucide-react';
import { NavSection } from '../types';

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    id: 'core',
    title: 'نظرة عامة',
    items: [
      {
        id: 'dashboard',
        title: 'لوحة التحكم',
        path: '/admin',
        icon: LayoutDashboard,
      },
      {
        id: 'integration-tracker',
        title: 'مؤشر تكامل النظامين',
        path: '/admin/integration-tracker',
        icon: Sparkles,
        badge: 'تفاعلي',
        badgeColor: 'blue',
      },
    ],
  },
  {
    id: 'catalog',
    title: 'الكتالوج والمنتجات',
    items: [
      {
        id: 'products',
        title: 'المنتجات',
        path: '/admin/products',
        icon: Package,
        badge: 50,
        badgeColor: 'neutral',
        children: [
          { id: 'all-products', title: 'جميع المنتجات', path: '/admin/products' },
          { id: 'add-product', title: 'إضافة منتج جديد', path: '/admin/products/new' },
        ],
      },
      {
        id: 'categories',
        title: 'التصنيفات',
        path: '/admin/categories',
        icon: FolderTree,
        badge: 8,
        badgeColor: 'neutral',
      },
      {
        id: 'collections',
        title: 'المجموعات الملكية',
        path: '/admin/collections',
        icon: Layers,
      },
      {
        id: 'inventory',
        title: 'المخزون والمستودع',
        path: '/admin/inventory',
        icon: Boxes,
        badge: '3 منخفض',
        badgeColor: 'amber',
      },
    ],
  },
  {
    id: 'sales',
    title: 'المبيعات والطلبات',
    items: [
      {
        id: 'orders',
        title: 'الطلبات',
        path: '/admin/orders',
        icon: ShoppingBag,
        badge: 'جديد',
        badgeColor: 'green',
      },
      {
        id: 'abandoned-carts',
        title: 'السلات المتروكة',
        path: '/admin/abandoned-carts',
        icon: ShoppingCart,
      },
      {
        id: 'returns',
        title: 'المرتجعات والبدائل',
        path: '/admin/returns',
        icon: RotateCcw,
      },
    ],
  },
  {
    id: 'customers',
    title: 'العملاء والتواصل',
    items: [
      {
        id: 'customers-list',
        title: 'قاعدة العملاء',
        path: '/admin/customers',
        icon: Users,
      },
      {
        id: 'messages',
        title: 'رسائل الدعم',
        path: '/admin/messages',
        icon: MessageSquare,
        badge: 'جديد',
        badgeColor: 'blue',
      },
      {
        id: 'reviews',
        title: 'التقييمات والآراء',
        path: '/admin/reviews',
        icon: Star,
        badge: '4 معلق',
        badgeColor: 'amber',
      },
    ],
  },
  {
    id: 'marketing',
    title: 'التسويق والعروض',
    items: [
      {
        id: 'coupons',
        title: 'قسائم التخفيض',
        path: '/admin/coupons',
        icon: TicketPercent,
      },
      {
        id: 'promotions',
        title: 'الحملات الترويجية',
        path: '/admin/promotions',
        icon: Megaphone,
      },
      {
        id: 'subscribers',
        title: 'النشرة البريدية',
        path: '/admin/subscribers',
        icon: Sparkles,
      },
    ],
  },
  {
    id: 'content',
    title: 'المحتوى والواجهة',
    items: [
      {
        id: 'homepage-builder',
        title: 'إدارة الصفحة الرئيسية',
        path: '/admin/homepage',
        icon: LayoutTemplate,
      },
      {
        id: 'media-library',
        title: 'مكتبة الوسائط',
        path: '/admin/media',
        icon: ImageIcon,
      },
    ],
  },
  {
    id: 'analytics',
    title: 'التحليلات والتقارير',
    items: [
      {
        id: 'analytics-dashboard',
        title: 'التقارير والأداء',
        path: '/admin/analytics',
        icon: BarChart3,
      },
    ],
  },
  {
    id: 'settings',
    title: 'الإعدادات والنظام',
    items: [
      {
        id: 'store-settings',
        title: 'إعدادات المتجر',
        path: '/admin/settings',
        icon: Settings,
      },
    ],
  },
];
