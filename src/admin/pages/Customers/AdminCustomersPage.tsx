import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Crown,
  Search,
  Plus,
  Phone,
  Mail,
  MessageCircle,
  Eye,
  Filter,
  DollarSign,
  ShoppingBag,
  MapPin,
  Calendar,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  ArrowUpDown,
  Wallet,
  History,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
  Coins
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminCustomer, CustomerFilterParams } from '../../types';
import { commerceEventBus } from '../../../shared/events/commerceEvents';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  
  // Wallet controller states
  const [pointsInput, setPointsInput] = useState<string>('');
  const [creditInput, setCreditInput] = useState<string>('');
  const [isUpdatingWallet, setIsUpdatingWallet] = useState<boolean>(false);

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'الرياض',
    country: 'المملكة العربية السعودية',
    status: 'active' as const,
    membershipTier: 'standard' as const,
    notes: '',
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: CustomerFilterParams = {
        search: search || undefined,
        tier: selectedTier !== 'all' ? (selectedTier as any) : undefined,
        status: selectedStatus !== 'all' ? (selectedStatus as any) : undefined,
        sortBy: 'totalSpent',
        sortDirection: 'desc',
        pageSize: 50,
      };
      const res = await adminService.getCustomers(params);
      setCustomers(res.items || res.data || []);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    const unsubCust = commerceEventBus.subscribe('CUSTOMER_UPDATED', () => {
      fetchCustomers();
    });
    const unsubOrder = commerceEventBus.subscribe('ORDER_CREATED', () => {
      fetchCustomers();
    });
    return () => {
      unsubCust();
      unsubOrder();
    };
  }, [search, selectedTier, selectedStatus]);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // KPIs
  const stats = useMemo(() => {
    const total = customers.length;
    const royalVips = customers.filter((c) => c.membershipTier === 'vip_royal').length;
    const totalSpent = customers.reduce((acc, c) => acc + c.totalSpent, 0);
    const avgSpend = total > 0 ? Math.round(totalSpent / total) : 0;
    return { total, royalVips, totalSpent, avgSpend };
  }, [customers]);

  const handleOpenDetail = (customer: AdminCustomer) => {
    setSelectedCustomer(customer);
    setEditingNotes(customer.notes || '');
    setPointsInput(String(customer.loyaltyPoints || 0));
    setCreditInput(String(customer.storeCreditBalance || 0));
    setIsDetailOpen(true);
  };

  const handleUpdateWallet = async () => {
    if (!selectedCustomer) return;
    try {
      setIsUpdatingWallet(true);
      const points = parseInt(pointsInput, 10) || 0;
      const credit = parseFloat(creditInput) || 0;
      const updated = await adminService.updateCustomer(selectedCustomer.id, {
        loyaltyPoints: points,
        storeCreditBalance: credit,
      });
      setSelectedCustomer(updated);
      setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showNotification('تم تحديث المحفظة ورصيد نقاط الولاء للعميل بنجاح');
    } catch (err) {
      console.error(err);
      showNotification('حدث خطأ أثناء تحديث أرصدة العميل');
    } finally {
      setIsUpdatingWallet(false);
    }
  };

  const handleQuickAdjustCredit = (delta: number) => {
    const current = parseFloat(creditInput) || 0;
    setCreditInput(String(Math.max(0, current + delta)));
  };

  const handleSaveNotes = async () => {
    if (!selectedCustomer) return;
    try {
      setIsSavingNotes(true);
      const updated = await adminService.updateCustomer(selectedCustomer.id, {
        notes: editingNotes,
      });
      setSelectedCustomer(updated);
      setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showNotification('تم تحديث ملاحظات العميل بنجاح');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleUpdateTier = async (id: number, tier: AdminCustomer['membershipTier']) => {
    try {
      const updated = await adminService.updateCustomer(id, { membershipTier: tier });
      if (selectedCustomer?.id === id) setSelectedCustomer(updated);
      setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
      showNotification('تمت ترقية فئة العضوية بنجاح');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;
    try {
      await adminService.createCustomer({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        city: newCustomer.city,
        country: newCustomer.country,
        status: newCustomer.status,
        membershipTier: newCustomer.membershipTier,
        notes: newCustomer.notes,
      });
      setIsAddModalOpen(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        city: 'الرياض',
        country: 'المملكة العربية السعودية',
        status: 'active',
        membershipTier: 'standard',
        notes: '',
      });
      fetchCustomers();
      showNotification('تم تسجيل العميل بنجاح في قاعدة البيانات');
    } catch (err) {
      console.error(err);
    }
  };

  const getTierBadge = (tier: AdminCustomer['membershipTier']) => {
    switch (tier) {
      case 'vip_royal':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Crown className="w-3.5 h-3.5" />
            النخبة الملكية VIP
          </span>
        );
      case 'gold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
            <Award className="w-3 h-3" />
            العضوية الذهبية
          </span>
        );
      case 'silver':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            الفضية
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800/50">
            عضوية قياسية
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#00875A] text-white px-4 py-3 rounded-xl shadow-xl text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>لوحة التحكم</span>
            <span>/</span>
            <span className="text-amber-700 font-semibold">قاعدة العملاء</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Users className="w-7 h-7 text-amber-600" />
            إدارة العملاء ونخبة VIP
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            سجل كبار الشخصيات والعملاء، متابعة القيمة الشرائية (LTV)، والتواصل المباشر
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-xs transition-all active:scale-98 text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إضافة عميل جديد
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">إجمالي العملاء</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#00875A] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-emerald-600 font-medium">مسجلين بالمتجر</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">النخبة الملكية VIP</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-500">{stats.royalVips}</span>
            <span className="text-xs text-slate-500">من أصحاب الحسابات الخاصة</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">إجمالي الإنفاق (LTV)</span>
            <div className="w-9 h-9 rounded-xl bg-[#00875A]/10 text-[#00875A] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.totalSpent.toLocaleString('ar-SA')}
            </span>
            <span className="text-xs text-slate-500">ر.س</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">متوسط مشتريات العميل</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.avgSpend.toLocaleString('ar-SA')}
            </span>
            <span className="text-xs text-slate-500">ر.س / عميل</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، رقم الجوال، البريد، أو المدينة..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#00875A]/20 focus:border-[#00875A] text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00875A]/20 focus:border-[#00875A]"
          >
            <option value="all">كل فئات العضوية</option>
            <option value="vip_royal">النخبة الملكية VIP</option>
            <option value="gold">الذهبية Gold</option>
            <option value="silver">الفضية Silver</option>
            <option value="standard">القياسية Standard</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00875A]/20 focus:border-[#00875A]"
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="vip">VIP</option>
            <option value="inactive">غير نشط</option>
            <option value="blocked">محظور</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">العميل</th>
                <th className="py-3.5 px-4">فئة العضوية</th>
                <th className="py-3.5 px-4">المدينة</th>
                <th className="py-3.5 px-4 text-center">عدد الطلبات</th>
                <th className="py-3.5 px-4">إجمالي الإنفاق (LTV)</th>
                <th className="py-3.5 px-4">آخر نشاط</th>
                <th className="py-3.5 px-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    جاري تحميل سجل العملاء...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    لم يتم العثور على عملاء مطابقين لخيارات البحث
                  </td>
                </tr>
              ) : (
                customers.map((c, idx) => (
                  <tr
                    key={`admin-cust-${c.id || idx}-${idx}`}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {c.avatar ? (
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-[#00875A] font-bold flex items-center justify-center text-sm">
                            {c.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {c.name}
                            {c.membershipTier === 'vip_royal' && (
                              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">{c.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getTierBadge(c.membershipTier)}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.city}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                      {c.ordersCount} طلب
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {c.totalSpent.toLocaleString('ar-SA')}{' '}
                      <span className="text-xs font-normal text-slate-400">ر.س</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{c.lastActive}</td>
                    <td className="py-3.5 px-4 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          title="مراسلة واتساب"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleOpenDetail(c)}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          الملف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer */}
      {isDetailOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl p-6 flex flex-col justify-between">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  ملف العميل الملكي
                </h2>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Card */}
              <div className="mt-6 p-5 rounded-2xl bg-radial from-slate-900 to-slate-950 text-white border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                  {selectedCustomer.avatar ? (
                    <img
                      src={selectedCustomer.avatar}
                      alt={selectedCustomer.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500/40"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 font-black text-2xl flex items-center justify-center ring-2 ring-amber-500/40">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      {selectedCustomer.name}
                    </h3>
                    <p className="text-xs text-amber-400 font-medium mt-0.5">
                      {selectedCustomer.membershipTier === 'vip_royal'
                        ? 'عضوية فخامة الملكية الفاخرة VIP'
                        : selectedCustomer.membershipTier === 'gold'
                        ? 'عضوية النخبة الذهبية'
                        : 'عضوية عملاء فخامة'}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-1">{selectedCustomer.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-800/80 text-center">
                  <div>
                    <div className="text-xs text-slate-400">الطلبات</div>
                    <div className="text-lg font-black text-white mt-1">
                      {selectedCustomer.ordersCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">إجمالي LTV</div>
                    <div className="text-lg font-black text-amber-400 mt-1">
                      {selectedCustomer.totalSpent.toLocaleString('ar-SA')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">متوسط السلة</div>
                    <div className="text-lg font-black text-white mt-1">
                      {selectedCustomer.averageOrderValue.toLocaleString('ar-SA')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <a
                  href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  محادثة واتساب
                </a>
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#00875A]" />
                  اتصال هاتفي
                </a>
              </div>

              {/* Membership Tier Modifier */}
              <div className="mt-6">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  ترقية / تغيير فئة العضوية
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['standard', 'silver', 'gold', 'vip_royal'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleUpdateTier(selectedCustomer.id, t)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                        selectedCustomer.membershipTier === t
                          ? 'border-[#00875A] bg-emerald-50 dark:bg-emerald-950/30 text-[#00875A] ring-1 ring-[#00875A]'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {t === 'vip_royal'
                        ? '👑 النخبة الملكية'
                        : t === 'gold'
                        ? '⭐ الذهبية'
                        : t === 'silver'
                        ? '🥈 الفضية'
                        : 'القياسية'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loyalty & Store Credit (Wallet) Controller */}
              <div className="mt-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400">
                    <Wallet className="w-4 h-4 text-amber-500" />
                    <span>التحكم بنقاط الولاء والمحفظة الملكية</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 font-bold">
                    الرصيد الفعلي: {selectedCustomer.storeCreditBalance || 0} ر.س
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      رصيد المحفظة (ر.س)
                    </label>
                    <input
                      type="number"
                      value={creditInput}
                      onChange={(e) => setCreditInput(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none"
                    />
                    {/* Quick Adjustment Chips */}
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      <span className="text-[9px] text-slate-400">إضافة سريعة:</span>
                      {[50, 100, 500].map((amount) => (
                        <button
                          key={`qa-${amount}`}
                          type="button"
                          onClick={() => handleQuickAdjustCredit(amount)}
                          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 cursor-pointer"
                        >
                          +{amount}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleQuickAdjustCredit(-50)}
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200 cursor-pointer"
                        title="خصم 50 ر.س"
                      >
                        -50
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      نقاط الولاء النشطة
                    </label>
                    <input
                      type="number"
                      value={pointsInput}
                      onChange={(e) => setPointsInput(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none"
                    />
                    <span className="text-[9px] text-slate-400 block mt-1.5">
                      القيمة النقدية: {Math.floor((parseInt(pointsInput) || 0) / 10)} ر.س
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUpdateWallet}
                  disabled={isUpdatingWallet}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/50 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isUpdatingWallet ? 'جاري تحديث المحفظة...' : 'حفظ أرصدة المحفظة والنقاط'}
                </button>

                {/* Customer Wallet Transactions History in Admin Modal */}
                {selectedCustomer.walletTransactions && selectedCustomer.walletTransactions.length > 0 && (
                  <div className="pt-3 border-t border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <History className="w-3.5 h-3.5 text-amber-500" />
                        سجل حركات المحفظة ({selectedCustomer.walletTransactions.length})
                      </span>
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {selectedCustomer.walletTransactions.slice().reverse().map((tx, idx) => {
                        const isPositive = tx.type === 'credit_added' || tx.type === 'order_refund' || tx.type === 'points_converted';
                        return (
                          <div
                            key={tx.id || `adm-tx-${idx}`}
                            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px]"
                          >
                            <div className="flex items-center gap-1.5">
                              {tx.type === 'points_converted' ? (
                                <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              ) : tx.type === 'order_refund' ? (
                                <RotateCcw className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              ) : tx.type === 'credit_spent' ? (
                                <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              ) : (
                                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              )}
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                                  {tx.description}
                                </span>
                                <span className="text-[9px] text-slate-400">
                                  {new Date(tx.date).toLocaleDateString('ar-SA')} • الرصيد بعد: {tx.balanceAfter} ر.س
                                </span>
                              </div>
                            </div>
                            <span
                              className={`font-mono font-bold ${
                                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {isPositive ? '+' : '-'}{tx.amount} ر.س
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Private Notes */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    ملاحظات الإدارة الخاصة (الذوق، العناوين المفضلة، المناسبات)
                  </label>
                </div>
                <textarea
                  rows={4}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="سجل تفضيلات العميل، نوع التغليف المفضل، أوقات التوصيل المناسبة..."
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00875A]/20 focus:border-[#00875A]"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="mt-2 w-full py-2 bg-[#00875A] hover:bg-[#00724C] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingNotes ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>تاريخ الانضمام: {selectedCustomer.joinedAt}</span>
              <span>المدينة: {selectedCustomer.city}</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00875A]" />
                تسجيل عميل جديد
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  اسم العميل الكريم *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="مثال: سمو الأمير فيصل بن عبدالعزيز"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    رقم الجوال *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="+966 50 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="client@fakhama.sa"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00875A]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    المدينة
                  </label>
                  <input
                    type="text"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    placeholder="الرياض"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    فئة العضوية
                  </label>
                  <select
                    value={newCustomer.membershipTier}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, membershipTier: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="vip_royal">النخبة الملكية VIP</option>
                    <option value="gold">الذهبية Gold</option>
                    <option value="silver">الفضية Silver</option>
                    <option value="standard">القياسية Standard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  ملاحظات وتفضيلات
                </label>
                <textarea
                  rows={2}
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  placeholder="تفضيلات الإهداء والمقتنيات الخاصة..."
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#00875A] hover:bg-[#00724C] text-white text-sm font-semibold shadow-xs"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
