import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const WISHLIST_STORAGE_KEY = 'luxestore_wishlist';

interface WishlistContextType {
  wishlist: number[];
  wishlistCount: number;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => boolean;
  addToWishlist: (productId: number) => void;
  removeFromWishlist: (productId: number) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function readStoredWishlist(): number[] {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(Number).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<number[]>(readStoredWishlist);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  const isInWishlist = useCallback((productId: number) => {
    return wishlist.includes(Number(productId));
  }, [wishlist]);

  const addToWishlist = useCallback((productId: number) => {
    const pId = Number(productId);
    if (!pId) return;
    setWishlist(prev => {
      if (prev.includes(pId)) return prev;
      return [...prev, pId];
    });
    showToast('Saved to your wishlist', 'success');
  }, [showToast]);

  const removeFromWishlist = useCallback((productId: number) => {
    const pId = Number(productId);
    setWishlist(prev => prev.filter(id => id !== pId));
    showToast('Removed from wishlist', 'info');
  }, [showToast]);

  const toggleWishlist = useCallback((productId: number): boolean => {
    const pId = Number(productId);
    if (!pId) return false;
    let added = false;
    setWishlist(prev => {
      if (prev.includes(pId)) {
        added = false;
        return prev.filter(id => id !== pId);
      } else {
        added = true;
        return [...prev, pId];
      }
    });
    showToast(added ? 'Saved to wishlist' : 'Removed from wishlist', added ? 'success' : 'info');
    return added;
  }, [showToast]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist(): WishlistContextType {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return ctx;
}
