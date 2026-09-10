import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { useAddresses } from '../hooks/useAccount';
import { useCreateOrder } from '../hooks/useOrders';
import { useToast } from '../context/ToastContext';
import { commerceStore } from '../shared/store/commerceStore';
import { commerceEventBus } from '../shared/events/commerceEvents';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Alert } from '../components/ui/Alert';
import {
  CreditCard,
  Truck,
  MapPin,
  Lock,
  AlertCircle,
  Building,
  User as UserIcon,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Wallet,
  Sparkles,
  ArrowRight,
  Clock,
  Check
} from 'lucide-react';

const PAYMENT_METHODS = [
  {
    id: 'mada',
    title: 'بطاقة مدى / البطاقة الائتمانية',
    desc: 'دفع آمن ومشفر فوري يدعم مدى وفيزا وماستركارد',
    icon: CreditCard,
    badge: 'الأكثر استخداماً',
  },
  {
    id: 'apple_pay',
    title: 'Apple Pay / الدفع السريع',
    desc: 'إتمام الطلب بلمسة واحدة عبر بصمة الوجه أو الإصبع',
    icon: Wallet,
    badge: 'فوري وآمن',
  },
  {
    id: 'tabby',
    title: 'تابي / تمارا (قسّمها على 4 دفعات)',
    desc: 'ادفع ربع القيمة الآن وقسّم الباقي بدون فوائد أو رسوم',
    icon: Sparkles,
    badge: 'بدون فوائد',
  },
  {
    id: 'cod',
    title: 'الدفع عند الاستلام VIP',
    desc: 'الدفع نقداً أو بجهاز مدى عند وصول مندوب التوصيل',
    icon: Truck,
    badge: 'خدمة خاصة',
  },
];

export const CheckoutPage: React.FC = () => {
  const { cart, clearCart, giftWrapping, giftMessage } = useCart();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { data: productsData } = useProducts({ limit: 100 });
  const { data: addresses } = useAddresses(isAuthenticated);
  const { mutateAsync: createOrder, isPending: isSubmitting } = useCreateOrder();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Address Selection or Input
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>('new');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('الرياض');
  const [state, setState] = useState('منطقة الرياض');
  const [postalCode, setPostalCode] = useState('12211');
  const [country, setCountry] = useState('المملكة العربية السعودية');

  // Shipping & Payment Methods
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState('mada');

  // Card Inputs
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Dynamic store settings from central commerceStore
  const [storeSettings, setStoreSettings] = useState(() => commerceStore.getStoreSettings());

  // Auto-fill from user profile
  useEffect(() => {
    if (user) {
      if (!recipientName) setRecipientName(user.name || '');
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Handle saved addresses
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => Boolean(a.is_default)) || addresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        applyAddress(defaultAddr);
      }
    }
  }, [addresses]);

  const applyAddress = (addr: any) => {
    setRecipientName(addr.recipient_name);
    setPhone(addr.phone);
    setAddressLine1(addr.address_line1);
    setAddressLine2(addr.address_line2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postal_code);
    setCountry(addr.country || 'المملكة العربية السعودية');
  };

  const handleSelectAddressChange = (addrId: number | 'new') => {
    setSelectedAddressId(addrId);
    if (addrId === 'new') {
      setAddressLine1('');
      setAddressLine2('');
    } else {
      const found = addresses?.find((a) => a.id === addrId);
      if (found) applyAddress(found);
    }
  };

  const productsMap = useMemo(() => {
    const map = new Map<number, any>();
    if (productsData?.products) {
      for (const p of productsData.products) {
        map.set(p.id, p);
      }
    }
    return map;
  }, [productsData]);

  const items = useMemo(() => {
    return cart.map((item) => {
      const product = productsMap.get(item.productId);
      return {
        ...item,
        product,
        price: product?.price || 0,
        name: product?.name || `مقتنى رقم #${item.productId}`,
        image_url: product?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
        subtotal: (product?.price || 0) * item.quantity,
      };
    });
  }, [cart, productsMap]);

  // Coupon & Discount state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    calculatedDiscount: number;
  } | null>(null);

  // Synchronized Customer State for VIP membership and Store Credit (Wallet)
  const [customer, setCustomer] = useState<any>(null);
  const [useStoreCredit, setUseStoreCredit] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.email) return;
    const loadCustomer = () => {
      const found = commerceStore.getCustomers().find(
        (c) => c.email.toLowerCase() === user.email.toLowerCase()
      );
      setCustomer(found || null);
    };
    loadCustomer();
    const unsub = commerceStore.subscribe(() => {
      loadCustomer();
    });
    return () => unsub();
  }, [user?.email]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (!clean) return;

    const validation = commerceStore.validateCoupon(clean, subtotal);
    if (validation.valid && validation.coupon) {
      setAppliedPromo({
        code: validation.coupon.code,
        discountType: validation.coupon.discountType,
        discountValue: validation.coupon.discountValue,
        calculatedDiscount: validation.discountAmount,
      });
      showToast(`تم تفعيل القسيمة (${validation.coupon.code}) وخصم ${validation.discountAmount} ر.س بنجاح!`, 'success');
      setPromoCode('');
    } else {
      showToast(validation.message || 'رمز القسيمة غير صالح أو لا يستوفي الشروط.', 'warning');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    showToast('تمت إزالة قسيمة الخصم.', 'info');
  };

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.subtotal, 0), [items]);

  useEffect(() => {
    const unsubSettings = commerceEventBus.subscribe('SETTINGS_UPDATED', (newSettings) => {
      setStoreSettings(newSettings);
    });

    const unsubCoupons = commerceStore.subscribe(() => {
      setStoreSettings(commerceStore.getStoreSettings());
      if (appliedPromo) {
        const validation = commerceStore.validateCoupon(appliedPromo.code, subtotal);
        if (validation.valid && validation.coupon) {
          setAppliedPromo({
            code: validation.coupon.code,
            discountType: validation.coupon.discountType as 'percentage' | 'fixed_amount',
            discountValue: validation.coupon.discountValue,
            calculatedDiscount: validation.discountAmount,
          });
        } else {
          setAppliedPromo(null);
          showToast('تم إلغاء أو تعديل قسيمة الخصم النشطة من قبل إدارة النظام.', 'warning');
        }
      }
    });

    return () => {
      unsubSettings();
      unsubCoupons();
    };
  }, [appliedPromo, subtotal, showToast]);
  const discountAmount = appliedPromo ? appliedPromo.calculatedDiscount : 0;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingThreshold = storeSettings.freeShippingThreshold || 500;
  const isFreeStandard = taxableSubtotal >= shippingThreshold;
  const baseShipping = isFreeStandard ? 0 : (storeSettings.defaultShippingFee ?? 45);
  const shippingFee = shippingMethod === 'express' ? baseShipping + 25 : baseShipping;
  const taxRate = storeSettings.taxRatePercentage ?? 15;
  const tax = Math.round((taxableSubtotal * taxRate) / 100);
  const preCreditTotal = Math.max(0, taxableSubtotal + shippingFee + tax);
  const appliedCredit = useStoreCredit && customer ? Math.min(customer.storeCreditBalance || 0, preCreditTotal) : 0;
  const total = Math.max(0, preCreditTotal - appliedCredit);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (cart.length === 0) {
      setFormError('حقيبة التسوق فارغة. يرجى إضافة مقتنيات قبل إتمام الطلب.');
      return;
    }

    // Pre-flight Stock Availability Check
    for (const item of items) {
      const p = item.product || commerceStore.getProductById(item.productId);
      const available = p ? p.stock : 0;
      if (available <= 0) {
        setFormError(`عذراً، المقتنى "${item.name}" نفد من المستودع حالياً. يرجى حذفه من الحقيبة لمتابعة الدفع.`);
        return;
      }
      if (item.quantity > available) {
        setFormError(`عذراً، الكمية المطلوبة من "${item.name}" (${item.quantity}) تتجاوز المتوفر في المستودع (${available} فقط). يرجى تعديل الكمية.`);
        return;
      }
    }

    if (!recipientName.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      setFormError('يرجى ملء جميع حقول عنوان التوصيل الإلزامية.');
      return;
    }

    if (paymentMethod === 'mada') {
      if (!cardholderName.trim() || !cardNumber.trim() || !cardExp.trim() || !cardCvv.trim()) {
        setFormError('يرجى إدخال كافة بيانات بطاقة الدفع (الاسم، الرقم، تاريخ الانتهاء، ورمز الأمان).');
        return;
      }
    }

    try {
      const fullAddress = [addressLine1.trim(), addressLine2.trim()].filter(Boolean).join(', ');
      const orderPayload = {
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customer: {
          name: recipientName.trim(),
          email: user?.email || 'customer@luxestore.com',
          address: fullAddress,
          city: city.trim(),
          postalCode: postalCode.trim(),
          postal_code: postalCode.trim(),
          phone: phone.trim(),
        },
        shippingAddress: {
          recipient_name: recipientName.trim(),
          phone: phone.trim(),
          address_line1: addressLine1.trim(),
          address_line2: addressLine2.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          postal_code: postalCode.trim(),
          country: country.trim(),
        },
        shippingMethod,
        paymentMethod: paymentMethod === 'mada' ? 'Credit Card / Mada' : paymentMethod === 'apple_pay' ? 'Apple Pay' : paymentMethod === 'tabby' ? 'Tabby 4x' : 'Cash on Delivery VIP',
        couponCode: appliedPromo?.code,
        discountTotal: discountAmount,
        giftWrapping,
        giftMessage: giftWrapping ? giftMessage : undefined,
        storeCreditApplied: appliedCredit,
      };

      const created = await createOrder(orderPayload);
      
      clearCart();
      if (user?.email) {
        commerceStore.markAbandonedCartRecovered(user.email);
      }
      showToast('تم تأكيد طلبك بنجاح! شكراً لاختيارك متجر فخامة.', 'success');
      navigate(`/order-success?id=${created.id}`);
    } catch (err: any) {
      setFormError(err.message || 'تعذر إتمام الطلب. يرجى مراجعة البيانات المدخلة.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto font-arabic" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-[#FAF8F3] border border-[#E8E3D8] flex items-center justify-center text-neutral-400 mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#111111] mb-2 tracking-tight">حقيبة المقتنيات فارغة</h2>
        <p className="text-xs text-neutral-500 mb-6 leading-relaxed">يجب أن تحتوي حقيبتك على مقتنيات لتتمكن من إتمام الطلب وتأكيد الشحن.</p>
        <Link to="/">
          <Button variant="primary">العودة إلى المعرض</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-6 pb-20 font-arabic" dir="rtl">
      <Breadcrumbs
        items={[
          { label: 'حقيبة التسوق', path: '/cart' },
          { label: 'إتمام الطلب والدفع' }
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8E3D8] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black px-2.5 py-0.5 bg-[#008F68]/10 text-[#008F68] rounded-full">
              بوابة الدفع الآمنة VIP
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
            إتمام الطلب والدفع المعتمد
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            أدخل عنوان التسليم واختر وسيلة الدفع لاستكمال اقتناء مقتنياتك الفاخرة.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="flex items-center gap-2 text-xs text-neutral-600 bg-white px-4 py-2 rounded-full border border-[#E8E3D8] shadow-2xs">
            <span>لديك حساب عضوية؟</span>
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="text-[#008F68] font-black hover:underline cursor-pointer"
            >
              تسجيل الدخول للاستفادة من نقاط الولاء
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Right Column: Checkout Forms */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {formError && (
            <Alert type="error" onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          {/* Section 1: Shipping Address */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3D8] flex flex-col gap-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E8E3D8] pb-4">
              <h2 className="text-base font-black text-[#111111] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FCFAF7] border border-[#E8E3D8] flex items-center justify-center text-[#008F68]">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>١. عنوان التسليم والتوصيل الملكي</span>
              </h2>
            </div>

            {/* Saved addresses selector if authenticated */}
            {isAuthenticated && addresses && addresses.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-[#111111]">العناوين المسجلة مسبقاً:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr, idx) => (
                    <div
                      key={`chk-addr-${addr.id || idx}-${idx}`}
                      onClick={() => handleSelectAddressChange(addr.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1 ${
                        selectedAddressId === addr.id
                          ? 'border-[#008F68] bg-[#008F68]/5 ring-1 ring-[#008F68]'
                          : 'border-[#E8E3D8] bg-[#FCFAF7] hover:border-neutral-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#111111]">{addr.recipient_name}</span>
                        {addr.is_default && (
                          <span className="text-[10px] bg-[#008F68] text-white px-2 py-0.5 rounded-full font-bold">
                            افتراضي
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate">{addr.address_line1}, {addr.city}</p>
                      <span className="text-[10px] text-neutral-400 font-mono">{addr.phone}</span>
                    </div>
                  ))}
                  <div
                    onClick={() => handleSelectAddressChange('new')}
                    className={`p-3.5 rounded-2xl border border-dashed cursor-pointer transition-all flex items-center justify-center text-xs font-black ${
                      selectedAddressId === 'new'
                        ? 'border-[#008F68] bg-[#008F68]/5 text-[#008F68]'
                        : 'border-[#E8E3D8] text-neutral-500 hover:border-neutral-400'
                    }`}
                  >
                    + إضافة عنوان توصيل جديد
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="اسم المستلم الكامل"
                placeholder="مثال: تركي بن فيصل"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4" />}
                required
              />

              <Input
                label="رقم الجوال للتنسيق مع المندوب"
                type="tel"
                placeholder="+966 50 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                required
              />
            </div>

            <Input
              label="العنوان، الحي، واسم الشارع"
              placeholder="حي حطين، طريق الأمير محمد بن سلمان"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              leftIcon={<Building className="w-4 h-4" />}
              required
            />

            <Input
              label="رقم المبنى أو الفيلا / الطابق (اختياري)"
              placeholder="فيلا 12 / مجمع القصور الملكي"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Input
                label="المدينة"
                placeholder="الرياض"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />

              <Input
                label="المنطقة / الإمارة"
                placeholder="منطقة الرياض"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />

              <Input
                label="الرمز البريدي"
                placeholder="12211"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Section 2: Shipping Method */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3D8] flex flex-col gap-5 shadow-2xs">
            <h2 className="text-base font-black text-[#111111] flex items-center gap-2.5 border-b border-[#E8E3D8] pb-4">
              <div className="w-8 h-8 rounded-full bg-[#FCFAF7] border border-[#E8E3D8] flex items-center justify-center text-[#008F68]">
                <Truck className="w-4 h-4" />
              </div>
              <span>٢. خيارات سرعة الشحن والتوصيل</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setShippingMethod('standard')}
                className={`p-5 rounded-2xl border flex flex-col gap-2 cursor-pointer transition-all ${
                  shippingMethod === 'standard'
                    ? 'bg-[#008F68] text-white border-[#008F68] shadow-xs'
                    : 'bg-[#FCFAF7] border-[#E8E3D8] text-[#111111] hover:border-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm">التوصيل القياسي المؤمن VIP</span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    shippingMethod === 'standard' ? 'bg-white/20 text-[#FFC700]' : 'bg-[#008F68]/10 text-[#008F68]'
                  }`}>مجاني</span>
                </div>
                <p className={`text-xs leading-relaxed ${shippingMethod === 'standard' ? 'text-white/80' : 'text-neutral-500'}`}>
                  توصيل خلال 24 - 48 ساعة مع استلام شخصي وموثق بالتوقيع.
                </p>
              </div>

              <div
                onClick={() => setShippingMethod('express')}
                className={`p-5 rounded-2xl border flex flex-col gap-2 cursor-pointer transition-all ${
                  shippingMethod === 'express'
                    ? 'bg-[#008F68] text-white border-[#008F68] shadow-xs'
                    : 'bg-[#FCFAF7] border-[#E8E3D8] text-[#111111] hover:border-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm">توصيل فوري في نفس اليوم</span>
                  <span className="text-xs font-black text-[#FFC700]">50.00 ر.س</span>
                </div>
                <p className={`text-xs leading-relaxed ${shippingMethod === 'express' ? 'text-white/80' : 'text-neutral-500'}`}>
                  توصيل سريع مخصص بسيارة خاصة ومندوب مباشر خلال 4 ساعات.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method Selection */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3D8] flex flex-col gap-5 shadow-2xs">
            <h2 className="text-base font-black text-[#111111] flex items-center gap-2.5 border-b border-[#E8E3D8] pb-4">
              <div className="w-8 h-8 rounded-full bg-[#FCFAF7] border border-[#E8E3D8] flex items-center justify-center text-[#008F68]">
                <CreditCard className="w-4 h-4" />
              </div>
              <span>٣. وسيلة الدفع المعتمدة</span>
            </h2>

            {/* Payment Method Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method, idx) => {
                const isSelected = paymentMethod === method.id;
                const IconComponent = method.icon;
                return (
                  <div
                    key={`chk-pay-${method.id || idx}-${idx}`}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'border-[#008F68] bg-[#008F68]/5 ring-1 ring-[#008F68]'
                        : 'border-[#E8E3D8] bg-[#FCFAF7] hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`w-4 h-4 ${isSelected ? 'text-[#008F68]' : 'text-neutral-500'}`} />
                        <span className="text-xs font-black text-[#111111]">{method.title}</span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-white border border-[#E8E3D8] rounded-full text-neutral-600">
                        {method.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">{method.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Card Inputs if Mada/Credit Card is selected */}
            {paymentMethod === 'mada' && (
              <div className="mt-2 pt-4 border-t border-[#F0EAE1] flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="الاسم المطبوع على البطاقة"
                    placeholder="SULTAN AL SAUD"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    required
                  />

                  <Input
                    label="رقم البطاقة الائتمانية / مدى"
                    placeholder="4532 •••• •••• 8892"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    leftIcon={<CreditCard className="w-4 h-4" />}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="تاريخ الانتهاء"
                    placeholder="MM / YY"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    required
                  />

                  <Input
                    label="رمز الأمان (CVV)"
                    placeholder="•••"
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'apple_pay' && (
              <div className="p-4 rounded-2xl bg-black text-white text-center flex flex-col items-center gap-2">
                <span className="text-sm font-black">الدفع بضغطة واحدة مع Apple Pay</span>
                <p className="text-xs text-neutral-300">سيتم تفعيل المصادقة البيومترية فور الضغط على تأكيد الطلب.</p>
              </div>
            )}

            {paymentMethod === 'tabby' && (
              <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#E8E3D8] flex items-center justify-between text-xs">
                <div>
                  <span className="font-black text-[#111111]">خطة الأقساط الميسرة:</span>
                  <p className="text-neutral-500 text-[11px] mt-0.5">
                    ادفع <strong>{(total / 4).toFixed(2)} ر.س</strong> اليوم، وقسّم الباقي على 3 أشهر.
                  </p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  0% فوائد
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-neutral-600 bg-[#FAF8F3] p-3.5 rounded-2xl border border-[#E8E3D8]">
              <ShieldCheck className="w-4 h-4 text-[#008F68] shrink-0" />
              <span>مدفوعاتك مشفرة ومحمية بالكامل عبر بوابات البنك المركزي السعودي وبروتوكول SSL 256-bit.</span>
            </div>
          </div>
        </div>

        {/* Left Column: Order Review Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-3xl bg-white border border-[#E8E3D8] p-6 sm:p-7 shadow-2xs flex flex-col gap-5 sticky top-24">
            <h3 className="text-base font-black text-[#111111] tracking-tight border-b border-[#E8E3D8] pb-3">
              مراجعة الطلب ({items.length} مقتنيات)
            </h3>

            {/* Thumbnail preview of items */}
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto divide-y divide-[#FAF8F3] pl-1">
              {items.map((i, idx) => (
                <div key={`chk-item-${i.productId || idx}-${idx}`} className="flex items-center gap-3 pt-2.5 first:pt-0">
                  <img
                    src={i.image_url}
                    alt={i.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl bg-[#FCFAF7] p-1 border border-[#E8E3D8] object-contain shrink-0 mix-blend-multiply"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-[#111111] truncate">{i.name}</p>
                    <p className="text-[11px] text-neutral-400 font-bold">الكمية: {i.quantity} × {Number(i?.price ?? 0).toLocaleString('ar-SA')} ر.س</p>
                  </div>
                  <span className="text-xs font-black text-[#111111] shrink-0 font-mono">
                    {Number(i?.subtotal ?? 0).toLocaleString('ar-SA')} ر.س
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="pt-3 border-t border-[#E8E3D8]">
              {appliedPromo ? (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-emerald-800 uppercase px-2 py-0.5 bg-emerald-100 rounded-md">
                      {appliedPromo.code}
                    </span>
                    <span className="font-bold text-emerald-800">
                      - {Number(appliedPromo?.calculatedDiscount ?? 0).toLocaleString('ar-SA')} ر.س
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-emerald-700 hover:text-red-600 font-bold text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="رمز قسيمة الخصم"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 rounded-xl bg-[#FCFAF7] border border-[#E8E3D8] text-xs px-3 py-2 font-mono uppercase focus:outline-none focus:border-[#008F68]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-[#111111] text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    تطبيق
                  </button>
                </div>
              )}
            </div>

            {/* Store Credit Balance Option */}
            {customer && (customer.storeCreditBalance || 0) > 0 && (
              <div className="pt-3 border-t border-[#E8E3D8]">
                <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-amber-800">
                      <span>👑 المحفظة الملكية</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm">
                        رصيدك: {Number(customer.storeCreditBalance).toLocaleString('ar-SA')} ر.س
                      </span>
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useStoreCredit}
                        onChange={(e) => setUseStoreCredit(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                  {useStoreCredit && (
                    <div className="text-[10px] text-amber-700 font-bold">
                      سيتم تطبيق خصم بقيمة <span className="font-mono">{Number(appliedCredit).toLocaleString('ar-SA')} ر.س</span> من رصيد محفظتك.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Gift Wrapping Notice */}
            {giftWrapping && (
              <div className="p-4 rounded-2xl bg-[#FCFAF5] border border-amber-200/60 flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-amber-800 font-black">
                  <Sparkles className="w-4 h-4 text-[#FFC700] fill-[#FFC700]" />
                  <span>تغليف الهدايا الملكي نشط</span>
                </div>
                {giftMessage ? (
                  <div className="p-3 bg-white rounded-xl border border-[#FAF8F5] text-neutral-600 italic">
                    "{giftMessage}"
                  </div>
                ) : (
                  <span className="text-neutral-400 font-medium">بطاقة إهداء فارغة جاهزة للكتابة اليدوية</span>
                )}
              </div>
            )}

            {/* Breakdown */}
            <div className="flex flex-col gap-2.5 text-xs text-neutral-600 pt-3 border-t border-[#E8E3D8]">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">المجموع الفرعي</span>
                <span className="font-black text-[#111111] font-mono">{Number(subtotal ?? 0).toLocaleString('ar-SA')} ر.س</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>خصم القسيمة ({appliedPromo.code})</span>
                  <span className="font-mono">- {Number(appliedPromo?.calculatedDiscount ?? 0).toLocaleString('ar-SA')} ر.س</span>
                </div>
              )}
              {appliedCredit > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>خصم المحفظة الملكية 💰</span>
                  <span className="font-mono">- {Number(appliedCredit).toLocaleString('ar-SA')} ر.س</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">الشحن والتوصيل</span>
                <span className={`font-black ${shippingFee === 0 ? 'text-[#008F68]' : 'text-[#111111]'}`}>
                  {shippingFee === 0 ? 'مجاني (عرض VIP)' : `${Number(shippingFee ?? 0).toLocaleString('ar-SA')} ر.س`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">ضريبة القيمة المضافة ({taxRate}%)</span>
                <span className="font-black text-[#111111] font-mono">{Number(tax ?? 0).toLocaleString('ar-SA')} ر.س</span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-[#E8E3D8] text-base">
                <span className="font-black text-[#111111]">المبلغ الإجمالي</span>
                <div className="text-left">
                  <span className="text-2xl font-black text-[#111111] font-mono">{Number(total ?? 0).toLocaleString('ar-SA')}</span>
                  <span className="text-xs font-bold text-neutral-500 mr-1">ر.س</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<Lock className="w-4 h-4" />}
              className="w-full"
            >
              تأكيد الطلب والدفع الآمن
            </Button>

            <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
              بتأكيدك لهذا الطلب، فإنك توافق على شروط الخدمة وسياسة الخصوصية الخاصة بمتجر فخامة.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
