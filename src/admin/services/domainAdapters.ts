import { Product, Order } from '../../types';
import {
  AdminProduct,
  AdminOrder,
  ProductStatus,
  OrderStatus,
  StockStatus
} from '../types';

/**
 * Domain Adapters & Converters
 * Provides bi-directional mapping between Admin Canonical Domain Models
 * and Customer Frontend Lightweight Models.
 */

export function mapAdminProductToCustomerProduct(adminProduct: AdminProduct): Product {
  return {
    id: typeof adminProduct.id === 'number' ? adminProduct.id : parseInt(String(adminProduct.id), 10) || Date.now(),
    name: adminProduct.name,
    description: adminProduct.description || '',
    price: adminProduct.price,
    image_url: adminProduct.image_url || adminProduct.galleryImages?.[0] || '/placeholder.png',
    stock: adminProduct.stock,
    category: adminProduct.category || 'عام',
    created_at: adminProduct.createdAt,
  };
}

export function mapCustomerProductToAdminProduct(product: Product): AdminProduct {
  const stockStat: StockStatus =
    product.stock <= 0 ? 'out_of_stock' : product.stock <= 5 ? 'low_stock' : 'in_stock';

  return {
    id: product.id,
    name: product.name,
    slug: product.name.toLowerCase().replace(/\s+/g, '-'),
    sku: `SKU-${product.id}`,
    brand: 'فخامة',
    category: product.category,
    price: product.price,
    compareAtPrice: undefined,
    costPrice: Math.round(product.price * 0.6),
    stock: product.stock,
    lowStockThreshold: 5,
    stockStatus: stockStat,
    status: (product.stock > 0 ? 'published' : 'out_of_stock') as ProductStatus,
    image_url: product.image_url,
    galleryImages: [product.image_url],
    description: product.description,
    shortDescription: product.description.slice(0, 100),
    rating: 5.0,
    reviewsCount: 0,
    salesCount: 0,
    tags: [product.category],
    collections: [],
    isFeatured: false,
    createdAt: product.created_at || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function mapAdminOrderToCustomerOrder(adminOrder: AdminOrder): Order {
  const customerStatusMap: Record<OrderStatus, Order['status']> = {
    pending: 'pending',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
    returned: 'cancelled',
    refunded: 'cancelled',
  };

  return {
    id: typeof adminOrder.id === 'number' ? adminOrder.id : parseInt(String(adminOrder.id).replace(/\D/g, ''), 10) || Date.now(),
    user_id: adminOrder.customer?.id || 1,
    total: adminOrder.total,
    status: customerStatusMap[adminOrder.status] || 'pending',
    created_at: adminOrder.createdAt,
    shipping_address: adminOrder.shippingAddress?.addressLine1 || '',
    recipient_name: adminOrder.customer?.name || adminOrder.shippingAddress?.recipientName || 'عميل فخامة',
    phone: adminOrder.customer?.phone || adminOrder.shippingAddress?.phone || '',
    items: adminOrder.items.map((item, idx) => ({
      id: idx + 1,
      order_id: typeof adminOrder.id === 'number' ? adminOrder.id : 1,
      productId: item.productId,
      product_name: item.productName,
      name: item.productName,
      image_url: item.imageUrl,
      quantity: item.quantity,
      price: item.unitPrice,
      subtotal: item.totalPrice,
    })),
  };
}
