import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile, useUpdateProfile, useAddresses, useCreateAddress, useDeleteAddress, useSetDefaultAddress } from '../hooks/useAccount';
import { useOrders } from '../hooks/useOrders';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/authApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { Link } from 'react-router-dom';
import {
  User,
  Phone,
  Lock,
  MapPin,
  Package,
  Plus,
  Trash2,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  Crown,
  Award,
  Sparkles,
  Gift,
  Clock,
  CheckCircle2,
  ChevronLeft,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  Wallet,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  TrendingUp,
  History,
  DollarSign,
  ShoppingBag,
  MessageSquare,
  Send,
  HelpCircle,
  Headphones
} from 'lucide-react';
import { commerceStore } from '../shared/store/commerceStore';
import { commerceEventBus } from '../shared/events/commerceEvents';
import { ReturnRequest, WalletTransaction, SupportTicket } from '../shared/types/commerce';

export const AccountPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { isLoading: isProfileLoading } = useProfile();
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { data: addresses = [], isLoading: isAddressesLoading } = useAddresses();
  const { mutateAsync: createAddress, isPending: isCreatingAddress } = useCreateAddress();
  const { mutateAsync: deleteAddress } = useDeleteAddress();
  const { mutateAsync: setDefaultAddress } = useSetDefaultAddress();
  const { data: orders = [] } = useOrders();
  const { showToast } = useToast();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'addresses' | 'returns' | 'tickets' | 'security' | 'vip'>('profile');
  const [userReturns, setUserReturns] = useState<ReturnRequest[]>([]);
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState<string>('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState<boolean>(false);
  const [newTicketSubject, setNewTicketSubject] = useState<string>('');
  const [newTicketMessage, setNewTicketMessage] = useState<string>('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState<boolean>(false);
  const [convertPointsAmount, setConvertPointsAmount] = useState<number>(100);
  const [isConvertingPoints, setIsConvertingPoints] = useState<boolean>(false);

  // Load customer returns
  React.useEffect(() => {
    const loadReturns = () => {
      const all = commerceStore.getReturnRequests();
      // Filter for this user's orders or email/name
      const orderIds = new Set(orders.map((o) => String(o.id)));
      const filtered = all.filter(
        (r) =>
          orderIds.has(String(r.orderId)) ||
          orderIds.has(String(r.orderId).replace('ORD-', '')) ||
          (user?.email && r.customerEmail?.toLowerCase() === user.email.toLowerCase())
      );
      setUserReturns(filtered);
    };

    loadReturns();
    const unsub = commerceEventBus.subscribe('RETURN_REQUEST_UPDATED', () => {
      loadReturns();
    });
    return () => unsub();
  }, [orders, user?.email]);

  // Load customer support tickets
  React.useEffect(() => {
    const loadTickets = () => {
      const all = commerceStore.getSupportTickets();
      if (!user?.email) {
        setUserTickets([]);
        return;
      }
      const filtered = all.filter(
        (t) =>
          t.customerEmail?.toLowerCase() === user.email.toLowerCase() ||
          (user.name && t.customerName?.toLowerCase() === user.name.toLowerCase())
      );
      setUserTickets(filtered);
    };

    loadTickets();
    const unsubCreated = commerceEventBus.subscribe('TICKET_CREATED', loadTickets);
    const unsubUpdated = commerceEventBus.subscribe('TICKET_UPDATED', loadTickets);
    const unsubDeleted = commerceEventBus.subscribe('TICKET_DELETED', loadTickets);

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [user?.email, user?.name]);

  // Edit Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Add Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addrLabel, setAddrLabel] = useState('المنزل');
  const [addrRecipient, setAddrRecipient] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('الرياض');
  const [addrState, setAddrState] = useState('منطقة الرياض');
  const [addrPostal, setAddrPostal] = useState('');
  const [addrCountry] = useState('المملكة العربية السعودية');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() || undefined });
      await refreshUser();
      setIsEditingProfile(false);
      showToast('تم حفظ وتحديث بيانات حسابك الملكي بنجاح.', 'success');
    } catch (err: any) {
      showToast(err.message || 'تعذر تحديث الملف الشخصي', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword || !newPassword) {
      setPasswordError('يرجى إدخال كلمة المرور الحالية والجديدة.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('يجب أن لا تقل كلمة المرور عن 6 خانات.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين.');
      return;
    }

    try {
      setIsChangingPassword(true);
      await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('تم تغيير كلمة المرور بنجاح وحماية حسابك.', 'success');
    } catch (err: any) {
      setPasswordError(err.message || 'تعذر تغيير كلمة المرور. يرجى التحقق من كلمة المرور الحالية.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrRecipient.trim() || !addrPhone.trim() || !addrLine1.trim() || !addrCity.trim() || !addrPostal.trim()) {
      showToast('يرجى ملء كافة الحقول الإلزامية للعنوان.', 'warning');
      return;
    }

    try {
      await createAddress({
        label: addrLabel.trim() || 'المنزل',
        recipient_name: addrRecipient.trim(),
        phone: addrPhone.trim(),
        address_line1: addrLine1.trim(),
        address_line2: addrLine2.trim() || undefined,
        city: addrCity.trim(),
        state: addrState.trim(),
        postal_code: addrPostal.trim(),
        country: addrCountry.trim(),
        is_default: addrIsDefault ? 1 : 0
      });

      setIsAddressModalOpen(false);
      // Reset form
      setAddrRecipient('');
      setAddrPhone('');
      setAddrLine1('');
      setAddrLine2('');
      setAddrPostal('');
      showToast('تم حفظ عنوان التوصيل الملكي الجديد بنجاح.', 'success');
    } catch (err: any) {
      showToast(err.message || 'تعذر حفظ العنوان', 'error');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await deleteAddress(id);
      showToast('تم حذف العنوان بنجاح.', 'info');
    } catch (err: any) {
      showToast(err.message || 'تعذر حذف العنوان', 'error');
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await setDefaultAddress(id);
      showToast('تم تعيين العنوان كعنوان رئيسي افتراضي للشحن.', 'success');
    } catch (err: any) {
      showToast(err.message || 'تعذر تعيين العنوان الافتراضي', 'error');
    }
  };

  // Synchronized Customer State from Commerce Store
  const [customer, setCustomer] = useState<any>(null);

  React.useEffect(() => {
    const loadCustomer = () => {
      if (!user?.email) return;
      const found = commerceStore.getCustomers().find(
        (c) => c.email.toLowerCase() === user.email.toLowerCase()
      );
      if (found) {
        setCustomer(found);
      } else {
        const pointsEarned = Math.floor(orders.reduce((sum, o) => sum + (o.total || 0), 0) / 10);
        const tot = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        let tier: any = 'standard';
        if (tot >= 15000) tier = 'vip_royal';
        else if (tot >= 8000) tier = 'gold';
        else if (tot >= 3000) tier = 'silver';

        const welcomeCredit = 200;
        const initialPoints = Math.max(350, pointsEarned);
        const newCust = commerceStore.addCustomer({
          name: user.name || 'عميل فخامة',
          email: user.email,
          phone: user.phone || '0500000000',
          totalOrders: orders.length,
          totalSpent: tot,
          loyaltyPoints: initialPoints,
          storeCreditBalance: welcomeCredit,
          walletTransactions: [
            {
              id: `wt_welcome_${Date.now()}`,
              type: 'credit_added',
              amount: welcomeCredit,
              balanceAfter: welcomeCredit,
              description: 'رصيد ترحيبي بمناسبة تدشين حساب العضوية الملكية',
              date: new Date().toISOString(),
            },
          ],
          membershipTier: tier,
          status: 'active',
        });
        setCustomer(newCust);
      }
    };

    loadCustomer();
    const unsub = commerceEventBus.subscribe('CUSTOMER_UPDATED', (updatedCust: any) => {
      if (user?.email && updatedCust && updatedCust.email.toLowerCase() === user.email.toLowerCase()) {
        setCustomer(updatedCust);
      }
    });
    return () => unsub();
  }, [user?.email, orders]);

  // Calculate VIP tier & points with Store State override
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const loyaltyPoints = customer ? (customer.loyaltyPoints ?? 0) : Math.floor(totalSpent * 0.1);
  const rawTier = customer ? customer.membershipTier : (totalSpent >= 15000 ? 'vip_royal' : totalSpent >= 8000 ? 'gold' : totalSpent >= 3000 ? 'silver' : 'standard');
  const vipTier = rawTier === 'vip_royal' ? 'النخبة الملكية VIP' : rawTier === 'gold' ? 'الذهبية الفاخرة' : rawTier === 'silver' ? 'الفضية الترحيبية' : 'القياسية';
  const storeCredit = customer?.storeCreditBalance || 0;

  const handleConvertPoints = (amountToConvert?: number) => {
    const points = amountToConvert || convertPointsAmount;
    if (!user?.email) {
      showToast('يرجى تسجيل الدخول أولاً للقيام بهذه العملية', 'error');
      return;
    }
    if (points <= 0) {
      showToast('يرجى تحديد عدد نقاط أكبر من الصفر', 'error');
      return;
    }
    if (points > loyaltyPoints) {
      showToast(`رصيد نقاطك الحالي (${loyaltyPoints} نقطة) لا يكفي لإتمام هذا التحويل`, 'error');
      return;
    }

    try {
      setIsConvertingPoints(true);
      const res = commerceStore.convertLoyaltyPointsToCredit(user.email, points, 10);
      if (res.success) {
        showToast(`تم بنجاح تحويل ${points} نقطة إلى رصيد ${res.creditAdded} ر.س في محفظتك الملكية!`, 'success');
      } else {
        showToast(res.error || 'تعذر تحويل النقاط', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء تحويل النقاط', 'error');
    } finally {
      setIsConvertingPoints(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-8 pb-20 font-arabic" dir="rtl">
      {/* Top Banner with VIP Welcome */}
      <div className="rounded-3xl bg-linear-to-l from-[#008F68] to-[#0A3D2F] p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md relative overflow-hidden">
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black text-[#FFC700] shadow-inner overflow-hidden shrink-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'V'
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                onClick={() => setActiveTab('wallet')}
                className="text-[10px] font-black px-2.5 py-0.5 bg-[#FFC700] hover:bg-amber-400 text-[#111111] rounded-full flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                title="عرض مزايا فئة العضوية والمحفظة"
              >
                <Crown className="w-3 h-3 text-[#111111]" />
                عضوية {vipTier}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('wallet')}
                className="text-[10px] text-white/90 bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                title="اضغط لتحويل النقاط إلى رصيد محفظة"
              >
                <Coins className="w-3 h-3 text-[#FFC700]" />
                <span>{loyaltyPoints} نقطة مكافآت</span>
              </button>
              {storeCredit > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('wallet')}
                  className="text-[10px] font-black bg-[#FFC700] hover:bg-amber-300 text-neutral-900 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs cursor-pointer transition-transform hover:scale-105"
                  title="عرض رصيد وسجل المحفظة الملكية"
                >
                  <Wallet className="w-3 h-3 text-neutral-900" />
                  <span>المحفظة: {storeCredit.toLocaleString('ar-SA')} ر.س</span>
                </button>
              )}
              {user?.provider === 'google.com' && (
                <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                  <svg className="w-3 h-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  حساب Google موثق
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black">{user?.name || 'ضيف فخامة الكريم'}</h1>
            <p className="text-xs text-white/70 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Link to="/orders">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-[#111111] hover:bg-white/90 border-none shadow-xs"
              leftIcon={<Package className="w-4 h-4 text-[#008F68]" />}
            >
              متابعة الطلبات ({orders.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E8E3D8] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-[#008F68] text-white shadow-xs'
              : 'text-neutral-500 hover:text-[#111111] hover:bg-neutral-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>البيانات الشخصية</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wallet')}
          className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'wallet' || activeTab === 'vip'
              ? 'bg-[#008F68] text-white shadow-xs'
              : 'text-neutral-500 hover:text-[#111111] hover:bg-neutral-100'
          }`}
        >
          <Wallet className="w-3.5 h-3.5 text-[#FFC700]" />
          <span>المحفظة الملكية والولاء</span>
          {storeCredit > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFC700] text-neutral-950 font-black shadow-xs">
              {storeCredit.toLocaleString('ar-SA')} ر.س
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('addresses')}
          className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'addresses'
              ? 'bg-[#008F68] text-white shadow-xs'
              : 'text-neutral-500 hover:text-[#111111] hover:bg-neutral-100'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>عناوين التوصيل ({addresses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('returns')}
          className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'returns'
              ? 'bg-[#008F68] text-white shadow-xs'
              : 'text-neutral-500 hover:text-[#111111] hover:bg-neutral-100'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#008F68]" />
          <span>طلبات الاسترجاع والضمان ({userReturns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'tickets'
              ? 'bg-[#008F68] text-white shadow-xs'
              : 'text-neutral-500 hover:text-[#111111] hover:bg-neutral-100'
          }`}
        >
          <Headphones className="w-3.5 h-3.5 text-[#008F68]" />
          <span>تذاكر الدعم والكونسيرج ({userTickets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-[#008F68] text-white shadow-xs'
              : 'text-neutral-500 hover:text-[#111111] hover:bg-neutral-100'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>الأمان وكلمة المرور</span>
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3D8] flex flex-col gap-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#E8E3D8] pb-4">
                <h2 className="text-base font-black text-[#111111]">المعلومات الشخصية الأساسية</h2>
                <Button
                  variant={isEditingProfile ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    if (!isEditingProfile && user) {
                      setName(user.name);
                      setPhone(user.phone || '');
                    }
                    setIsEditingProfile(!isEditingProfile);
                  }}
                >
                  {isEditingProfile ? 'إلغاء' : 'تعديل البيانات'}
                </Button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                  <Input
                    label="الاسم الكامل"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={<User className="w-4 h-4" />}
                    required
                  />
                  <Input
                    label="رقم الجوال المسجل للتوصيل"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone className="w-4 h-4" />}
                    placeholder="+966 50 123 4567"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isUpdatingProfile}
                    className="mt-2"
                  >
                    حفظ التعديلات
                  </Button>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#E8E3D8]">
                    <span className="text-neutral-400 font-bold block mb-1">البريد الإلكتروني المعتمد</span>
                    <span className="font-black text-[#111111]">{user?.email}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#E8E3D8]">
                    <span className="text-neutral-400 font-bold block mb-1">رقم الجوال</span>
                    <span className="font-black text-[#111111] font-mono">{user?.phone || 'غير محدد بعد'}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#E8E3D8]">
                    <span className="text-neutral-400 font-bold block mb-1">تاريخ الانضمام</span>
                    <span className="font-black text-[#111111]">عضو معتمد لعام 2026</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#E8E3D8]">
                    <span className="text-neutral-400 font-bold block mb-1">حالة توثيق الحساب</span>
                    <span className="font-black text-[#008F68] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      موثق ومؤمن بالكامل
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E8E3D8] pb-3">
                <h3 className="text-sm font-black text-[#111111]">أحدث الطلبات</h3>
                <Link to="/orders" className="text-xs font-black text-[#008F68] hover:underline flex items-center gap-1">
                  <span>عرض الكل</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">لا توجد طلبات مسجلة بعد.</p>
              ) : (
                <div className="flex flex-col divide-y divide-[#F0EAE1]">
                  {orders.slice(0, 3).map((ord, idx) => (
                    <div key={`acc-ord-${ord.id || idx}-${idx}`} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-black text-[#111111]">طلب رقم LX-{ord.id.toString().padStart(4, '0')}</p>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {new Date(ord.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                      <div className="text-left font-mono">
                        <span className="font-black text-[#111111]">{Number(ord?.total ?? 0).toLocaleString('ar-SA')} ر.س</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#111111]">دفتر عناوين التوصيل الملكي</h2>
              <p className="text-xs text-neutral-500 mt-0.5">العناوين التي يتم الشحن إليها مباشرة وبسرعة فائقة.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddressModalOpen(true)}
            >
              إضافة عنوان جديد
            </Button>
          </div>

          {isAddressesLoading ? (
            <div className="p-12 flex justify-center"><Spinner size="lg" /></div>
          ) : addresses.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-[#E8E3D8] text-xs text-neutral-500">
              لا توجد عناوين توصيل محفوظة. أضف عنوانك الأول لتسريع عمليات الشراء اللاحقة.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {addresses.map((addr, idx) => (
                <div
                  key={`acc-addr-${addr.id || idx}-${idx}`}
                  className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all ${
                    addr.is_default
                      ? 'bg-white border-[#008F68] ring-1 ring-[#008F68] shadow-xs'
                      : 'bg-white border-[#E8E3D8] hover:border-neutral-400'
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-[#111111] flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#008F68]" />
                        {addr.label}
                      </span>
                      {Boolean(addr.is_default) && (
                        <span className="text-[10px] font-black bg-[#008F68] text-white px-2.5 py-0.5 rounded-full">
                          الرئيسي
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#111111]">{addr.recipient_name} • <span className="font-mono text-neutral-500">{addr.phone}</span></p>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {addr.address_line1}
                      {addr.address_line2 ? `، ${addr.address_line2}` : ''}، {addr.city}، {addr.state} ({addr.postal_code})
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#F0EAE1] text-xs">
                    {!addr.is_default ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-[#008F68] hover:underline font-black cursor-pointer"
                      >
                        تعيين كافتراضي
                      </button>
                    ) : <span className="text-neutral-400 text-[11px]">العنوان المعتمد للشحن</span>}

                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-neutral-400 hover:text-rose-600 p-1 rounded-full transition-colors cursor-pointer"
                      title="حذف العنوان"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Royal Wallet & VIP Loyalty */}
      {(activeTab === 'wallet' || activeTab === 'vip') && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#111111] flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#008F68]" />
                <span>المحفظة الملكية وبرنامج مكافآت النخبة</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                استخدم رصيد المتجر المالي للشراء الفوري عند إتمام الطلب، وحوّل نقاط ولائك إلى رصيد نقدي بنقرة واحدة.
              </p>
            </div>
            <Link to="/shop">
              <Button variant="primary" size="sm" leftIcon={<ShoppingBag className="w-4 h-4 text-[#FFC700]" />}>
                تسوق واستخدم الرصيد
              </Button>
            </Link>
          </div>

          {/* Top Row: Digital Royal Card + Instant Converter */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* VIP Black & Gold Digital Card (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="w-full rounded-3xl p-6 sm:p-7 relative overflow-hidden bg-gradient-to-br from-neutral-950 via-[#171717] to-neutral-900 border border-amber-500/30 text-white shadow-lg flex flex-col justify-between min-h-[250px] relative">
                {/* Background Royal Pattern */}
                <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                
                {/* Top of Card */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-[#FFC700]" />
                    <span className="text-xs font-black tracking-widest text-[#FFC700] uppercase">FAKHAMA ROYAL CARD</span>
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-amber-200/60 uppercase">VIP ACCESS</span>
                </div>

                {/* Middle: Balance & Chip */}
                <div className="my-4 z-10 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 block mb-1">الرصيد النقدي المتاح بالمحفظة</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#FFC700] font-mono">
                        {storeCredit.toLocaleString('ar-SA')}
                      </span>
                      <span className="text-sm font-bold text-amber-200/90">ريال سعودي</span>
                    </div>
                  </div>
                  {/* Digital Gold Chip Icon */}
                  <div className="w-11 h-9 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-0.5 shadow-inner flex items-center justify-center shrink-0">
                    <div className="w-full h-full border border-amber-800/40 rounded flex flex-col justify-around p-1">
                      <div className="h-[1px] bg-amber-800/50 w-full" />
                      <div className="h-[1px] bg-amber-800/50 w-3/4 mx-auto" />
                      <div className="h-[1px] bg-amber-800/50 w-full" />
                    </div>
                  </div>
                </div>

                {/* Bottom of Card */}
                <div className="flex items-end justify-between pt-4 border-t border-white/10 z-10 text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">حامل البطاقة الملكية</span>
                    <span className="font-bold text-sm text-neutral-100">{user?.name || 'ضيف فخامة الكريم'}</span>
                  </div>
                  <div className="text-left" dir="ltr">
                    <span className="text-[9px] uppercase tracking-wider text-amber-300/80 block text-right font-mono">MEMBERSHIP</span>
                    <span className="font-mono text-xs font-semibold text-neutral-300">LX-8892 •••• 2026</span>
                  </div>
                </div>
              </div>

              {/* Card Perks Note */}
              <div className="mt-3 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>يُخصم رصيد المحفظة تلقائياً عند الدفع لتغطية طلباتك بالكامل أو جزئياً بلا قيود.</span>
              </div>
            </div>

            {/* Instant Points to Store Credit Converter (7 cols on lg) */}
            <div className="lg:col-span-7 rounded-3xl bg-white border border-[#E8E3D8] p-6 sm:p-7 shadow-2xs flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-[#008F68]/10 text-[#008F68] flex items-center justify-center">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-[#111111]">تحويل نقاط المكافآت إلى رصيد محفظة</h3>
                      <p className="text-[11px] text-neutral-500">استبدل نقاطك المكتسبة من المشتريات برصيد مالي حقيقي فوري</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-neutral-400 block">رصيد النقاط الحالي</span>
                    <span className="font-mono font-black text-sm text-[#008F68]">{loyaltyPoints.toLocaleString('ar-SA')} نقطة</span>
                  </div>
                </div>

                {/* Conversion Rate Banner */}
                <div className="mt-4 p-3 rounded-2xl bg-[#FBF9F4] border border-[#E8E3D8] flex items-center justify-between text-xs">
                  <span className="text-neutral-600 font-bold flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#008F68]" />
                    معدل الصرف الملكي:
                  </span>
                  <span className="font-black text-[#111111] bg-white px-2.5 py-1 rounded-xl border border-[#E8E3D8] shadow-2xs">
                    كل 10 نقاط = 1 ريال سعودي نقداً
                  </span>
                </div>

                {/* Quick Chips Selection */}
                <div className="mt-4">
                  <label className="block text-[11px] font-bold text-neutral-500 mb-2">اختر عدد النقاط المراد تحويلها:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[100, 250, 500].map((pts) => (
                      <button
                        key={`chip-${pts}`}
                        type="button"
                        onClick={() => setConvertPointsAmount(pts)}
                        className={`p-2 rounded-xl border text-xs font-black transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                          convertPointsAmount === pts
                            ? 'bg-[#008F68] text-white border-[#008F68] shadow-2xs'
                            : 'bg-white hover:bg-neutral-50 border-[#E8E3D8] text-[#111111]'
                        }`}
                      >
                        <span>{pts} نقطة</span>
                        <span className={`text-[10px] ${convertPointsAmount === pts ? 'text-emerald-100' : 'text-neutral-400'}`}>
                          ({pts / 10} ر.س)
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setConvertPointsAmount(loyaltyPoints)}
                      disabled={loyaltyPoints <= 0}
                      className={`p-2 rounded-xl border text-xs font-black transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                        convertPointsAmount === loyaltyPoints && loyaltyPoints > 0
                          ? 'bg-[#008F68] text-white border-[#008F68] shadow-2xs'
                          : 'bg-white hover:bg-neutral-50 border-[#E8E3D8] text-[#111111] disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      <span>كامل الرصيد</span>
                      <span className={`text-[10px] ${convertPointsAmount === loyaltyPoints ? 'text-emerald-100' : 'text-neutral-400'}`}>
                        ({Math.floor(loyaltyPoints / 10)} ر.س)
                      </span>
                    </button>
                  </div>
                </div>

                {/* Custom Points Input & Preview */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 mb-1">أو أدخل عدد النقاط المخصص:</label>
                    <input
                      type="number"
                      min="10"
                      step="10"
                      max={loyaltyPoints}
                      value={convertPointsAmount}
                      onChange={(e) => setConvertPointsAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2.5 rounded-xl border border-[#E8E3D8] bg-white text-xs font-mono font-bold text-[#111111] focus:outline-none focus:border-[#008F68]"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-emerald-800">الرصيد النقدي المستحق:</span>
                    <span className="text-base font-black text-emerald-900 font-mono">
                      +{(convertPointsAmount / 10).toFixed(0)} ريال سعودي
                    </span>
                  </div>
                </div>
              </div>

              {/* Convert Button */}
              <button
                type="button"
                onClick={() => handleConvertPoints(convertPointsAmount)}
                disabled={isConvertingPoints || loyaltyPoints <= 0 || convertPointsAmount <= 0 || convertPointsAmount > loyaltyPoints}
                className="w-full py-3 bg-[#008F68] hover:bg-[#007a58] disabled:bg-neutral-200 disabled:text-neutral-400 text-white rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                {isConvertingPoints ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FFC700]" />
                    <span>تأكيد التحويل وإضافة الرصيد إلى المحفظة فوراً</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tier Progress & VIP Perks Grid */}
          <div className="rounded-3xl bg-white border border-[#E8E3D8] p-6 sm:p-7 shadow-2xs flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EAE1] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#FFC700]" />
                  <h3 className="font-black text-sm text-[#111111]">مستوى العضوية الملكية ومؤشر الترقية</h3>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  إجمالي مشترياتك المؤهلة حتى الآن: <span className="font-bold text-[#111111] font-mono">{totalSpent.toLocaleString('ar-SA')} ر.س</span>
                </p>
              </div>

              <span className="text-xs font-black px-3.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5 self-start sm:self-auto">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                فئتك الحالية: {vipTier}
              </span>
            </div>

            {/* Progress Bar towards Next Tier */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-neutral-600">
                  {rawTier === 'vip_royal'
                    ? 'أنت في أرقى فئة ملكية VIP في متجر فخامة 👑'
                    : `التقدم نحو فئة ${rawTier === 'gold' ? 'النخبة الملكية VIP' : rawTier === 'silver' ? 'الذهبية الفاخرة' : 'الفضية الترحيبية'}`}
                </span>
                <span className="font-mono text-[#008F68]">
                  {rawTier === 'vip_royal'
                    ? '100%'
                    : rawTier === 'gold'
                    ? `${Math.min(100, Math.round((totalSpent / 15000) * 100))}%`
                    : rawTier === 'silver'
                    ? `${Math.min(100, Math.round((totalSpent / 8000) * 100))}%`
                    : `${Math.min(100, Math.round((totalSpent / 3000) * 100))}%`}
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden p-0.5 border border-[#E8E3D8]">
                <div
                  className="h-full bg-linear-to-l from-[#008F68] to-[#FFC700] rounded-full transition-all duration-500"
                  style={{
                    width:
                      rawTier === 'vip_royal'
                        ? '100%'
                        : rawTier === 'gold'
                        ? `${Math.min(100, Math.max(10, (totalSpent / 15000) * 100))}%`
                        : rawTier === 'silver'
                        ? `${Math.min(100, Math.max(10, (totalSpent / 8000) * 100))}%`
                        : `${Math.min(100, Math.max(5, (totalSpent / 3000) * 100))}%`,
                  }}
                />
              </div>
              {rawTier !== 'vip_royal' && (
                <p className="text-[11px] text-neutral-400 mt-2">
                  تبقى لك إنفاق{' '}
                  <span className="font-bold text-[#111111] font-mono">
                    {(
                      (rawTier === 'gold' ? 15000 : rawTier === 'silver' ? 8000 : 3000) - totalSpent
                    ).toLocaleString('ar-SA')}{' '}
                    ر.س
                  </span>{' '}
                  للارتقاء تلقائياً إلى الفئة الأعلى والتمتع بمزايا مضاعفة.
                </p>
              )}
            </div>

            {/* 3 VIP Perks Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-[#FBF9F4] border border-[#E8E3D8] flex flex-col gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#008F68]/10 text-[#008F68] flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <h4 className="font-black text-xs text-[#111111]">تغليف الهدايا الملكي المجاني</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  علب مخملية فاخرة وبطاقات إهداء مخصصة ومختومة بشعار فخامة الملكي مجاناً لكافة مقتنياتك.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FBF9F4] border border-[#E8E3D8] flex flex-col gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFC700]/20 text-amber-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-black text-xs text-[#111111]">أولوية المعاينة والحجز الحصري</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  إمكانية معاينة وحجز القطع النادرة والمجموعات الموسمية المحدودة قبل طرحها العام بـ 48 ساعة.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FBF9F4] border border-[#E8E3D8] flex flex-col gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#111111] text-[#FFC700] flex items-center justify-center">
                  <Crown className="w-4 h-4" />
                </div>
                <h4 className="font-black text-xs text-[#111111]">مستشار اقتناء شخصي VIP</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  خدمة استشارية خاصة على مدار الساعة لمساعدتك في انتقاء وتنسيق الهدايا الرفيعة والمقتنيات الثمينة.
                </p>
              </div>
            </div>
          </div>

          {/* Wallet Transactions History / Ledger */}
          <div className="rounded-3xl bg-white border border-[#E8E3D8] p-6 sm:p-7 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-neutral-100 text-[#111111] flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#111111]">سجل حركات ومعاملات المحفظة الملكية</h3>
                  <p className="text-[11px] text-neutral-500">كشف حساب موثق بجميع الإيداعات والاستخدامات واسترداد المبالغ</p>
                </div>
              </div>
              <span className="text-xs text-neutral-400 font-bold">
                {customer?.walletTransactions?.length || 0} عملية مسجلة
              </span>
            </div>

            {(!customer?.walletTransactions || customer.walletTransactions.length === 0) ? (
              <div className="py-10 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 text-neutral-400 flex items-center justify-center border border-[#E8E3D8]">
                  <Wallet className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-neutral-700">لا توجد حركات مالية مسجلة على المحفظة حتى الآن</p>
                <p className="text-[11px] text-neutral-400 max-w-sm leading-relaxed">
                  عند سداد مشترياتك بالرصيد، أو تحويل نقاط المكافآت، أو استرداد مبالغ المرتجعات، ستظهر تفاصيل المعاملة هنا بدقة.
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#F0EAE1]">
                {(customer.walletTransactions as WalletTransaction[]).map((tx, idx) => {
                  const isPositive = tx.type === 'credit_added' || tx.type === 'order_refund' || tx.type === 'points_converted';
                  return (
                    <div key={tx.id || `acc-tx-${idx}`} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            tx.type === 'points_converted'
                              ? 'bg-amber-100 text-amber-800'
                              : tx.type === 'order_refund'
                              ? 'bg-blue-100 text-blue-800'
                              : tx.type === 'credit_spent'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {tx.type === 'points_converted' ? (
                            <Coins className="w-4 h-4" />
                          ) : tx.type === 'order_refund' ? (
                            <RotateCcw className="w-4 h-4" />
                          ) : tx.type === 'credit_spent' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-[#111111]">{tx.description}</span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                tx.type === 'points_converted'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : tx.type === 'order_refund'
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : tx.type === 'credit_spent'
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {tx.type === 'points_converted'
                                ? 'تحويل نقاط'
                                : tx.type === 'order_refund'
                                ? 'استرداد طلب'
                                : tx.type === 'credit_spent'
                                ? 'شراء طلب'
                                : 'إيداع رصيد'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-neutral-400 mt-1">
                            <span>{new Date(tx.date).toLocaleDateString('ar-SA')} - {new Date(tx.date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span>الرصيد بعد العملية: {tx.balanceAfter.toLocaleString('ar-SA')} ر.س</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left" dir="ltr">
                        <span
                          className={`font-mono text-sm font-black ${
                            isPositive ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? '+' : '-'}{tx.amount.toLocaleString('ar-SA')} SAR
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Returns & Warranty Requests */}
      {activeTab === 'returns' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#111111]">طلبات الاسترجاع والضمان والاستبدال</h2>
              <p className="text-xs text-neutral-500 mt-0.5">متابعة حالة طلبات الشحن العكسي واسترداد الأموال المباشرة.</p>
            </div>
            <Link to="/orders">
              <Button variant="secondary" size="sm" leftIcon={<Package className="w-3.5 h-3.5 text-[#008F68]" />}>
                تقديم طلب من سجل الفواتير
              </Button>
            </Link>
          </div>

          {userReturns.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-[#E8E3D8] text-xs text-neutral-500 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-[#111111]">لا توجد طلبات استرجاع أو استبدال حالية</p>
              <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
                إذا كنت ترغب في استرجاع أو استبدال أي مقتنى قمت بشرائه، تفضل بزيارة صفحة تفاصيل الطلب واضغط على "طلب استرجاع أو استبدال".
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {userReturns.map((ret, idx) => (
                <div
                  key={`acc-ret-${ret.id || idx}-${idx}`}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E8E3D8] flex flex-col gap-4 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0EAE1] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#008F68]/10 text-[#008F68] flex items-center justify-center font-mono font-black text-sm">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-[#111111]">طلب استرجاع #{ret.id.replace('ret_', '')}</span>
                          <span className="text-xs text-neutral-400">لطلب الشراء #{String(ret.orderId).replace('ORD-', '')}</span>
                        </div>
                        <span className="text-[11px] text-neutral-500">
                          تاريخ الطلب: {new Date(ret.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          ret.status === 'refunded'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : ret.status === 'approved'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : ret.status === 'item_received'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : ret.status === 'rejected'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {ret.status === 'refunded' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {ret.status === 'approved' && <Clock className="w-3.5 h-3.5" />}
                        {ret.status === 'pending_review' && <Clock className="w-3.5 h-3.5" />}
                        {ret.status === 'rejected' && <AlertCircle className="w-3.5 h-3.5" />}
                        {ret.status === 'pending_review'
                          ? 'قيد مراجعة الإدارة'
                          : ret.status === 'approved'
                          ? 'تمت الموافقة - بانتظار الشحن'
                          : ret.status === 'item_received'
                          ? 'تم استلام الشحنة وفحصها'
                          : ret.status === 'refunded'
                          ? 'مكتمل وتم إرجاع المبلغ'
                          : 'مرفوض'}
                      </span>
                    </div>
                  </div>

                  {/* Items in Return */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-neutral-500">المقتنيات المشمولة بالاسترجاع:</span>
                    <div className="flex flex-wrap gap-3">
                      {ret.items.map((item, idx) => (
                        <div
                          key={`ret-item-${item.id || idx}-${idx}`}
                          className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FCFAF7] border border-[#E8E3D8] text-xs"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-[#E8E3D8]"
                            />
                          )}
                          <div>
                            <p className="font-black text-[#111111]">{item.name}</p>
                            <p className="text-[11px] text-neutral-500 font-mono">
                              الكمية: {item.quantity} • {Number(item.price || 0).toLocaleString('ar-SA')} ر.س
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reason notes */}
                  {ret.reasonNotes && (
                    <div className="p-3.5 rounded-2xl bg-[#FCFAF7] border border-[#E8E3D8] text-xs text-neutral-600 leading-relaxed">
                      <span className="font-bold text-[#111111]">تفاصيل وملاحظات الطلب: </span>
                      {ret.reasonNotes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[#F0EAE1]">
                    <div className="text-xs text-neutral-500">
                      مبلغ الاسترداد المقدر: <span className="font-mono font-black text-[#111111] text-sm">{Number(ret.refundAmount || 0).toLocaleString('ar-SA')} ر.س</span>
                    </div>
                    <Link to={`/orders/${String(ret.orderId).replace('ORD-', '')}`}>
                      <Button variant="outline" size="sm" leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}>
                        عرض فاتورة الطلب الأصلية
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Support & Concierge Tickets */}
      {activeTab === 'tickets' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3D8] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#008F68]/10 text-[#008F68] flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#111111]">تذاكر الدعم والكونسيرج الملكي</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  تواصل مباشرة مع فريق المستشارين ومتابعة استفساراتك وطلباتك الخاصة
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewTicketModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              فتح تذكرة استفسار جديدة
            </Button>
          </div>

          {userTickets.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E8E3D8] flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-black text-[#111111]">لا توجد تذاكر دعم سابقة</h3>
              <p className="text-xs text-neutral-500 max-w-sm">
                هل لديك استفسار حول أحد المقتنيات أو ترغب في خدمة كونسيرج مخصصة؟ فريقنا في خدمتك دائماً.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewTicketModalOpen(true)}
                className="mt-2"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                تواصل مع مستشار فخامة
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Tickets List */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                {userTickets.map((ticket) => {
                  const isSelected = selectedTicketId === ticket.id || (!selectedTicketId && userTickets[0]?.id === ticket.id);
                  const isClosed = ticket.status === 'resolved' || ticket.status === 'closed';
                  const isInProgress = ticket.status === 'in_progress';

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                        isSelected
                          ? 'bg-[#FAF8F3] border-[#008F68] shadow-xs ring-1 ring-[#008F68]/30'
                          : 'bg-white border-[#E8E3D8] hover:border-[#008F68]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-[#008F68]">
                          #{ticket.ticketNumber}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            isClosed
                              ? 'bg-emerald-50 text-emerald-700'
                              : isInProgress
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {isClosed ? 'تم الحل' : isInProgress ? 'قيد المعالجة' : 'جديدة'}
                        </span>
                      </div>

                      <h4 className="font-black text-sm text-[#111111] line-clamp-1">{ticket.subject}</h4>
                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{ticket.message}</p>

                      <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-2 border-t border-[#F0EAE1]">
                        <span>{new Date(ticket.createdAt).toLocaleDateString('ar-SA')}</span>
                        <span>{ticket.responses?.length || 0} ردود</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Ticket Conversation */}
              {(() => {
                const currentTicket =
                  userTickets.find((t) => t.id === selectedTicketId) || userTickets[0];
                if (!currentTicket) return null;

                const isClosed = currentTicket.status === 'resolved' || currentTicket.status === 'closed';

                const handleSendReply = (e: React.FormEvent) => {
                  e.preventDefault();
                  if (!ticketReplyText.trim()) return;
                  commerceStore.addSupportTicketResponse(currentTicket.id, 'customer', ticketReplyText.trim());
                  setTicketReplyText('');
                  showToast('تم إرسال ردك إلى فريق الدعم بنجاح.', 'success');
                };

                return (
                  <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8E3D8] shadow-2xs overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-5 border-b border-[#E8E3D8] bg-[#FAF8F3] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#008F68]">
                            #{currentTicket.ticketNumber}
                          </span>
                          <h3 className="font-black text-sm text-[#111111]">{currentTicket.subject}</h3>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          تاريخ الإنشاء: {new Date(currentTicket.createdAt).toLocaleString('ar-SA')}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                          isClosed
                            ? 'bg-emerald-100 text-emerald-800'
                            : currentTicket.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isClosed ? 'مكتملة' : currentTicket.status === 'in_progress' ? 'قيد المعالجة' : 'مفتوحة'}
                      </span>
                    </div>

                    {/* Messages Flow */}
                    <div className="p-5 flex-1 max-h-[420px] overflow-y-auto flex flex-col gap-4">
                      {/* Customer Original Inquiry */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#008F68]/10 text-[#008F68] flex items-center justify-center shrink-0 text-xs font-black">
                          {user?.name?.charAt(0) || 'أنت'}
                        </div>
                        <div className="flex-1 bg-[#FAF8F3] p-4 rounded-2xl rounded-tr-none border border-[#E8E3D8]">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-black text-xs text-[#111111]">أنت</span>
                            <span className="text-[10px] text-neutral-400">
                              {new Date(currentTicket.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap">
                            {currentTicket.message}
                          </p>
                        </div>
                      </div>

                      {/* Conversation Responses */}
                      {currentTicket.responses?.map((resp) => {
                        const isAdmin = resp.sender === 'admin';
                        return (
                          <div
                            key={resp.id}
                            className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black ${
                                isAdmin
                                  ? 'bg-[#111111] text-[#FFC700]'
                                  : 'bg-[#008F68]/10 text-[#008F68]'
                              }`}
                            >
                              {isAdmin ? <Crown className="w-4 h-4" /> : user?.name?.charAt(0) || 'أنت'}
                            </div>
                            <div
                              className={`flex-1 p-4 rounded-2xl border ${
                                isAdmin
                                  ? 'bg-emerald-50/60 border-emerald-200/80 rounded-tl-none'
                                  : 'bg-[#FAF8F3] border-[#E8E3D8] rounded-tr-none'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`font-black text-xs ${isAdmin ? 'text-emerald-950 flex items-center gap-1' : 'text-[#111111]'}`}>
                                  {isAdmin ? 'مستشار فخامة الملكي' : 'أنت'}
                                  {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                                </span>
                                <span className="text-[10px] text-neutral-400">
                                  {new Date(resp.timestamp).toLocaleString('ar-SA')}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap">
                                {resp.message}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Reply Form */}
                    <div className="p-4 border-t border-[#E8E3D8] bg-[#FAF8F3]">
                      <form onSubmit={handleSendReply} className="flex gap-2">
                        <input
                          type="text"
                          value={ticketReplyText}
                          onChange={(e) => setTicketReplyText(e.target.value)}
                          placeholder={isClosed ? 'أرسل رداً لإعادة فتح المحادثة مع المستشار...' : 'اكتب ردك أو استفسارك الإضافي هنا...'}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8E3D8] text-xs focus:outline-none focus:border-[#008F68] bg-white text-[#111111]"
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          disabled={!ticketReplyText.trim()}
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                        >
                          إرسال
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'security' && (
        <div className="max-w-xl p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3D8] flex flex-col gap-5 shadow-2xs animate-in fade-in duration-200">
          <h2 className="text-base font-black text-[#111111] flex items-center gap-2 border-b border-[#E8E3D8] pb-3">
            <KeyRound className="w-4 h-4 text-[#008F68]" />
            <span>تأمين الحساب وإدارة الدخول</span>
          </h2>

          {user?.provider === 'google.com' && (
            <div className="p-4 rounded-2xl bg-[#008F68]/5 border border-[#008F68]/20 flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-black text-[#111111]">أنت مسجل الدخول باستخدام Google الموثق</p>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  يتم تأمين بيانات تسجيل دخولك والمصادقة الثنائية تلقائياً وبأعلى درجات التشفير عبر خوادم Google الآمنة.
                </p>
              </div>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <Input
              label="كلمة المرور الحالية"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label="كلمة المرور الجديدة"
              type="password"
              placeholder="6 خانات على الأقل"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label="تأكيد كلمة المرور الجديدة"
              type="password"
              placeholder="إعادة كتابة كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isChangingPassword}
              className="mt-2"
            >
              تحديث وحفظ كلمة المرور
            </Button>
          </form>
        </div>
      )}

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="إضافة عنوان توصيل جديد"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAddress} className="flex flex-col gap-4 font-arabic" dir="rtl">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="تسمية العنوان"
              placeholder="مثال: المنزل، المكتب، القصر"
              value={addrLabel}
              onChange={(e) => setAddrLabel(e.target.value)}
              required
            />
            <Input
              label="اسم المستلم"
              placeholder="سلطان آل سعود"
              value={addrRecipient}
              onChange={(e) => setAddrRecipient(e.target.value)}
              required
            />
          </div>

          <Input
            label="رقم الهاتف"
            type="tel"
            placeholder="+966 50 123 4567"
            value={addrPhone}
            onChange={(e) => setAddrPhone(e.target.value)}
            required
          />

          <Input
            label="العنوان والشارع"
            placeholder="طريق الملك فهد، حي العليا"
            value={addrLine1}
            onChange={(e) => setAddrLine1(e.target.value)}
            required
          />

          <Input
            label="رقم المبنى / الشقة (اختياري)"
            placeholder="برج النخيل، طابق 14"
            value={addrLine2}
            onChange={(e) => setAddrLine2(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="المدينة"
              placeholder="الرياض"
              value={addrCity}
              onChange={(e) => setAddrCity(e.target.value)}
              required
            />
            <Input
              label="المنطقة"
              placeholder="منطقة الرياض"
              value={addrState}
              onChange={(e) => setAddrState(e.target.value)}
              required
            />
            <Input
              label="الرمز البريدي"
              placeholder="12211"
              value={addrPostal}
              onChange={(e) => setAddrPostal(e.target.value)}
              required
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-[#111111] mt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={addrIsDefault}
              onChange={(e) => setAddrIsDefault(e.target.checked)}
              className="rounded-sm border-[#E8E3D8] text-[#008F68] focus:ring-[#008F68] cursor-pointer"
            />
            <span>تعيين كعنوان توصيل رئيسي وافتراضي</span>
          </label>

          <Button
            type="submit"
            variant="primary"
            isLoading={isCreatingAddress}
            className="mt-3"
          >
            حفظ العنوان
          </Button>
        </form>
      </Modal>

      {/* New Support Ticket Modal */}
      <Modal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        title="فتح تذكرة استفسار أو طلب كونسيرج جديد"
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newTicketSubject.trim() || !newTicketMessage.trim()) {
              showToast('يرجى كتابة موضوع ورسالة الاستفسار.', 'warning');
              return;
            }
            setIsSubmittingTicket(true);
            setTimeout(() => {
              const created = commerceStore.addSupportTicket({
                customerName: user?.name || 'عميل فخامة',
                customerEmail: user?.email || 'customer@fakhama.sa',
                customerPhone: user?.phone || phone || '',
                subject: newTicketSubject.trim(),
                message: newTicketMessage.trim(),
              });
              setIsSubmittingTicket(false);
              setIsNewTicketModalOpen(false);
              setNewTicketSubject('');
              setNewTicketMessage('');
              setSelectedTicketId(created.id);
              showToast(`تم فتح التذكرة #${created.ticketNumber} بنجاح! سيجيبك المستشار قريباً.`, 'success');
            }, 500);
          }}
          className="flex flex-col gap-4 font-arabic"
          dir="rtl"
        >
          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#E8E3D8] text-xs text-neutral-600 leading-relaxed">
            فريق مستشاري فخامة متاح لخدمتك والإجابة على أي استفسار حول المقتنيات، التوصيل المخصص، أو طلبات الضمان.
          </div>

          <Input
            label="موضوع التذكرة / نوع الاستفسار"
            placeholder="مثال: استفسار عن مقتنى خاص، تعديل موعد التسليم، شهادة الأصالة"
            value={newTicketSubject}
            onChange={(e) => setNewTicketSubject(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#111111]">تفاصيل الاستفسار أو الطلب</label>
            <textarea
              rows={4}
              placeholder="اكتب استفسارك بالتفصيل وسيقوم مستشار فخامة بالرد عليك في أقرب وقت..."
              value={newTicketMessage}
              onChange={(e) => setNewTicketMessage(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-[#E8E3D8] text-xs focus:outline-none focus:border-[#008F68] bg-white text-[#111111] resize-none"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmittingTicket}
            className="mt-2"
            leftIcon={<Send className="w-4 h-4" />}
          >
            إرسال التذكرة الآن
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default AccountPage;
