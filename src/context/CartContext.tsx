import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem } from '../types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { commerceStore } from '../shared/store/commerceStore';

const CART_STORAGE_KEY = 'luxestore_cart';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  isMiniCartOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  toggleMiniCart: () => void;
  addToCart: (productId: number, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  giftWrapping: boolean;
  setGiftWrapping: (wrapping: boolean) => void;
  giftMessage: string;
  setGiftMessage: (message: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const map = new Map<number, number>();
    for (const item of parsed) {
      if (item && typeof item.productId === 'number' && item.productId > 0) {
        const qty = Math.max(1, Math.min(1000, Number(item.quantity) || 1));
        map.set(item.productId, (map.get(item.productId) || 0) + qty);
      }
    }

    return Array.from(map.entries()).map(([productId, quantity]) => ({
      productId,
      quantity
    }));
  } catch {
    return [];
  }
}

function writeStoredCart(cart: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (err) {
    console.warn('Could not write cart to localStorage', err);
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(readStoredCart);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const [giftWrapping, setGiftWrapping] = useState<boolean>(() => {
    try {
      return localStorage.getItem('luxestore_gift_wrapping') === 'true';
    } catch {
      return false;
    }
  });

  const [giftMessage, setGiftMessage] = useState<string>(() => {
    try {
      return localStorage.getItem('luxestore_gift_message') || '';
    } catch {
      return '';
    }
  });

  // Sync gift wrapping states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('luxestore_gift_wrapping', String(giftWrapping));
      localStorage.setItem('luxestore_gift_message', giftMessage);
    } catch (e) {
      console.warn('Could not save gift options to localStorage', e);
    }
  }, [giftWrapping, giftMessage]);

  // Save to localStorage and sync abandoned cart state to commerceStore
  useEffect(() => {
    writeStoredCart(cart);

    // Sync abandoned cart state to commerceStore in real-time
    const products = commerceStore.getProducts();
    const detailedItems = cart.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod?.name || `منتج فاخر #${item.productId}`,
        imageUrl: prod?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
        unitPrice: prod?.price || 1500,
        quantity: item.quantity,
      };
    });

    const totalVal = detailedItems.reduce((acc, itm) => acc + itm.unitPrice * itm.quantity, 0);

    commerceStore.syncAbandonedCart({
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
      userPhone: user?.phone,
      items: detailedItems,
      totalValue: totalVal,
    });
  }, [cart, user]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        setCart(readStoredCart());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const openMiniCart = useCallback(() => setIsMiniCartOpen(true), []);
  const closeMiniCart = useCallback(() => setIsMiniCartOpen(false), []);
  const toggleMiniCart = useCallback(() => setIsMiniCartOpen(prev => !prev), []);

  const addToCart = useCallback((productId: number, quantity = 1) => {
    const pId = Number(productId);
    if (!pId || pId <= 0) return;

    const product = commerceStore.getProductById(pId);
    const availableStock = product ? product.stock : 999;

    if (availableStock <= 0) {
      showToast('عذراً، هذا المقتنى الملكي نفد من المخزون حالياً ولا يمكن إضافته للحقيبة.', 'warning');
      return;
    }

    let addedSuccessfully = false;
    let hitStockLimit = false;

    setCart(prev => {
      const idx = prev.findIndex(item => item.productId === pId);
      if (idx >= 0) {
        const currentQty = prev[idx].quantity;
        const requestedTotal = currentQty + Math.max(1, quantity);
        const finalQty = Math.min(availableStock, requestedTotal);

        if (finalQty === currentQty) {
          hitStockLimit = true;
          return prev;
        }

        if (finalQty < requestedTotal) {
          hitStockLimit = true;
        }

        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: finalQty };
        addedSuccessfully = true;
        return updated;
      } else {
        const initialQty = Math.min(availableStock, Math.max(1, quantity));
        if (initialQty < quantity) {
          hitStockLimit = true;
        }
        addedSuccessfully = true;
        return [...prev, { productId: pId, quantity: initialQty }];
      }
    });

    if (hitStockLimit) {
      showToast(`تم ضبط الكمية عند الحد الأقصى المتوفر في المستودع (${availableStock} قطع فقط).`, 'info');
    } else if (addedSuccessfully) {
      showToast('تمت إضافة المقتنى الفاخر إلى حقيبة التسوق بنجاح.', 'success');
    }
  }, [showToast]);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    const pId = Number(productId);
    const product = commerceStore.getProductById(pId);
    const availableStock = product ? product.stock : 999;

    if (quantity > availableStock) {
      showToast(`عذراً، أقصى كمية متوفرة لهذا المقتنى في المخزون هي ${availableStock} قطع.`, 'warning');
    }

    setCart(prev => {
      if (quantity <= 0) {
        return prev.filter(item => item.productId !== pId);
      }
      const cappedQty = Math.min(availableStock > 0 ? availableStock : 1, quantity);
      return prev.map(item =>
        item.productId === pId ? { ...item, quantity: cappedQty } : item
      );
    });
  }, [showToast]);

  const removeFromCart = useCallback((productId: number) => {
    const pId = Number(productId);
    setCart(prev => prev.filter(item => item.productId !== pId));
    showToast('Item removed from cart', 'info');
  }, [showToast]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        isMiniCartOpen,
        openMiniCart,
        closeMiniCart,
        toggleMiniCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        giftWrapping,
        setGiftWrapping,
        giftMessage,
        setGiftMessage
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
