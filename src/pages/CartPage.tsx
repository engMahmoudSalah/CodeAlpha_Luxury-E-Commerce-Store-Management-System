import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../hooks/useProducts';
import { useToast } from '../context/ToastContext';
import { commerceStore } from '../shared/store/commerceStore';
import { commerceEventBus } from '../shared/events/commerceEvents';
import { Button } from '../components/ui/Button';
import { QuantityStepper } from '../components/ui/QuantityStepper';
import { EmptyState } from '../components/ui/EmptyState';
import { GiftOptions } from '../components/cart/GiftOptions';
import { FreeShippingProgress } from '../components/cart/FreeShippingProgress';
import { ProductCard } from '../components/product/ProductCard';
import {
  ShoppingBag,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Truck,
  Sparkles,
  RefreshCw,
  Lock,
  Package,
  AlertCircle
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    giftWrapping,
    setGiftWrapping,
    giftMessage,
    setGiftMessage
  } = useCart();
  const { addToWishlist } = useWishlist();
  const { data: productsData } = useProducts({ limit: 100 });
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const recoveryParam = searchParams.get('recovery');
  const couponParam = searchParams.get('coupon');

  // Dynamic store settings from commerceStore
  const [storeSettings, setStoreSettings] = useState(() => commerceStore.getStoreSettings());

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    calculatedDiscount: number;
  } | null>(null);

  // Restore abandoned cart if recovery ID is present and cart is empty
  useEffect(() => {
    if (recoveryParam && cart.length === 0) {
      const abandoned = commerceStore.getAbandonedCartById(recoveryParam);
      if (abandoned && abandoned.items && abandoned.items.length > 0) {
        abandoned.items.forEach((item) => {
          updateQuantity(item.productId, item.quantity);
        });
        showToast(`تمت استعادة مقتنيات سلتك الملكية (${abandoned.cartNumber}) بنجاح!`, 'success');
      }
    }
  }, [recoveryParam, cart.length, updateQuantity, showToast]);

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
        category: product?.category || 'مقتنيات فاخرة',
        stock: product?.stock ?? 99,
        subtotal: (product?.price || 0) * item.quantity,
      };
    });
  }, [cart, productsMap]);

  const rawSubtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [items]);

  const hasOutOfStockItems = useMemo(() => {
    return items.some((item) => item.stock <= 0);
  }, [items]);

  const hasOverStockItems = useMemo(() => {
    return items.some((item) => item.quantity > item.stock);
  }, [items]);

  const hasStockIssues = hasOutOfStockItems || hasOverStockItems;

  useEffect(() => {
    const unsubSettings = commerceEventBus.subscribe('SETTINGS_UPDATED', (newSettings) => {
      setStoreSettings(newSettings);
    });
    
    // Auto-revalidate coupon if coupon configs are modified in admin
    const unsubCoupons = commerceStore.subscribe(() => {
      setStoreSettings(commerceStore.getStoreSettings());
      if (appliedPromo) {
        const validation = commerceStore.validateCoupon(appliedPromo.code, rawSubtotal);
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
  }, [appliedPromo, rawSubtotal, showToast]);

  // Auto-apply coupon from URL if provided
  useEffect(() => {
    if (couponParam && !appliedPromo && rawSubtotal > 0) {
      const validation = commerceStore.validateCoupon(couponParam.trim().toUpperCase(), rawSubtotal);
      if (validation.valid && validation.coupon) {
        setAppliedPromo({
          code: validation.coupon.code,
          discountType: validation.coupon.discountType as 'percentage' | 'fixed_amount',
          discountValue: validation.coupon.discountValue,
          calculatedDiscount: validation.discountAmount,
        });
        showToast(`تم تطبيق قسيمة الخصم الترويجية (${validation.coupon.code}) تلقائياً!`, 'success');
      }
    }
  }, [couponParam, appliedPromo, rawSubtotal, showToast]);

  const discountAmount = appliedPromo ? appliedPromo.calculatedDiscount : 0;
  const shippingThreshold = storeSettings.freeShippingThreshold || 500;
  const isFreeShipping = rawSubtotal >= shippingThreshold;
  const shippingCost = isFreeShipping ? 0 : (storeSettings.defaultShippingFee ?? 45);
  const taxRate = storeSettings.taxRatePercentage ?? 15;
  const estimatedTax = Math.round((Math.max(0, rawSubtotal - discountAmount) * taxRate) / 100);
  const finalTotal = Math.max(0, rawSubtotal - discountAmount + shippingCost + estimatedTax);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (!clean) return;

    const validation = commerceStore.validateCoupon(clean, rawSubtotal);
    if (validation.valid && validation.coupon) {
      setAppliedPromo({
        code: validation.coupon.code,
        discountType: validation.coupon.discountType,
        discountValue: validation.coupon.discountValue,
        calculatedDiscount: validation.discountAmount,
      });
      showToast(
        validation.coupon.discountType === 'percentage'
          ? `تم تطبيق قسيمة الخصم (${validation.coupon.code}): خصم ${validation.coupon.discountValue}% بنجاح!`
          : `تم تطبيق قسيمة الخصم (${validation.coupon.code}): خصم ${validation.coupon.discountValue} ر.س بنجاح!`,
        'success'
      );
      setPromoCode('');
    } else {
      showToast(validation.message || 'رمز القسيمة غير صالح أو منتهي الصلاحية.', 'warning');
    }
  };

  const handleMoveToWishlist = (productId: number, productName: string) => {
    addToWishlist(productId);
    removeFromCart(productId);
    showToast(`تم نقل "${productName}" إلى قائمة رغباتك ومفضلاتك.`, 'info');
  };

  // Upsell suggestions (products not in current cart)
  const cartProductIds = new Set(cart.map((c) => c.productId));
  const suggestedUpsells = (productsData?.products || [])
    .filter((p) => !cartProductIds.has(p.id))
    .slice(0, 4);

  if (cart.length === 0) {
    return (
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-arabic" dir="rtl">
        <EmptyState
          icon={<ShoppingBag className="w-12 h-12 text-[#FFC700]" />}
          title="حقيبة المقتنيات فارغة"
          description="لم تقم بإضافة أي مقتنيات إلى حقيبتك بعد. استكشف مجموعات متجر فخامة لاختيار ما يناسب ذوقك الرفيع."
          actionText="استكشاف المعرض والكتالوج"
          onAction={() => navigate('/')}
        />

        {suggestedUpsells.length > 0 && (
          <div className="mt-16 pt-12 border-t border-neutral-100 flex flex-col gap-6">
            <div className="text-center">
              <h3 className="text-xl font-black text-[#111111]">مقتنيات مختارة قد تنال إعجابك</h3>
              <p className="text-xs text-neutral-500 mt-1">تشكيلة ملكية حصرية متوفرة للشحن الفوري</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {suggestedUpsells.map((p, idx) => (
                <ProductCard key={`cart-empty-upsell-${p.id || idx}-${idx}`} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-8 pb-20 font-arabic" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8E3D8] pb-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#111111] tracking-tight">
            حقيبة المقتنيات الملكية
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            راجع مقتنياتك المحددة، خصومات القسائم، وخيارات تغليف الهدايا والشحن السريع.
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-neutral-400 hover:text-rose-600 transition-colors font-black flex items-center gap-1.5 cursor-pointer px-3.5 py-2 rounded-full hover:bg-rose-50 border border-transparent hover:border-rose-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>تفريغ الحقيبة</span>
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <FreeShippingProgress
        currentSubtotal={rawSubtotal}
        threshold={shippingThreshold}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Right Column: Cart Items List & Gift Wrapping */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="divide-y divide-[#F0EAE1] rounded-3xl bg-white border border-[#E8E3D8] p-5 sm:p-7 shadow-2xs">
            {items.map((item, idx) => (
              <div key={`cart-item-${item.productId || idx}-${idx}`} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
                {/* Product thumbnail + details */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Link
                    to={`/products/${item.productId}`}
                    className="w-20 h-20 rounded-2xl bg-[#FCFAF7] p-2 border border-[#E8E3D8] shrink-0 flex items-center justify-center overflow-hidden hover:border-[#008F68] transition-colors"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black text-[#008F68] bg-[#008F68]/10 px-2.5 py-0.5 rounded-full inline-block">
                      {item.category || 'مقتنى ملكي'}
                    </span>
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-sm sm:text-base font-black text-[#111111] hover:text-[#008F68] line-clamp-1 block transition-colors mt-1"
                    >
                      {item.name}
                    </Link>
                    <div className="text-xs text-neutral-500 mt-1 font-bold">
                      {Number(item.price).toLocaleString('ar-SA')} ر.س للقطعة
                    </div>

                    {item.stock <= 0 ? (
                      <div className="text-[11px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1.5">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        <span>نفد المخزون - يرجى إزالة المقتنى للمتابعة</span>
                      </div>
                    ) : item.quantity > item.stock ? (
                      <div className="text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1.5">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>الكمية المطلوبة تتجاوز المتاح (المتوفر: {item.stock} فقط)</span>
                      </div>
                    ) : null}

                    {/* Move to Wishlist action */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => handleMoveToWishlist(item.productId, item.name)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-[#008F68] transition-colors cursor-pointer"
                      >
                        <Heart className="w-3 h-3" />
                        <span>نقل للمفضلة</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quantity Stepper & Subtotal */}
                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F3EFE6]">
                  <QuantityStepper
                    value={item.quantity}
                    max={item.stock}
                    onChange={(qty) => updateQuantity(item.productId, qty)}
                  />

                  <div className="text-left min-w-[100px]">
                    <span className="text-base font-black text-[#111111] font-mono">
                      {Number(item.subtotal).toLocaleString('ar-SA')}
                    </span>
                    <span className="text-xs font-sans text-neutral-500 mr-1">ر.س</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    aria-label="حذف المقتنى"
                    className="p-2 rounded-full text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف من الحقيبة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Luxury Gift Options Component */}
          <GiftOptions
            giftWrapping={giftWrapping}
            giftMessage={giftMessage}
            onToggleGiftWrapping={setGiftWrapping}
            onUpdateGiftMessage={setGiftMessage}
          />

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-black text-[#111111] hover:text-[#008F68] transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>متابعة تصفح المعرض والكتالوج</span>
            </Link>
          </div>
        </div>

        {/* Left Column: Order Summary & Checkout */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-3xl bg-white border border-[#E8E3D8] p-6 shadow-2xs flex flex-col gap-5 sticky top-24">
            <h2 className="text-base font-black text-[#111111] tracking-tight border-b border-[#E8E3D8] pb-3">
              ملخص الطلب المعتمد
            </h2>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="رمز القسيمة (LUXE10, VIP20)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full bg-[#FCFAF7] border border-[#E8E3D8] rounded-full pl-3 pr-8 py-2.5 text-xs text-[#111111] placeholder-neutral-400 uppercase font-bold focus:outline-none focus:border-[#008F68]"
                />
                <Tag className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <Button type="submit" variant="secondary" size="sm">
                تطبيق
              </Button>
            </form>

            {appliedPromo && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#008F68]/10 border border-[#008F68]/20 text-[#008F68] text-xs font-black">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#008F68]" />
                  <span>تم تطبيق الرمز {appliedPromo.code} (خصم {appliedPromo.discountPercent}%)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAppliedPromo(null)}
                  className="text-neutral-500 hover:text-rose-600 mr-2 text-[11px] cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            )}

            {/* Summary Line Items */}
            <div className="flex flex-col gap-3 text-xs text-neutral-600 pt-2 border-t border-[#E8E3D8]">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">المجموع الفرعي</span>
                <span className="font-black text-[#111111] font-mono">
                  {Number(rawSubtotal).toLocaleString('ar-SA')} ر.س
                </span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between text-[#008F68] font-black">
                  <span>
                    خصم القسيمة ({appliedPromo.code} - {appliedPromo.discountType === 'percentage' ? `${appliedPromo.discountValue}%` : `${appliedPromo.discountValue} ر.س`})
                  </span>
                  <span>-{Number(discountAmount).toLocaleString('ar-SA')} ر.س</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">الشحن السريع المؤمّن VIP</span>
                <span className={`font-black ${isFreeShipping ? 'text-[#008F68]' : 'text-[#111111]'}`}>
                  {isFreeShipping ? 'مجاني (عرض VIP)' : `${Number(shippingCost).toLocaleString('ar-SA')} ر.س`}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">ضريبة القيمة المضافة ({taxRate}%)</span>
                <span className="font-black text-[#111111] font-mono">
                  {Number(estimatedTax).toLocaleString('ar-SA')} ر.س
                </span>
              </div>

              {giftWrapping && (
                <div className="flex justify-between text-[#008F68] font-bold">
                  <span>تغليف الهدايا الملكي</span>
                  <span>مجاناً (هدية المتجر)</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-4 border-t border-[#E8E3D8]">
                <span className="font-black text-[#111111] text-base">الإجمالي النهائي</span>
                <div className="text-left">
                  <span className="text-2xl font-black text-[#111111] font-mono">
                    {Number(finalTotal).toLocaleString('ar-SA')}
                  </span>
                  <span className="text-xs font-bold text-neutral-500 mr-1">ر.س</span>
                </div>
              </div>
            </div>

            {/* Stock Issues Alert */}
            {hasStockIssues && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>يرجى تعديل الكميات أو حذف المقتنيات غير المتوفرة في المستودع للمتابعة إلى الدفع.</span>
              </div>
            )}

            {/* Checkout Action Button */}
            {hasStockIssues ? (
              <Button
                variant="primary"
                size="lg"
                disabled={true}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="w-full opacity-60 cursor-not-allowed"
              >
                المخزون غير كافٍ للمتابعة
              </Button>
            ) : (
              <Link to="/checkout" className="w-full">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  className="w-full"
                >
                  متابعة إتمام الطلب والدفع
                </Button>
              </Link>
            )}

            {/* Trust & Guarantee Badges */}
            <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2 text-[11px] text-neutral-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#008F68] shrink-0" />
                <span>دفع إلكتروني آمن ومشفر 256-bit بنكياً</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#008F68] shrink-0" />
                <span>شحن وتوصيل مؤمن إلى باب بيتك</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#008F68] shrink-0" />
                <span>إمكانية الاسترجاع والاستبدال خلال 14 يوماً</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Curated Items */}
      {suggestedUpsells.length > 0 && (
        <div className="mt-8 pt-10 border-t border-[#E8E3D8] flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-black text-[#111111]">مقتنيات مكملة مقترحة</h3>
            <p className="text-xs text-neutral-500 mt-1">اختر مقتنيات متناسقة لإضافتها لطلبيتك قبل إتمام الدفع.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {suggestedUpsells.map((p, idx) => (
              <ProductCard key={`cart-main-upsell-${p.id || idx}-${idx}`} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
