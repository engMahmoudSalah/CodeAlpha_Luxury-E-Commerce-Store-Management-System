/**
 * Fakhama Shared Commerce Canonical Domain Types
 * Single Source of Truth for both Customer Storefront and Admin Commerce Operations
 */

export type ProductStatus = 'draft' | 'published' | 'archived' | 'out_of_stock';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type CustomerStatus = 'active' | 'inactive' | 'blocked' | 'vip' | 'standard';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type DiscountType = 'percentage' | 'fixed' | 'fixed_amount' | 'free_shipping';
export type ReturnStatus = 'pending_review' | 'approved' | 'item_received' | 'refunded' | 'rejected';
export type RefundStatus = 'requested' | 'approved' | 'processing' | 'completed' | 'rejected';
export type PromotionType = 'hero_slide' | 'announcement_bar' | 'category_banner' | 'popup';
export type MembershipTier = 'standard' | 'silver' | 'gold' | 'vip_royal';
export type SubscriberStatus = 'active' | 'unsubscribed';
export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  responses?: {
    id: string;
    sender: 'admin' | 'customer';
    message: string;
    timestamp: string;
  }[];
}

export interface Subscriber {
  id: string;
  email: string;
  status: SubscriberStatus;
  subscribedAt: string;
  source?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name?: string;
  title?: string;
  options?: { name: string; value: string }[];
  attributes?: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  image_url?: string;
  image?: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  values: string[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category: string;
  brand?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  stockStatus: StockStatus;
  status: ProductStatus;
  image_url: string;
  galleryImages?: string[];
  description: string;
  shortDescription?: string;
  rating: number;
  reviewsCount: number;
  salesCount?: number;
  tags?: string[];
  collections?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  icon?: string;
  parentId?: string | number | null;
  productsCount: number;
  displayOrder: number;
  isActive: boolean;
  isFeatured?: boolean;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface InventoryLog {
  id: string;
  productId: number;
  productName: string;
  sku: string;
  warehouseId?: string;
  warehouseName?: string;
  type: 'in' | 'out' | 'adjustment' | 'order' | 'return' | 'transfer';
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  user: string;
  timestamp: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerImage: string;
  productsCount: number;
  productIds?: number[];
  isPublished: boolean;
  isActive?: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description?: string;
  productsCount: number;
  isFeatured?: boolean;
  isActive: boolean;
}

export interface CartItem {
  productId: number;
  variantId?: string;
  quantity: number;
  selectedAttributes?: Record<string, string>;
}

export interface CartItemWithProduct {
  item: CartItem;
  product: Product;
  variant?: ProductVariant;
  unitPrice: number;
  subtotal: number;
}

export interface OrderItem {
  id?: number | string;
  order_id?: number | string;
  productId: number;
  product_name?: string;
  name?: string;
  image_url?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderTimelineEvent {
  id: string;
  title: string;
  description: string;
  status: OrderStatus;
  timestamp: string;
  actor?: string;
}

export interface Order {
  id: number | string;
  orderNumber: string;
  user_id: number | string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    recipient_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state?: string;
    postal_code?: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  taxTotal: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingMethod: string;
  couponCode?: string;
  trackingNumber?: string;
  trackingCarrier?: string;
  notes?: string;
  giftWrapping?: boolean;
  giftMessage?: string;
  storeCreditApplied?: number;
  timeline: OrderTimelineEvent[];
  created_at: string;
  updated_at?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit_added' | 'credit_spent' | 'points_converted' | 'order_refund';
  amount: number;
  balanceAfter: number;
  description: string;
  date: string;
  referenceId?: string;
}

export interface Customer {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: CustomerStatus;
  membershipTier: MembershipTier;
  loyaltyPoints: number;
  storeCreditBalance?: number;
  walletTransactions?: WalletTransaction[];
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  city?: string;
  country?: string;
  tags?: string[];
  createdAt: string;
  lastOrderAt?: string;
  defaultAddress?: Order['shippingAddress'];
}

export interface Review {
  id: string;
  productId: number;
  productName?: string;
  productImage?: string;
  customerName: string;
  customerEmail?: string;
  customerAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured?: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  isVIPOnly?: boolean;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  description?: string;
}

export interface Promotion {
  id: string;
  title: string;
  subtitle?: string;
  type: PromotionType;
  imageUrl: string;
  linkUrl?: string;
  badgeText?: string;
  ctaText?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface HomepageSection {
  id: string;
  type: 'hero' | 'featured_products' | 'categories_grid' | 'best_sellers' | 'collection_banner' | 'editorial' | 'testimonials' | 'vip_cta' | 'trust_perks';
  title: string;
  subtitle?: string;
  enabled: boolean;
  order: number;
  content: Record<string, unknown>;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  currency: string;
  currencySymbol: string;
  contactEmail: string;
  contactPhone: string;
  whatsappSupport?: string;
  vatNumber?: string;
  commercialRegister?: string;
  announcementText?: string;
  announcementEnabled?: boolean;
  freeShippingThreshold: number;
  defaultShippingFee: number;
  expressShippingFee?: number;
  taxRatePercentage: number;
  guestCheckoutEnabled: boolean;
  requirePhoneVerification?: boolean;
  lowStockAlertEmail?: string;
  reviewsAutoApprove: boolean;
  maintenanceMode: boolean;
}

export interface AbandonedCart {
  id: string;
  cartNumber: string;
  customer: {
    id?: string | number;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  items: {
    productId: number;
    productName: string;
    imageUrl: string;
    unitPrice: number;
    quantity: number;
  }[];
  totalValue: number;
  abandonedAt: string;
  status: 'abandoned' | 'recovered' | 'contacted';
  recoverySentCount: number;
  lastRecoverySentAt?: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string | number;
  customerName: string;
  customerEmail: string;
  items: Array<{ productId: number; quantity: number; reason: string }>;
  status: ReturnStatus;
  refundStatus?: RefundStatus;
  refundAmount?: number;
  reasonNotes?: string;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductFilterParams {
  search?: string;
  category?: string;
  brand?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  stockStatus?: StockStatus;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}
