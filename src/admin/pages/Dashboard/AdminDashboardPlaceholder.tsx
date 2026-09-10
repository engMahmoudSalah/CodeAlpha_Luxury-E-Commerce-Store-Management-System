import React from 'react';
import { Sparkles, Layers, Package, ShoppingBag, Users, CheckCircle2 } from 'lucide-react';
import { AdminPageHeader } from '../../components/layout/AdminPageHeader';
import { AdminCard } from '../../components/ui/AdminCard';
import { AdminBadge } from '../../components/ui/AdminBadge';
import { AdminButton } from '../../components/ui/AdminButton';

export const AdminDashboardPlaceholder: React.FC = () => {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="لوحة التحكم"
        subtitle="مرحباً بك في لوحة إدارة مقتنيات فخامة — الهيكل الأساسي للواجهة جاهز للعمل"
        badge={<AdminBadge variant="primary">المرحلة 0: التأسيس المعماري</AdminBadge>}
        actions={
          <AdminButton
            variant="outline"
            size="sm"
            icon={Sparkles}
          >
            نظام الإدارة جاهز
          </AdminButton>
        }
      />

      {/* Overview Status Card */}
      <AdminCard
        title="حالة معمارية الواجهة (Admin Frontend Architecture)"
        subtitle="تم تجهيز الهيكل البرمجي، نظام الـ Layout، القوائم التفاعلية، ونظام التصميم الموحد"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E8E3D8] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F4EE] text-[#00875A] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#6B6860]">الهيكل ونظام التوجيه</p>
              <p className="text-sm font-bold text-[#181818] mt-0.5">جاهز ومتكامل</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E8E3D8] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F4EE] text-[#00875A] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#6B6860]">عقود البيانات والـ Types</p>
              <p className="text-sm font-bold text-[#181818] mt-0.5">Backend-Ready</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E8E3D8] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F4EE] text-[#00875A] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#6B6860]">القوائم والبحث السريع</p>
              <p className="text-sm font-bold text-[#181818] mt-0.5">⌘K Command Palette</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E8E3D8] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F4EE] text-[#00875A] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#6B6860]">مكونات التصميم</p>
              <p className="text-sm font-bold text-[#181818] mt-0.5">Fakhama Tokens</p>
            </div>
          </div>
        </div>
      </AdminCard>
    </div>
  );
};
