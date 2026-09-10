import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  TicketPercent,
  Settings,
  Boxes,
  Layers,
  Star,
  Megaphone,
  LayoutTemplate,
  Image as ImageIcon,
  BarChart3,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  Plus
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { AdminModal } from '../ui/AdminModal';

interface QuickAction {
  id: string;
  title: string;
  category: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'dash', title: 'لوحة التحكم الرئيسية', category: 'الرئيسية', path: '/admin', icon: Sparkles },
  { id: 'add_prod', title: 'إضافة منتج جديد', category: 'المنتجات', path: '/admin/products/new', icon: Plus, shortcut: 'P' },
  { id: 'all_prod', title: 'كتالوج المنتجات', category: 'المنتجات', path: '/admin/products', icon: Package },
  { id: 'categories', title: 'التصنيفات والفئات', category: 'الكتالوج', path: '/admin/categories', icon: FolderTree },
  { id: 'collections', title: 'المجموعات الملكية', category: 'الكتالوج', path: '/admin/collections', icon: Layers },
  { id: 'inventory', title: 'المخزون والمستودعات', category: 'المستودع', path: '/admin/inventory', icon: Boxes },
  { id: 'orders', title: 'إدارة الطلبات والشحن', category: 'المبيعات', path: '/admin/orders', icon: ShoppingBag, shortcut: 'O' },
  { id: 'abandoned', title: 'السلات المتروكة واستردادها', category: 'المبيعات', path: '/admin/abandoned-carts', icon: ShoppingCart },
  { id: 'returns', title: 'طلبات الإرجاع والاستبدال', category: 'المبيعات', path: '/admin/returns', icon: RotateCcw },
  { id: 'customers', title: 'قاعدة بيانات العملاء والـ VIP', category: 'العملاء', path: '/admin/customers', icon: Users, shortcut: 'C' },
  { id: 'reviews', title: 'مراجعات وتقييمات العملاء', category: 'العملاء', path: '/admin/reviews', icon: Star },
  { id: 'coupons', title: 'قسائم التخفيض والعروض', category: 'التسويق', path: '/admin/coupons', icon: TicketPercent },
  { id: 'promotions', title: 'الحملات الإعلانية والبنرات', category: 'التسويق', path: '/admin/promotions', icon: Megaphone },
  { id: 'homepage', title: 'منسق الصفحة الرئيسية', category: 'المحتوى', path: '/admin/homepage', icon: LayoutTemplate },
  { id: 'media', title: 'مكتبة الوسائط والصور', category: 'المحتوى', path: '/admin/media', icon: ImageIcon },
  { id: 'analytics', title: 'التقارير والتحليلات المالية', category: 'التقارير', path: '/admin/analytics', icon: BarChart3 },
  { id: 'settings', title: 'إعدادات المتجر والضرائب', category: 'النظام', path: '/admin/settings', icon: Settings },
];

export const AdminCommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen } = useAdmin();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery('');
    }
  }, [commandPaletteOpen]);

  const filtered = QUICK_ACTIONS.filter(
    (action) =>
      action.title.toLowerCase().includes(query.toLowerCase()) ||
      action.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    setCommandPaletteOpen(false);
    navigate(path);
  };

  return (
    <AdminModal
      isOpen={commandPaletteOpen}
      onClose={() => setCommandPaletteOpen(false)}
      size="md"
      showCloseButton={false}
    >
      <div className="-m-6" dir="rtl">
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E8E3D8] bg-[#FAF8F3]">
          <Search className="w-5 h-5 text-[#9E9A90] ml-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن صفحة، منتج، طلب، أو إعداد إداري..."
            className="w-full bg-transparent border-none text-xs sm:text-sm text-[#181818] placeholder-[#9E9A90] focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] bg-white border border-[#E8E3D8] rounded text-[#6B6860] font-mono shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6B6860]">
              لم يتم العثور على نتائج تطابق "{query}"
            </div>
          ) : (
            filtered.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleSelect(action.path)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F3EFE6] text-right transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E3D8] flex items-center justify-center text-[#00875A] group-hover:bg-[#00875A] group-hover:text-white transition-colors shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#181818] group-hover:text-[#00875A] transition-colors">
                        {action.title}
                      </p>
                      <p className="text-[10px] text-[#9E9A90]">
                        {action.category}
                      </p>
                    </div>
                  </div>

                  {action.shortcut && (
                    <kbd className="text-[10px] px-1.5 py-0.5 bg-[#FAF8F3] border border-[#E8E3D8] rounded text-[#6B6860] font-mono">
                      {action.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2.5 bg-[#FAF8F3] border-t border-[#E8E3D8] text-[11px] text-[#6B6860] flex items-center justify-between">
          <span>انقر على أي أمر للانتقال السريع</span>
          <span className="font-mono">⌘K / Ctrl+K</span>
        </div>
      </div>
    </AdminModal>
  );
};
