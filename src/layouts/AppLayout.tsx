import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { WifiOff, PhoneCall, CheckCircle2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { MiniCartDrawer } from '../components/cart/MiniCartDrawer';
import { AuthModal } from '../components/auth/AuthModal';
import { FloatingCompareBar } from '../components/compare/FloatingCompareBar';
import { ToastContainer } from '../components/ui/ToastContainer';
import { MaintenanceBanner } from '../components/common/MaintenanceBanner';
import { commerceEventBus } from '../shared/events/commerceEvents';
import { AIConciergeWidget } from '../components/ai/AIConciergeWidget';

export const AppLayout: React.FC = () => {
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showRestored, setShowRestored] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  const updateQueueCount = () => {
    try {
      const saved = localStorage.getItem('commerce_sync_queue');
      if (saved) {
        const parsed = JSON.parse(saved);
        setQueueCount(Array.isArray(parsed) ? parsed.length : 0);
      } else {
        setQueueCount(0);
      }
    } catch (e) {
      setQueueCount(0);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      updateQueueCount();
      setTimeout(() => setShowRestored(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateQueueCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Poll queue status
    updateQueueCount();
    const interval = setInterval(updateQueueCount, 3000);

    const unsubQueued = commerceEventBus.subscribe('OFFLINE_UPDATE_QUEUED', () => {
      updateQueueCount();
    });

    const unsubCompleted = commerceEventBus.subscribe('OFFLINE_SYNC_COMPLETED', () => {
      setQueueCount(0);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      unsubQueued();
      unsubCompleted();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#18181B] antialiased selection:bg-[#C5A880]/20 selection:text-[#18181B] font-alexandria" dir="rtl">
      {/* Dynamic Network Banners */}
      {!isOnline && (
        <div className="bg-amber-500 text-stone-950 px-4 py-3 text-xs sm:text-sm font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 text-center border-b border-amber-600 animate-fade-in z-50">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-stone-900" />
            <span>
              أنت تتصفح الآن في <strong>وضع عدم الاتصال</strong>. يمكنك مواصلة التسوق وتأكيد طلبك، وسيقوم النظام بحفظه ومزامنته تلقائياً فور عودة الاتصال.
              {queueCount > 0 && (
                <span className="bg-stone-900 text-amber-400 px-1.5 py-0.5 rounded-md font-bold mx-1 inline-block">
                  ({queueCount} عمليات معلقة في الانتظار)
                </span>
              )}
            </span>
          </div>
          <a
            href="https://wa.me/966500000000?text=أريد%20إتمام%20طلبي%20من%20متجر%20فخامة"
            target="_blank"
            referrerPolicy="no-referrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-950 hover:bg-stone-900 text-amber-400 hover:text-amber-300 font-bold rounded-lg transition-all text-xs shrink-0 select-none cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            الاتصال بالكونسيرج الخاص
          </a>
        </div>
      )}

      {showRestored && (
        <div className="bg-[#00875A] text-white px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-center border-b border-[#00704a] animate-fade-in z-50">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>تمت استعادة الاتصال بنجاح ومزامنة كافة عمليات السلة والطلبات المعلقة!</span>
        </div>
      )}

      <MaintenanceBanner />
      <Header />
      <main className="flex-1 w-full p-0 m-0">
        <Outlet />
      </main>
      <Footer />

      {/* Global Modals, Drawers, and Toasts */}
      <MiniCartDrawer />
      <AuthModal />
      <FloatingCompareBar />
      <ToastContainer />
      <AIConciergeWidget />
    </div>
  );
};
