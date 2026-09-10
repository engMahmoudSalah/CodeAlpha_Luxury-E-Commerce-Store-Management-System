export interface CartItem {
  productId: number;
  quantity: number;
}

export const CART_STORAGE_KEY = 'ecommerce_cart';

function getStorage(): Storage | null {
  if (typeof localStorage !== 'undefined') return localStorage;
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  return null;
}

/**
 * Safely parse and sanitize cart from localStorage
 * Guarantees no malformed, negative, NaN, or non-integer values crash the app
 */
export function getCart(): CartItem[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      storage.removeItem(CART_STORAGE_KEY);
      return [];
    }

    const sanitizedMap = new Map<number, number>();
    let hasMalformedEntries = false;

    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') {
        hasMalformedEntries = true;
        continue;
      }

      const pId = Number(entry.productId);
      const qty = Number(entry.quantity);

      // Validate integers > 0
      if (
        !Number.isInteger(pId) ||
        pId <= 0 ||
        !Number.isInteger(qty) ||
        qty <= 0 ||
        !Number.isFinite(pId) ||
        !Number.isFinite(qty)
      ) {
        hasMalformedEntries = true;
        continue;
      }

      // Merge duplicate product IDs
      const currentQty = sanitizedMap.get(pId) || 0;
      sanitizedMap.set(pId, Math.min(currentQty + qty, 1000));
    }

    const cleanCart: CartItem[] = Array.from(sanitizedMap.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    // If cleaned version differs from storage, update storage safely
    if (hasMalformedEntries || cleanCart.length !== parsed.length) {
      saveCart(cleanCart);
    }

    return cleanCart;
  } catch (err) {
    console.warn('Failed to parse cart storage, resetting to empty array:', err);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
    return [];
  }
}

/**
 * Save sanitized cart to localStorage and notify UI listeners
 */
export function saveCart(cart: CartItem[]): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
    } else if (typeof globalThis !== 'undefined' && typeof (globalThis as any).dispatchEvent === 'function') {
      (globalThis as any).dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
    }
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err);
  }
}

/**
 * Add product to cart with validation
 */
export function addToCart(productId: number, quantity = 1): CartItem[] {
  const pId = Number(productId);
  const qty = Number(quantity);

  if (!Number.isInteger(pId) || pId <= 0) {
    throw new Error('Invalid productId: Must be a positive integer.');
  }

  if (!Number.isInteger(qty) || qty <= 0) {
    throw new Error('Invalid quantity: Must be a positive integer.');
  }

  const cart = getCart();
  const existingIndex = cart.findIndex((item) => item.productId === pId);

  if (existingIndex > -1) {
    cart[existingIndex].quantity = Math.min(cart[existingIndex].quantity + qty, 1000);
  } else {
    cart.push({ productId: pId, quantity: Math.min(qty, 1000) });
  }

  saveCart(cart);
  return cart;
}

/**
 * Update quantity for a specific product
 */
export function updateQuantity(productId: number, quantity: number): CartItem[] {
  const pId = Number(productId);
  const qty = Number(quantity);

  if (!Number.isInteger(pId) || pId <= 0) {
    return getCart();
  }

  if (!Number.isInteger(qty) || qty <= 0) {
    return removeFromCart(pId);
  }

  const cart = getCart();
  const existingIndex = cart.findIndex((item) => item.productId === pId);

  if (existingIndex > -1) {
    cart[existingIndex].quantity = Math.min(qty, 1000);
    saveCart(cart);
  }

  return cart;
}

/**
 * Remove product completely from cart
 */
export function removeFromCart(productId: number): CartItem[] {
  const pId = Number(productId);
  const cart = getCart().filter((item) => item.productId !== pId);
  saveCart(cart);
  return cart;
}

/**
 * Empty the shopping cart
 */
export function clearCart(): CartItem[] {
  saveCart([]);
  return [];
}

/**
 * Get total quantity count of all items in cart
 */
export function getCartCount(): number {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}
