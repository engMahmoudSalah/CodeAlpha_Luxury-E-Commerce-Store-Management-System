export * from './productRepository';
import { Category, Collection, Order, Review, Coupon, Promotion, HomepageSection, StoreSettings, ReturnRequest } from '../types/commerce';
import { commerceStore } from '../store/commerceStore';

export const categoryRepository = {
  async getCategories(): Promise<Category[]> {
    return commerceStore.getCategories();
  },
  async updateCategories(categories: Category[]): Promise<Category[]> {
    commerceStore.updateCategories(categories);
    return commerceStore.getCategories();
  },
};

export const collectionRepository = {
  async getCollections(): Promise<Collection[]> {
    return commerceStore.getCollections();
  },
  async updateCollections(collections: Collection[]): Promise<Collection[]> {
    commerceStore.updateCollections(collections);
    return commerceStore.getCollections();
  },
};

export const orderRepository = {
  async getOrders(): Promise<Order[]> {
    return commerceStore.getOrders();
  },
  async getOrderById(id: number | string): Promise<Order | undefined> {
    return commerceStore.getOrderById(id);
  },
  async createOrder(orderPayload: Omit<Order, 'id' | 'orderNumber' | 'created_at' | 'timeline'>): Promise<Order> {
    return commerceStore.createOrder(orderPayload);
  },
  async updateOrderStatus(id: number | string, status: Order['status'], note?: string): Promise<Order | undefined> {
    return commerceStore.updateOrderStatus(id, status, note);
  },
};

export const reviewRepository = {
  async getReviews(): Promise<Review[]> {
    return commerceStore.getReviews();
  },
  async addReview(review: Omit<Review, 'id' | 'createdAt' | 'status'>): Promise<Review> {
    return commerceStore.addReview(review);
  },
  async updateReviewStatus(id: string, status: Review['status']): Promise<Review | undefined> {
    return commerceStore.updateReviewStatus(id, status);
  },
};

export const couponRepository = {
  async getCoupons(): Promise<Coupon[]> {
    return commerceStore.getCoupons();
  },
  async validateCoupon(code: string, cartSubtotal: number): Promise<{ isValid: boolean; coupon?: Coupon; error?: string }> {
    const coupons = commerceStore.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());

    if (!coupon) {
      return { isValid: false, error: 'كود الخصم غير صحيح أو غير موجود' };
    }
    if (!coupon.isActive) {
      return { isValid: false, error: 'كود الخصم انتهت صلاحيته أو معطل' };
    }
    if (coupon.minOrderAmount && cartSubtotal < coupon.minOrderAmount) {
      return { isValid: false, error: `الحد أدنى لاستخدام الكوبون هو ${coupon.minOrderAmount} ر.س` };
    }

    return { isValid: true, coupon };
  },
};

export const promotionRepository = {
  async getPromotions(): Promise<Promotion[]> {
    return commerceStore.getPromotions();
  },
  async updatePromotions(promotions: Promotion[]): Promise<Promotion[]> {
    commerceStore.updatePromotions(promotions);
    return commerceStore.getPromotions();
  },
};

export const homepageRepository = {
  async getSections(): Promise<HomepageSection[]> {
    return commerceStore.getHomepageSections();
  },
  async updateSections(sections: HomepageSection[]): Promise<HomepageSection[]> {
    commerceStore.updateHomepageSections(sections);
    return commerceStore.getHomepageSections();
  },
};

export const storeSettingsRepository = {
  async getSettings(): Promise<StoreSettings> {
    return commerceStore.getStoreSettings();
  },
  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    return commerceStore.updateStoreSettings(settings);
  },
};
