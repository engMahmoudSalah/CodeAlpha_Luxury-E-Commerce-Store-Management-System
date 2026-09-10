import { Order, CreateOrderPayload } from '../types';
import { commerceStore } from '../shared/store/commerceStore';
import { auth } from '../lib/firebase';
import { syncItemToFirestore } from '../shared/store/firestoreSync';

function toCustomerOrder(canonical: ReturnType<typeof commerceStore.getOrders>[0]): Order {
  const numericId = typeof canonical.id === 'number' ? canonical.id : parseInt(String(canonical.id).replace(/\D/g, '') || '1001', 10);
  const numericUserId = typeof canonical.user_id === 'number' ? canonical.user_id : parseInt(String(canonical.user_id).replace(/\D/g, '') || '1', 10);
  const formattedAddress = typeof canonical.shippingAddress === 'string'
    ? canonical.shippingAddress
    : `${canonical.shippingAddress?.recipient_name || canonical.customerName} - ${canonical.shippingAddress?.address_line1 || ''}, ${canonical.shippingAddress?.city || ''}`;

  return {
    id: numericId,
    orderNumber: canonical.orderNumber || (typeof canonical.id === 'string' && canonical.id.startsWith('ORD-') ? canonical.id : `ORD-${numericId}`),
    user_id: numericUserId,
    total: canonical.total,
    subtotal: canonical.subtotal,
    shippingFee: canonical.shippingFee,
    taxTotal: canonical.taxTotal,
    discountTotal: canonical.discountTotal,
    couponCode: canonical.couponCode,
    paymentMethod: canonical.paymentMethod,
    paymentStatus: canonical.paymentStatus,
    shippingMethod: canonical.shippingMethod,
    trackingNumber: canonical.trackingNumber,
    carrier: canonical.trackingCarrier || (canonical as any).carrier,
    timeline: canonical.timeline,
    status: canonical.status as Order['status'],
    created_at: canonical.created_at,
    shipping_address: formattedAddress,
    shippingAddress: canonical.shippingAddress,
    recipient_name: canonical.shippingAddress?.recipient_name || canonical.customerName,
    customerName: canonical.customerName,
    customerEmail: canonical.customerEmail,
    phone: canonical.shippingAddress?.phone || canonical.customerPhone,
    giftWrapping: canonical.giftWrapping,
    giftMessage: canonical.giftMessage,
    storeCreditApplied: canonical.storeCreditApplied,
    items: (canonical.items || []).map((i) => ({
      id: i.productId,
      productId: i.productId,
      name: i.name,
      product_name: i.name,
      image_url: i.image_url,
      quantity: i.quantity,
      price: i.price,
      subtotal: i.subtotal || i.price * i.quantity,
    })),
  };
}

export const orderApi = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    // 1. Immediately record in central commerceStore so Admin sees it in real-time
    const products = commerceStore.getProducts();
    const resolvedItems = (payload.items || []).map((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      const price = p?.price || 1500;
      return {
        productId: item.productId,
        name: p?.name || `مقتنى رقم #${item.productId}`,
        image_url: p?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
        price,
        quantity: item.quantity,
        subtotal: price * item.quantity,
      };
    });

    const subtotal = resolvedItems.reduce((acc, i) => acc + i.subtotal, 0);
    const settings = commerceStore.getStoreSettings();
    const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.defaultShippingFee;
    const taxTotal = Math.round((subtotal * settings.taxRatePercentage) / 100);
    const discountTotal = payload.discountTotal || 0;
    const storeCreditApplied = payload.storeCreditApplied || 0;
    const total = Math.max(0, subtotal + shippingFee + taxTotal - discountTotal - storeCreditApplied);

    const shippingAddress = payload.shippingAddress || {
      recipient_name: payload.customer?.name || 'عميل فخامة الملكي',
      phone: payload.customer?.phone || '0500000000',
      address_line1: payload.customer?.address || 'حي النخيل، طريق الملك فهد',
      city: payload.customer?.city || 'الرياض',
      country: 'المملكة العربية السعودية',
    };

    const currentUser = auth.currentUser;
    const user_id = currentUser ? currentUser.uid : (payload.customer?.email || 1);

    const canonicalOrder = commerceStore.createOrder({
      user_id: user_id as any,
      customerName: shippingAddress.recipient_name,
      customerEmail: payload.customer?.email || (currentUser?.email) || 'client@fakhama.com',
      customerPhone: shippingAddress.phone,
      shippingAddress,
      items: resolvedItems,
      subtotal,
      discountTotal,
      shippingFee,
      taxTotal,
      total,
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: payload.paymentMethod || 'Credit Card / Mada',
      shippingMethod: payload.shippingMethod || 'standard',
      couponCode: payload.couponCode,
      giftWrapping: payload.giftWrapping,
      giftMessage: payload.giftMessage,
      storeCreditApplied: payload.storeCreditApplied,
    });

    // Ensure immediate sync of new order to Firestore
    syncItemToFirestore('orders', canonicalOrder).catch(console.error);

    return toCustomerOrder(canonicalOrder);
  },

  async getOrders(): Promise<Order[]> {
    return commerceStore.getOrders().map(toCustomerOrder);
  },

  async getOrderById(id: number | string): Promise<Order> {
    const cleanId = String(id).replace(/[^0-9]/g, '');
    const found = commerceStore.getOrders().find(
      (o) =>
        String(o.id) === String(id) ||
        String(o.id) === cleanId ||
        o.orderNumber === String(id) ||
        o.orderNumber === `ORD-${cleanId}` ||
        o.orderNumber === `ORD-${id}` ||
        (o.trackingNumber && o.trackingNumber === String(id))
    );
    if (found) return toCustomerOrder(found);
    throw new Error('لم يتم العثور على الطلب');
  },

  async trackOrder(orderId: number | string): Promise<Order> {
    return this.getOrderById(orderId);
  }
};
