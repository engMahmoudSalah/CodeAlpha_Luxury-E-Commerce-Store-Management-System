/**
 * Fakhama Unified Commerce Store
 * Single reactive in-memory state with localStorage persistence & EventBus integration.
 * Admin mutations immediately update this store, causing instant UI refreshes across the app.
 */

import {
  Product,
  Category,
  Collection,
  Brand,
  Order,
  Customer,
  Review,
  Coupon,
  Promotion,
  HomepageSection,
  StoreSettings,
  ReturnRequest,
  InventoryLog,
  AbandonedCart,
  WalletTransaction,
} from '../types/commerce';
import { commerceEventBus } from '../events/commerceEvents';
import {
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_COLLECTIONS,
  MOCK_ORDERS,
  MOCK_CUSTOMERS,
  MOCK_REVIEWS,
  MOCK_COUPONS,
  MOCK_PROMOTIONS,
  MOCK_STORE_SETTINGS,
  MOCK_RETURN_REQUESTS,
  MOCK_INVENTORY_LOGS,
  MOCK_ABANDONED_CARTS,
} from '../../admin/services/mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'fakhama_shared_products_v2',
  CATEGORIES: 'fakhama_shared_categories_v2',
  COLLECTIONS: 'fakhama_shared_collections_v2',
  BRANDS: 'fakhama_shared_brands_v2',
  ORDERS: 'fakhama_shared_orders_v2',
  CUSTOMERS: 'fakhama_shared_customers_v2',
  REVIEWS: 'fakhama_shared_reviews_v2',
  COUPONS: 'fakhama_shared_coupons_v2',
  PROMOTIONS: 'fakhama_shared_promotions_v2',
  HOMEPAGE: 'fakhama_shared_homepage_v2',
  SETTINGS: 'fakhama_shared_settings_v2',
  RETURNS: 'fakhama_shared_returns_v2',
  INVENTORY_LOGS: 'fakhama_shared_inventory_logs_v2',
  ABANDONED_CARTS: 'fakhama_shared_abandoned_carts_v2',
};

import { syncItemToFirestore, syncDeleteToFirestore, syncArrayToFirestore } from './firestoreSync';

// Helper to safely parse localStorage
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed loading ${key} from storage:`, err);
    return fallback;
  }
}

const COLLECTION_MAP: Record<string, string> = {
  [STORAGE_KEYS.PRODUCTS]: 'products',
  [STORAGE_KEYS.CATEGORIES]: 'categories',
  [STORAGE_KEYS.COLLECTIONS]: 'collections',
  [STORAGE_KEYS.ORDERS]: 'orders',
  [STORAGE_KEYS.CUSTOMERS]: 'users',
  [STORAGE_KEYS.REVIEWS]: 'reviews',
  [STORAGE_KEYS.COUPONS]: 'coupons',
  [STORAGE_KEYS.PROMOTIONS]: 'promotions',
  [STORAGE_KEYS.RETURNS]: 'returns',
};

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed saving ${key} to storage:`, err);
  }
}

// Initial Brands
const DEFAULT_BRANDS: Brand[] = [
  { id: 'b1', name: 'Fakhama Heritage', slug: 'fakhama-heritage', logo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150', productsCount: 12, isFeatured: true, isActive: true },
  { id: 'b2', name: 'Fakhama Parfums', slug: 'fakhama-parfums', logo: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=150', productsCount: 8, isFeatured: true, isActive: true },
  { id: 'b3', name: 'Maison Leather', slug: 'maison-leather', logo: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=150', productsCount: 6, isFeatured: false, isActive: true },
];

// Initial Homepage Sections
const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  {
    id: 'hero',
    type: 'hero',
    title: 'سلايدر العروض والبنرات الرئيسية',
    subtitle: 'الشريحة الأولى في أعلى الصفحة الرئيسية',
    enabled: true,
    order: 1,
    content: {
      title: 'فخامة تشكيلة الشتاء الفاخرة',
      subtitle: 'حيث تلتقي الأصالة العربية بالحرفية الإيطالية الاستثنائية',
      ctaText: 'تسوق التشكيلة الملكية',
      ctaLink: '/catalog',
    },
  },
  {
    id: 'trust_perks',
    type: 'trust_perks',
    title: 'شريط المزايا والضمانات الملكية',
    subtitle: 'ضمان الأصالة، الشحن المصفح، والكونسيرج الخاص',
    enabled: true,
    order: 2,
    content: {},
  },
  {
    id: 'categories_grid',
    type: 'categories_grid',
    title: 'تصفح الأقسام الملكية',
    subtitle: 'عالم متكامل من الساعات والعطور والمنتجات الجلدية',
    enabled: true,
    order: 3,
    content: {},
  },
  {
    id: 'featured_products',
    type: 'featured_products',
    title: 'القطع المختارة للنخبة',
    subtitle: 'أحدث الإصدارات المصممة بعناية فائقة',
    enabled: true,
    order: 4,
    content: {},
  },
  {
    id: 'best_sellers',
    type: 'best_sellers',
    title: 'الأكثر مبيعاً وإقبالاً',
    subtitle: 'اختيارات كبار الشخصيات وعشاق الفخامة',
    enabled: true,
    order: 5,
    content: {},
  },
  {
    id: 'editorial',
    type: 'editorial',
    title: 'القصة التراثية والحكاية الفاخرة (ثمانية)',
    subtitle: 'استعراض مقتنيات التراث والهوية الوطنية الراقية',
    enabled: true,
    order: 6,
    content: {},
  },
  {
    id: 'philosophy',
    type: 'editorial',
    title: 'فلسفة الجودة وحرفية الإنتاج',
    subtitle: 'سرد قصة صناعة الفخامة والمواد الفاخرة المستعملة',
    enabled: true,
    order: 7,
    content: {},
  },
  {
    id: 'live_gallery',
    type: 'editorial',
    title: 'المعرض التفاعلي الملكي المباشر',
    subtitle: 'توزع وتفاعل مقتنيات فخامة كقطع الفسيفساء',
    enabled: true,
    order: 8,
    content: {},
  },
  {
    id: 'social_proof',
    type: 'testimonials',
    title: 'آراء وقصص عملاء النخبة',
    subtitle: 'كلمات موثقة من شخصيات متميزة تسوقت معنا',
    enabled: true,
    order: 9,
    content: {},
  },
  {
    id: 'vip_club',
    type: 'vip_cta',
    title: 'نادي كبار الشخصيات VIP',
    subtitle: 'دعوة الانضمام والاشتراك لخدمات الكونسيرج ومزايا النخبة',
    enabled: true,
    order: 10,
    content: {},
  },
];

class UnifiedCommerceStore {
  private products: Product[];
  private categories: Category[];
  private collections: Collection[];
  private brands: Brand[];
  private orders: Order[];
  private customers: Customer[];
  private reviews: Review[];
  private coupons: Coupon[];
  private promotions: Promotion[];
  private homepageSections: HomepageSection[];
  private storeSettings: StoreSettings;
  private returnRequests: ReturnRequest[];
  private inventoryLogs: InventoryLog[];
  private abandonedCarts: AbandonedCart[];
  private newsletterSubscribers: import('../types/commerce').Subscriber[];
  private supportTickets: import('../types/commerce').SupportTicket[];

  private subscribers: Set<() => void> = new Set();

  constructor() {
    // Map AdminProduct to canonical Product
    const initialProducts: Product[] = MOCK_PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug || `product-${p.id}`,
      sku: p.sku || `SKU-${p.id}`,
      category: p.category,
      brand: p.brand || 'Fakhama Heritage',
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      costPrice: p.costPrice,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold || 5,
      stockStatus: p.stockStatus || (p.stock > 0 ? 'in_stock' : 'out_of_stock'),
      status: p.status || 'published',
      image_url: p.image_url,
      galleryImages: p.galleryImages || [p.image_url],
      description: p.description,
      shortDescription: p.shortDescription,
      rating: p.rating || 5.0,
      reviewsCount: p.reviewsCount || 0,
      salesCount: p.salesCount || 0,
      tags: p.tags || [],
      collections: p.collections || [],
      isFeatured: p.isFeatured || false,
      isBestSeller: p.collections?.includes('الأكثر مبيعاً') || false,
      isNewArrival: p.collections?.includes('وصل حديثاً') || false,
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt,
    }));

    // Map AdminCategory to Category
    const initialCategories: Category[] = MOCK_CATEGORIES.map((c, idx) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image_url: c.image,
      parentId: c.parentId || null,
      productsCount: c.productCount || 0,
      displayOrder: c.displayOrder || idx + 1,
      isActive: c.status === 'active',
    }));

    // Map AdminCollection to Collection
    const initialCollections: Collection[] = MOCK_COLLECTIONS.map((col) => ({
      id: col.id,
      name: col.title,
      slug: col.slug,
      description: col.description,
      bannerImage: col.bannerImage || col.image,
      productsCount: col.productsCount || 0,
      isPublished: col.status === 'active',
      isFeatured: col.featured || false,
      createdAt: col.createdAt,
    }));

    // Map AdminOrder to Order
    const initialOrders: Order[] = MOCK_ORDERS.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber || o.id.toString(),
      user_id: o.customer.email || 'usr_guest',
      customerName: o.customer.name,
      customerEmail: o.customer.email,
      customerPhone: o.customer.phone,
      shippingAddress: {
        recipient_name: o.shippingAddress?.recipientName || o.customer.name,
        phone: o.shippingAddress?.phone || o.customer.phone,
        address_line1: o.shippingAddress?.addressLine1 || 'حي الصحافة، الرياض',
        city: o.shippingAddress?.city || 'الرياض',
        country: o.shippingAddress?.country || 'المملكة العربية السعودية',
      },
      items: o.items.map((itm, idx) => ({
        id: idx + 1,
        productId: itm.productId,
        product_name: itm.productName,
        name: itm.productName,
        image_url: itm.imageUrl,
        quantity: itm.quantity,
        price: itm.unitPrice,
        subtotal: itm.totalPrice,
      })),
      subtotal: o.subtotal,
      discountTotal: o.discount,
      shippingFee: o.shipping,
      taxTotal: o.tax,
      total: o.total,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      shippingMethod: 'Aramex Express',
      trackingNumber: o.trackingNumber,
      timeline: (o.timeline || []).map((t, idx) => ({
        id: t.id || `tl_${idx}`,
        status: t.status as any,
        title: t.status,
        description: t.note || 'تم تحديث حالة الطلب',
        timestamp: t.timestamp,
        note: t.note,
        user: t.user,
      })),
      created_at: o.createdAt,
    }));

    // Map AdminCustomer to Customer
    const initialCustomers: Customer[] = MOCK_CUSTOMERS.map((cust) => ({
      id: cust.id,
      name: cust.name,
      email: cust.email,
      phone: cust.phone,
      avatar: cust.avatar,
      status: cust.status,
      membershipTier: cust.membershipTier || 'standard',
      loyaltyPoints: cust.loyaltyPoints || 0,
      storeCreditBalance: cust.storeCreditBalance || 0,
      totalOrders: cust.ordersCount,
      totalSpent: cust.totalSpent,
      city: cust.city,
      country: cust.country || 'المملكة العربية السعودية',
      notes: cust.notes,
      walletTransactions: (cust as any).walletTransactions || (cust.storeCreditBalance ? [{
        id: `wt_init_${cust.id}`,
        type: 'credit_added' as const,
        amount: cust.storeCreditBalance,
        balanceAfter: cust.storeCreditBalance,
        description: 'رصيد محفظة ترحيبي بمناسبة تدشين العضوية الملكية',
        date: cust.joinedAt || new Date().toISOString(),
      }] : []),
      createdAt: cust.joinedAt,
      lastOrderAt: cust.lastActive,
    }));

    // Map AdminReview to Review
    const initialReviews: Review[] = MOCK_REVIEWS.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: r.productName,
      productImage: r.productImage,
      customerName: r.customerName,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      createdAt: r.createdAt,
    }));

    // Map AdminCoupon to Coupon
    const initialCoupons: Coupon[] = MOCK_COUPONS.map((cp) => ({
      id: cp.id,
      code: cp.code,
      discountType: cp.discountType as any,
      discountValue: cp.discountValue,
      minOrderAmount: cp.minOrderValue,
      usageLimit: cp.usageLimit,
      usageCount: cp.usageCount,
      startsAt: cp.startDate,
      expiresAt: cp.endDate,
      isActive: cp.status === 'active',
      description: cp.description,
    }));

    // Map AdminPromotion to Promotion
    const initialPromotions: Promotion[] = MOCK_PROMOTIONS.map((pr, idx) => ({
      id: pr.id,
      title: pr.title,
      subtitle: pr.subtitle,
      type: pr.type,
      imageUrl: pr.imageUrl,
      linkUrl: pr.linkUrl,
      badgeText: pr.badge,
      ctaText: 'تسوق الآن',
      isActive: pr.status === 'active',
      displayOrder: idx + 1,
    }));

    // Map AdminReturnRequest to ReturnRequest
    const initialReturns: ReturnRequest[] = MOCK_RETURN_REQUESTS.map((ret) => ({
      id: ret.id,
      orderId: ret.orderId,
      customerName: ret.customer.name,
      customerEmail: ret.customer.email,
      items: ret.items.map((i) => ({ productId: i.productId, quantity: i.quantity, reason: i.reason })),
      status: ret.status,
      refundAmount: ret.totalRefundAmount,
      createdAt: ret.requestedAt,
    }));

    const initialInventoryLogs: InventoryLog[] = MOCK_INVENTORY_LOGS.map((log) => ({
      id: log.id,
      productId: log.productId,
      productName: log.productName,
      sku: log.sku,
      warehouseId: log.warehouseId,
      warehouseName: log.warehouseName,
      type: log.type,
      quantityChange: log.quantityChange,
      previousStock: log.previousStock,
      newStock: log.newStock,
      reason: log.reason,
      user: log.user,
      timestamp: log.timestamp,
    }));

    this.products = loadFromStorage(STORAGE_KEYS.PRODUCTS, initialProducts);
    this.categories = loadFromStorage(STORAGE_KEYS.CATEGORIES, initialCategories);
    this.collections = loadFromStorage(STORAGE_KEYS.COLLECTIONS, initialCollections);
    this.brands = loadFromStorage(STORAGE_KEYS.BRANDS, DEFAULT_BRANDS);
    this.orders = loadFromStorage(STORAGE_KEYS.ORDERS, initialOrders);
    this.customers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    this.reviews = loadFromStorage(STORAGE_KEYS.REVIEWS, initialReviews);
    this.coupons = loadFromStorage(STORAGE_KEYS.COUPONS, initialCoupons);
    this.promotions = loadFromStorage(STORAGE_KEYS.PROMOTIONS, initialPromotions);
    this.homepageSections = loadFromStorage(STORAGE_KEYS.HOMEPAGE, DEFAULT_HOMEPAGE_SECTIONS);
    this.storeSettings = loadFromStorage(STORAGE_KEYS.SETTINGS, {
      storeName: MOCK_STORE_SETTINGS.storeName,
      tagline: MOCK_STORE_SETTINGS.storeTagline,
      currency: MOCK_STORE_SETTINGS.currency,
      currencySymbol: 'ر.س',
      contactEmail: MOCK_STORE_SETTINGS.supportEmail,
      contactPhone: MOCK_STORE_SETTINGS.supportPhone,
      whatsappSupport: '+966500000000',
      vatNumber: '310123456700003',
      commercialRegister: '1010987654',
      announcementText: 'توصيل ملكي مجاني لجميع الطلبات التي تتجاوز 1,000 ريال مع تغليف هدية فاخر',
      announcementEnabled: true,
      freeShippingThreshold: MOCK_STORE_SETTINGS.freeShippingThreshold,
      defaultShippingFee: MOCK_STORE_SETTINGS.standardShippingFee,
      expressShippingFee: MOCK_STORE_SETTINGS.standardShippingFee + 40,
      taxRatePercentage: MOCK_STORE_SETTINGS.vatPercentage,
      guestCheckoutEnabled: MOCK_STORE_SETTINGS.allowGuestCheckout ?? true,
      requirePhoneVerification: true,
      lowStockAlertEmail: MOCK_STORE_SETTINGS.supportEmail,
      reviewsAutoApprove: true,
      maintenanceMode: MOCK_STORE_SETTINGS.maintenanceMode,
    });
    this.returnRequests = loadFromStorage(STORAGE_KEYS.RETURNS, initialReturns);
    this.inventoryLogs = loadFromStorage(STORAGE_KEYS.INVENTORY_LOGS, initialInventoryLogs);
    this.abandonedCarts = loadFromStorage(STORAGE_KEYS.ABANDONED_CARTS, MOCK_ABANDONED_CARTS);
    this.newsletterSubscribers = loadFromStorage('fakhama_shared_newsletter_subscribers_v2', []);
    this.supportTickets = loadFromStorage('fakhama_shared_support_tickets', []);
  }

  // --- Subscription mechanism ---
  public subscribe(listener: () => void): () => void {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  private notify(): void {
    this.subscribers.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Subscriber notify error:', err);
      }
    });
  }

  public updateFromServer(property: string, items: any[]): void {
    if ((this as any)[property] !== undefined) {
      // Ensure numeric IDs remain numeric for products
      if (property === 'products') {
        items = items.map(p => ({
          ...p,
          id: typeof p.id === 'string' ? parseInt(p.id, 10) : p.id
        }));
      }
      (this as any)[property] = items;
      this.notify();
    }
  }

  // ============================================================================
  // PRODUCTS
  // ============================================================================
  public getProducts(): Product[] {
    return [...this.products];
  }

  public getProductById(id: number | string): Product | undefined {
    return this.products.find((p) => String(p.id) === String(id) || p.slug === String(id));
  }

  public addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    let maxId = 0;
    this.products.forEach(p => {
      const numId = typeof p.id === 'string' ? parseInt(p.id, 10) : p.id;
      if (!isNaN(numId) && numId > maxId) maxId = numId;
    });
    const newId = maxId + 1;
    const newProduct: Product = {
      ...product,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.products.unshift(newProduct);
    saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
    syncItemToFirestore('products', newProduct);
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    }).catch(() => {});
    this.notify();
    commerceEventBus.emit('PRODUCT_CREATED', newProduct);
    return newProduct;
  }

  public updateProduct(id: number | string, updates: Partial<Product>): Product | undefined {
    const index = this.products.findIndex((p) => String(p.id) === String(id));
    if (index === -1) return undefined;

    const updated = {
      ...this.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.products[index] = updated;
    saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
    syncItemToFirestore('products', updated);
    fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});
    this.notify();
    commerceEventBus.emit('PRODUCT_UPDATED', updated);
    return updated;
  }

  public deleteProduct(id: number | string): boolean {
    const initialLen = this.products.length;
    this.products = this.products.filter((p) => String(p.id) !== String(id));
    if (this.products.length !== initialLen) {
      saveToStorage(STORAGE_KEYS.PRODUCTS, this.products);
      syncDeleteToFirestore('products', id);
      fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
      this.notify();
      commerceEventBus.emit('PRODUCT_DELETED', { id });
      return true;
    }
    return false;
  }

  // ============================================================================
  // CATEGORIES
  // ============================================================================
  public getCategories(): Category[] {
    return this.categories
      .map((cat) => {
        const count = this.products.filter(
          (p) => p.category === cat.name || (p as any).subcategory === cat.name
        ).length;
        return {
          ...cat,
          productsCount: count,
        };
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getCategoryById(id: string | number): Category | undefined {
    const cat = this.categories.find((c) => String(c.id) === String(id));
    if (!cat) return undefined;
    const count = this.products.filter(
      (p) => p.category === cat.name || (p as any).subcategory === cat.name
    ).length;
    return { ...cat, productsCount: count };
  }

  public addCategory(data: Omit<Category, 'id' | 'productsCount'>): Category {
    const newId = `cat_${Date.now()}`;
    const newCat: Category = {
      ...data,
      id: newId,
      productsCount: 0,
      displayOrder: data.displayOrder || this.categories.length + 1,
      isActive: data.isActive !== undefined ? data.isActive : true,
    };
    this.categories.push(newCat);
    saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
    syncItemToFirestore('categories', newCat);
    this.notify();
    commerceEventBus.emit('CATEGORY_UPDATED', this.categories);
    return newCat;
  }

  public updateCategory(id: string | number, updates: Partial<Category>): Category | undefined {
    const idx = this.categories.findIndex((c) => String(c.id) === String(id));
    if (idx === -1) return undefined;
    const updated = {
      ...this.categories[idx],
      ...updates,
    };
    this.categories[idx] = updated;
    saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
    syncItemToFirestore('categories', updated);
    this.notify();
    commerceEventBus.emit('CATEGORY_UPDATED', this.categories);
    return updated;
  }

  public deleteCategory(id: string | number): boolean {
    const initialLen = this.categories.length;
    this.categories = this.categories.filter((c) => String(c.id) !== String(id) && String(c.parentId) !== String(id));
    if (this.categories.length !== initialLen) {
      saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
      syncDeleteToFirestore('categories', id);
      this.notify();
      commerceEventBus.emit('CATEGORY_UPDATED', this.categories);
      return true;
    }
    return false;
  }

  public reorderCategories(orderedIds: (string | number)[]): void {
    orderedIds.forEach((id, index) => {
      const cat = this.categories.find((c) => String(c.id) === String(id));
      if (cat) cat.displayOrder = index + 1;
    });
    saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
    this.notify();
    commerceEventBus.emit('CATEGORY_UPDATED', this.categories);
  }

  public updateCategories(categories: Category[]): void {
    this.categories = [...categories];
    saveToStorage(STORAGE_KEYS.CATEGORIES, this.categories);
    this.notify();
    commerceEventBus.emit('CATEGORY_UPDATED', this.categories);
  }

  // ============================================================================
  // COLLECTIONS
  // ============================================================================
  public getCollections(): Collection[] {
    return this.collections.map((col) => {
      const pCount = (col.productIds && col.productIds.length > 0)
        ? col.productIds.length
        : this.products.filter((p) => (p.collections || []).includes(col.name) || (p.collections || []).includes(col.slug)).length;
      return {
        ...col,
        productsCount: pCount,
      };
    });
  }

  public getCollectionById(id: string): Collection | undefined {
    const col = this.collections.find((c) => c.id === id || c.slug === id);
    if (!col) return undefined;
    const pCount = (col.productIds && col.productIds.length > 0)
      ? col.productIds.length
      : this.products.filter((p) => (p.collections || []).includes(col.name) || (p.collections || []).includes(col.slug)).length;
    return { ...col, productsCount: pCount };
  }

  public addCollection(data: Omit<Collection, 'id' | 'productsCount' | 'createdAt'>): Collection {
    const newId = `col_${Date.now()}`;
    const newCol: Collection = {
      ...data,
      id: newId,
      productsCount: data.productIds?.length || 0,
      createdAt: new Date().toISOString(),
    };
    this.collections.push(newCol);
    saveToStorage(STORAGE_KEYS.COLLECTIONS, this.collections);
    this.notify();
    commerceEventBus.emit('COLLECTION_UPDATED', this.collections);
    return newCol;
  }

  public updateCollection(id: string, updates: Partial<Collection>): Collection | undefined {
    const idx = this.collections.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    const updated = {
      ...this.collections[idx],
      ...updates,
    };
    this.collections[idx] = updated;
    saveToStorage(STORAGE_KEYS.COLLECTIONS, this.collections);
    this.notify();
    commerceEventBus.emit('COLLECTION_UPDATED', this.collections);
    return updated;
  }

  public deleteCollection(id: string): boolean {
    const initialLen = this.collections.length;
    this.collections = this.collections.filter((c) => c.id !== id);
    if (this.collections.length !== initialLen) {
      saveToStorage(STORAGE_KEYS.COLLECTIONS, this.collections);
      this.notify();
      commerceEventBus.emit('COLLECTION_UPDATED', this.collections);
      return true;
    }
    return false;
  }

  public updateCollections(collections: Collection[]): void {
    this.collections = [...collections];
    saveToStorage(STORAGE_KEYS.COLLECTIONS, this.collections);
    this.notify();
    commerceEventBus.emit('COLLECTION_UPDATED', this.collections);
  }

  // ============================================================================
  // INVENTORY LOGS & STOCK CONTROL
  // ============================================================================
  public getInventoryLogs(params?: {
    productId?: number;
    warehouseId?: string;
    type?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): InventoryLog[] {
    let logs = [...this.inventoryLogs];
    if (params?.productId) {
      logs = logs.filter((l) => l.productId === params.productId);
    }
    if (params?.warehouseId && params.warehouseId !== 'all') {
      logs = logs.filter((l) => l.warehouseId === params.warehouseId);
    }
    if (params?.type && params.type !== 'all') {
      logs = logs.filter((l) => l.type === params.type);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      logs = logs.filter(
        (l) =>
          l.productName.toLowerCase().includes(q) ||
          l.sku.toLowerCase().includes(q) ||
          l.reason.toLowerCase().includes(q) ||
          l.user.toLowerCase().includes(q)
      );
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addInventoryLog(logData: Omit<InventoryLog, 'id' | 'timestamp'>): InventoryLog {
    const log: InventoryLog = {
      ...logData,
      id: `inv_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.inventoryLogs.unshift(log);
    saveToStorage(STORAGE_KEYS.INVENTORY_LOGS, this.inventoryLogs);
    this.notify();
    commerceEventBus.emit('INVENTORY_LOG_CREATED', log);
    return log;
  }

  public adjustStock(
    productId: number,
    newStock: number,
    reason: string = 'تعديل يدوي للمخزون',
    user: string = 'المدير التنفيذي',
    type: InventoryLog['type'] = 'adjustment',
    warehouseName: string = 'المستودع الرئيسي - الرياض'
  ): Product | undefined {
    const product = this.getProductById(productId);
    if (!product) return undefined;

    const previousStock = product.stock;
    const targetStock = Math.max(0, newStock);
    const quantityChange = targetStock - previousStock;
    const lowStockThreshold = product.lowStockThreshold || 5;
    const stockStatus =
      targetStock === 0 ? 'out_of_stock' : targetStock <= lowStockThreshold ? 'low_stock' : 'in_stock';

    const updated = this.updateProduct(productId, {
      stock: targetStock,
      stockStatus,
    });

    if (quantityChange !== 0) {
      this.addInventoryLog({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        warehouseId: 'wh_main',
        warehouseName,
        type: type || (quantityChange > 0 ? 'in' : 'out'),
        quantityChange,
        previousStock,
        newStock: targetStock,
        reason,
        user,
      });
    }

    return updated;
  }

  // ============================================================================
  // ORDERS
  // ============================================================================
  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getOrderById(id: number | string): Order | undefined {
    return this.orders.find((o) => o.id === id || o.orderNumber === id.toString());
  }

  public createOrder(orderPayload: Omit<Order, 'id' | 'orderNumber' | 'created_at' | 'timeline'>): Order {
    // Validate stock for all items first before doing any state modifications
    for (const item of orderPayload.items) {
      const p = this.products.find((prod) => prod.id === item.productId);
      if (p) {
        if (p.stock < item.quantity) {
          throw new Error(`عذراً، الكمية المطلوبة من مقتنى "${p.name}" غير متوفرة حالياً. الكمية المتبقية في المخزون هي ${p.stock} فقط.`);
        }
      } else {
        throw new Error(`عذراً، المقتنى المطلوب رقم #${item.productId} غير متوفر في النظام حالياً.`);
      }
    }

    const nextId = this.orders.length > 0 ? Math.max(...this.orders.map((o) => (typeof o.id === 'number' ? o.id : 100))) + 1 : 1001;
    const orderNumber = `ORD-${9800 + nextId}`;

    const timeline: any[] = [
      {
        id: `tl_${Date.now()}`,
        title: 'تم إنشاء الطلب',
        description: 'قام العميل بإتمام عملية الدفع وتقديم الطلب بنجاح',
        status: 'pending',
        timestamp: new Date().toISOString(),
        actor: 'العميل',
      }
    ];

    if (orderPayload.giftWrapping) {
      timeline.push({
        id: `tl_${Date.now()}_gift`,
        title: 'تغليف الهدايا الملكي الفاخر',
        description: `تم اختيار ميزة التغليف الملكي الفاخر وإرفاق بطاقة الإهداء: "${orderPayload.giftMessage || 'بدون نص مكتوب'}"`,
        status: 'pending',
        timestamp: new Date().toISOString(),
        actor: 'العميل',
      });
    }

    const newOrder: Order = {
      ...orderPayload,
      id: nextId,
      orderNumber,
      created_at: new Date().toISOString(),
      timeline,
    };

    this.orders.unshift(newOrder);
    saveToStorage(STORAGE_KEYS.ORDERS, this.orders);
    syncItemToFirestore('orders', newOrder);
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'ord-' + newOrder.id },
      body: JSON.stringify({
        customer: {
          name: newOrder.customerName,
          email: newOrder.customerEmail,
          phone: newOrder.customerPhone,
          address: newOrder.shippingAddress?.address_line1 || 'الرياض',
          city: newOrder.shippingAddress?.city || 'الرياض',
          postal_code: '11564'
        },
        items: newOrder.items.map((it) => ({
          product_id: it.productId,
          quantity: it.quantity,
        })),
      }),
    }).catch(() => {});

    // 1. Deduct stock for ordered items & record real Inventory Logs
    orderPayload.items.forEach((item) => {
      const p = this.products.find((prod) => prod.id === item.productId);
      if (p) {
        const prevStock = p.stock;
        const newStock = Math.max(0, p.stock - item.quantity);
        this.updateProduct(p.id, {
          stock: newStock,
          stockStatus: newStock === 0 ? 'out_of_stock' : newStock <= (p.lowStockThreshold || 5) ? 'low_stock' : 'in_stock',
          salesCount: (p.salesCount || 0) + item.quantity,
        });

        // Add real inventory log
        this.addInventoryLog({
          productId: p.id,
          productName: p.name,
          sku: p.sku || `LX-${p.id}`,
          warehouseId: 'wh_main',
          warehouseName: 'المستودع الملكي الرئيسي - الرياض',
          type: 'order',
          quantityChange: -item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          reason: `صرف مقتنيات للطلب الملكي ${orderNumber}`,
          user: orderPayload.customerName || 'العميل',
        });
      }
    });

    // 2. Synchronize Customer profile in Admin Customers
    const customerIdentifier = orderPayload.customerEmail || orderPayload.customerPhone;
    if (customerIdentifier) {
      const existingCust = this.customers.find(
        (c) =>
          (orderPayload.customerEmail && c.email.toLowerCase() === orderPayload.customerEmail.toLowerCase()) ||
          (orderPayload.customerPhone && c.phone === orderPayload.customerPhone)
      );

      const pointsEarned = Math.floor(newOrder.total / 10);

      if (existingCust) {
        const newTotalSpent = existingCust.totalSpent + newOrder.total;
        const newTotalOrders = existingCust.totalOrders + 1;
        const newLoyaltyPoints = (existingCust.loyaltyPoints || 0) + pointsEarned;
        let newTier = existingCust.membershipTier;
        if (newTotalSpent >= 15000) newTier = 'vip_royal';
        else if (newTotalSpent >= 8000) newTier = 'gold';
        else if (newTotalSpent >= 3000) newTier = 'silver';

        const creditDeducted = (newOrder.storeCreditApplied && newOrder.storeCreditApplied > 0) ? newOrder.storeCreditApplied : 0;
        const newCreditBalance = Math.max(0, (existingCust.storeCreditBalance || 0) - creditDeducted);
        let updatedTxs = existingCust.walletTransactions || [];
        if (creditDeducted > 0) {
          const tx: WalletTransaction = {
            id: `wt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            type: 'credit_spent',
            amount: -creditDeducted,
            balanceAfter: newCreditBalance,
            description: `استخدام رصيد المحفظة في سداد الطلب #${newOrder.orderNumber || newOrder.id}`,
            date: new Date().toISOString(),
            referenceId: String(newOrder.orderNumber || newOrder.id),
          };
          updatedTxs = [tx, ...updatedTxs];
        }

        this.updateCustomer(String(existingCust.id), {
          totalSpent: newTotalSpent,
          totalOrders: newTotalOrders,
          loyaltyPoints: newLoyaltyPoints,
          membershipTier: newTier,
          storeCreditBalance: newCreditBalance,
          walletTransactions: updatedTxs,
          lastOrderAt: new Date().toISOString(),
          name: orderPayload.customerName || existingCust.name,
        });
      } else {
        let initialTier: Customer['membershipTier'] = 'standard';
        if (newOrder.total >= 15000) initialTier = 'vip_royal';
        else if (newOrder.total >= 8000) initialTier = 'gold';
        else if (newOrder.total >= 3000) initialTier = 'silver';

        this.addCustomer({
          name: orderPayload.customerName || 'عميل جديد',
          email: orderPayload.customerEmail || `customer_${nextId}@luxestore.com`,
          phone: orderPayload.customerPhone || '0500000000',
          totalOrders: 1,
          totalSpent: newOrder.total,
          loyaltyPoints: pointsEarned,
          membershipTier: initialTier,
          status: 'active',
          lastOrderAt: new Date().toISOString(),
          tags: ['عميل متجر أونلاين'],
        });
      }
    }

    // 3. Increment coupon usage count if used
    if (orderPayload.couponCode) {
      const coupon = this.coupons.find((c) => c.code.toUpperCase() === orderPayload.couponCode?.toUpperCase());
      if (coupon) {
        coupon.usageCount = (coupon.usageCount || 0) + 1;
        this.updateCoupons(this.coupons);
      }
    }

    this.notify();
    commerceEventBus.emit('ORDER_CREATED', newOrder);
    return newOrder;
  }

  public updateOrderStatus(id: number | string, status: Order['status'], note?: string): Order | undefined {
    const index = this.orders.findIndex((o) => o.id === id || o.orderNumber === id.toString());
    if (index === -1) return undefined;

    const order = this.orders[index];
    const statusArabicTitles: Record<string, string> = {
      pending: 'تم استلام وتوثيق الطلب',
      processing: 'جاري تجهيز وتغليف المقتنيات الملكية',
      shipped: 'تم تسليم الشحنة لشركة الشحن السريع',
      delivered: 'تم تسليم وتوقيع الطلب بنجاح',
      cancelled: 'تم إلغاء الطلب',
      returned: 'تم استرجاع المقتنيات للمستودع',
      refunded: 'تم استرداد كامل المبلغ للعميل',
    };
    const title = statusArabicTitles[status] || `تحديث حالة الطلب إلى: ${status}`;

    const newTimeline = [
      {
        id: `tl_${Date.now()}`,
        title,
        description: note || `تم تغيير حالة الطلب بواسطة إدارة المتجر`,
        status,
        timestamp: new Date().toISOString(),
        actor: 'إدارة المتجر',
      },
      ...order.timeline,
    ];

    const updated: Order = {
      ...order,
      status,
      timeline: newTimeline,
      updated_at: new Date().toISOString(),
    };

    this.orders[index] = updated;
    saveToStorage(STORAGE_KEYS.ORDERS, this.orders);
    syncItemToFirestore('orders', updated);
    fetch(`/api/orders/${order.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note })
    }).catch(() => {});
    this.notify();
    commerceEventBus.emit('ORDER_UPDATED', updated);
    return updated;
  }

  // ============================================================================
  // REVIEWS
  // ============================================================================
  private recalculateProductRating(productId: number): void {
    const productReviews = this.reviews.filter(
      (r) => r.productId === productId && (r.status === 'approved' || r.status === undefined)
    );
    if (productReviews.length > 0) {
      const avgRating = Number(
        (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
      );
      this.updateProduct(productId, {
        rating: avgRating,
        reviewsCount: productReviews.length,
      });
    } else {
      // If no approved reviews left, keep default base rating or set count to 0
      const existingProduct = this.products.find((p) => p.id === productId);
      if (existingProduct) {
        this.updateProduct(productId, {
          reviewsCount: 0,
        });
      }
    }
  }

  public getReviews(productId?: number): Review[] {
    if (productId !== undefined) {
      return this.reviews.filter((r) => r.productId === productId && (r.status === 'approved' || r.status === undefined));
    }
    return [...this.reviews];
  }

  public addReview(review: Omit<Review, 'id' | 'createdAt' | 'status'>): Review {
    const newReview: Review = {
      ...review,
      id: `rev_${Date.now()}`,
      status: this.storeSettings.reviewsAutoApprove ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
    };
    this.reviews.unshift(newReview);
    saveToStorage(STORAGE_KEYS.REVIEWS, this.reviews);
    syncItemToFirestore('reviews', newReview);
    this.recalculateProductRating(newReview.productId);
    this.notify();
    commerceEventBus.emit('REVIEW_CREATED', newReview);
    return newReview;
  }

  public updateReviewStatus(id: string, status: Review['status']): Review | undefined {
    const index = this.reviews.findIndex((r) => r.id === id);
    if (index === -1) return undefined;

    const updated = { ...this.reviews[index], status };
    this.reviews[index] = updated;
    saveToStorage(STORAGE_KEYS.REVIEWS, this.reviews);
    syncItemToFirestore('reviews', updated);
    this.recalculateProductRating(updated.productId);
    this.notify();
    commerceEventBus.emit('REVIEW_UPDATED', updated);
    return updated;
  }

  // ============================================================================
  // COUPONS & PROMOTIONS
  // ============================================================================
  public getCoupons(): Coupon[] {
    return [...this.coupons];
  }

  public updateCoupons(coupons: Coupon[]): void {
    this.coupons = [...coupons];
    saveToStorage(STORAGE_KEYS.COUPONS, this.coupons);
    this.notify();
    commerceEventBus.emit('COUPON_UPDATED', this.coupons);
  }

  public validateCoupon(code: string, cartTotal: number): { valid: boolean; message?: string; discountAmount: number; coupon?: Coupon } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = this.coupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (!coupon) {
      return { valid: false, message: 'رمز القسيمة غير صحيح', discountAmount: 0 };
    }
    if (!coupon.isActive) {
      return { valid: false, message: 'هذه القسيمة غير نشطة حالياً', discountAmount: 0 };
    }
    if (coupon.startsAt && new Date(coupon.startsAt) > new Date()) {
      return { valid: false, message: 'هذه القسيمة لم تبدأ بعد', discountAmount: 0 };
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, message: 'عذراً، انتهت صلاحية هذه القسيمة', discountAmount: 0 };
    }
    if (coupon.usageLimit && coupon.usageCount && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: 'تم استنفاذ الحد الأقصى لاستخدام هذه القسيمة', discountAmount: 0 };
    }
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `الحد الأدنى للطلب لتفعيل هذه القسيمة هو ${coupon.minOrderAmount} ر.س`,
        discountAmount: 0,
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(cartTotal, coupon.discountValue);
    }

    return {
      valid: true,
      discountAmount: Math.round(discountAmount),
      coupon,
    };
  }

  public getPromotions(): Promotion[] {
    return [...this.promotions];
  }

  public updatePromotions(promotions: Promotion[]): void {
    this.promotions = [...promotions];
    saveToStorage(STORAGE_KEYS.PROMOTIONS, this.promotions);
    this.notify();
    commerceEventBus.emit('PROMOTION_UPDATED', this.promotions);
  }

  // ============================================================================
  // HOMEPAGE CMS
  // ============================================================================
  public getHomepageSections(): HomepageSection[] {
    return [...this.homepageSections];
  }

  public updateHomepageSections(sections: HomepageSection[]): void {
    this.homepageSections = [...sections];
    saveToStorage(STORAGE_KEYS.HOMEPAGE, this.homepageSections);
    this.notify();
    commerceEventBus.emit('HOMEPAGE_UPDATED', this.homepageSections);
  }

  // ============================================================================
  // STORE SETTINGS
  // ============================================================================
  public getStoreSettings(): StoreSettings {
    return { ...this.storeSettings };
  }

  public updateStoreSettings(settings: Partial<StoreSettings>): StoreSettings {
    this.storeSettings = { ...this.storeSettings, ...settings };
    saveToStorage(STORAGE_KEYS.SETTINGS, this.storeSettings);
    syncItemToFirestore('settings', { id: 'storeSettings', ...this.storeSettings });
    this.notify();
    commerceEventBus.emit('SETTINGS_UPDATED', this.storeSettings);
    return this.storeSettings;
  }

  // ============================================================================
  // CUSTOMERS & RETURNS
  // ============================================================================
  public getCustomers(): Customer[] {
    return [...this.customers];
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.customers.find((c) => c.id === id || c.email === id);
  }

  public addCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const newCustomer: Customer = {
      ...customer,
      id: `cust_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.customers.unshift(newCustomer);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, this.customers);
    syncItemToFirestore('users', newCustomer);
    this.notify();
    commerceEventBus.emit('CUSTOMER_UPDATED', newCustomer);
    return newCustomer;
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
    const idx = this.customers.findIndex(
      (c) =>
        c.id === id ||
        c.email?.toLowerCase() === id.toLowerCase() ||
        String(c.id).replace(/\D/g, '') === String(id).replace(/\D/g, '')
    );
    if (idx === -1) return undefined;

    const prev = this.customers[idx];
    const updated = { ...prev, ...updates };
    this.customers[idx] = updated;
    saveToStorage(STORAGE_KEYS.CUSTOMERS, this.customers);
    syncItemToFirestore('users', updated);
    this.notify();
    commerceEventBus.emit('CUSTOMER_UPDATED', updated);
    return updated;
  }

  public adjustCustomerStoreCredit(
    customerIdOrEmail: string,
    amount: number,
    type: 'credit_added' | 'credit_spent' | 'points_converted' | 'order_refund',
    description: string,
    referenceId?: string
  ): Customer | undefined {
    const customer = this.customers.find(
      (c) =>
        c.id === customerIdOrEmail ||
        c.email?.toLowerCase() === customerIdOrEmail.toLowerCase() ||
        String(c.id).replace(/\D/g, '') === String(customerIdOrEmail).replace(/\D/g, '')
    );
    if (!customer) return undefined;

    const currentBalance = customer.storeCreditBalance || 0;
    const newBalance = Math.max(0, currentBalance + amount);
    const tx: WalletTransaction = {
      id: `wt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      amount,
      balanceAfter: newBalance,
      description,
      date: new Date().toISOString(),
      referenceId,
    };

    const updatedTransactions = [tx, ...(customer.walletTransactions || [])];
    return this.updateCustomer(String(customer.id), {
      storeCreditBalance: newBalance,
      walletTransactions: updatedTransactions,
    });
  }

  public convertLoyaltyPointsToCredit(
    customerIdOrEmail: string,
    points: number,
    conversionRate: number = 10
  ): { success: boolean; creditAdded: number; newPoints: number; newBalance: number; error?: string } {
    const customer = this.customers.find(
      (c) =>
        c.id === customerIdOrEmail ||
        c.email?.toLowerCase() === customerIdOrEmail.toLowerCase() ||
        String(c.id).replace(/\D/g, '') === String(customerIdOrEmail).replace(/\D/g, '')
    );
    if (!customer) {
      return { success: false, creditAdded: 0, newPoints: 0, newBalance: 0, error: 'تعذر العثور على حساب العميل' };
    }
    if (points <= 0) {
      return { success: false, creditAdded: 0, newPoints: 0, newBalance: 0, error: 'يرجى تحديد عدد نقاط صالح' };
    }
    if ((customer.loyaltyPoints || 0) < points) {
      return { success: false, creditAdded: 0, newPoints: 0, newBalance: 0, error: 'رصيد نقاطك الحالي لا يكفي لإتمام التحويل' };
    }

    const creditToAdd = Math.floor(points / conversionRate);
    if (creditToAdd <= 0) {
      return {
        success: false,
        creditAdded: 0,
        newPoints: customer.loyaltyPoints || 0,
        newBalance: customer.storeCreditBalance || 0,
        error: `الحد الأدنى للتحويل هو ${conversionRate} نقاط (تعادل 1 ر.س)`,
      };
    }

    const newPoints = (customer.loyaltyPoints || 0) - points;
    const newBalance = (customer.storeCreditBalance || 0) + creditToAdd;

    const tx: WalletTransaction = {
      id: `wt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'points_converted',
      amount: creditToAdd,
      balanceAfter: newBalance,
      description: `تحويل ${points} نقطة مكافآت إلى رصيد نقدي في المحفظة الملكية`,
      date: new Date().toISOString(),
    };

    const updatedTransactions = [tx, ...(customer.walletTransactions || [])];
    this.updateCustomer(String(customer.id), {
      loyaltyPoints: newPoints,
      storeCreditBalance: newBalance,
      walletTransactions: updatedTransactions,
    });

    return {
      success: true,
      creditAdded: creditToAdd,
      newPoints,
      newBalance,
    };
  }

  // ============================================================================
  // ABANDONED CARTS
  // ============================================================================
  public getAbandonedCarts(): AbandonedCart[] {
    return [...this.abandonedCarts];
  }

  public getAbandonedCartById(id: string): AbandonedCart | undefined {
    return this.abandonedCarts.find((c) => c.id === id);
  }

  public syncAbandonedCart(cartData: {
    userId?: string | number;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    userAvatar?: string;
    items: Array<{
      productId: number;
      productName: string;
      imageUrl: string;
      unitPrice: number;
      quantity: number;
    }>;
    totalValue: number;
  }): AbandonedCart | null {
    if (!cartData.items || cartData.items.length === 0) {
      // If cart became empty, remove any active abandoned cart for this user/email
      if (cartData.userEmail || cartData.userId) {
        const initialLen = this.abandonedCarts.length;
        this.abandonedCarts = this.abandonedCarts.filter(
          (c) =>
            !(
              (cartData.userId && c.customer.id === cartData.userId) ||
              (cartData.userEmail && c.customer.email === cartData.userEmail)
            )
        );
        if (this.abandonedCarts.length !== initialLen) {
          saveToStorage(STORAGE_KEYS.ABANDONED_CARTS, this.abandonedCarts);
          this.notify();
          commerceEventBus.emit('ABANDONED_CART_UPDATED', this.abandonedCarts);
        }
      }
      return null;
    }

    const email = cartData.userEmail || 'guest@fakhama.sa';
    const name = cartData.userName || 'زائر المتجر';
    const phone = cartData.userPhone || '+966 50 000 0000';

    // Check if an abandoned cart already exists for this customer
    const existingIndex = this.abandonedCarts.findIndex(
      (c) =>
        (cartData.userId && c.customer.id === cartData.userId) ||
        (cartData.userEmail && c.customer.email === cartData.userEmail)
    );

    if (existingIndex !== -1) {
      const existing = this.abandonedCarts[existingIndex];
      const updatedCart: AbandonedCart = {
        ...existing,
        customer: {
          ...existing.customer,
          name,
          email,
          phone,
          avatar: cartData.userAvatar || existing.customer.avatar,
        },
        items: cartData.items,
        totalValue: cartData.totalValue,
        abandonedAt: new Date().toISOString(),
        status: existing.status === 'recovered' ? 'abandoned' : existing.status,
      };
      this.abandonedCarts[existingIndex] = updatedCart;
      saveToStorage(STORAGE_KEYS.ABANDONED_CARTS, this.abandonedCarts);
      this.notify();
      commerceEventBus.emit('ABANDONED_CART_UPDATED', this.abandonedCarts);
      return updatedCart;
    } else {
      const newCart: AbandonedCart = {
        id: `cart_${Date.now()}`,
        cartNumber: `CRT-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: {
          id: cartData.userId,
          name,
          email,
          phone,
          avatar: cartData.userAvatar,
        },
        items: cartData.items,
        totalValue: cartData.totalValue,
        abandonedAt: new Date().toISOString(),
        status: 'abandoned',
        recoverySentCount: 0,
      };
      this.abandonedCarts.unshift(newCart);
      saveToStorage(STORAGE_KEYS.ABANDONED_CARTS, this.abandonedCarts);
      this.notify();
      commerceEventBus.emit('ABANDONED_CART_UPDATED', this.abandonedCarts);
      return newCart;
    }
  }

  public markAbandonedCartRecovered(cartIdOrUserEmail: string): boolean {
    let found = false;
    this.abandonedCarts = this.abandonedCarts.map((c) => {
      if (c.id === cartIdOrUserEmail || c.customer.email === cartIdOrUserEmail) {
        found = true;
        return {
          ...c,
          status: 'recovered' as const,
          lastRecoverySentAt: 'تم إتمام الطلب واسترجاع السلة بنجاح',
        };
      }
      return c;
    });

    if (found) {
      saveToStorage(STORAGE_KEYS.ABANDONED_CARTS, this.abandonedCarts);
      this.notify();
      commerceEventBus.emit('ABANDONED_CART_UPDATED', this.abandonedCarts);
    }
    return found;
  }

  public sendAbandonedCartRecovery(cartId: string, channel: 'email' | 'whatsapp' | 'sms' = 'whatsapp'): boolean {
    const idx = this.abandonedCarts.findIndex((c) => c.id === cartId);
    if (idx === -1) return false;

    const channelNames = {
      whatsapp: 'واتساب',
      email: 'البريد الإلكتروني',
      sms: 'رسالة SMS',
    };

    const cart = this.abandonedCarts[idx];
    const updated: AbandonedCart = {
      ...cart,
      status: 'contacted',
      recoverySentCount: (cart.recoverySentCount || 0) + 1,
      lastRecoverySentAt: `الآن عبر ${channelNames[channel]}`,
    };

    this.abandonedCarts[idx] = updated;
    saveToStorage(STORAGE_KEYS.ABANDONED_CARTS, this.abandonedCarts);
    this.notify();
    commerceEventBus.emit('ABANDONED_CART_UPDATED', this.abandonedCarts);
    return true;
  }

  public deleteAbandonedCart(cartId: string): boolean {
    const initialLen = this.abandonedCarts.length;
    this.abandonedCarts = this.abandonedCarts.filter((c) => c.id !== cartId);
    if (this.abandonedCarts.length !== initialLen) {
      saveToStorage(STORAGE_KEYS.ABANDONED_CARTS, this.abandonedCarts);
      this.notify();
      commerceEventBus.emit('ABANDONED_CART_UPDATED', this.abandonedCarts);
      return true;
    }
    return false;
  }

  public getReturnRequests(): ReturnRequest[] {
    return [...this.returnRequests];
  }

  public createReturnRequest(req: Omit<ReturnRequest, 'id' | 'createdAt'>): ReturnRequest {
    const newReq: ReturnRequest = {
      ...req,
      id: `ret_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.returnRequests.unshift(newReq);
    saveToStorage(STORAGE_KEYS.RETURNS, this.returnRequests);
    syncItemToFirestore('returns', newReq);
    this.notify();
    commerceEventBus.emit('RETURN_REQUEST_UPDATED', newReq);
    return newReq;
  }

  public updateReturnRequest(id: string, status: ReturnRequest['status'], refundStatus?: ReturnRequest['refundStatus']): ReturnRequest | undefined {
    const index = this.returnRequests.findIndex((r) => r.id === id);
    if (index === -1) return undefined;

    const previousStatus = this.returnRequests[index].status;
    const updated: ReturnRequest = {
      ...this.returnRequests[index],
      status,
      ...(refundStatus ? { refundStatus } : {}),
    };

    // Auto-restock returned items if return is newly approved or refunded
    if ((status === 'approved' || status === 'refunded') && previousStatus !== 'approved' && previousStatus !== 'refunded') {
      if (updated.items && Array.isArray(updated.items)) {
        updated.items.forEach((item) => {
          const p = this.products.find((prod) => prod.id === item.productId);
          if (p) {
            const prevStock = p.stock;
            const newStock = p.stock + item.quantity;
            this.updateProduct(p.id, {
              stock: newStock,
              stockStatus: newStock > (p.lowStockThreshold || 5) ? 'in_stock' : newStock > 0 ? 'low_stock' : 'out_of_stock',
            });

            this.addInventoryLog({
              productId: p.id,
              productName: p.name,
              sku: p.sku || `LX-${p.id}`,
              warehouseId: 'wh_main',
              warehouseName: 'المستودع الملكي الرئيسي - الرياض',
              type: 'return',
              quantityChange: item.quantity,
              previousStock: prevStock,
              newStock: newStock,
              reason: `إعادة مخزون بسبب قبول طلب المرتجع #${updated.id}`,
              user: 'إدارة المتجر',
            });
          }
        });
      }

      // Add timeline event to order
      this.addOrderTimelineEvent(
        updated.orderId,
        'تم القبول والموافقة على المرتجع',
        `تم قبول طلب الاسترجاع بمبلغ مسترد ${Number(updated.refundAmount || 0).toLocaleString('ar-SA')} ر.س وإعادة المقتنيات للمخزون`,
        'cancelled',
        'إدارة المتجر'
      );
      this.updateOrderPaymentStatus(updated.orderId, 'refunded');
    }

    this.returnRequests[index] = updated;
    saveToStorage(STORAGE_KEYS.RETURNS, this.returnRequests);
    syncItemToFirestore('returns', updated);
    this.notify();
    commerceEventBus.emit('RETURN_REQUEST_UPDATED', updated);
    return updated;
  }

  // Helper additions for Order lifecycle
  public updateOrderPaymentStatus(id: number | string, paymentStatus: Order['paymentStatus']): Order | undefined {
    const index = this.orders.findIndex((o) => o.id === id || o.orderNumber === id.toString());
    if (index === -1) return undefined;

    const updated: Order = {
      ...this.orders[index],
      paymentStatus,
      updated_at: new Date().toISOString(),
    };
    this.orders[index] = updated;
    saveToStorage(STORAGE_KEYS.ORDERS, this.orders);
    syncItemToFirestore('orders', updated);
    this.notify();
    commerceEventBus.emit('ORDER_UPDATED', updated);
    return updated;
  }

  public updateOrderShipping(id: number | string, trackingNumber: string, shippingCarrier?: string): Order | undefined {
    const index = this.orders.findIndex((o) => o.id === id || o.orderNumber === id.toString());
    if (index === -1) return undefined;

    const updated: Order = {
      ...this.orders[index],
      trackingNumber,
      trackingCarrier: shippingCarrier || this.orders[index].trackingCarrier || 'Aramex VIP',
      updated_at: new Date().toISOString(),
    };
    this.orders[index] = updated;
    saveToStorage(STORAGE_KEYS.ORDERS, this.orders);
    syncItemToFirestore('orders', updated);
    this.notify();
    commerceEventBus.emit('ORDER_UPDATED', updated);
    return updated;
  }

  public addOrderTimelineEvent(id: number | string, title: string, description?: string, status?: string, actor = 'إدارة المتجر'): Order | undefined {
    const index = this.orders.findIndex((o) => o.id === id || o.orderNumber === id.toString());
    if (index === -1) return undefined;

    const order = this.orders[index];
    const newTimeline = [
      {
        id: `tl_${Date.now()}`,
        title,
        description: description || 'تم تسجيل إجراء جديد للطلب',
        status: (status as any) || order.status,
        timestamp: new Date().toISOString(),
        actor,
      },
      ...order.timeline,
    ];

    const updated: Order = {
      ...order,
      timeline: newTimeline,
      updated_at: new Date().toISOString(),
    };

    this.orders[index] = updated;
    saveToStorage(STORAGE_KEYS.ORDERS, this.orders);
    syncItemToFirestore('orders', updated);
    this.notify();
    commerceEventBus.emit('ORDER_UPDATED', updated);
    return updated;
  }

  public cancelOrder(id: number | string, reason?: string): Order | undefined {
    const order = this.orders.find((o) => o.id === id || o.orderNumber === id.toString());
    if (order && order.status !== 'cancelled') {
      // Restore stock for all items
      order.items.forEach((item) => {
        const prod = this.products.find((p) => p.id === item.productId);
        if (prod) {
          const newStock = prod.stock + item.quantity;
          this.updateProduct(prod.id, {
            stock: newStock,
            stockStatus: newStock > 0 ? (newStock <= (prod.lowStockThreshold || 5) ? 'low_stock' : 'in_stock') : 'out_of_stock',
          });
          this.addInventoryLog({
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku || `LX-${prod.id}`,
            warehouseId: 'wh_main',
            warehouseName: 'المستودع الملكي الرئيسي - الرياض',
            type: 'adjustment',
            quantityChange: item.quantity,
            previousStock: prod.stock,
            newStock,
            reason: `استعادة المخزون بعد إلغاء الطلب #${order.orderNumber || order.id}`,
            user: 'نظام إدارة الطلبات',
          });
        }
      });

      // Restore store credit if used on this order
      if (order.storeCreditApplied && order.storeCreditApplied > 0) {
        const custEmail = order.customerEmail || (order.shippingAddress as any)?.email;
        if (custEmail) {
          this.adjustCustomerStoreCredit(
            custEmail,
            order.storeCreditApplied,
            'order_refund',
            `استرجاع رصيد المحفظة بعد إلغاء الطلب #${order.orderNumber || order.id}`,
            String(order.orderNumber || order.id)
          );
        }
      }
    }
    return this.updateOrderStatus(id, 'cancelled', reason || 'تم إلغاء الطلب');
  }

  // Reviews helpers
  public deleteReview(id: string): boolean {
    const targetReview = this.reviews.find((r) => r.id === id);
    const initialLen = this.reviews.length;
    this.reviews = this.reviews.filter((r) => r.id !== id);
    if (this.reviews.length !== initialLen) {
      saveToStorage(STORAGE_KEYS.REVIEWS, this.reviews);
      if (targetReview) {
        this.recalculateProductRating(targetReview.productId);
      }
      this.notify();
      commerceEventBus.emit('REVIEW_UPDATED', { id });
      return true;
    }
    return false;
  }

  // Coupons helpers
  public addCoupon(coupon: Omit<Coupon, 'id'>): Coupon {
    const newCoupon: Coupon = {
      ...coupon,
      id: `cpn_${Date.now()}`,
    };
    this.coupons.unshift(newCoupon);
    saveToStorage(STORAGE_KEYS.COUPONS, this.coupons);
    this.notify();
    commerceEventBus.emit('COUPON_UPDATED', this.coupons);
    return newCoupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>): Coupon | undefined {
    const idx = this.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;

    const updated = { ...this.coupons[idx], ...updates };
    this.coupons[idx] = updated;
    saveToStorage(STORAGE_KEYS.COUPONS, this.coupons);
    this.notify();
    commerceEventBus.emit('COUPON_UPDATED', this.coupons);
    return updated;
  }

  public deleteCoupon(id: string): boolean {
    const initialLen = this.coupons.length;
    this.coupons = this.coupons.filter((c) => c.id !== id);
    if (this.coupons.length !== initialLen) {
      saveToStorage(STORAGE_KEYS.COUPONS, this.coupons);
      this.notify();
      commerceEventBus.emit('COUPON_UPDATED', this.coupons);
      return true;
    }
    return false;
  }

  // Promotions helpers
  public addPromotion(promo: Omit<Promotion, 'id'>): Promotion {
    const newPromo: Promotion = {
      ...promo,
      id: `prm_${Date.now()}`,
    };
    this.promotions.unshift(newPromo);
    saveToStorage(STORAGE_KEYS.PROMOTIONS, this.promotions);
    this.notify();
    commerceEventBus.emit('PROMOTION_UPDATED', this.promotions);
    return newPromo;
  }

  public updatePromotion(id: string, updates: Partial<Promotion>): Promotion | undefined {
    const idx = this.promotions.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;

    const updated = { ...this.promotions[idx], ...updates };
    this.promotions[idx] = updated;
    saveToStorage(STORAGE_KEYS.PROMOTIONS, this.promotions);
    this.notify();
    commerceEventBus.emit('PROMOTION_UPDATED', this.promotions);
    return updated;
  }

  public deletePromotion(id: string): boolean {
    const initialLen = this.promotions.length;
    this.promotions = this.promotions.filter((p) => p.id !== id);
    if (this.promotions.length !== initialLen) {
      saveToStorage(STORAGE_KEYS.PROMOTIONS, this.promotions);
      this.notify();
      commerceEventBus.emit('PROMOTION_UPDATED', this.promotions);
      return true;
    }
    return false;
  }

  // ============================================================================
  // NEWSLETTER SUBSCRIBERS
  // ============================================================================
  public getNewsletterSubscribers(): import('../types/commerce').Subscriber[] {
    return [...this.newsletterSubscribers];
  }

  public addNewsletterSubscriber(email: string, source: string = 'Footer'): import('../types/commerce').Subscriber | null {
    const existing = this.newsletterSubscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active';
        existing.subscribedAt = new Date().toISOString();
        saveToStorage('fakhama_shared_newsletter_subscribers_v2', this.newsletterSubscribers);
        this.notify();
        commerceEventBus.emit('SUBSCRIBER_UPDATED', this.newsletterSubscribers);
        return existing;
      }
      return null;
    }

    const newSubscriber: import('../types/commerce').Subscriber = {
      id: `sub_${Date.now()}`,
      email: email.toLowerCase(),
      status: 'active',
      subscribedAt: new Date().toISOString(),
      source
    };

    this.newsletterSubscribers.unshift(newSubscriber);
    saveToStorage('fakhama_shared_newsletter_subscribers_v2', this.newsletterSubscribers);
    this.notify();
    commerceEventBus.emit('SUBSCRIBER_UPDATED', this.newsletterSubscribers);
    return newSubscriber;
  }

  public updateSubscriberStatus(id: string, status: import('../types/commerce').SubscriberStatus): boolean {
    const sub = this.newsletterSubscribers.find(s => s.id === id);
    if (!sub) return false;
    sub.status = status;
    saveToStorage('fakhama_shared_newsletter_subscribers_v2', this.newsletterSubscribers);
    this.notify();
    commerceEventBus.emit('SUBSCRIBER_UPDATED', this.newsletterSubscribers);
    return true;
  }

  public deleteSubscriber(id: string): boolean {
    const initialLen = this.newsletterSubscribers.length;
    this.newsletterSubscribers = this.newsletterSubscribers.filter(s => s.id !== id);
    if (this.newsletterSubscribers.length !== initialLen) {
      saveToStorage('fakhama_shared_newsletter_subscribers_v2', this.newsletterSubscribers);
      this.notify();
      commerceEventBus.emit('SUBSCRIBER_UPDATED', this.newsletterSubscribers);
      return true;
    }
    return false;
  }

  // ============================================================================
  // SUPPORT TICKETS (CONTACT US)
  // ============================================================================
  public getSupportTickets(): import('../types/commerce').SupportTicket[] {
    return [...this.supportTickets];
  }

  public addSupportTicket(ticket: Omit<import('../types/commerce').SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>): import('../types/commerce').SupportTicket {
    const newTicket: import('../types/commerce').SupportTicket = {
      ...ticket,
      id: `tk_${Date.now()}`,
      ticketNumber: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: []
    };
    this.supportTickets.unshift(newTicket);
    saveToStorage('fakhama_shared_support_tickets', this.supportTickets);
    this.notify();
    commerceEventBus.emit('TICKET_CREATED', newTicket);
    return newTicket;
  }

  public updateSupportTicketStatus(id: string, status: import('../types/commerce').SupportTicketStatus): import('../types/commerce').SupportTicket | undefined {
    const idx = this.supportTickets.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    this.supportTickets[idx].status = status;
    this.supportTickets[idx].updatedAt = new Date().toISOString();
    saveToStorage('fakhama_shared_support_tickets', this.supportTickets);
    this.notify();
    commerceEventBus.emit('TICKET_UPDATED', this.supportTickets[idx]);
    return this.supportTickets[idx];
  }

  public addSupportTicketResponse(id: string, sender: 'admin' | 'customer', message: string): import('../types/commerce').SupportTicket | undefined {
    const idx = this.supportTickets.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    
    if (!this.supportTickets[idx].responses) {
      this.supportTickets[idx].responses = [];
    }

    this.supportTickets[idx].responses!.push({
      id: `res_${Date.now()}`,
      sender,
      message,
      timestamp: new Date().toISOString()
    });
    
    if (sender === 'admin' && this.supportTickets[idx].status === 'open') {
        this.supportTickets[idx].status = 'in_progress';
    } else if (sender === 'customer' && this.supportTickets[idx].status === 'resolved') {
        this.supportTickets[idx].status = 'in_progress';
    }

    this.supportTickets[idx].updatedAt = new Date().toISOString();
    saveToStorage('fakhama_shared_support_tickets', this.supportTickets);
    this.notify();
    commerceEventBus.emit('TICKET_UPDATED', this.supportTickets[idx]);
    return this.supportTickets[idx];
  }

  public deleteSupportTicket(id: string): boolean {
    const initialLen = this.supportTickets.length;
    this.supportTickets = this.supportTickets.filter(t => t.id !== id);
    if (this.supportTickets.length !== initialLen) {
      saveToStorage('fakhama_shared_support_tickets', this.supportTickets);
      this.notify();
      commerceEventBus.emit('TICKET_DELETED', id);
      return true;
    }
    return false;
  }
}

export const commerceStore = new UnifiedCommerceStore();
