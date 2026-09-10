import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, PhoneCall, Mail, MessageCircle } from 'lucide-react';
import { commerceStore } from '../../shared/store/commerceStore';
import { commerceEventBus } from '../../shared/events/commerceEvents';
import { useLocation } from 'react-router-dom';

export const MaintenanceBanner: React.FC = () => {
  const location = useLocation();
  const [settings, setSettings] = useState(() => commerceStore.getStoreSettings());

  useEffect(() => {
    const unsub = commerceEventBus.subscribe('SETTINGS_UPDATED', (newSettings) => {
      setSettings(newSettings);
    });
    return () => unsub();
  }, []);

  // If in admin dashboard or maintenance mode is false, do not show maintenance takeover
  const isAdminRoute = location.pathname.startsWith('/admin');
  if (isAdminRoute || !settings?.maintenanceMode) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-9999 bg-stone-950/95 backdrop-blur-md text-white flex items-center justify-center p-4 sm:p-6 select-none font-arabic"
      dir="rtl"
    >
      <div className="max-w-lg w-full bg-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mx-auto flex items-center justify-center animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold tracking-wider">
            صيانة وتحديث الأنظمة
          </span>
          <h2 className="text-2xl font-black text-white">
            متجر {settings.storeName || 'فخامة'} قيد التحديث الملكي
          </h2>
          <p className="text-sm text-stone-400 leading-relaxed">
            نعمل حالياً على ترقية خوادمنا وتحديث التشكيلات الحصرية لنقدم لكم تجربة اقتناء تليق بذوقكم الرفيع. سنعاود استقبالكم في أقرب وقت.
          </p>
        </div>

        {/* Support contact pill info */}
        <div className="bg-stone-800/80 border border-stone-700/60 rounded-2xl p-4 text-xs space-y-2">
          <div className="font-bold text-stone-300">للحالات العاجلة وتتبع الطلبات المسبقة:</div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-stone-400">
            {settings.contactPhone && (
              <a
                href={`tel:${settings.contactPhone}`}
                className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                <span dir="ltr">{settings.contactPhone}</span>
              </a>
            )}
            {settings.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>{settings.contactEmail}</span>
              </a>
            )}
            {settings.whatsappSupport && (
              <a
                href={`https://wa.me/${settings.whatsappSupport.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors text-emerald-500 font-bold"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>واتساب الكونسيرج</span>
              </a>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs transition-all active:scale-98 cursor-pointer shadow-lg shadow-amber-500/20"
        >
          <RefreshCw className="w-4 h-4" />
          <span>إعادة التحقق من حالة المتجر</span>
        </button>
      </div>
    </div>
  );
};
