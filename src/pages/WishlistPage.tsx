import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';
import { useToast } from '../context/ToastContext';
import { ProductGrid } from '../components/product/ProductGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Heart, ShoppingBag, Trash2, Sparkles, Share2, ArrowRight } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { data: productsData, isLoading } = useProducts({ limit: 100 });
  const { showToast } = useToast();
  const navigate = useNavigate();

  const products = useMemo(() => {
    if (!productsData?.products) return [];
    return productsData.products.filter((p) => wishlist.includes(p.id));
  }, [productsData, wishlist]);

  const handleMoveAllToCart = () => {
    let addedCount = 0;
    for (const p of products) {
      if (p.stock > 0) {
        addToCart(p.id, 1);
        addedCount++;
      }
    }
    if (addedCount > 0) {
      showToast(`تمت إضافة ${addedCount} مقتنيات بنجاح إلى حقيبة التسوق!`, 'success');
    }
  };

  const handleShareWishlist = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('تم نسخ رابط قائمة الرغبات لمشاركتها مع أصدقائك!', 'success');
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="py-16 font-arabic max-w-2xl mx-auto px-4 text-center" dir="rtl">
        <EmptyState
          icon={<Heart className="w-10 h-10 text-[#008F68]" />}
          title="قائمة الرغبات والمفضلة فارغة"
          description="احفظ مقتنياتك الفاخرة المفضلة بالنقر على أيقونة القلب في بطاقة أي مقتنى للرجوع إليها وإهدائها لاحقاً."
          actionText="استكشاف تشكيلة المعرض الملكي"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-8 pb-20 font-arabic" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8E3D8] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black px-2.5 py-0.5 bg-[#008F68]/10 text-[#008F68] rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              مقتنياتك المفضلة ({wishlist.length})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">قائمة الرغبات والمقتنيات المحفوظة</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            مراجعة المقتنيات التي قمت بحفظها وإضافتها مباشرة إلى حقيبة التسوق الخاصة بك.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShareWishlist}
            className="p-2.5 rounded-full bg-white border border-[#E8E3D8] text-neutral-600 hover:text-[#008F68] hover:border-[#008F68] transition-colors cursor-pointer shadow-2xs"
            title="مشاركة القائمة"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleMoveAllToCart}
            leftIcon={<ShoppingBag className="w-4 h-4" />}
          >
            إضافة الكل للحقيبة
          </Button>

          <button
            onClick={clearWishlist}
            className="text-xs text-neutral-400 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer transition-colors p-2 bg-white rounded-full border border-[#E8E3D8] px-3.5 shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>تفريغ</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <ProductGrid
        products={products}
        isLoading={isLoading}
        emptyTitle="لا توجد مقتنيات في المفضلة"
        emptyDescription="تصفح المعرض لإضافة مقتنيات إلى قائمتك."
      />
    </div>
  );
};

export default WishlistPage;
