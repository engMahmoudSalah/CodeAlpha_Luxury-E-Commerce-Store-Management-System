import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';
import { QuantityStepper } from '../ui/QuantityStepper';
import { Button } from '../ui/Button';
import { ShoppingBag, Heart, ArrowLeft, ShieldCheck, Truck, RefreshCw, GitCompare, Sparkles } from 'lucide-react';

export interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();

  useEffect(() => {
    if (isOpen) setQuantity(1);
  }, [isOpen, product]);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const isOutOfStock = product.stock <= 0;
  const rating = 4.9;
  const reviews = 28;

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      id="quickview-modal"
    >
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch" dir="rtl">
        {/* Product Image Showcase Column */}
        <div className="w-full md:w-5/12 flex items-center justify-center p-8 bg-[#FCFAF7] rounded-2xl border border-[#F0EAE1] relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-xs border border-[#E8E3D8] rounded-full text-[10px] font-black text-[#111111] shadow-2xs">
              <Sparkles className="w-3 h-3 text-[#FFC700]" />
              إصدار فاخر
            </span>
          </div>
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="max-h-72 md:max-h-80 w-auto object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Product Info Column */}
        <div className="w-full md:w-7/12 flex flex-col justify-between min-w-0">
          <div>
            {/* Category & Stock Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-2.5">
              <Badge variant="neutral">
                {product.category === 'Audio' ? 'الأنظمة الصوتية' : product.category === 'Wearables' ? 'الساعات الفاخرة' : 'الإلكترونيات الراقية'}
              </Badge>
              {isOutOfStock ? (
                <Badge variant="danger">نفد من المخزون</Badge>
              ) : product.stock <= 3 ? (
                <Badge variant="warning">متبقي {product.stock} قطع فقط</Badge>
              ) : (
                <Badge variant="success">متوفر بالمخزون ({product.stock} قطعة)</Badge>
              )}
            </div>

            {/* Product Title */}
            <h2 className="text-xl md:text-2xl font-black text-[#111111] tracking-tight leading-snug mb-2 font-arabic">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={rating} count={reviews} showCount size="md" />
              <span className="text-[11px] text-neutral-400 font-bold">• تقييمات موثقة</span>
            </div>

            {/* Price */}
            <div className="text-2xl md:text-3xl font-black text-[#111111] mb-3">
              {(product?.price ?? 0).toLocaleString('ar-SA')} <span className="text-xs font-bold text-neutral-500">ر.س</span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-5 line-clamp-3">
              {product.description}
            </p>

            {/* Features Specs Mini */}
            <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-[#FCFAF7] border border-[#F0EAE1] mb-5 text-xs text-neutral-700 font-arabic">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#008F68] shrink-0" />
                <span>شحن مؤمن وسريع</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#008F68] shrink-0" />
                <span>ضمان ذهبي سنتين</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#008F68] shrink-0" />
                <span>استبدال واسترجاع ميسر</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-400">الرمز:</span>
                <span className="font-mono text-neutral-900">LX-{product.id.toString().padStart(4, '0')}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col gap-3 pt-4 border-t border-[#F0EAE1]">
            <div className="flex items-center gap-3 flex-wrap">
              <QuantityStepper
                value={quantity}
                max={Math.max(1, product.stock)}
                onChange={setQuantity}
                disabled={isOutOfStock}
              />

              <Button
                variant="primary"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                leftIcon={<ShoppingBag className="w-4 h-4" />}
                className="flex-1 min-w-[150px]"
              >
                إضافة للحقيبة
              </Button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label={inWishlist ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
                title={inWishlist ? 'في المفضلة' : 'إضافة للمفضلة'}
                className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                  inWishlist
                    ? 'bg-[#008F68] text-white border-[#008F68]'
                    : 'bg-white text-neutral-600 border-[#E8E3D8] hover:text-[#008F68] hover:border-[#008F68]'
                }`}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => toggleCompare(product.id)}
                aria-label={inCompare ? 'إزالة من المقارنة' : 'إضافة للمقارنة'}
                title={inCompare ? 'في المقارنة' : 'إضافة للمقارنة'}
                className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                  inCompare
                    ? 'bg-[#111111] text-[#FFC700] border-[#111111]'
                    : 'bg-white text-neutral-600 border-[#E8E3D8] hover:text-[#111111] hover:border-[#111111]'
                }`}
              >
                <GitCompare className="w-4 h-4" />
              </button>
            </div>

            <Link
              to={`/products/${product.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs text-[#008F68] hover:text-[#00704A] font-black transition-colors mt-1 font-arabic"
            >
              <span>عرض الصفحة الكاملة وتفاصيل المقتنى</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
};

