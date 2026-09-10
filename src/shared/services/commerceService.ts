/**
 * Unified Commerce Service
 * Backend-Ready async domain service. Both Admin and Customer Storefront call this service.
 * When a real backend API is attached, only this service implementation changes.
 */

import {
  Product,
  Category,
  Collection,
  Order,
  Review,
  Coupon,
  Promotion,
  HomepageSection,
  StoreSettings,
  ProductFilterParams,
  PaginatedResult,
} from '../types/commerce';
import {
  productRepository,
  categoryRepository,
  collectionRepository,
  orderRepository,
  reviewRepository,
  couponRepository,
  promotionRepository,
  homepageRepository,
  storeSettingsRepository,
} from '../repositories';

export const commerceService = {
  // Products
  async getProducts(params: ProductFilterParams = {}): Promise<PaginatedResult<Product>> {
    return productRepository.getProducts(params);
  },

  async getProductById(id: number | string): Promise<Product | undefined> {
    return productRepository.getProductById(id);
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    return productRepository.createProduct(product);
  },

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    return productRepository.updateProduct(id, updates);
  },

  async deleteProduct(id: number): Promise<boolean> {
    return productRepository.deleteProduct(id);
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    return categoryRepository.getCategories();
  },

  async updateCategories(categories: Category[]): Promise<Category[]> {
    return categoryRepository.updateCategories(categories);
  },

  // Collections
  async getCollections(): Promise<Collection[]> {
    return collectionRepository.getCollections();
  },

  async updateCollections(collections: Collection[]): Promise<Collection[]> {
    return collectionRepository.updateCollections(collections);
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    return orderRepository.getOrders();
  },

  async getOrderById(id: number | string): Promise<Order | undefined> {
    return orderRepository.getOrderById(id);
  },

  async createOrder(orderPayload: Omit<Order, 'id' | 'orderNumber' | 'created_at' | 'timeline'>): Promise<Order> {
    return orderRepository.createOrder(orderPayload);
  },

  async updateOrderStatus(id: number | string, status: Order['status'], note?: string): Promise<Order | undefined> {
    return orderRepository.updateOrderStatus(id, status, note);
  },

  // Reviews
  async getReviews(): Promise<Review[]> {
    return reviewRepository.getReviews();
  },

  async addReview(review: Omit<Review, 'id' | 'createdAt' | 'status'>): Promise<Review> {
    return reviewRepository.addReview(review);
  },

  async updateReviewStatus(id: string, status: Review['status']): Promise<Review | undefined> {
    return reviewRepository.updateReviewStatus(id, status);
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    return couponRepository.getCoupons();
  },

  async validateCoupon(code: string, cartSubtotal: number) {
    return couponRepository.validateCoupon(code, cartSubtotal);
  },

  // Promotions
  async getPromotions(): Promise<Promotion[]> {
    return promotionRepository.getPromotions();
  },

  async updatePromotions(promotions: Promotion[]): Promise<Promotion[]> {
    return promotionRepository.updatePromotions(promotions);
  },

  // Homepage CMS
  async getHomepageSections(): Promise<HomepageSection[]> {
    return homepageRepository.getSections();
  },

  async updateHomepageSections(sections: HomepageSection[]): Promise<HomepageSection[]> {
    return homepageRepository.updateSections(sections);
  },

  // Store Settings
  async getStoreSettings(): Promise<StoreSettings> {
    return storeSettingsRepository.getSettings();
  },

  async updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    return storeSettingsRepository.updateSettings(settings);
  },
};
