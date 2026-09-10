import React from 'react';
import { ShoppingBag, Heart, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductStickyBarProps {
  product: Product;
  visible: boolean;
}

export const ProductStickyBar: React.FC<ProductStickyBarProps> = ({ product, visible }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!visible) return null;

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8E3D8] shadow-2xl z-40 py-3 px-4 sm:px-8 transition-all animate-in slide-in-from-bottom-5 duration-200 font-arabic"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Product Identity info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#FCFAF7] border border-[#F0EAE1] p-1 shrink-0 flex items-center justify-center">
            <img
              src={product.image_url}
              alt={product.name}
              className="max-h-full max-w-full object-contain mix-blend-multiply"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-black text-[#111111] truncate">
              {product.name}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-[#008F68]">
                {Number(product.price).toLocaleString('ar-SA')} ر.س
              </span>
              <span className="text-[10px] text-neutral-400 font-bold hidden sm:inline">
                {product.stock > 0 ? `• متوفر (${product.stock})` : '• نفد'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-label={inWishlist ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
            className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
              inWishlist
                ? 'bg-[#008F68] text-white border-[#008F68]'
                : 'bg-white text-neutral-600 border-[#E8E3D8] hover:text-[#008F68]'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
          </button>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => addToCart(product.id, 1)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95 ${
              isOutOfStock
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-[#008F68] hover:bg-[#007353] text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isOutOfStock ? 'نفد من المخزون' : 'إضافة للحقيبة'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
