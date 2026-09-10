import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useProduct, useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';
import { Review, Product } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StarRating } from '../components/ui/StarRating';
import { QuantityStepper } from '../components/ui/QuantityStepper';
import { Spinner } from '../components/ui/Spinner';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { ErrorState } from '../components/ui/ErrorState';
import { ProductCard } from '../components/product/ProductCard';
import { ProductGallery } from '../components/product/ProductGallery';
import { ProductReviewsSection } from '../components/product/ProductReviewsSection';
import { ProductStickyBar } from '../components/product/ProductStickyBar';
import { ProductBundleSection } from '../components/product/ProductBundleSection';
import { commerceStore } from '../shared/store/commerceStore';
import { commerceEventBus } from '../shared/events/commerceEvents';
import {
  ShoppingBag,
  Heart,
  GitCompare,
  Check,
  Truck,
  ShieldCheck,
  RefreshCw,
  ChevronLeft,
  Package,
  ArrowRight,
  Sparkles,
  Share2,
  Copy,
  Clock,
  Award,
  Zap,
  CheckCircle2
} from 'lucide-react';

const REVIEWS_STORAGE_PREFIX = 'luxestore_reviews_';

const COLOR_VARIANTS = [
  { id: 'titanium', name: 'التيتانيوم الطبيعي', hex: '#8E8E93', border: '#D1D1D6' },
  { id: 'space-black', name: 'الأسود الملكي المات', hex: '#1C1C1E', border: '#3A3A3C' },
  { id: 'pure-gold', name: 'الذهب الملكي المصقول', hex: '#D4AF37', border: '#C5A880' },
  { id: 'silver', name: 'الفضي اللامع', hex: '#E5E5EA', border: '#C7C7CC' },
];

const getCategoryDisplayName = (cat?: string) => {
  if (!cat) return 'مقتنى ملكي فاخر';
  if (cat === 'Audio') return 'الأنظمة الصوتية';
  if (cat === 'Wearables') return 'الساعات الفاخرة';
  if (cat === 'Electronics') return 'الإلكترونيات الراقية';
  if (cat === 'Home & Office') return 'مقتنيات المساحات';
  if (cat === 'Accessories') return 'الإكسسوارات الفاخرة';
  return cat;
};

export const ProductDetailPage: React.FC = () => {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Support both /products/:id and /product.html?id=:id
  const productId = routeId || searchParams.get('id');

  const { data: product, isLoading, isError } = useProduct(productId);
  const { data: relatedData } = useProducts({
    category: product?.category,
    limit: 5,
  });

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(COLOR_VARIANTS[0]);
  const [activeTab, setActiveTab] = useState<'specs' | 'packaging' | 'shipping' | 'reviews'>('specs');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const mainActionRef = useRef<HTMLDivElement>(null);

  // Customer Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);

  // Scroll listener for sticky action bar
  useEffect(() => {
    const handleScroll = () => {
      if (mainActionRef.current) {
        const rect = mainActionRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load reviews from central commerceStore with real-time reactivity
  useEffect(() => {
    const activeId = product?.id ?? (productId ? Number(productId) : undefined);
    if (!activeId || isNaN(activeId)) return;

    const storeReviews = commerceStore.getReviews(activeId);
    setReviews(
      (storeReviews || []).map((r) => ({
        id: r.id,
        productId: r.productId,
        author: r.customerName,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      }))
    );

    const unsub = commerceEventBus.subscribe('REVIEW_CREATED', (newRev) => {
      if (newRev.productId === activeId) {
        setReviews((prev) => {
          if (prev.some((r) => r.id === newRev.id)) return prev;
          return [
            {
              id: newRev.id,
              productId: newRev.productId,
              author: newRev.customerName,
              rating: newRev.rating,
              comment: newRev.comment,
              createdAt: newRev.createdAt,
            },
            ...prev,
          ];
        });
      }
    });

    const unsubStatus = commerceEventBus.subscribe('REVIEW_UPDATED', () => {
      const updatedStoreReviews = commerceStore.getReviews(activeId);
      setReviews(
        (updatedStoreReviews || []).map((r) => ({
          id: r.id,
          productId: r.productId,
          author: r.customerName,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
        }))
      );
    });

    return () => {
      unsub();
      unsubStatus();
    };
  }, [product?.id, productId]);

  const handleAddReview = (newRevData: Omit<Review, 'id' | 'createdAt'>) => {
    const activeId = product?.id ?? Number(productId);
    if (!activeId || isNaN(activeId)) return;

    const createdCanonical = commerceStore.addReview({
      productId: activeId,
      productName: product?.name,
      productImage: product?.image_url,
      customerName: newRevData.author,
      rating: newRevData.rating,
      comment: newRevData.comment,
    });

    const newRev: Review = {
      id: createdCanonical.id,
      productId: activeId,
      author: createdCanonical.customerName,
      rating: createdCanonical.rating,
      comment: createdCanonical.comment,
      createdAt: createdCanonical.createdAt,
    };
    setReviews((prev) => [newRev, ...prev]);
    showToast('شكراً لك! تم اعتماد ونشر تقييمك وإرساله للإدارة بنجاح.', 'success');
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, quantity);
    showToast(`تمت إضافة ${quantity} من "${product.name}" إلى حقيبة التسوق.`, 'success');
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product.id, quantity);
    navigate('/checkout');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('تم نسخ رابط المقتنى إلى الحافظة.', 'info');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!product) return;
    const text = encodeURIComponent(`شاهد هذا المقتنى الفاخر من متجر فخامة: ${product.name} - ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 font-arabic" dir="rtl">
        <Spinner size="lg" />
        <p className="text-sm font-bold text-neutral-400">جاري استحضار تفاصيل المقتنى الملكي...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto font-arabic" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#111111] mb-2">المقتنى غير متوفر</h2>
        <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
          لم نتمكن من العثور على هذا المقتنى في الكتالوج الحالي. قد يكون تم نقله للأرشيف أو نفدت كميته بالكامل.
        </p>
        <Link to="/">
          <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
            العودة إلى المعرض الرئيسي
          </Button>
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round((((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100))
    : 0;
  const savingAmount = hasDiscount ? product.compareAtPrice! - product.price : 0;

  // Average review rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '4.9';

  const relatedProducts = (relatedData?.products || []).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-10 pb-24 font-arabic" dir="rtl">
      {/* 1. Breadcrumb Bar & Share Tools */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-neutral-100">
        <Breadcrumbs
          items={[
            { label: 'المجموعات', path: '/' },
            {
              label: getCategoryDisplayName(product.category),
              path: `/?category=${encodeURIComponent(product.category)}`
            },
            { label: product.name }
          ]}
        />

        {/* Social Share & Link Copy */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF8F3] hover:bg-[#008F68]/10 text-neutral-700 hover:text-[#008F68] border border-[#E8E3D8] rounded-full text-xs font-bold transition-all cursor-pointer"
            title="نسخ الرابط"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#008F68]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'تم النسخ' : 'نسخ الرابط'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF8F3] hover:bg-[#25D366]/10 text-neutral-700 hover:text-[#25D366] border border-[#E8E3D8] rounded-full text-xs font-bold transition-all cursor-pointer"
            title="مشاركة عبر واتساب"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">واتساب</span>
          </button>
        </div>
      </div>

      {/* 2. Main Product Showcase & Buying Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Right Column: Multi-Angle Interactive Image Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery product={product} />
        </div>

        {/* Left Column: Details, Variants, Specs & Actions */}
        <div className="lg:col-span-6 flex flex-col gap-6" ref={mainActionRef}>
          <div>
            {/* Category & Stock Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Badge variant="star" size="md">
                {getCategoryDisplayName(product.category)}
              </Badge>
              {isOutOfStock ? (
                <Badge variant="danger" size="md">نفد من المخزون</Badge>
              ) : product.stock <= (product.lowStockThreshold || 5) ? (
                <Badge variant="warning" size="md">متبقي {product.stock} قطع فقط بالمستودع</Badge>
              ) : (
                <Badge variant="success" size="md">متوفر للشحن الفوري ({product.stock} قطعة)</Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[#111111] tracking-tight leading-tight mb-3 font-arabic">
              {product.name}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={Number(avgRating)} size="md" />
              <span className="text-sm font-black text-[#111111] font-mono">
                {avgRating}
              </span>
              <span className="text-xs text-neutral-400 font-bold">
                • {reviews.length} تقييم موثق من نادي المقتنين
              </span>
            </div>

            {/* Price Presentation */}
            <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-neutral-100">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-[#111111] font-mono">
                  {Number(product.price).toLocaleString('ar-SA')}
                </span>
                <span className="text-sm font-bold text-neutral-500">ر.س</span>

                {hasDiscount && (
                  <>
                    <span className="text-lg sm:text-xl font-bold text-neutral-400 line-through font-mono">
                      {Number(product.compareAtPrice).toLocaleString('ar-SA')} ر.س
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                      وفر {Number(savingAmount).toLocaleString('ar-SA')} ر.س ({discountPercent}% خصم)
                    </span>
                  </>
                )}

                <span className="text-xs text-neutral-400 font-bold mr-auto">
                  شامل ضريبة القيمة المضافة والشحن المجاني
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Color / Finish Selector */}
          <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-[#FCFAF7] border border-[#F0EAE1]">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-neutral-500">اللون / اللمسة النهائية:</span>
              <span className="text-[#008F68]">{selectedColor.name}</span>
            </div>
            <div className="flex items-center gap-3">
              {COLOR_VARIANTS.map((color, idx) => {
                const isSelected = selectedColor.id === color.id;
                return (
                  <button
                    key={`pdt-color-${color.id || idx}-${idx}`}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`group relative flex items-center justify-center w-8 h-8 rounded-full transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-[#008F68] ring-offset-2 scale-110'
                        : 'hover:scale-105'
                    }`}
                    title={color.name}
                  >
                    <span
                      className="w-7 h-7 rounded-full shadow-inner border"
                      style={{ backgroundColor: color.hex, borderColor: color.border }}
                    />
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white absolute drop-shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-Time Shipping & Delivery Countdown */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#E8E3D8] text-xs text-neutral-700">
            <Clock className="w-4 h-4 text-[#008F68] shrink-0" />
            <div>
              <span>اطلب خلال <strong>٣ ساعات و ١٥ دقيقة</strong> ليصلك المقتنى غداً في الرياض وجدة مع الشحن السريع VIP.</span>
            </div>
          </div>

          {/* Quick Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-[#E8E3D8] text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#008F68]/10 border border-[#008F68]/20 flex items-center justify-center text-[#008F68] shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-[#111111]">شحن مؤمن وسريع</p>
                <p className="text-[10px] text-neutral-400">خلال 24 - 48 ساعة</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#008F68]/10 border border-[#008F68]/20 flex items-center justify-center text-[#008F68] shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-[#111111]">ضمان ذهبي سنتين</p>
                <p className="text-[10px] text-neutral-400">استبدال وصيانة فورية</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#008F68]/10 border border-[#008F68]/20 flex items-center justify-center text-[#008F68] shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-[#111111]">استرجاع ميسر</p>
                <p className="text-[10px] text-neutral-400">خلال 14 يوماً من الاستلام</p>
              </div>
            </div>
          </div>

          {/* Add to Cart & Buy Now Actions */}
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-neutral-500">الكمية</span>
                <QuantityStepper
                  value={quantity}
                  max={Math.max(1, product.stock)}
                  onChange={setQuantity}
                  disabled={isOutOfStock}
                />
              </div>

              <div className="flex-1 flex items-end gap-3 min-w-[220px]">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  leftIcon={<ShoppingBag className="w-5 h-5" />}
                  className="flex-1"
                >
                  {isOutOfStock ? 'نفد من المخزون' : 'إضافة إلى الحقيبة'}
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="hidden sm:inline-flex"
                >
                  الشراء الفوري
                </Button>
              </div>
            </div>

            {/* Wishlist and Compare Toggles */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`flex-1 py-2.5 px-4 rounded-full border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  inWishlist
                    ? 'bg-[#008F68] text-white border-[#008F68]'
                    : 'bg-white hover:bg-[#FAF8F3] border-[#E8E3D8] text-neutral-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
                <span>{inWishlist ? 'محفوظ في المفضلة' : 'إضافة للمفضلة'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleCompare(product.id)}
                className={`flex-1 py-2.5 px-4 rounded-full border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  inCompare
                    ? 'bg-[#111111] text-[#FFC700] border-[#111111]'
                    : 'bg-white hover:bg-[#FAF8F3] border-[#E8E3D8] text-neutral-700'
                }`}
              >
                <GitCompare className="w-4 h-4" />
                <span>{inCompare ? 'في قائمة المقارنة' : 'مقارنة المواصفات'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Frequently Bought Together Bundle */}
      {relatedProducts.length > 0 && (
        <ProductBundleSection
          currentProduct={product}
          companionProducts={relatedProducts}
        />
      )}

      {/* 4. Comprehensive Tabs Section: Specifications, Unboxing Packaging, Shipping & Reviews */}
      <section className="flex flex-col gap-6 pt-8 border-t border-neutral-100">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 border-b border-[#F0EAE1] scrollbar-none">
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white hover:bg-[#FAF8F3] text-neutral-600 border border-[#E8E3D8]'
            }`}
          >
            المواصفات الفنية المعتمدة
          </button>

          <button
            onClick={() => setActiveTab('packaging')}
            className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              activeTab === 'packaging'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white hover:bg-[#FAF8F3] text-neutral-600 border border-[#E8E3D8]'
            }`}
          >
            التغليف والملحقات الملكية
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              activeTab === 'shipping'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white hover:bg-[#FAF8F3] text-neutral-600 border border-[#E8E3D8]'
            }`}
          >
            الشحن والضمان الذهبي
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white hover:bg-[#FAF8F3] text-neutral-600 border border-[#E8E3D8]'
            }`}
          >
            <span>تقييمات المقتنين</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeTab === 'reviews' ? 'bg-[#008F68] text-white' : 'bg-neutral-100 text-neutral-600'
            }`}>
              {reviews.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Technical Specs */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E8E3D8] text-xs">
              <span className="text-neutral-500 font-bold">الرقم التعريفي (SKU)</span>
              <span className="text-[#111111] font-mono font-black">LX-{product.id.toString().padStart(4, '0')}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E8E3D8] text-xs">
              <span className="text-neutral-500 font-bold">المجموعة والتصنيف</span>
              <span className="text-[#111111] font-black">{product.category}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E8E3D8] text-xs">
              <span className="text-neutral-500 font-bold">حالة المخزون</span>
              <span className="text-[#111111] font-black">{product.stock} قطع في المستودع الرئيسي</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E8E3D8] text-xs">
              <span className="text-neutral-500 font-bold">معايير الهندسة والتجميع</span>
              <span className="text-[#111111] font-black">معايير ألمانية / سويسرية فائقة الدقة</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E8E3D8] text-xs">
              <span className="text-neutral-500 font-bold">المواد والخامات الأساسية</span>
              <span className="text-[#111111] font-black">سبائك ألومنيوم طيران ومواد فاخرة معالجة</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E8E3D8] text-xs">
              <span className="text-neutral-500 font-bold">شهادات الجودة والمطابقة</span>
              <span className="text-[#111111] font-black">CE, FCC, RoHS, SASO معتمد رسمياً</span>
            </div>
          </div>
        )}

        {/* Tab 2: Packaging & Unboxing */}
        {activeTab === 'packaging' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
            <div className="p-5 rounded-2xl bg-white border border-[#E8E3D8] flex flex-col gap-2 shadow-2xs">
              <span className="text-xl">🎁</span>
              <h4 className="text-xs font-black text-[#111111]">علبة هدايا ملكية</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                تغليف فاخر بصندوق صلب مكسو بالكتان ومبطن بالمخمل لحماية المقتنى أثناء الشحن.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E8E3D8] flex flex-col gap-2 shadow-2xs">
              <span className="text-xl">📜</span>
              <h4 className="text-xs font-black text-[#111111]">شهادة الأصالة والضمان</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                بطاقة معدنية منقوشة تحمل الرقم التسلسلي الفريد وشهادة المصادقة الرسمية.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E8E3D8] flex flex-col gap-2 shadow-2xs">
              <span className="text-xl">🔌</span>
              <h4 className="text-xs font-black text-[#111111]">كابلات وملحقات كاملة</h4>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                كافة الكابلات المجدولة ومحولات الشحن السريع وحقيبة التنقل الجلدية المخصصة.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Shipping & Warranty */}
        {activeTab === 'shipping' && (
          <div className="flex flex-col gap-4 max-w-3xl text-xs text-neutral-600 leading-relaxed bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E3D8] shadow-2xs">
            <p>
              يتم فحص وتغليف كل مقتنى يدويًا داخل صناديق فاخرة مخصصة، وشحنه عبر أسطول النقل السريع المخصص مع إمكانية التتبع المباشر لحظة بلحظة.
            </p>
            <ul className="list-disc pr-5 flex flex-col gap-2 text-xs text-neutral-500">
              <li><strong>التوصيل السريع القياسي:</strong> مجاني لكافة مدن المملكة ودول الخليج خلال 24 - 48 ساعة.</li>
              <li><strong>الاستلام بالتوقيع الشخصي:</strong> يتم تسليم الشحنة للعميل مباشرة لضمان أقصى درجات الأمان.</li>
              <li><strong>الضمان الذهبي الشامل:</strong> يشمل أي عيوب مصنعية أو أعطال مع استبدال فوري لمدة 24 شهرًا.</li>
              <li><strong>فترة التجربة 14 يوماً:</strong> يمكنك إرجاع أو استبدال المنتج بكل سهولة إذا لم يطابق تطلعاتك.</li>
            </ul>
          </div>
        )}

        {/* Tab 4: Customer Reviews */}
        {activeTab === 'reviews' && (
          <ProductReviewsSection
            productId={product.id}
            reviews={reviews}
            onAddReview={handleAddReview}
          />
        )}
      </section>

      {/* 5. Related Curated Products */}
      {relatedProducts.length > 0 && (
        <section className="flex flex-col gap-6 pt-8 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-[#111111]">مقتنيات مكملة من ذات الفئة</h3>
              <p className="text-xs text-neutral-400">استكشف خيارات متناسقة صممت لتكمل ذوقك وتلبي تطلعاتك.</p>
            </div>
            <Link to={`/?category=${encodeURIComponent(product.category)}`} className="text-xs font-black text-[#008F68] hover:underline">
              عرض كامل المجموعة ←
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p, idx) => (
              <ProductCard key={`pdt-related-${p.id || idx}-${idx}`} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Floating Bottom Sticky Bar on Scroll */}
      <ProductStickyBar product={product} visible={showStickyBar} />
    </div>
  );
};

export default ProductDetailPage;
