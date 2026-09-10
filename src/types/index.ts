export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image_url: string;
  stock: number;
  lowStockThreshold?: number;
  stockStatus?: string;
  salesCount?: number;
  sku?: string;
  category: string;
  created_at?: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | '';
  instock?: boolean;
  page?: number;
  limit?: number;
}

export interface CategoryCountsResponse {
  categories: string[];
  counts: Record<string, number>;
}

export interface PriceRangeResponse {
  min: number;
  max: number;
}

export interface SearchSuggestionsResponse {
  products: Array<{
    id: number;
    name: string;
    price: number;
    image_url: string;
    category: string;
    stock: number;
  }>;
  categories: string[];
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  photoURL?: string;
  provider?: string;
  created_at?: string;
}

export interface Address {
  id: number;
  user_id: number;
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: number | boolean;
  created_at?: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
}

export interface CartItemWithProduct {
  item: CartItem;
  product: Product;
  subtotal: number;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  productId: number;
  product_name?: string;
  name?: string;
  image_url?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber?: string;
  user_id: number;
  total: number;
  subtotal?: number;
  shippingFee?: number;
  taxTotal?: number;
  discountTotal?: number;
  couponCode?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  carrier?: string;
  timeline?: any[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
  created_at: string;
  shipping_address?: string;
  shippingAddress?: any;
  recipient_name?: string;
  customerName?: string;
  customerEmail?: string;
  phone?: string;
  items?: OrderItem[];
  giftWrapping?: boolean;
  giftMessage?: string;
  storeCreditApplied?: number;
}

export interface CreateOrderPayload {
  items: { productId: number; quantity: number }[];
  customer?: {
    name: string;
    email: string;
    address: string;
    city: string;
    postalCode?: string;
    postal_code?: string;
    phone: string;
  };
  shippingAddress?: {
    recipient_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  shippingMethod?: string;
  paymentMethod?: string;
  couponCode?: string;
  discountTotal?: number;
  giftWrapping?: boolean;
  giftMessage?: string;
  storeCreditApplied?: number;
}

export interface Review {
  id: string;
  productId: number;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
