import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../hooks/useProducts';
import { Button } from '../ui/Button';
import { QuantityStepper } from '../ui/QuantityStepper';
import { FreeShippingProgress } from './FreeShippingProgress';
import { X, ShoppingBag, ArrowLeft, Trash2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const MiniCartDrawer: React.FC = () => {
  const { cart, isMiniCartOpen, closeMiniCart, updateQuantity, removeFromCart } = useCart();
  const { data: productsData } = useProducts({ limit: 100 });
  const navigate = useNavigate();

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
        stock: product?.stock || 99,
        subtotal: (product?.price || 0) * item.quantity,
      };
    });
  }, [cart, productsMap]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + i.subtotal, 0);
  }, [items]);

  if (!isMiniCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity font-arabic"
      onClick={closeMiniCart}
      dir="rtl"
    >
      <div
        className="fixed inset-y-0 left-0 max-w-full flex pr-6 sm:pr-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-[#FCFAF7] border-r border-[#E8E3D8] shadow-2xl flex flex-col text-[#111111] animate-in slide-in-from-left duration-300">
          {/* Header */}
          <div className="p-5 border-b border-[#E8E3D8] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#008F68]/10 border border-[#008F68]/20 flex items-center justify-center text-[#008F68]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#111111]">حقيبة المقتنيات</h2>
                <p className="text-[10px] text-neutral-400 font-bold">
                  {cart.reduce((a, b) => a + b.quantity, 0)} قطع محددة
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeMiniCart}
              aria-label="إغلاق حقيبة التسوق"
              className="p-2 rounded-full text-neutral-400 hover:text-[#111111] hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Free Shipping Progress bar in Drawer */}
          {items.length > 0 && (
            <div className="p-3 bg-[#FAF8F3] border-b border-[#E8E3D8]">
              <FreeShippingProgress currentSubtotal={subtotal} threshold={500} />
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-[#F0EAE1]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-3">
                <div className="w-16 h-16 rounded-full bg-white border border-[#E8E3D8] flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-black text-[#111111]">الحقيبة فارغة حالياً</h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  تصفح مجموعات متجر فخامة وانتقِ ما يثري تجربتك اليومية.
                </p>
                <Button
                  onClick={closeMiniCart}
                  variant="primary"
                  size="sm"
                  className="mt-2"
                >
                  استكشاف المعرض
                </Button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div key={`mini-cart-item-${item.productId || idx}-${idx}`} className="py-4 flex gap-3 items-center">
                  <Link
                    to={`/products/${item.productId}`}
                    onClick={closeMiniCart}
                    className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center border border-[#E8E3D8] shrink-0 overflow-hidden"
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
                    <Link
                      to={`/products/${item.productId}`}
                      onClick={closeMiniCart}
                      className="text-xs font-black text-[#111111] hover:text-[#008F68] line-clamp-1 block transition-colors"
                    >
                      {item.name}
                    </Link>
                    <div className="text-[11px] text-neutral-500 font-bold mt-0.5 font-mono">
                      {Number(item.price).toLocaleString('ar-SA')} ر.س
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <QuantityStepper
                        value={item.quantity}
                        max={item.stock}
                        size="sm"
                        onChange={(qty) => updateQuantity(item.productId, qty)}
                      />
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        aria-label="حذف المقتنى"
                        className="text-neutral-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-left font-black text-xs text-[#111111] shrink-0 font-mono">
                    {Number(item.subtotal).toLocaleString('ar-SA')} <span className="text-[10px] font-sans">ر.س</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#E8E3D8] bg-white flex flex-col gap-3 shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-bold">المجموع التقديري:</span>
                <span className="text-base font-black text-[#111111] font-mono">
                  {Number(subtotal).toLocaleString('ar-SA')} <span className="text-xs font-sans text-neutral-500">ر.س</span>
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">
                يشمل التوصيل السريع وضمان الأصالة المعتمد وتغليف فخامة الملكي.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-1">
                <Link to="/cart" onClick={closeMiniCart}>
                  <Button variant="secondary" size="md" className="w-full">
                    عرض الحقيبة
                  </Button>
                </Link>
                <Link to="/checkout" onClick={closeMiniCart}>
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                    className="w-full"
                  >
                    إتمام الطلب
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#008F68]" />
                <span>شحن وتوصيل مؤمن وسريع 100%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniCartDrawer;
