import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  ShoppingBag,
  Boxes,
  TicketPercent,
  Users,
  Settings,
  Sparkles
} from 'lucide-react';
import { AdminCard } from '../../../components/ui/AdminCard';

export const DashboardQuickActions: React.FC = () => {
  const actions = [
    {
      title: 'إضافة منتج جديد',
      desc: 'إدراج تحفة أو مقتنى بالكتالوج',
      path: '/admin/products/new',
      icon: PlusCircle,
      color: 'bg-[#00875A] text-white',
      badge: 'سريع',
    },
    {
      title: 'معالجة الطلبات',
      desc: 'متابعة الشحن والتوصيل',
      path: '/admin/orders',
      icon: ShoppingBag,
      color: 'bg-emerald-50 text-emerald-800',
    },
    {
      title: 'فحص المستودع',
      desc: 'مراقبة الجرد والنواقص',
      path: '/admin/inventory',
      icon: Boxes,
      color: 'bg-amber-50 text-amber-800',
    },
    {
      title: 'إنشاء قسيمة تخفيض',
      desc: 'إطلاق عروض وتخفيضات',
      path: '/admin/coupons',
      icon: TicketPercent,
      color: 'bg-amber-100/60 text-amber-900',
    },
    {
      title: 'قاعدة عملاء VIP',
      desc: 'بيانات ومشتريات العملاء',
      path: '/admin/customers',
      icon: Users,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'إعدادات المتجر',
      desc: 'الضرائب، الشحن والدفع',
      path: '/admin/settings',
      icon: Settings,
      color: 'bg-stone-100 text-stone-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Link
            key={`quick-action-${action.path || index}`}
            to={action.path}
            className="group"
          >
            <AdminCard className="p-3.5 h-full transition-all hover:border-[#00875A] hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${action.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {action.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#E6F4EE] text-[#00875A] rounded-md">
                      {action.badge}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-[#181818] group-hover:text-[#00875A] transition-colors leading-snug">
                  {action.title}
                </h4>
              </div>
              <p className="text-[10px] text-[#9E9A90] mt-1 line-clamp-1">
                {action.desc}
              </p>
            </AdminCard>
          </Link>
        );
      })}
    </div>
  );
};
