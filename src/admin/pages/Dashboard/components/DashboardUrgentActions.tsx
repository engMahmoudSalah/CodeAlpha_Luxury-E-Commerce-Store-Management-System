import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  RotateCcw,
  ShoppingCart,
  Crown,
  ChevronLeft,
  ArrowUpRight,
  Sparkles,
  Star
} from 'lucide-react';
import { AdminCard } from '../../../components/ui/AdminCard';
import { AdminBadge } from '../../../components/ui/AdminBadge';
import { AdminButton } from '../../../components/ui/AdminButton';
import { commerceStore } from '../../../../shared/store/commerceStore';

interface UrgentActionItem {
  id: string;
  type: 'order' | 'return' | 'stock' | 'cart' | 'vip' | 'review';
  title: string;
  subtitle: string;
  amount?: string;
  severity: 'high' | 'medium' | 'info';
  actionLabel: string;
  actionPath: string;
  tag: string;
}

interface DashboardUrgentActionsProps {
  loading?: boolean;
}

export const DashboardUrgentActions: React.FC<DashboardUrgentActionsProps> = ({
  loading = false,
}) => {
  const items: UrgentActionItem[] = useMemo(() => {
    const list: UrgentActionItem[] = [];
    const orders = commerceStore.getOrders();
    const products = commerceStore.getProducts();
    const returnRequests = commerceStore.getReturnRequests();
    const reviews = commerceStore.getReviews();

    // 1. Pending high-value / standard orders
    const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing');
    pendingOrders.slice(0, 2).forEach((o) => {
      const isHighVal = o.total >= 3000;
      list.push({
        id: `urg_ord_${o.id}`,
        type: isHighVal ? 'vip' : 'order',
        title: `طلب ${o.orderNumber || `#${o.id}`} بانتظار التأكيد والمعالجة`,
        subtitle: `للعميل ${o.customerName || 'عميل'} بقيمة ${Number(o?.total ?? 0).toLocaleString('ar-SA')} ر.س (${o.items.length} منتجات)`,
        amount: `${Number(o?.total ?? 0).toLocaleString('ar-SA')} ر.س`,
        severity: isHighVal ? 'high' : 'medium',
        actionLabel: 'معالجة الطلب',
        actionPath: `/admin/orders/${o.id}`,
        tag: isHighVal ? 'طلب VIP عالي القيمة' : 'طلب بانتظار الشحن',
      });
    });

    // 2. Critical stock / Low stock products
    const lowStock = products.filter((p) => p.stock <= (p.lowStockThreshold || 5));
    lowStock.slice(0, 2).forEach((p) => {
      const isZero = p.stock === 0;
      list.push({
        id: `urg_stock_${p.id}`,
        type: 'stock',
        title: isZero ? `نفاد كمية: ${p.name}` : `مخزون حرج: ${p.name}`,
        subtitle: `المتبقي ${p.stock} فقط في المستودع الرئيسي - الحد الأدنى ${p.lowStockThreshold || 5}`,
        amount: `${p.stock} قطع`,
        severity: isZero ? 'high' : 'medium',
        actionLabel: 'تعديل المخزون',
        actionPath: '/admin/inventory',
        tag: isZero ? 'نفد المخزون' : 'مخزون منخفض',
      });
    });

    // 3. Pending return requests
    const pendingReturns = returnRequests.filter((r) => r.status === 'pending_review');
    pendingReturns.slice(0, 1).forEach((r) => {
      const reasonText = r.items[0]?.reason || r.reasonNotes || 'طلب استرجاع جودة';
      list.push({
        id: `urg_ret_${r.id}`,
        type: 'return',
        title: `طلب استرجاع بانتظار المراجعة #${r.id}`,
        subtitle: `للطلب #${r.orderId} بقيمة ${(r.refundAmount || 0).toLocaleString('ar-SA')} ر.س - السبب: ${reasonText}`,
        amount: `${(r.refundAmount || 0).toLocaleString('ar-SA')} ر.س`,
        severity: 'medium',
        actionLabel: 'مراجعة المرتجع',
        actionPath: '/admin/returns',
        tag: 'مرتجع معلق',
      });
    });

    // 4. Pending reviews
    const pendingReviews = reviews.filter((r) => r.status === 'pending');
    pendingReviews.slice(0, 1).forEach((r) => {
      list.push({
        id: `urg_rev_${r.id}`,
        type: 'review',
        title: `مراجعة جديدة بانتظار الاعتماد من ${r.customerName}`,
        subtitle: `تقييم ${r.rating} نجوم: "${(r.comment || '').slice(0, 40)}..."`,
        severity: 'info',
        actionLabel: 'اعتماد التقييم',
        actionPath: '/admin/reviews',
        tag: 'تقييم جديد',
      });
    });

    return list;
  }, []);

  if (loading) {
    return (
      <AdminCard className="p-5 space-y-3">
        <div className="h-5 w-48 bg-[#F0ECE4] rounded animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`urgent-skel-${i}`} className="h-14 w-full bg-[#FAF8F3] rounded-xl animate-pulse" />
          ))}
        </div>
      </AdminCard>
    );
  }

  return (
    <AdminCard className="p-0 overflow-hidden border-[#E8E3D8]">
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-[#F0ECE4] bg-gradient-to-r from-white via-white to-[#FAF8F3]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-[#181818]">
                مركز العمليات العاجلة وخدمة النخبة
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                {items.length} مهام تتطلب إجراءً
              </span>
            </div>
            <p className="text-xs text-[#9E9A90] mt-0.5">
              تنبيهات فورية لضمان تجربة تسوق استثنائية لعملاء فخامة
            </p>
          </div>
        </div>

        <Link
          to="/admin/orders"
          className="text-xs font-bold text-[#00875A] hover:text-[#006E49] flex items-center gap-1 hover:underline shrink-0"
        >
          <span>عرض الكل</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Items List */}
      <div className="divide-y divide-[#F0ECE4]">
        {items.map((item, idx) => {
          const isHigh = item.severity === 'high';
          return (
            <div
              key={`urgent-act-${item.id || idx}-${idx}`}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F3] transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isHigh ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {item.type === 'order' && <Crown className="w-4 h-4" />}
                  {item.type === 'stock' && <AlertTriangle className="w-4 h-4" />}
                  {item.type === 'cart' && <ShoppingCart className="w-4 h-4" />}
                  {item.type === 'return' && <RotateCcw className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-[#181818]">{item.title}</span>
                    <AdminBadge variant={isHigh ? 'red' : 'amber'} size="sm">
                      {item.tag}
                    </AdminBadge>
                  </div>
                  <p className="text-[11px] text-[#6B6860] mt-0.5 line-clamp-1">{item.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F0ECE4]">
                {item.amount && (
                  <span className="font-bold text-xs text-[#181818]">{item.amount}</span>
                )}
                <Link to={item.actionPath}>
                  <AdminButton variant="outline" size="sm" className="text-xs">
                    <span>{item.actionLabel}</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </AdminButton>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </AdminCard>
  );
};
