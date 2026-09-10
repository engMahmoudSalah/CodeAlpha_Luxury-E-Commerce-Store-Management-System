import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  ShieldCheck,
  Truck,
  Receipt,
  Save,
  Check,
  Phone,
  Mail,
  MessageCircle,
  AlertTriangle,
  Lock,
  DollarSign,
  BellRing
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminStoreSettings } from '../../types';
import { commerceEventBus } from '../../../shared/events/commerceEvents';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AdminStoreSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'shipping' | 'tax' | 'security'>('general');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStoreSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    const unsub = commerceEventBus.subscribe('SETTINGS_UPDATED', () => {
      fetchSettings();
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSaving(true);
      const updated = await adminService.updateStoreSettings(settings);
      setSettings(updated);
      setToastMessage('تم حفظ وتحديث إعدادات المتجر بنجاح');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-16 text-center text-slate-400">
        جاري تحميل إعدادات المتجر...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#00875A] text-white px-4 py-3 rounded-xl shadow-xl text-sm animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>لوحة التحكم</span>
            <span>/</span>
            <span className="text-amber-700 font-semibold">إعدادات وتهيئة المتجر</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Settings className="w-7 h-7 text-amber-600" />
            إعدادات وتهيئة المتجر
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            إدارة بيانات الهوية، بوابات الدفع والضرائب، وقواعد الشحن والأمان
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-xs transition-all active:scale-98 text-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {saving ? 'جاري الحفظ...' : 'حفظ التعديلات الملكية'}
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-1 overflow-x-auto">
        {[
          { id: 'general', label: 'الهوية والتواصل', icon: Store },
          { id: 'tax', label: 'الضرائب والامتثال المالي', icon: Receipt },
          { id: 'shipping', label: 'الشحن وسياسات التوصيل', icon: Truck },
          { id: 'security', label: 'الأمان وقواعد المتجر', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-500/10 rounded-t-xl'
                  : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <div className="bg-white dark:bg-stone-900 border border-[#E8E3D8] dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-[#181818] dark:text-white border-b border-[#F0ECE4] dark:border-stone-800 pb-3">
              بيانات الهوية وخدمة الكونسيرج الملكية
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1.5">
                  اسم المتجر الرسمي
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1.5">
                  الوصف والشعار التسويقي (Tagline)
                </label>
                <input
                  type="text"
                  value={settings.storeTagline}
                  onChange={(e) => setSettings({ ...settings, storeTagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1.5">
                  البريد الإلكتروني لخدمة العملاء
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9E9A90] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1.5">
                  هاتف الإدارة والمكتب التنفيذي
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#9E9A90] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1.5">
                  رقم واتساب الكونسيرج الفوري
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-emerald-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={settings.whatsappSupport}
                    onChange={(e) => setSettings({ ...settings, whatsappSupport: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Global Top Announcement Bar Setting */}
            <div className="pt-4 border-t border-[#F0ECE4] dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#181818] dark:text-white">
                    شريط الإعلان العلوي للمتجر (Announcement Bar)
                  </h4>
                  <p className="text-xs text-[#5A5852] dark:text-stone-400 mt-0.5">
                    النص الترويجي المعروض في أعلى ترويسة المتجر لجميع الزوار
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.announcementEnabled ?? true}
                    onChange={(e) => setSettings({ ...settings, announcementEnabled: e.target.checked })}
                    className="w-5 h-5 accent-[#00875A] rounded cursor-pointer"
                  />
                </label>
              </div>
              <input
                type="text"
                value={settings.announcementText || ''}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                placeholder="مثال: توصيل ملكي مجاني لجميع الطلبات التي تتجاوز 1,000 ريال مع تغليف هدية فاخر"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Tax & Compliance */}
        {activeTab === 'tax' && (
          <div className="bg-white dark:bg-stone-900 border border-[#E8E3D8] dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-[#181818] dark:text-white border-b border-[#F0ECE4] dark:border-stone-800 pb-3">
              الامتثال للأنظمة والفوترة الضريبية
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1.5">
                  الرقم الضريبي للمنشأة (VAT Number)
                </label>
                <input
                  type="text"
                  value={settings.vatNumber}
                  onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1.5">
                  رقم السجل التجاري (CR)
                </label>
                <input
                  type="text"
                  value={settings.commercialRegister}
                  onChange={(e) => setSettings({ ...settings, commercialRegister: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1.5">
                  نسبة ضريبة القيمة المضافة (%)
                </label>
                <input
                  type="number"
                  value={settings.vatPercentage}
                  onChange={(e) => setSettings({ ...settings, vatPercentage: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1.5">
                  العملة الافتراضية للمتجر
                </label>
                <input
                  type="text"
                  disabled
                  value="ريال سعودي (SAR)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#F2EFE8] dark:bg-stone-800/50 text-sm text-[#6B6860] cursor-not-allowed font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Shipping */}
        {activeTab === 'shipping' && (
          <div className="bg-white dark:bg-stone-900 border border-[#E8E3D8] dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-[#181818] dark:text-white border-b border-[#F0ECE4] dark:border-stone-800 pb-3">
              قواعد الشحن ورسوم التوصيل الملكي
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1.5">
                  الحد الأدنى للشحن المجاني (ر.س)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white font-bold"
                />
                <p className="text-[11px] text-[#6B6860] mt-1">
                  الطلبات فوق هذا المبلغ تحصل تلقائياً على شحن مجاني
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1.5">
                  رسوم الشحن العادي (ر.س)
                </label>
                <input
                  type="number"
                  value={settings.standardShippingFee}
                  onChange={(e) =>
                    setSettings({ ...settings, standardShippingFee: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1.5">
                  رسوم الشحن السريع VIP (ر.س)
                </label>
                <input
                  type="number"
                  value={settings.expressShippingFee}
                  onChange={(e) =>
                    setSettings({ ...settings, expressShippingFee: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Security & Rules */}
        {activeTab === 'security' && (
          <div className="bg-white dark:bg-stone-900 border border-[#E8E3D8] dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-[#181818] dark:text-white border-b border-[#F0ECE4] dark:border-stone-800 pb-3">
              ضوابط الأمان وتنبيهات المستودع
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF8F3] dark:bg-stone-800/40 border border-[#E8E3D8] dark:border-stone-800">
                <div>
                  <div className="text-sm font-bold text-[#181818] dark:text-white">
                    السماح بالطلب السريع كزائر (بدون تسجيل حساب مسبق)
                  </div>
                  <div className="text-xs text-[#6B6860] mt-0.5">
                    تسهيل إتمام الشراء للعملاء المستعجلين مع إمكانية إنشاء حساب تلقائي
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowGuestCheckout}
                  onChange={(e) =>
                    setSettings({ ...settings, allowGuestCheckout: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#00875A] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF8F3] dark:bg-stone-800/40 border border-[#E8E3D8] dark:border-stone-800">
                <div>
                  <div className="text-sm font-bold text-[#181818] dark:text-white">
                    التحقق عبر رمز SMS أو واتساب لتأكيد الطلب
                  </div>
                  <div className="text-xs text-[#6B6860] mt-0.5">
                    إرسال رمز تحقق للرقم للحد من الطلبات الوهمية والتأكد من بيانات المستلم
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requirePhoneVerification}
                  onChange={(e) =>
                    setSettings({ ...settings, requirePhoneVerification: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#00875A] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/20">
                <div>
                  <div className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    وضع الصيانة المؤقت (Maintenance Mode)
                  </div>
                  <div className="text-xs text-[#6B6860] dark:text-stone-400 mt-0.5">
                    إغلاق واجهة المتجر مؤقتاً أمام الزوار وعرض صفحة "تحت التحديث والتطوير"
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    setSettings({ ...settings, maintenanceMode: e.target.checked })
                  }
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#5A5852] dark:text-stone-300 mb-1.5">
                  بريد استلام إشعارات انخفاض المخزون الفوري
                </label>
                <div className="relative">
                  <BellRing className="w-4 h-4 text-[#9E9A90] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={settings.lowStockAlertEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, lowStockAlertEmail: e.target.value })
                    }
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-stone-700 bg-[#FAF8F3] dark:bg-stone-800 text-sm text-[#181818] dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
