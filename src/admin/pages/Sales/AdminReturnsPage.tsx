import React, { useState, useEffect, useMemo } from 'react';
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  PackageCheck,
  AlertCircle,
  Truck,
  DollarSign,
  User,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  Crown
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminReturnRequest } from '../../types';
import { useToast } from '../../../context/ToastContext';
import { commerceEventBus } from '../../../shared/events/commerceEvents';

export const AdminReturnsPage: React.FC = () => {
  const { showToast } = useToast();

  const [returns, setReturns] = useState<AdminReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminReturnRequest['status'] | 'all'>('all');

  // Action / Detail Modal
  const [selectedReturn, setSelectedReturn] = useState<AdminReturnRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const data = await adminService.getReturnRequests();
      setReturns(data);
    } catch (err: any) {
      showToast('تعذر تحميل طلبات الاسترجاع', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
    const unsub = commerceEventBus.subscribe('RETURN_REQUEST_UPDATED', () => {
      loadReturns();
    });
    return unsub;
  }, []);

  // Filtered
  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = r.id.toLowerCase().includes(q);
        const matchesOrder = r.orderNumber.toLowerCase().includes(q);
        const matchesName = r.customer.name.toLowerCase().includes(q);
        const matchesPhone = r.customer.phone.toLowerCase().includes(q);
        const matchesProd = r.items.some((i) => i.productName.toLowerCase().includes(q));
        if (!matchesId && !matchesOrder && !matchesName && !matchesPhone && !matchesProd) return false;
      }
      if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [returns, searchQuery, statusFilter]);

  // KPIs
  const totalReturnsCount = returns.length;
  const pendingCount = returns.filter((r) => r.status === 'pending_review').length;
  const inInspectionCount = returns.filter((r) => r.status === 'approved' || r.status === 'item_received').length;
  const totalRefundedSum = returns
    .filter((r) => r.status === 'refunded')
    .reduce((sum, r) => sum + r.totalRefundAmount, 0);

  // Handler for Updating Return Status
  const handleUpdateStatus = async (
    returnItem: AdminReturnRequest,
    newStatus: AdminReturnRequest['status'],
    notes?: string
  ) => {
    try {
      setIsUpdating(true);
      await adminService.updateReturnStatus(returnItem.id, newStatus, notes);
      const statusNames: Record<AdminReturnRequest['status'], string> = {
        pending_review: 'قيد المراجعة',
        approved: 'مقبول للشحن العكسي',
        item_received: 'تم استلام الشحنة في المستودع',
        refunded: 'مكتمل وتم استرجاع المبلغ',
        rejected: 'مرفوض',
      };
      showToast(`تم تحديث حالة طلب الاسترجاع إلى "${statusNames[newStatus]}"`, 'success');
      setModalOpen(false);
      await loadReturns();
    } catch (err: any) {
      showToast('تعذر تحديث طلب الاسترجاع', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: AdminReturnRequest['status']) => {
    switch (status) {
      case 'pending_review':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>بانتظار المراجعة</span>
          </span>
        );
      case 'approved':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            <span>مقبول للشحن العكسي</span>
          </span>
        );
      case 'item_received':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>قيد فحص الجودة</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#E6F4EE] text-[#00875A] border border-[#00875A]/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم استرداد المبلغ</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>مرفوض</span>
          </span>
        );
    }
  };

  return (
    <div id="admin-returns-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#181818] tracking-tight font-arabic flex items-center gap-2.5">
            <RotateCcw className="w-7 h-7 text-[#00875A]" />
            <span>إدارة المرتجعات والاستبدال والضمان</span>
          </h1>
          <p className="text-sm text-[#5A5852] mt-1 font-arabic">
            معالجة طلبات الاسترجاع، فحص حالة المقتنيات، وإعادة المبالغ لحسابات العملاء
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] flex items-center justify-center text-[#181818]">
            <RotateCcw className="w-5 h-5 text-[#5A5852]" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">إجمالي طلبات الاسترجاع</span>
            <span className="text-xl font-black text-[#181818] font-arabic">
              {totalReturnsCount} طلبات
            </span>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('pending_review')}
          className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3 cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">بانتظار القرار الإداري</span>
            <span className="text-xl font-black text-amber-700 font-arabic">
              {pendingCount} طلبات
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">قيد الشحن وفحص الجودة</span>
            <span className="text-xl font-black text-amber-800 font-arabic">
              {inInspectionCount} شحنات
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E6F4EE] border border-[#00875A]/20 flex items-center justify-center text-[#00875A]">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">إجمالي المبالغ المستردة</span>
            <span className="text-xl font-black text-[#00875A] font-arabic">
              {totalRefundedSum.toLocaleString('ar-SA')} ر.س
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A5852]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الطلب، اسم العميل، المنتج..."
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-[#E8E3D8] bg-[#FAF8F5] text-sm text-[#181818] placeholder-[#5A5852] focus:outline-none focus:border-[#00875A]"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] focus:outline-none focus:border-[#00875A] cursor-pointer"
          >
            <option value="all">كل حالات المرتجعات</option>
            <option value="pending_review">بانتظار المراجعة</option>
            <option value="approved">مقبول للشحن</option>
            <option value="item_received">تم الاستلام والفحص</option>
            <option value="refunded">مكتمل وتم الاسترجاع</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
      </div>

      {/* Returns List Table */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E8E3D8]">
          <div className="w-10 h-10 border-3 border-[#00875A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#5A5852] font-arabic">جاري تحميل سجل المرتجعات...</p>
        </div>
      ) : filteredReturns.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#E8E3D8] p-6">
          <RotateCcw className="w-12 h-12 text-[#5A5852]/40 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-[#181818] mb-1 font-arabic">
            لا توجد طلبات استرجاع مطابقة للبحث
          </h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E3D8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E3D8] text-[11px] font-bold text-[#5A5852] uppercase tracking-wider font-arabic">
                  <th className="py-3.5 px-4">رقم الطلب الأصلي</th>
                  <th className="py-3.5 px-4">العميل</th>
                  <th className="py-3.5 px-4">المنتج والكمية</th>
                  <th className="py-3.5 px-4">سبب الاسترجاع</th>
                  <th className="py-3.5 px-4">المبلغ المستحق</th>
                  <th className="py-3.5 px-4">حالة الطلب</th>
                  <th className="py-3.5 px-4">التاريخ</th>
                  <th className="py-3.5 px-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D8] text-xs">
                {filteredReturns.map((ret, idx) => {
                  const firstItem = ret.items[0];
                  return (
                    <tr key={`admin-ret-${ret.id || idx}-${idx}`} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      {/* Order & Return ID */}
                      <td className="py-4 px-4 font-mono font-bold text-[#181818]">
                        <div>
                          <span className="text-sm font-extrabold block text-[#00875A]">
                            {ret.orderNumber}
                          </span>
                          <span className="text-[11px] text-[#5A5852] font-normal">
                            {ret.returnNumber || ret.id}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4 font-arabic">
                        <div>
                          <span className="font-extrabold text-sm text-[#181818] block">
                            {ret.customer.name}
                          </span>
                          <span className="text-[11px] text-[#5A5852] font-mono block">
                            {ret.customer.phone}
                          </span>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-4 px-4">
                        {firstItem && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl border border-[#E8E3D8] overflow-hidden bg-[#FAF8F5] shrink-0">
                              <img
                                src={firstItem.imageUrl}
                                alt={firstItem.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="font-bold text-[#181818] block font-arabic truncate max-w-xs">
                                {firstItem.productName}
                              </span>
                              <span className="text-[11px] text-[#5A5852] font-arabic">
                                الكمية: {firstItem.quantity} قطعة ({firstItem.condition === 'sealed' ? 'مغلف بحالة المصنع' : 'مفتوح'})
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Reason */}
                      <td className="py-4 px-4 font-arabic text-[#5A5852] max-w-xs">
                        <span className="font-bold text-[#181818] block">
                          {firstItem?.reason || 'طلب استرجاع عام'}
                        </span>
                      </td>

                      {/* Refund Amount */}
                      <td className="py-4 px-4 font-bold text-[#181818] font-arabic">
                        <span className="text-sm font-black text-[#00875A]">
                          {Number(ret?.totalRefundAmount ?? 0).toLocaleString('ar-SA')} ر.س
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">{getStatusBadge(ret.status)}</td>

                      {/* Date */}
                      <td className="py-4 px-4 text-[#5A5852] whitespace-nowrap font-arabic text-[11px]">
                        {ret.requestedAt}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-left">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReturn(ret);
                            setAdminNotes(ret.adminNotes || '');
                            setModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-[#00875A]/20 bg-[#E6F4EE] text-[#00875A] text-xs font-bold hover:bg-[#00875A] hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-arabic"
                        >
                          <span>مراجعة واتخاذ قرار</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review & Decision Modal */}
      {modalOpen && selectedReturn && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8E3D8] shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200 font-arabic space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3D8]">
              <div>
                <h3 className="font-extrabold text-base text-[#181818]">
                  مراجعة طلب الاسترجاع {selectedReturn.returnNumber || selectedReturn.id}
                </h3>
                <span className="text-xs text-[#5A5852] font-mono">
                  طلب أصلي: {selectedReturn.orderNumber}
                </span>
              </div>
              {getStatusBadge(selectedReturn.status)}
            </div>

            {/* Product & Customer Summary */}
            {selectedReturn.items[0] && (
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E3D8] flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl border border-[#E8E3D8] overflow-hidden bg-white shrink-0">
                  <img
                    src={selectedReturn.items[0].imageUrl}
                    alt={selectedReturn.items[0].productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-[#181818] truncate">
                    {selectedReturn.items[0].productName}
                  </h4>
                  <p className="text-[11px] text-[#5A5852] mt-0.5">
                    العميل: {selectedReturn.customer.name} ({selectedReturn.customer.phone})
                  </p>
                  <p className="text-xs font-black text-[#00875A] mt-1">
                    المبلغ المستحق للاسترجاع: {Number(selectedReturn?.totalRefundAmount ?? 0).toLocaleString('ar-SA')} ر.س
                  </p>
                </div>
              </div>
            )}

            {/* Reason Details */}
            <div className="text-xs space-y-1">
              <span className="font-bold text-[#181818] block">سبب الاسترجاع المحدد من العميل:</span>
              <p className="text-[#5A5852] bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E3D8]">
                {selectedReturn.items[0]?.reason || 'استرجاع عام'}
              </p>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-xs font-bold text-[#181818] mb-1">
                ملاحظات إدارة الجودة وفحص المستودع
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                placeholder="اكتب ملاحظاتك حول حالة المنتج، التغليف، سبب القبول أو الرفض..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E3D8] bg-white text-xs text-[#181818] focus:outline-none focus:border-[#00875A]"
              />
            </div>

            {/* Decision Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-[#E8E3D8]">
              <span className="block text-xs font-bold text-[#181818]">اتخاذ الإجراء:</span>

              <div className="grid grid-cols-2 gap-2">
                {selectedReturn.status === 'pending_review' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReturn, 'approved', adminNotes)}
                    disabled={isUpdating}
                    className="py-2.5 px-3 rounded-xl bg-[#00875A] text-white text-xs font-bold hover:bg-[#00724C] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>قبول وإصدار بوليصة استرجاع</span>
                  </button>
                )}

                {(selectedReturn.status === 'approved' || selectedReturn.status === 'item_received') && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReturn, 'refunded', adminNotes)}
                    disabled={isUpdating}
                    className="py-2.5 px-3 rounded-xl bg-[#00875A] text-white text-xs font-bold hover:bg-[#00704A] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>إتمام استرجاع المبلغ للعميل</span>
                  </button>
                )}

                {selectedReturn.status !== 'rejected' && selectedReturn.status !== 'refunded' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReturn, 'rejected', adminNotes)}
                    disabled={isUpdating}
                    className="py-2.5 px-3 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>رفض طلب الاسترجاع</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#5A5852] hover:bg-[#FAF8F5] cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
