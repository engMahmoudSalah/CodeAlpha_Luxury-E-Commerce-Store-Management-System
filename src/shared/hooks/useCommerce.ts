import { useSyncExternalStore, useCallback } from 'react';
import { commerceStore } from '../store/commerceStore';
import { commerceService } from '../services/commerceService';
import { ProductFilterParams, Product, Order, Review, Coupon, Promotion, HomepageSection, StoreSettings, Category, Collection } from '../types/commerce';

/**
 * Custom hook to reactively subscribe to the Unified Commerce Store.
 * Ensures instant UI re-renders whenever Admin or Customer mutates data.
 */
export function useCommerceStore() {
  const subscribe = useCallback((callback: () => void) => {
    return commerceStore.subscribe(callback);
  }, []);

  const getSnapshot = useCallback(() => {
    return commerceStore;
  }, []);

  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    products: commerceStore.getProducts(),
    categories: commerceStore.getCategories(),
    collections: commerceStore.getCollections(),
    orders: commerceStore.getOrders(),
    customers: commerceStore.getCustomers(),
    reviews: commerceStore.getReviews(),
    coupons: commerceStore.getCoupons(),
    promotions: commerceStore.getPromotions(),
    homepageSections: commerceStore.getHomepageSections(),
    storeSettings: commerceStore.getStoreSettings(),
    returnRequests: commerceStore.getReturnRequests(),
  };
}

/**
 * Reactive Product Hook for Storefront & Admin
 */
export function useProducts(params: ProductFilterParams = {}) {
  const store = useCommerceStore();
  let products = store.products;

  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q))
    );
  }

  if (params.category && params.category !== 'all') {
    products = products.filter((p) => p.category === params.category);
  }

  if (params.status) {
    products = products.filter((p) => p.status === params.status);
  } else {
    // Default storefront filter: only show published products if no status specified
    if (params.status === undefined) {
      products = products.filter((p) => p.status === 'published');
    }
  }

  return {
    products,
    total: products.length,
    createProduct: commerceService.createProduct,
    updateProduct: commerceService.updateProduct,
    deleteProduct: commerceService.deleteProduct,
  };
}

/**
 * Reactive Orders Hook for Customer & Admin
 */
export function useOrders() {
  const store = useCommerceStore();
  return {
    orders: store.orders,
    createOrder: commerceService.createOrder,
    updateOrderStatus: commerceService.updateOrderStatus,
  };
}

/**
 * Reactive Homepage CMS Config Hook
 */
export function useHomepageConfig() {
  const store = useCommerceStore();
  return {
    sections: store.homepageSections,
    updateSections: commerceService.updateHomepageSections,
  };
}

/**
 * Reactive Store Settings Hook
 */
export function useStoreSettings() {
  const store = useCommerceStore();
  return {
    settings: store.storeSettings,
    updateSettings: commerceService.updateStoreSettings,
  };
}
