import { LucideIcon } from 'lucide-react';

// ============================================================================
// 1. SYSTEM ENUMS & PRIMITIVES
// ============================================================================

export type ProductStatus = 'draft' | 'published' | 'archived' | 'out_of_stock';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type CustomerStatus = 'active' | 'inactive' | 'blocked' | 'vip' | 'standard';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type DiscountType = 'percentage' | 'fixed' | 'fixed_amount' | 'free_shipping';
export type ReturnStatus = 'pending_review' | 'approved' | 'item_received' | 'refunded' | 'rejected';
export type PromotionType = 'hero_slide' | 'announcement_bar' | 'category_banner' | 'popup';
export type MembershipTier = 'standard' | 'silver' | 'gold' | 'vip_royal';
export type UserRole = 'super_admin' | 'admin' | 'inventory_manager' | 'orders_manager' | 'customer_support' | 'editor';

// ============================================================================
// 2. GENERIC BACKEND-READY API CONTRACTS
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResult<T> {
  data: T[];
  items?: T[];
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

export interface FilterParams {
  search?: string;
  status?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
}

export interface BulkActionPayload {
  action: string;
  ids: (string | number)[];
  payload?: Record<string, unknown>;
}

export interface BulkActionResult {
  success: boolean;
  affectedCount: number;
  failedCount?: number;
  message: string;
}

// ============================================================================
// 3. ADMIN USER, ROLES & PERMISSION CONTRACTS
// ============================================================================

export interface AdminPermission {
  id: string;
  module: string;
  action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve';
  description: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[]; // Permission IDs
  usersCount: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  roleId?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  twoFactorEnabled?: boolean;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string; // e.g. "product.create", "order.status_update"
  module: string;
  entityId: string | number;
  entityName?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  timestamp: string;
}

// ============================================================================
// 4. PRODUCTS, VARIANTS & ATTRIBUTES CONTRACTS
// ============================================================================

export interface ProductOption {
  id: string;
  name: string; // e.g. "المقاس" | "اللون" | "العيار" | "سعة الذاكرة"
  values: string[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  options: { name: string; value: string }[];
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  image?: string;
  barcode?: string;
  weight?: number;
  status?: 'active' | 'inactive';
}

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
}

export interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  website?: string;
  description?: string;
  productsCount: number;
  featured: boolean;
  createdAt: string;
}

export interface AdminAttribute {
  id: string;
  name: string;
  code: string;
  type: 'select' | 'color' | 'text' | 'number' | 'boolean';
  values: { id: string; label: string; value: string; colorCode?: string }[];
  isFilterable: boolean;
  isRequired: boolean;
}

export interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  category: string;
  subcategory?: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  taxIncluded?: boolean;
  stock: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  status: ProductStatus;
  image_url: string;
  galleryImages: string[];
  description: string;
  shortDescription?: string;
  rating: number;
  reviewsCount: number;
  salesCount: number;
  tags: string[];
  collections: string[];
  isFeatured: boolean;
  hasVariants?: boolean;
  options?: ProductOption[];
  variants?: ProductVariant[];
  weight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  seo?: ProductSEO;
  relatedProductIds?: number[];
  crossSellProductIds?: number[];
  upsellProductIds?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilterParams extends FilterParams {
  category?: string;
  brand?: string;
  status?: ProductStatus | 'all';
  stockStatus?: StockStatus | 'all';
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  collection?: string;
}

// ============================================================================
// 5. CATEGORIES & COLLECTIONS CONTRACTS
// ============================================================================

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  parentId?: string;
  productCount: number;
  status: 'active' | 'hidden';
  displayOrder: number;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seo?: ProductSEO;
  createdAt: string;
}

export interface AdminCollection {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  productsCount: number;
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  bannerImage?: string;
  conditionsType?: 'manual' | 'automated';
  productIds?: number[];
  rules?: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: string;
  }[];
  createdAt: string;
}

// ============================================================================
// 6. INVENTORY, WAREHOUSES & STOCK OPERATIONS CONTRACTS
// ============================================================================

export interface AdminWarehouse {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  isPrimary: boolean;
  totalProductsCount: number;
  contactName: string;
  contactPhone: string;
  status: 'active' | 'inactive';
}

export interface AdminInventoryLog {
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

export interface AdminSupplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  productsSuppliedCount: number;
  status: 'active' | 'inactive';
}

export interface AdminPurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  status: 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled';
  expectedDeliveryDate?: string;
  items: {
    productId: number;
    productName: string;
    sku: string;
    orderedQuantity: number;
    receivedQuantity: number;
    unitCost: number;
  }[];
  totalCost: number;
  notes?: string;
  createdAt: string;
}

export interface InventoryFilterParams extends FilterParams {
  category?: string;
  warehouseId?: string;
  stockStatus?: StockStatus | 'all';
}

// ============================================================================
// 7. ORDERS, RETURNS & FULFILLMENT CONTRACTS
// ============================================================================

export interface AdminOrderItem {
  productId: number;
  productName: string;
  sku?: string;
  variantTitle?: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderTimelineItem {
  id?: string;
  status: string;
  timestamp: string;
  note?: string;
  user?: string;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  items: AdminOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: {
    recipientName: string;
    phone: string;
    addressLine1: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  trackingNumber?: string;
  shippingCarrier?: string;
  notes?: string;
  internalNotes?: string;
  giftWrapping?: boolean;
  giftMessage?: string;
  timeline: OrderTimelineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilterParams extends FilterParams {
  status?: OrderStatus | 'all';
  paymentStatus?: PaymentStatus | 'all';
  paymentMethod?: string;
  minTotal?: number;
  maxTotal?: number;
}

export interface AdminAbandonedCart {
  id: string;
  cartNumber: string;
  customer: {
    id?: number;
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

export interface AdminReturnRequest {
  id: string;
  returnNumber: string;
  orderId: number;
  orderNumber: string;
  customer: {
    id?: number;
    name: string;
    phone: string;
    email: string;
  };
  items: {
    productId: number;
    productName: string;
    imageUrl: string;
    price: number;
    quantity: number;
    reason: string;
    condition: 'opened' | 'sealed' | 'damaged' | 'wrong_item';
  }[];
  totalRefundAmount: number;
  status: ReturnStatus;
  rejectionReason?: string;
  requestedAt: string;
  updatedAt: string;
  adminNotes?: string;
}

// ============================================================================
// 8. CUSTOMERS, 360 PROFILE & SEGMENTS CONTRACTS
// ============================================================================

export interface CustomerAddress {
  id: string;
  title: string;
  recipientName: string;
  phone: string;
  city: string;
  addressLine: string;
  isDefault: boolean;
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

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: CustomerStatus;
  ordersCount: number;
  totalSpent: number;
  averageOrderValue: number;
  membershipTier: MembershipTier;
  loyaltyPoints?: number;
  storeCreditBalance?: number;
  walletTransactions?: WalletTransaction[];
  addresses?: CustomerAddress[];
  city: string;
  country: string;
  joinedAt: string;
  lastActive: string;
  notes?: string;
  tags?: string[];
}

export interface AdminCustomerSegment {
  id: string;
  name: string;
  description: string;
  customerCount: number;
  rules: {
    field: 'total_spent' | 'orders_count' | 'days_since_last_order' | 'tier' | 'city';
    operator: 'gte' | 'lte' | 'eq' | 'contains';
    value: string | number;
  }[];
  createdAt: string;
}

export interface CustomerFilterParams extends FilterParams {
  tier?: 'all' | MembershipTier;
  status?: CustomerStatus | 'all';
  city?: string;
  sortDirection?: 'asc' | 'desc';
  pageSize?: number;
}

// ============================================================================
// 9. REVIEWS, Q&A & WISHLIST INSIGHTS CONTRACTS
// ============================================================================

export interface AdminReview {
  id: string;
  productId: number;
  productName: string;
  productImage: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title?: string;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  verifiedPurchase: boolean;
  adminReply?: string;
  createdAt: string;
}

export interface AdminQA {
  id: string;
  productId: number;
  productName: string;
  customerName: string;
  question: string;
  answer?: string;
  status: 'answered' | 'pending' | 'rejected';
  createdAt: string;
}

// ============================================================================
// 10. MARKETING, COUPONS, CAMPAIGNS & LOYALTY CONTRACTS
// ============================================================================

export interface AdminCoupon {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired' | 'disabled';
  createdAt: string;
}

export interface AdminPromotion {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  type: PromotionType;
  imageUrl?: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired' | 'disabled';
  clicksCount: number;
  viewsCount: number;
}

export interface AdminGiftCard {
  id: string;
  code: string;
  initialBalance: number;
  currentBalance: number;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  status: 'active' | 'used' | 'expired' | 'disabled';
  expiresAt: string;
  createdAt: string;
}

export interface AdminLoyaltyReward {
  id: string;
  title: string;
  pointsRequired: number;
  discountValue: number;
  discountType: DiscountType;
  status: 'active' | 'inactive';
}

// ============================================================================
// 11. MERCHANDISING, RECOMMENDATIONS & SEARCH CONTRACTS
// ============================================================================

export interface AdminMerchandisingRule {
  id: string;
  name: string;
  triggerType: 'product_view' | 'cart_item' | 'category_browse' | 'checkout';
  targetProductId?: number;
  recommendedProductIds: number[];
  ruleType: 'frequently_bought_together' | 'upsell' | 'cross_sell' | 'similar_luxury';
  priority: number;
  status: 'active' | 'inactive';
}

export interface AdminSearchSynonym {
  id: string;
  term: string;
  synonyms: string[];
  status: 'active' | 'inactive';
}

export interface AdminSearchRedirect {
  id: string;
  query: string;
  targetUrl: string;
  matchType: 'exact' | 'contains';
  clicksCount: number;
  status: 'active' | 'inactive';
}

// ============================================================================
// 12. CMS, HOMEPAGE BUILDER & MEDIA LIBRARY CONTRACTS
// ============================================================================

export interface AdminHomepageSection {
  id: string;
  title: string;
  type: 'hero_slider' | 'featured_categories' | 'curated_collection' | 'vip_banner' | 'luxury_grid' | 'trust_badges';
  isEnabled: boolean;
  displayOrder: number;
  settings?: Record<string, unknown>;
}

export interface AdminMediaAsset {
  id: string;
  name: string;
  fileName: string;
  url: string;
  thumbnailUrl?: string;
  fileSize: number; // bytes
  mimeType: string;
  dimensions?: { width: number; height: number };
  folder?: string;
  tags: string[];
  usedInCount?: number;
  createdAt: string;
}

// ============================================================================
// 13. SHIPPING, TAX & SETTINGS CONTRACTS
// ============================================================================

export interface AdminShippingZone {
  id: string;
  name: string;
  regions: string[];
  methods: {
    id: string;
    name: string;
    carrier: string;
    rate: number;
    freeThreshold?: number;
    estimatedDays: string;
    isEnabled: boolean;
  }[];
}

export interface AdminStoreSettings {
  storeName: string;
  storeTagline: string;
  supportEmail: string;
  supportPhone: string;
  whatsappSupport: string;
  currency: string;
  announcementText?: string;
  announcementEnabled?: boolean;
  vatPercentage: number;
  vatNumber: string;
  commercialRegister: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  requirePhoneVerification: boolean;
  lowStockAlertEmail: string;
}

// ============================================================================
// 14. NOTIFICATIONS, BREADCRUMBS & NAVIGATION
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

export interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeColor?: 'green' | 'amber' | 'red' | 'blue' | 'neutral';
  children?: {
    id: string;
    title: string;
    path: string;
    badge?: string | number;
  }[];
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'customer' | 'system' | 'return' | 'review';
  read: boolean;
  createdAt: string;
  link?: string;
}

// ============================================================================
// 15. DASHBOARD & ANALYTICS CONTRACTS
// ============================================================================

export type DateRangeOption = 'today' | '7days' | '30days' | '90days' | '1year';

export interface MetricCardData {
  id: string;
  label: string;
  value: number | string;
  formattedValue: string;
  changePercentage: number;
  isPositive: boolean;
  trendText: string;
  sparkline?: number[];
  unit?: string;
}

export interface DashboardMetrics {
  totalSales: MetricCardData;
  orders: MetricCardData;
  revenue: MetricCardData;
  averageOrderValue: MetricCardData;
  customers: MetricCardData;
  products: MetricCardData;
}

export interface DashboardChartPoint {
  date: string;
  formattedDate: string;
  sales: number;
  orders: number;
  revenue: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  chartData: DashboardChartPoint[];
  recentOrders: AdminOrder[];
  topProducts: (AdminProduct & { revenue: number; conversionRate: number })[];
  lowStockProducts: AdminProduct[];
  statsSummary: {
    pendingOrdersCount: number;
    lowStockCount: number;
    todayRevenue: number;
    newCustomersToday: number;
  };
}
