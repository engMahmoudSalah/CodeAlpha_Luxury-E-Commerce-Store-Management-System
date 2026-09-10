import { commerceStore } from '../../shared/store/commerceStore';
import { RefundStatus } from '../../shared/types/commerce';
import {
  AdminUser,
  AdminNotification,
  DashboardData,
  DashboardChartPoint,
  DateRangeOption,
  OrderStatus,
  PaymentStatus,
  AdminProduct,
  ProductFilterParams,
  PaginatedResult,
  ProductStatus,
  AdminCategory,
  AdminCollection,
  AdminOrder,
  OrderFilterParams,
  AdminInventoryLog,
  InventoryFilterParams,
  AdminAbandonedCart,
  AdminReturnRequest,
  AdminCustomer,
  AdminReview,
  AdminCoupon,
  AdminPromotion,
  AdminStoreSettings,
  CustomerFilterParams
} from '../types';
import {
  CURRENT_ADMIN_USER,
  MOCK_NOTIFICATIONS,
  generateDashboardData,
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_COLLECTIONS,
  MOCK_INVENTORY_LOGS,
  MOCK_ABANDONED_CARTS,
  MOCK_RETURN_REQUESTS,
  MOCK_CUSTOMERS,
  MOCK_REVIEWS,
  MOCK_COUPONS,
  MOCK_PROMOTIONS,
  MOCK_STORE_SETTINGS
} from './mockData';

// Mutable in-memory store reference synced with commerceStore
let categoriesStore: AdminCategory[] = [...MOCK_CATEGORIES];
let collectionsStore: AdminCollection[] = [...MOCK_COLLECTIONS];
let ordersStore: AdminOrder[] = [...MOCK_ORDERS];
let inventoryLogsStore: AdminInventoryLog[] = [...MOCK_INVENTORY_LOGS];
let abandonedCartsStore: AdminAbandonedCart[] = [...MOCK_ABANDONED_CARTS];
let returnRequestsStore: AdminReturnRequest[] = [...MOCK_RETURN_REQUESTS];
let customersStore: AdminCustomer[] = [...MOCK_CUSTOMERS];
let reviewsStore: AdminReview[] = [...MOCK_REVIEWS];
let couponsStore: AdminCoupon[] = [...MOCK_COUPONS];
let promotionsStore: AdminPromotion[] = [...MOCK_PROMOTIONS];
let storeSettingsStore: AdminStoreSettings = { ...MOCK_STORE_SETTINGS };

// Helper to convert canonical Product to AdminProduct
function toAdminProduct(p: ReturnType<typeof commerceStore.getProducts>[0]): AdminProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category: p.category,
    brand: p.brand || 'Fakhama Heritage',
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    costPrice: p.costPrice,
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold || 5,
    stockStatus: p.stockStatus,
    status: p.status,
    image_url: p.image_url,
    galleryImages: p.galleryImages || [p.image_url],
    description: p.description,
    shortDescription: p.shortDescription,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    salesCount: p.salesCount || 0,
    tags: p.tags || [],
    collections: p.collections || [],
    isFeatured: p.isFeatured || false,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

function toAdminOrder(o: ReturnType<typeof commerceStore.getOrders>[0]): AdminOrder {
  const numericId = typeof o.id === 'number' ? o.id : parseInt(String(o.id).replace(/\D/g, '') || '1001', 10);
  return {
    id: numericId,
    orderNumber: o.orderNumber || `ORD-${numericId}`,
    customer: {
      id: typeof o.user_id === 'number' ? o.user_id : 1,
      name: o.customerName || 'عميل فخامة الملكي',
      email: o.customerEmail || 'client@fakhama.com',
      phone: o.customerPhone || '0501234567',
      avatar: undefined,
    },
    items: (o.items || []).map((item) => ({
      productId: item.productId,
      productName: item.name || item.product_name || `مقتنى فاخر #${item.productId}`,
      sku: `SKU-${item.productId}`,
      variantTitle: item.variantName,
      imageUrl: item.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
      unitPrice: item.price,
      quantity: item.quantity,
      totalPrice: item.subtotal || (item.price * item.quantity),
    })),
    subtotal: o.subtotal,
    discount: o.discountTotal || 0,
    shipping: o.shippingFee || 0,
    tax: o.taxTotal || 0,
    total: o.total,
    status: (o.status as OrderStatus) || 'pending',
    paymentStatus: (o.paymentStatus as PaymentStatus) || 'paid',
    paymentMethod: o.paymentMethod || 'بطاقة مدى / فيزا',
    shippingAddress: {
      recipientName: o.shippingAddress?.recipient_name || o.customerName || 'عميل فخامة',
      phone: o.shippingAddress?.phone || o.customerPhone || '0500000000',
      addressLine1: o.shippingAddress?.address_line1 || 'المملكة العربية السعودية',
      city: o.shippingAddress?.city || 'الرياض',
      state: o.shippingAddress?.state,
      country: o.shippingAddress?.country || 'SA',
      postalCode: o.shippingAddress?.postal_code,
    },
    trackingNumber: o.trackingNumber,
    shippingCarrier: o.trackingCarrier || 'Aramex VIP Express',
    notes: o.notes,
    giftWrapping: o.giftWrapping,
    giftMessage: o.giftMessage,
    timeline: (o.timeline || []).map((t) => ({
      id: t.id,
      status: t.title,
      note: t.description,
      timestamp: t.timestamp,
      user: t.actor || 'إدارة النظام',
    })),
    createdAt: o.created_at || new Date().toISOString(),
    updatedAt: (o as any).updated_at || o.created_at || new Date().toISOString(),
  };
}

function toAdminCoupon(c: ReturnType<typeof commerceStore.getCoupons>[0]): AdminCoupon {
  return {
    id: c.id,
    code: c.code,
    description: c.description,
    discountType: c.discountType,
    discountValue: c.discountValue,
    minOrderValue: c.minOrderAmount,
    maxDiscountAmount: c.maxDiscountAmount,
    usageLimit: c.usageLimit || 100,
    usageCount: c.usageCount || 0,
    startDate: c.startsAt || new Date().toISOString().split('T')[0],
    endDate: c.expiresAt || '2026-12-31',
    status: c.isActive ? 'active' : 'disabled',
    createdAt: c.startsAt || new Date().toISOString().split('T')[0],
  };
}

function toAdminPromotion(p: ReturnType<typeof commerceStore.getPromotions>[0]): AdminPromotion {
  return {
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    badge: p.badgeText || 'عرض خاص',
    type: p.type,
    imageUrl: p.imageUrl,
    linkUrl: p.linkUrl || '/catalog',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    status: p.isActive ? 'active' : 'disabled',
    clicksCount: 142,
    viewsCount: 3890,
  };
}

function toAdminReview(r: ReturnType<typeof commerceStore.getReviews>[0]): AdminReview {
  return {
    id: r.id,
    productId: r.productId,
    productName: r.productName || `منتج #${r.productId}`,
    productImage: r.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
    customerName: r.customerName,
    customerEmail: r.customerEmail || 'client@fakhama.com',
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    status: r.status,
    verifiedPurchase: true,
    createdAt: r.createdAt,
  };
}

function toAdminReturnRequest(r: ReturnType<typeof commerceStore.getReturnRequests>[0]): AdminReturnRequest {
  const numericOrderId = typeof r.orderId === 'number' ? r.orderId : parseInt(String(r.orderId).replace(/\D/g, '') || '1001', 10);
  const products = commerceStore.getProducts();
  const order = commerceStore.getOrderById(r.orderId);

  return {
    id: r.id,
    returnNumber: `RET-${r.id.replace('ret_', '')}`,
    orderId: numericOrderId,
    orderNumber: order?.orderNumber || `ORD-${numericOrderId}`,
    customer: {
      id: typeof order?.user_id === 'number' ? order.user_id : parseInt(String(order?.user_id || '1').replace(/\D/g, '') || '1', 10),
      name: r.customerName || order?.customerName || 'عميل فخامة الملكي',
      phone: order?.customerPhone || '0501234567',
      email: r.customerEmail || order?.customerEmail || 'client@fakhama.com',
    },
    items: (r.items || []).map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const orderItem = order?.items.find((oi) => oi.productId === item.productId);
      const price = orderItem?.price || prod?.price || 1500;
      return {
        productId: item.productId,
        productName: prod?.name || orderItem?.name || `منتج فاخر #${item.productId}`,
        imageUrl: prod?.image_url || orderItem?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
        price,
        quantity: item.quantity,
        reason: item.reason || 'استبدال أو استرجاع',
        condition: 'sealed' as const,
      };
    }),
    totalRefundAmount: r.refundAmount || 0,
    status: r.status,
    requestedAt: r.createdAt,
    updatedAt: r.createdAt,
    adminNotes: r.reasonNotes,
  };
}

function toAdminAbandonedCart(c: ReturnType<typeof commerceStore.getAbandonedCarts>[0]): AdminAbandonedCart {
  return {
    id: c.id,
    cartNumber: c.cartNumber,
    customer: {
      name: c.customer.name,
      email: c.customer.email,
      phone: c.customer.phone,
      avatar: c.customer.avatar,
    },
    items: (c.items || []).map((itm) => ({
      productId: itm.productId,
      productName: itm.productName,
      imageUrl: itm.imageUrl,
      unitPrice: itm.unitPrice,
      quantity: itm.quantity,
    })),
    totalValue: c.totalValue,
    abandonedAt: c.abandonedAt,
    status: c.status,
    recoverySentCount: c.recoverySentCount || 0,
    lastRecoverySentAt: c.lastRecoverySentAt,
  };
}

function toAdminCustomer(c: ReturnType<typeof commerceStore.getCustomers>[0]): AdminCustomer {
  const numericId = typeof c.id === 'number' ? c.id : parseInt(String(c.id).replace(/\D/g, '') || '1', 10);
  return {
    id: numericId,
    name: c.name,
    email: c.email,
    phone: c.phone || '0501234567',
    avatar: c.avatar,
    membershipTier: c.membershipTier || 'silver',
    loyaltyPoints: c.loyaltyPoints || 0,
    storeCreditBalance: c.storeCreditBalance || 0,
    walletTransactions: c.walletTransactions || [],
    ordersCount: c.totalOrders || 0,
    totalSpent: c.totalSpent || 0,
    averageOrderValue: c.totalOrders > 0 ? Math.round(c.totalSpent / c.totalOrders) : 0,
    status: c.status || 'active',
    city: c.city || 'الرياض',
    country: c.country || 'المملكة العربية السعودية',
    joinedAt: c.createdAt ? c.createdAt.split('T')[0] : '2024-01-01',
    lastActive: 'الآن',
    notes: c.notes,
  };
}

function toAdminCategory(c: ReturnType<typeof commerceStore.getCategories>[0]): AdminCategory {
  return {
    id: String(c.id),
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    parentId: c.parentId ? String(c.parentId) : undefined,
    productCount: c.productsCount,
    displayOrder: c.displayOrder,
    status: c.isActive ? 'active' : 'hidden',
    featured: c.isFeatured || c.featured || false,
    seoTitle: c.seoTitle,
    seoDescription: c.seoDescription,
    createdAt: '2024-01-01',
  };
}

function toAdminCollection(col: ReturnType<typeof commerceStore.getCollections>[0]): AdminCollection {
  return {
    id: col.id,
    title: col.name,
    slug: col.slug,
    description: col.description,
    image: col.bannerImage || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200',
    bannerImage: col.bannerImage || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200',
    productsCount: col.productsCount,
    status: col.isActive || col.isPublished ? 'active' : 'draft',
    featured: col.isFeatured || false,
    conditionsType: 'manual',
    productIds: col.productIds || [],
    createdAt: col.createdAt || '2024-01-01',
  };
}

function toAdminInventoryLog(log: ReturnType<typeof commerceStore.getInventoryLogs>[0]): AdminInventoryLog {
  const dt = new Date(log.timestamp);
  const formattedTime = isNaN(dt.getTime())
    ? 'الآن'
    : dt.toLocaleDateString('ar-SA') + ' ' + dt.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  return {
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
    timestamp: formattedTime,
  };
}

/**
 * Admin Service Layer (Backend-Ready Contract)
 * Each method returns typed promises simulating asynchronous network latency.
 * When real API endpoints are introduced, only this service implementation changes.
 */
export const adminService = {
  async getCurrentUser(): Promise<AdminUser> {
    await new Promise((res) => setTimeout(res, 80));
    return { ...CURRENT_ADMIN_USER };
  },

  async getNotifications(): Promise<AdminNotification[]> {
    await new Promise((res) => setTimeout(res, 100));
    return [...MOCK_NOTIFICATIONS];
  },

  async markNotificationAsRead(id: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 80));
    return true;
  },

  async markAllNotificationsAsRead(): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 80));
    return true;
  },

  async getDashboardData(range: DateRangeOption = '7days'): Promise<DashboardData> {
    await new Promise((res) => setTimeout(res, 80));

    const orders = commerceStore.getOrders();
    const products = commerceStore.getProducts();
    const customers = commerceStore.getCustomers();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrdersCount = orders.length;
    const totalItemsSold = orders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
      0
    );
    const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
    const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;

    const recentOrders = orders.slice(0, 7).map(toAdminOrder);

    const lowStockProducts = products
      .filter((p) => p.stock <= (p.lowStockThreshold || 5))
      .map(toAdminProduct);

    // Compute top products dynamically from real orders
    const productStats = new Map<number, { revenue: number; unitsSold: number }>();
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const current = productStats.get(item.productId) || { revenue: 0, unitsSold: 0 };
        current.revenue += item.price * item.quantity;
        current.unitsSold += item.quantity;
        productStats.set(item.productId, current);
      });
    });

    const topProducts = products.map((p) => {
      const stats = productStats.get(p.id) || {
        revenue: (p.salesCount || 1) * p.price,
        unitsSold: p.salesCount || 1,
      };
      const adminProd = toAdminProduct(p);
      return {
        ...adminProd,
        revenue: stats.revenue,
        salesCount: stats.unitsSold,
        conversionRate: Math.min(8.5, +(stats.unitsSold * 0.4 + 1.2).toFixed(1)),
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Compute dynamic chart data based on range
    let chartData: DashboardChartPoint[] = [];

    if (range === 'today') {
      const slots = [
        { date: '00:00', formattedDate: '12 ص' },
        { date: '04:00', formattedDate: '4 ص' },
        { date: '08:00', formattedDate: '8 ص' },
        { date: '12:00', formattedDate: '12 م' },
        { date: '16:00', formattedDate: '4 م' },
        { date: '20:00', formattedDate: '8 م' },
        { date: '23:00', formattedDate: '11 م' },
      ];
      const count = slots.length;
      chartData = slots.map((s, idx) => {
        const fraction = totalOrdersCount > 0 ? (idx + 1) / count : 0;
        const oCount = Math.ceil(totalOrdersCount * (1 / count));
        const rev = Math.round(totalRevenue * (1 / count));
        const sCount = Math.ceil(totalItemsSold * (1 / count));
        return {
          date: s.date,
          formattedDate: s.formattedDate,
          sales: sCount,
          orders: oCount,
          revenue: rev,
        };
      });
    } else if (range === '7days') {
      const days = [
        { date: 'السبت', formattedDate: 'السبت' },
        { date: 'الأحد', formattedDate: 'الأحد' },
        { date: 'الإثنين', formattedDate: 'الإثنين' },
        { date: 'الثلاثاء', formattedDate: 'الثلاثاء' },
        { date: 'الأربعاء', formattedDate: 'الأربعاء' },
        { date: 'الخميس', formattedDate: 'الخميس' },
        { date: 'الجمعة', formattedDate: 'الجمعة' },
      ];
      const count = days.length;
      chartData = days.map((d, idx) => {
        // distribute real metrics proportionally across the days
        const weights = [0.1, 0.12, 0.14, 0.11, 0.16, 0.22, 0.15];
        const w = weights[idx] || 1 / count;
        return {
          date: d.date,
          formattedDate: d.formattedDate,
          sales: Math.max(1, Math.round(totalItemsSold * w)),
          orders: Math.max(1, Math.round(totalOrdersCount * w)),
          revenue: Math.round(totalRevenue * w),
        };
      });
    } else if (range === '30days') {
      const weeks = [
        { date: 'الأسبوع 1', formattedDate: 'الأسبوع 1' },
        { date: 'الأسبوع 2', formattedDate: 'الأسبوع 2' },
        { date: 'الأسبوع 3', formattedDate: 'الأسبوع 3' },
        { date: 'الأسبوع 4', formattedDate: 'الأسبوع 4' },
      ];
      const weights = [0.2, 0.24, 0.27, 0.29];
      chartData = weeks.map((wItem, idx) => ({
        date: wItem.date,
        formattedDate: wItem.formattedDate,
        sales: Math.round(totalItemsSold * weights[idx]),
        orders: Math.round(totalOrdersCount * weights[idx]),
        revenue: Math.round(totalRevenue * weights[idx]),
      }));
    } else if (range === '90days') {
      const months = [
        { date: 'الشهر 1', formattedDate: 'الشهر 1' },
        { date: 'الشهر 2', formattedDate: 'الشهر 2' },
        { date: 'الشهر 3', formattedDate: 'الشهر 3' },
      ];
      const weights = [0.28, 0.34, 0.38];
      chartData = months.map((mItem, idx) => ({
        date: mItem.date,
        formattedDate: mItem.formattedDate,
        sales: Math.round(totalItemsSold * weights[idx]),
        orders: Math.round(totalOrdersCount * weights[idx]),
        revenue: Math.round(totalRevenue * weights[idx]),
      }));
    } else {
      const quarters = [
        { date: 'الربع 1', formattedDate: 'Q1' },
        { date: 'الربع 2', formattedDate: 'Q2' },
        { date: 'الربع 3', formattedDate: 'Q3' },
        { date: 'الربع 4', formattedDate: 'Q4' },
      ];
      const weights = [0.21, 0.25, 0.26, 0.28];
      chartData = quarters.map((qItem, idx) => ({
        date: qItem.date,
        formattedDate: qItem.formattedDate,
        sales: Math.round(totalItemsSold * weights[idx]),
        orders: Math.round(totalOrdersCount * weights[idx]),
        revenue: Math.round(totalRevenue * weights[idx]),
      }));
    }

    return {
      metrics: {
        totalSales: {
          id: 'total_sales',
          label: 'إجمالي المبيعات',
          value: totalItemsSold || products.reduce((sum, p) => sum + (p.salesCount || 1), 0),
          formattedValue: `${totalItemsSold || products.reduce((sum, p) => sum + (p.salesCount || 1), 0)} قطعة`,
          changePercentage: 14.2,
          isPositive: true,
          trendText: '+14.2% عن الفترة السابقة',
        },
        revenue: {
          id: 'revenue',
          label: 'إجمالي الإيرادات المالية',
          value: totalRevenue,
          formattedValue: `${totalRevenue.toLocaleString()} ر.س`,
          changePercentage: 18.5,
          isPositive: true,
          trendText: '+18.5% نمو ملحوظ',
        },
        orders: {
          id: 'orders',
          label: 'عدد الطلبات المؤكدة',
          value: totalOrdersCount,
          formattedValue: totalOrdersCount.toLocaleString(),
          changePercentage: 11.8,
          isPositive: true,
          trendText: '+11.8% طلبات نشطة',
        },
        averageOrderValue: {
          id: 'avg_order_value',
          label: 'متوسط قيمة الطلب',
          value: averageOrderValue,
          formattedValue: `${averageOrderValue.toLocaleString()} ر.س`,
          changePercentage: 6.2,
          isPositive: true,
          trendText: '+6.2% سلة شرائية',
        },
        customers: {
          id: 'customers',
          label: 'العملاء المسجلون',
          value: customers.length,
          formattedValue: customers.length.toLocaleString(),
          changePercentage: 8.9,
          isPositive: true,
          trendText: '+8.9% عملاء جدد',
        },
        products: {
          id: 'products',
          label: 'إجمالي المنتجات بالمتجر',
          value: products.length,
          formattedValue: products.length.toLocaleString(),
          changePercentage: 0,
          isPositive: true,
          trendText: 'كتالوج المنتجات النشط',
        },
      },
      chartData,
      recentOrders,
      topProducts,
      lowStockProducts,
      statsSummary: {
        pendingOrdersCount,
        lowStockCount: lowStockProducts.length,
        todayRevenue: Math.round(totalRevenue * 0.15),
        newCustomersToday: Math.min(customers.length, 3),
      },
    };
  },

  // ----------------------------------------------------
  // Product Management Methods
  // ----------------------------------------------------

  async getProducts(params: ProductFilterParams = {}): Promise<PaginatedResult<AdminProduct>> {
    await new Promise((res) => setTimeout(res, 80));

    let items = commerceStore.getProducts().map(toAdminProduct);

    // Filter by search query (name, sku, brand, tags)
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (params.category && params.category !== 'all') {
      items = items.filter((p) => p.category === params.category);
    }

    // Filter by brand
    if (params.brand && params.brand !== 'all') {
      items = items.filter((p) => p.brand === params.brand);
    }

    // Filter by publication status
    if (params.status && params.status !== 'all') {
      items = items.filter((p) => p.status === params.status);
    }

    // Filter by stock status
    if (params.stockStatus && params.stockStatus !== 'all') {
      items = items.filter((p) => p.stockStatus === params.stockStatus);
    }

    // Filter by featured
    if (typeof params.isFeatured === 'boolean') {
      items = items.filter((p) => p.isFeatured === params.isFeatured);
    }

    // Sorting
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    items.sort((a: any, b: any) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });

    // Pagination
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 10);
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      data: paginatedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  async getProductById(id: number): Promise<AdminProduct | null> {
    await new Promise((res) => setTimeout(res, 50));
    const found = commerceStore.getProductById(id);
    return found ? toAdminProduct(found) : null;
  },

  async createProduct(productData: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt' | 'salesCount' | 'reviewsCount' | 'rating'>): Promise<AdminProduct> {
    await new Promise((res) => setTimeout(res, 100));
    const stock = Number(productData.stock) || 0;
    const lowStockThreshold = Number(productData.lowStockThreshold) || 5;
    const stockStatus =
      stock === 0 ? 'out_of_stock' : stock <= lowStockThreshold ? 'low_stock' : 'in_stock';

    const created = commerceStore.addProduct({
      name: productData.name,
      slug: productData.slug || `product-${Date.now()}`,
      sku: productData.sku || `SKU-${Date.now()}`,
      category: productData.category,
      brand: productData.brand || 'Fakhama Heritage',
      price: Number(productData.price) || 0,
      compareAtPrice: productData.compareAtPrice ? Number(productData.compareAtPrice) : undefined,
      costPrice: productData.costPrice ? Number(productData.costPrice) : undefined,
      stock,
      lowStockThreshold,
      stockStatus,
      status: productData.status || 'published',
      image_url: productData.image_url,
      galleryImages: productData.galleryImages || [productData.image_url],
      description: productData.description || '',
      shortDescription: productData.shortDescription || '',
      rating: 5.0,
      reviewsCount: 0,
      salesCount: 0,
      tags: productData.tags || [],
      collections: productData.collections || [],
      isFeatured: productData.isFeatured || false,
    });

    return toAdminProduct(created);
  },

  async updateProduct(id: number, productData: Partial<AdminProduct>): Promise<AdminProduct> {
    await new Promise((res) => setTimeout(res, 100));
    const current = commerceStore.getProductById(id);
    if (!current) throw new Error('المنتج المراد تعديله غير موجود');

    const stock = productData.stock !== undefined ? Number(productData.stock) : current.stock;
    const lowStockThreshold =
      productData.lowStockThreshold !== undefined
        ? Number(productData.lowStockThreshold)
        : current.lowStockThreshold || 5;
    const stockStatus =
      stock === 0 ? 'out_of_stock' : stock <= lowStockThreshold ? 'low_stock' : 'in_stock';

    const updated = commerceStore.updateProduct(id, {
      ...productData,
      stock,
      lowStockThreshold,
      stockStatus,
      price: productData.price !== undefined ? Number(productData.price) : current.price,
      compareAtPrice:
        productData.compareAtPrice !== undefined
          ? productData.compareAtPrice
            ? Number(productData.compareAtPrice)
            : undefined
          : current.compareAtPrice,
      costPrice:
        productData.costPrice !== undefined
          ? productData.costPrice
            ? Number(productData.costPrice)
            : undefined
          : current.costPrice,
    });

    if (!updated) throw new Error('فشل تحديث المنتج');
    return toAdminProduct(updated);
  },

  async updateProductStock(productId: number, newStock: number): Promise<boolean> {
    const current = commerceStore.getProductById(productId);
    if (!current) return false;
    const stock = Math.max(0, newStock);
    const lowStockThreshold = current.lowStockThreshold || 5;
    const stockStatus = stock === 0 ? 'out_of_stock' : stock <= lowStockThreshold ? 'low_stock' : 'in_stock';
    commerceStore.updateProduct(productId, { stock, stockStatus });
    return true;
  },

  async updateProductStatus(productId: number, status: ProductStatus): Promise<boolean> {
    commerceStore.updateProduct(productId, { status });
    return true;
  },

  async toggleProductFeatured(productId: number): Promise<boolean> {
    const current = commerceStore.getProductById(productId);
    if (!current) return false;
    commerceStore.updateProduct(productId, { isFeatured: !current.isFeatured });
    return true;
  },

  async deleteProduct(productId: number): Promise<boolean> {
    return commerceStore.deleteProduct(productId);
  },

  async bulkDeleteProducts(ids: number[]): Promise<boolean> {
    ids.forEach((id) => commerceStore.deleteProduct(id));
    return true;
  },

  async bulkUpdateProductStatus(ids: number[], status: ProductStatus): Promise<boolean> {
    ids.forEach((id) => commerceStore.updateProduct(id, { status }));
    return true;
  },

  async duplicateProduct(productId: number): Promise<AdminProduct> {
    const original = commerceStore.getProductById(productId);
    if (!original) throw new Error('المنتج المراد نسخه غير موجود');

    const duplicated = commerceStore.addProduct({
      name: `${original.name} (نسخة)`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: `${original.sku}-CPY`,
      category: original.category,
      brand: original.brand || 'Fakhama Heritage',
      price: original.price,
      compareAtPrice: original.compareAtPrice,
      costPrice: original.costPrice,
      stock: original.stock,
      lowStockThreshold: original.lowStockThreshold || 5,
      stockStatus: original.stockStatus,
      status: 'draft',
      image_url: original.image_url,
      galleryImages: original.galleryImages,
      description: original.description,
      shortDescription: original.shortDescription,
      rating: 5.0,
      reviewsCount: 0,
      salesCount: 0,
      tags: original.tags,
      collections: original.collections,
      isFeatured: false,
    });

    return toAdminProduct(duplicated);
  },

  async getProductCategories(): Promise<{ name: string; count: number }[]> {
    const products = commerceStore.getProducts();
    const catMap = new Map<string, number>();
    products.forEach((p) => {
      catMap.set(p.category, (catMap.get(p.category) || 0) + 1);
    });
    return Array.from(catMap.entries()).map(([name, count]) => ({ name, count }));
  },

  async getProductBrands(): Promise<string[]> {
    const products = commerceStore.getProducts();
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set);
  },

  // ----------------------------------------------------
  // Category Management Methods
  // ----------------------------------------------------

  async getCategories(): Promise<AdminCategory[]> {
    return commerceStore.getCategories().map(toAdminCategory);
  },

  async getCategoryById(id: string): Promise<AdminCategory | null> {
    await new Promise((res) => setTimeout(res, 40));
    const cat = commerceStore.getCategoryById(id);
    return cat ? toAdminCategory(cat) : null;
  },

  async createCategory(data: Omit<AdminCategory, 'id' | 'createdAt' | 'productCount'>): Promise<AdminCategory> {
    await new Promise((res) => setTimeout(res, 80));
    const created = commerceStore.addCategory({
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      description: data.description,
      image_url: data.image,
      parentId: data.parentId || null,
      displayOrder: data.displayOrder || 1,
      isActive: data.status === 'active',
      isFeatured: data.featured,
      featured: data.featured,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    });
    return toAdminCategory(created);
  },

  async updateCategory(id: string, data: Partial<AdminCategory>): Promise<AdminCategory> {
    await new Promise((res) => setTimeout(res, 80));
    const updates: any = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.slug !== undefined) updates.slug = data.slug;
    if (data.description !== undefined) updates.description = data.description;
    if (data.image !== undefined) updates.image_url = data.image;
    if (data.parentId !== undefined) updates.parentId = data.parentId;
    if (data.displayOrder !== undefined) updates.displayOrder = data.displayOrder;
    if (data.status !== undefined) updates.isActive = data.status === 'active';
    if (data.featured !== undefined) {
      updates.featured = data.featured;
      updates.isFeatured = data.featured;
    }
    if (data.seoTitle !== undefined) updates.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updates.seoDescription = data.seoDescription;

    const updated = commerceStore.updateCategory(id, updates);
    if (!updated) throw new Error('التصنيف غير موجود');
    return toAdminCategory(updated);
  },

  async deleteCategory(id: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 80));
    return commerceStore.deleteCategory(id);
  },

  async toggleCategoryFeatured(id: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 60));
    const cat = commerceStore.getCategoryById(id);
    if (cat) {
      const current = cat.isFeatured || cat.featured || false;
      commerceStore.updateCategory(id, { isFeatured: !current, featured: !current });
    }
    return true;
  },

  async updateCategoryStatus(id: string, status: 'active' | 'hidden'): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 60));
    commerceStore.updateCategory(id, { isActive: status === 'active' });
    return true;
  },

  async reorderCategories(orderedIds: string[]): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 60));
    commerceStore.reorderCategories(orderedIds);
    return true;
  },

  // ----------------------------------------------------
  // Collections Management Methods
  // ----------------------------------------------------

  async getCollections(): Promise<AdminCollection[]> {
    return commerceStore.getCollections().map(toAdminCollection);
  },

  async getCollectionById(id: string): Promise<AdminCollection | null> {
    await new Promise((res) => setTimeout(res, 40));
    const col = commerceStore.getCollectionById(id);
    return col ? toAdminCollection(col) : null;
  },

  async createCollection(data: Omit<AdminCollection, 'id' | 'createdAt' | 'productsCount'>): Promise<AdminCollection> {
    await new Promise((res) => setTimeout(res, 80));
    const created = commerceStore.addCollection({
      name: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
      description: data.description,
      bannerImage: data.bannerImage || data.image || '',
      isPublished: data.status === 'active',
      isActive: data.status === 'active',
      isFeatured: data.featured,
      productIds: data.productIds || [],
    });
    return toAdminCollection(created);
  },

  async updateCollection(id: string, data: Partial<AdminCollection>): Promise<AdminCollection> {
    await new Promise((res) => setTimeout(res, 80));
    const updates: any = {};
    if (data.title !== undefined) updates.name = data.title;
    if (data.slug !== undefined) updates.slug = data.slug;
    if (data.description !== undefined) updates.description = data.description;
    if (data.bannerImage !== undefined) updates.bannerImage = data.bannerImage;
    if (data.status !== undefined) updates.isActive = data.status === 'active';
    if (data.featured !== undefined) updates.isFeatured = data.featured;
    if (data.productIds !== undefined) updates.productIds = data.productIds;

    const updated = commerceStore.updateCollection(id, updates);
    if (!updated) throw new Error('المجموعة غير موجودة');
    return toAdminCollection(updated);
  },

  async deleteCollection(id: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 80));
    return commerceStore.deleteCollection(id);
  },

  async toggleCollectionFeatured(id: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 60));
    const col = commerceStore.getCollectionById(id);
    if (col) {
      commerceStore.updateCollection(id, { isFeatured: !col.isFeatured });
    }
    return true;
  },

  async updateCollectionStatus(id: string, status: 'active' | 'draft' | 'archived'): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 60));
    commerceStore.updateCollection(id, { isActive: status === 'active' });
    return true;
  },

  // ----------------------------------------------------
  // Order Management Methods
  // ----------------------------------------------------

  async getOrders(params: OrderFilterParams = {}): Promise<PaginatedResult<AdminOrder>> {
    await new Promise((res) => setTimeout(res, 80));

    let items = commerceStore.getOrders().map(toAdminOrder);

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      items = items.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.items.some((i) => i.productName.toLowerCase().includes(q) || (i.sku && i.sku.toLowerCase().includes(q)))
      );
    }

    if (params.status && params.status !== 'all') {
      items = items.filter((o) => o.status === params.status);
    }

    if (params.paymentStatus && params.paymentStatus !== 'all') {
      items = items.filter((o) => o.paymentStatus === params.paymentStatus);
    }

    if (params.paymentMethod && params.paymentMethod !== 'all') {
      items = items.filter((o) => o.paymentMethod.includes(params.paymentMethod!));
    }

    // Sort by createdAt desc by default
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 10);
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      data: paginatedItems,
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  async getOrderById(id: number): Promise<AdminOrder | null> {
    await new Promise((res) => setTimeout(res, 50));
    const found = commerceStore.getOrderById(id);
    return found ? toAdminOrder(found) : null;
  },

  async updateOrderStatus(orderId: number, status: OrderStatus, note?: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 80));
    const updated = commerceStore.updateOrderStatus(orderId, status, note);
    return !!updated;
  },

  async updatePaymentStatus(orderId: number, paymentStatus: PaymentStatus): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 80));
    const updated = commerceStore.updateOrderPaymentStatus(orderId, paymentStatus);
    return !!updated;
  },

  async updateOrderShippingInfo(orderId: number, trackingNumber: string, shippingCarrier: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 80));
    const updated = commerceStore.updateOrderShipping(orderId, trackingNumber, shippingCarrier);
    return !!updated;
  },

  async addOrderTimelineEvent(orderId: number, status: string, note?: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 80));
    const updated = commerceStore.addOrderTimelineEvent(orderId, status, note);
    return !!updated;
  },

  async cancelOrder(orderId: number, reason: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 80));
    const updated = commerceStore.cancelOrder(orderId, reason);
    return !!updated;
  },

  // ----------------------------------------------------
  // Inventory & Warehouse Management Methods
  // ----------------------------------------------------

  async getInventory(params: InventoryFilterParams = {}): Promise<PaginatedResult<AdminProduct>> {
    await new Promise((res) => setTimeout(res, 80));
    let items = commerceStore.getProducts().map(toAdminProduct);

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase().includes(q)) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    if (params.category && params.category !== 'all') {
      items = items.filter((p) => p.category === params.category);
    }

    if (params.stockStatus && params.stockStatus !== 'all') {
      items = items.filter((p) => p.stockStatus === params.stockStatus);
    }

    // Sort by stock asc (critical low first) or specified
    items.sort((a, b) => a.stock - b.stock);

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 15);
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;

    const slice = items.slice(startIndex, startIndex + limit);
    return {
      data: slice,
      items: slice,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  async adjustStock(productId: number, newStock: number, reason: string, user: string = 'الإدارة'): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 60));
    const updated = commerceStore.adjustStock(productId, newStock, reason, user, 'adjustment');
    if (!updated) throw new Error('المنتج غير موجود');
    return true;
  },

  async quickAddStock(productId: number, amount: number, reason: string, user: string = 'الإدارة'): Promise<boolean> {
    const target = commerceStore.getProductById(productId);
    if (!target) throw new Error('المنتج غير موجود');
    return this.adjustStock(productId, target.stock + amount, reason, user);
  },

  async updateLowStockThreshold(productId: number, threshold: number): Promise<boolean> {
    const target = commerceStore.getProductById(productId);
    if (target) {
      const lowStockThreshold = Math.max(1, threshold);
      const stockStatus = target.stock === 0 ? 'out_of_stock' : target.stock <= lowStockThreshold ? 'low_stock' : 'in_stock';
      commerceStore.updateProduct(productId, { lowStockThreshold, stockStatus });
    }
    return true;
  },

  async getInventoryLogs(): Promise<AdminInventoryLog[]> {
    await new Promise((res) => setTimeout(res, 60));
    return commerceStore.getInventoryLogs().map(toAdminInventoryLog);
  },

  // ----------------------------------------------------
  // Abandoned Carts Methods
  // ----------------------------------------------------

  async getAbandonedCarts(): Promise<AdminAbandonedCart[]> {
    await new Promise((res) => setTimeout(res, 60));
    return commerceStore.getAbandonedCarts().map(toAdminAbandonedCart);
  },

  async sendCartRecovery(cartId: string, channel: 'whatsapp' | 'sms' | 'email'): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 80));
    return commerceStore.sendAbandonedCartRecovery(cartId, channel);
  },

  async deleteAbandonedCart(cartId: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 60));
    return commerceStore.deleteAbandonedCart(cartId);
  },

  // ----------------------------------------------------
  // Returns & Refunds Methods
  // ----------------------------------------------------

  async getReturnRequests(): Promise<AdminReturnRequest[]> {
    await new Promise((res) => setTimeout(res, 50));
    return commerceStore.getReturnRequests().map(toAdminReturnRequest);
  },

  async updateReturnStatus(returnId: string, status: AdminReturnRequest['status'], adminNotes?: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 80));
    const refundStatus: RefundStatus = status === 'refunded' ? 'completed' : status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'processing';
    const updated = commerceStore.updateReturnRequest(returnId, status as any, refundStatus);
    if (updated && updated.orderId) {
      const statusTitleMap: Record<string, string> = {
        pending_review: 'طلب الاسترجاع قيد المراجعة',
        approved: 'تمت الموافقة على طلب الاسترجاع وجاري تجهيز الشحن العكسي',
        item_received: 'تم استلام المنتج المرتجع في المستودع وفحصه',
        refunded: 'تم إتمام استرجاع المبلغ إلى حساب العميل',
        rejected: 'تم رفض طلب الاسترجاع',
      };
      commerceStore.addOrderTimelineEvent(
        updated.orderId,
        statusTitleMap[status] || `تحديث حالة الاسترجاع: ${status}`,
        adminNotes || `تم تحديث حالة طلب الاسترجاع من قبل الإدارة الملكية`,
        status === 'refunded' ? 'returned' : undefined,
        'خدمة عملاء فخامة'
      );
      if (status === 'refunded') {
        commerceStore.updateOrderStatus(updated.orderId, 'returned' as any, 'تم تأكيد الاسترجاع ورد كامل المبلغ');
        commerceStore.updateOrderPaymentStatus(updated.orderId, 'refunded');
      }
    }
    return true;
  },

  // ----------------------------------------------------
  // Customers Management Methods
  // ----------------------------------------------------

  async getCustomers(params?: CustomerFilterParams): Promise<PaginatedResult<AdminCustomer>> {
    await new Promise((res) => setTimeout(res, 50));
    let filtered = commerceStore.getCustomers().map(toAdminCustomer);

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }

    if (params?.tier && params.tier !== 'all') {
      filtered = filtered.filter((c) => c.membershipTier === params.tier);
    }

    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((c) => c.status === params.status);
    }

    if (params?.city) {
      filtered = filtered.filter((c) => c.city === params.city);
    }

    // Sorting
    const sortField = params?.sortBy || 'totalSpent';
    const sortDir = params?.sortDirection || 'desc';

    filtered.sort((a, b) => {
      let valA: any = a[sortField as keyof AdminCustomer];
      let valB: any = b[sortField as keyof AdminCustomer];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return {
      data: items,
      items,
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      pagination: {
        total: totalCount,
        page,
        limit: pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  async getCustomerById(id: number): Promise<AdminCustomer | null> {
    await new Promise((res) => setTimeout(res, 50));
    const customer = commerceStore.getCustomers().find(
      (c) => c.id === `cust_${id}` || c.id === String(id) || String(c.id).replace(/\D/g, '') === String(id)
    );
    return customer ? toAdminCustomer(customer) : null;
  },

  async updateCustomer(id: number, data: Partial<AdminCustomer>): Promise<AdminCustomer> {
    await new Promise((res) => setTimeout(res, 80));
    const customer = commerceStore.getCustomers().find(
      (c) => c.id === `cust_${id}` || c.id === String(id) || String(c.id).replace(/\D/g, '') === String(id)
    );
    if (!customer) throw new Error('العميل غير موجود');

    let updatedWalletTxs = customer.walletTransactions || [];
    if (data.storeCreditBalance !== undefined && data.storeCreditBalance !== customer.storeCreditBalance) {
      const diff = data.storeCreditBalance - (customer.storeCreditBalance || 0);
      updatedWalletTxs = [
        {
          id: `wt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: diff > 0 ? ('credit_added' as const) : ('credit_spent' as const),
          amount: diff,
          balanceAfter: data.storeCreditBalance,
          description: diff > 0 ? 'تعديل وزيادة رصيد المحفظة بواسطة الإدارة الملكية' : 'تعديل وخصم رصيد من المحفظة بواسطة الإدارة',
          date: new Date().toISOString(),
        },
        ...updatedWalletTxs,
      ];
    }

    const updated = commerceStore.updateCustomer(String(customer.id), {
      ...(data.name ? { name: data.name } : {}),
      ...(data.email ? { email: data.email } : {}),
      ...(data.phone ? { phone: data.phone } : {}),
      ...(data.city ? { city: data.city } : {}),
      ...(data.membershipTier ? { membershipTier: data.membershipTier as any } : {}),
      ...(data.status ? { status: data.status as any } : {}),
      ...(data.loyaltyPoints !== undefined ? { loyaltyPoints: data.loyaltyPoints } : {}),
      ...(data.storeCreditBalance !== undefined ? { storeCreditBalance: data.storeCreditBalance, walletTransactions: updatedWalletTxs } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    });
    if (!updated) throw new Error('العميل غير موجود');
    return toAdminCustomer(updated);
  },

  async createCustomer(data: Omit<AdminCustomer, 'id' | 'ordersCount' | 'totalSpent' | 'averageOrderValue' | 'joinedAt' | 'lastActive'>): Promise<AdminCustomer> {
    await new Promise((res) => setTimeout(res, 80));
    const newCustomer = commerceStore.addCustomer({
      name: data.name,
      email: data.email,
      phone: data.phone,
      membershipTier: (data.membershipTier as any) || 'silver',
      loyaltyPoints: 100,
      totalOrders: 0,
      totalSpent: 0,
      city: data.city || 'الرياض',
      country: data.country || 'المملكة العربية السعودية',
      status: (data.status as any) || 'active',
    });
    return toAdminCustomer(newCustomer);
  },

  // ----------------------------------------------------
  // Reviews & Ratings Moderation
  // ----------------------------------------------------

  async getReviews(status?: 'approved' | 'pending' | 'rejected' | 'all'): Promise<AdminReview[]> {
    await new Promise((res) => setTimeout(res, 50));
    const all = commerceStore.getReviews().map(toAdminReview);
    if (!status || status === 'all') return all;
    return all.filter((r) => r.status === status);
  },

  async updateReviewStatus(id: string, status: AdminReview['status']): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 60));
    commerceStore.updateReviewStatus(id, status);
    return true;
  },

  async deleteReview(id: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 60));
    return commerceStore.deleteReview(id);
  },

  // ----------------------------------------------------
  // Coupons & Discounts
  // ----------------------------------------------------

  async getCoupons(): Promise<AdminCoupon[]> {
    await new Promise((res) => setTimeout(res, 50));
    return commerceStore.getCoupons().map(toAdminCoupon);
  },

  async createCoupon(data: Omit<AdminCoupon, 'id' | 'usageCount' | 'createdAt'>): Promise<AdminCoupon> {
    await new Promise((res) => setTimeout(res, 80));
    const created = commerceStore.addCoupon({
      code: data.code.toUpperCase().trim(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderValue,
      maxDiscountAmount: data.maxDiscountAmount,
      usageLimit: data.usageLimit || 100,
      usageCount: 0,
      isActive: data.status === 'active',
      startsAt: data.startDate,
      expiresAt: data.endDate,
      description: data.description,
    });
    return toAdminCoupon(created);
  },

  async updateCoupon(id: string, data: Partial<AdminCoupon>): Promise<AdminCoupon> {
    await new Promise((res) => setTimeout(res, 80));
    const updated = commerceStore.updateCoupon(id, {
      ...(data.code ? { code: data.code.toUpperCase().trim() } : {}),
      ...(data.discountValue !== undefined ? { discountValue: data.discountValue } : {}),
      ...(data.discountType ? { discountType: data.discountType } : {}),
      ...(data.status ? { isActive: data.status === 'active' } : {}),
      ...(data.minOrderValue !== undefined ? { minOrderAmount: data.minOrderValue } : {}),
      ...(data.maxDiscountAmount !== undefined ? { maxDiscountAmount: data.maxDiscountAmount } : {}),
      ...(data.usageLimit !== undefined ? { usageLimit: data.usageLimit } : {}),
      ...(data.description ? { description: data.description } : {}),
      ...(data.endDate ? { expiresAt: data.endDate } : {}),
    });
    if (!updated) throw new Error('الكوبون غير موجود');
    return toAdminCoupon(updated);
  },

  async deleteCoupon(id: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 60));
    return commerceStore.deleteCoupon(id);
  },

  async toggleCouponStatus(id: string): Promise<AdminCoupon> {
    await new Promise((res) => setTimeout(res, 60));
    const target = commerceStore.getCoupons().find((c) => c.id === id);
    if (!target) throw new Error('الكوبون غير موجود');
    const updated = commerceStore.updateCoupon(id, { isActive: !target.isActive });
    return toAdminCoupon(updated!);
  },

  // ----------------------------------------------------
  // Promotions & Marketing Banners
  // ----------------------------------------------------

  async getPromotions(): Promise<AdminPromotion[]> {
    await new Promise((res) => setTimeout(res, 50));
    return commerceStore.getPromotions().map(toAdminPromotion);
  },

  async createPromotion(data: Omit<AdminPromotion, 'id' | 'clicksCount' | 'viewsCount'>): Promise<AdminPromotion> {
    await new Promise((res) => setTimeout(res, 80));
    const created = commerceStore.addPromotion({
      title: data.title,
      subtitle: data.subtitle,
      type: data.type,
      badgeText: data.badge,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      linkUrl: data.linkUrl,
      isActive: data.status === 'active',
      displayOrder: 1,
    });
    return toAdminPromotion(created);
  },

  async updatePromotion(id: string, data: Partial<AdminPromotion>): Promise<AdminPromotion> {
    await new Promise((res) => setTimeout(res, 80));
    const updated = commerceStore.updatePromotion(id, {
      ...(data.title ? { title: data.title } : {}),
      ...(data.subtitle ? { subtitle: data.subtitle } : {}),
      ...(data.badge ? { badgeText: data.badge } : {}),
      ...(data.linkUrl ? { linkUrl: data.linkUrl } : {}),
      ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
      ...(data.status ? { isActive: data.status === 'active' } : {}),
    });
    if (!updated) throw new Error('الحملة غير موجودة');
    return toAdminPromotion(updated);
  },

  async deletePromotion(id: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 60));
    return commerceStore.deletePromotion(id);
  },

  // ----------------------------------------------------
  // Store Settings
  // ----------------------------------------------------

  async getStoreSettings(): Promise<AdminStoreSettings> {
    await new Promise((res) => setTimeout(res, 50));
    const s = commerceStore.getStoreSettings();
    return {
      storeName: s.storeName,
      storeTagline: s.tagline,
      supportEmail: s.contactEmail,
      supportPhone: s.contactPhone,
      whatsappSupport: s.whatsappSupport || '+966500000000',
      currency: s.currency,
      announcementText: s.announcementText || 'توصيل ملكي مجاني لجميع الطلبات التي تتجاوز 1,000 ريال مع تغليف هدية فاخر',
      announcementEnabled: s.announcementEnabled ?? true,
      vatPercentage: s.taxRatePercentage,
      vatNumber: s.vatNumber || '310123456700003',
      commercialRegister: s.commercialRegister || '1010987654',
      freeShippingThreshold: s.freeShippingThreshold,
      standardShippingFee: s.defaultShippingFee,
      expressShippingFee: s.expressShippingFee || (s.defaultShippingFee + 40),
      maintenanceMode: s.maintenanceMode,
      allowGuestCheckout: s.guestCheckoutEnabled,
      requirePhoneVerification: s.requirePhoneVerification ?? true,
      lowStockAlertEmail: s.lowStockAlertEmail || s.contactEmail,
    };
  },

  async updateStoreSettings(data: Partial<AdminStoreSettings>): Promise<AdminStoreSettings> {
    await new Promise((res) => setTimeout(res, 80));
    commerceStore.updateStoreSettings({
      ...(data.storeName ? { storeName: data.storeName } : {}),
      ...(data.storeTagline ? { tagline: data.storeTagline } : {}),
      ...(data.supportEmail ? { contactEmail: data.supportEmail } : {}),
      ...(data.supportPhone ? { contactPhone: data.supportPhone } : {}),
      ...(data.whatsappSupport ? { whatsappSupport: data.whatsappSupport } : {}),
      ...(data.vatNumber ? { vatNumber: data.vatNumber } : {}),
      ...(data.commercialRegister ? { commercialRegister: data.commercialRegister } : {}),
      ...(data.announcementText !== undefined ? { announcementText: data.announcementText } : {}),
      ...(data.announcementEnabled !== undefined ? { announcementEnabled: data.announcementEnabled } : {}),
      ...(data.currency ? { currency: data.currency } : {}),
      ...(data.vatPercentage !== undefined ? { taxRatePercentage: data.vatPercentage } : {}),
      ...(data.freeShippingThreshold !== undefined ? { freeShippingThreshold: data.freeShippingThreshold } : {}),
      ...(data.standardShippingFee !== undefined ? { defaultShippingFee: data.standardShippingFee } : {}),
      ...(data.expressShippingFee !== undefined ? { expressShippingFee: data.expressShippingFee } : {}),
      ...(data.allowGuestCheckout !== undefined ? { guestCheckoutEnabled: data.allowGuestCheckout } : {}),
      ...(data.requirePhoneVerification !== undefined ? { requirePhoneVerification: data.requirePhoneVerification } : {}),
      ...(data.lowStockAlertEmail ? { lowStockAlertEmail: data.lowStockAlertEmail } : {}),
      ...(data.maintenanceMode !== undefined ? { maintenanceMode: data.maintenanceMode } : {}),
    });
    return this.getStoreSettings();
  }
};

export * from './baseRepository';
export * from './eventBus';
export * from './domainAdapters';

