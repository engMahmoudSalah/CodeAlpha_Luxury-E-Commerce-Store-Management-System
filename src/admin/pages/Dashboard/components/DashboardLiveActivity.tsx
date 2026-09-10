import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShoppingBag,
  Star,
  RotateCcw,
  UserCheck,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { AdminCard } from '../../../components/ui/AdminCard';
import { AdminSkeleton } from '../../../components/ui/AdminSkeleton';
import { commerceStore } from '../../../../shared/store/commerceStore';

interface ActivityItem {
  id: string;
  type: 'order' | 'review' | 'user' | 'return' | 'stock';
  title: string;
  desc: string;
  timestamp: string;
  link?: string;
  highlight?: string;
}

interface DashboardLiveActivityProps {
  loading?: boolean;
}

export const DashboardLiveActivity: React.FC<DashboardLiveActivityProps> = ({
  loading = false,
}) => {
  const activities: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [];
    const orders = commerceStore.getOrders();
    const reviews = commerceStore.getReviews();
    const customers = commerceStore.getCustomers();
    const returnRequests = commerceStore.getReturnRequests();
    const inventoryLogs = commerceStore.getInventoryLogs();

    // 1. Orders
    orders.slice(0, 4).forEach((o, idx) => {
      const firstItem = o.items[0];
      const itemName = firstItem ? firstItem.name : 'منتجات فاخرة';
      const countExtra = o.items.length > 1 ? ` و ${o.items.length - 1} منتجات أخرى` : '';
      items.push({
        id: `act_order_${o.id || idx}`,
        type: 'order',
        title: `طلب شراء ${o.orderNumber || `#${o.id}`}`,
        desc: `${o.customerName || 'عميل'} اشترى "${itemName}${countExtra}"`,
        timestamp: 'مؤخراً',
        highlight: `${(o.total || 0).toLocaleString('ar-SA')} ر.س`,
        link: `/admin/orders/${o.id}`,
      });
    });

    // 2. Reviews
    reviews.slice(0, 2).forEach((r) => {
      items.push({
        id: `act_rev_${r.id}`,
        type: 'review',
        title: `تقييم ${r.rating} نجوم (${r.status === 'approved' ? 'معتمد' : 'بانتظار المراجعة'})`,
        desc: `${r.customerName} أضاف مراجعة: "${(r.comment || '').slice(0, 45)}..."`,
        timestamp: 'مؤخراً',
        link: '/admin/reviews',
      });
    });

    // 3. Customers
    customers.slice(0, 2).forEach((c) => {
      const isVip = c.membershipTier === 'vip_royal' || c.membershipTier === 'gold';
      items.push({
        id: `act_cust_${c.id}`,
        type: 'user',
        title: `عميل مسجل: ${isVip ? 'عضوية VIP ملكية' : 'عضوية قياسية'}`,
        desc: `${c.name} (${c.email || c.phone})`,
        timestamp: 'مؤخراً',
        link: '/admin/customers',
      });
    });

    // 4. Return Requests
    returnRequests.slice(0, 1).forEach((ret) => {
      items.push({
        id: `act_ret_${ret.id}`,
        type: 'return',
        title: `طلب استرجاع ${ret.status === 'pending_review' ? 'معلق' : 'معالج'}`,
        desc: `طلب استرجاع بقيمة ${(ret.refundAmount || 0).toLocaleString('ar-SA')} ر.س للطلب #${ret.orderId}`,
        timestamp: 'مؤخراً',
        link: '/admin/returns',
      });
    });

    // 5. Inventory Logs
    inventoryLogs.slice(0, 2).forEach((log) => {
      const typeLabel = log.type === 'in' ? 'توريد' : log.type === 'order' || log.type === 'out' ? 'بيع إلكتروني' : 'تعديل جرد';
      items.push({
        id: `act_log_${log.id}`,
        type: 'stock',
        title: `حركة مخزون: ${typeLabel} - ${log.productName}`,
        desc: `الكمية (${log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}) في ${log.warehouseName || 'المستودع الرئيسي'}`,
        timestamp: 'مؤخراً',
        link: '/admin/inventory',
      });
    });

    return items.slice(0, 6);
  }, []);

  if (loading) {
    return (
      <AdminCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <AdminSkeleton className="h-6 w-36" />
          <AdminSkeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <AdminSkeleton key={`live-skel-${i}`} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </AdminCard>
    );
  }

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-[#00875A]" />;
      case 'user':
        return <UserCheck className="w-4 h-4 text-[#00875A]" />;
      case 'review':
        return <Star className="w-4 h-4 text-amber-500" />;
      case 'return':
        return <RotateCcw className="w-4 h-4 text-rose-500" />;
      case 'stock':
        return <Activity className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-[#6B6860]" />;
    }
  };

  return (
    <AdminCard className="p-0 overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-[#F0ECE4]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#00875A]/10 text-[#00875A] flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#181818]">
              سجل النشاط الحي بالمتجر
            </h3>
            <p className="text-xs text-[#9E9A90] mt-0.5">
              تحديثات لحظية للعمليات والمشتريات وتفاعل العملاء
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#00875A] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#00875A] animate-ping" />
          <span>مباشر</span>
        </div>
      </div>

      {/* Activities list */}
      <div className="divide-y divide-[#F0ECE4]">
        {activities.map((item, idx) => (
          <div
            key={`live-act-${item.id || idx}-${idx}`}
            className="p-4 flex items-center justify-between gap-3 hover:bg-[#FAF8F3] transition-colors"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#FAF8F3] border border-[#E8E3D8] flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-[#181818]">{item.title}</span>
                  {item.highlight && (
                    <span className="text-[10px] font-mono font-bold text-[#00875A] bg-[#E6F4EE] px-1.5 py-0.2 rounded">
                      {item.highlight}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B6860] mt-0.5 line-clamp-1">{item.desc}</p>
              </div>
            </div>

            <div className="text-left shrink-0">
              <span className="text-[10px] text-[#9E9A90] block">{item.timestamp}</span>
              {item.link && (
                <Link
                  to={item.link}
                  className="text-[10px] text-[#00875A] font-bold hover:underline inline-flex items-center gap-0.5 mt-0.5"
                >
                  <span>عرض</span>
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
};
