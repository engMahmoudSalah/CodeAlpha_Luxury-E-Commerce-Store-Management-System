import { db } from '../config/database.js';
import { db as firestoreDb } from '../config/firebase.js';
import { doc, setDoc, updateDoc, increment } from 'firebase/firestore';

/**
 * Custom Order Processing Error
 */
export class OrderError extends Error {
  constructor(message, code = 'ORDER_ERROR', status = 400) {
    super(message);
    this.name = 'OrderError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Format database order row and items into a clean client object
 */
function formatOrderResponse(orderRow, itemsRows = []) {
  const totalVal = Number(orderRow.total_amount);
  return {
    id: orderRow.id,
    userId: orderRow.user_id,
    user_id: orderRow.user_id,
    total: totalVal,
    totalAmount: totalVal,
    status: orderRow.status,
    customer: {
      name: orderRow.customer_name,
      email: orderRow.customer_email,
      address: orderRow.address,
      city: orderRow.city,
      postalCode: orderRow.postal_code,
      phone: orderRow.phone
    },
    shipping_address: [orderRow.address, orderRow.city].filter(Boolean).join(', '),
    recipient_name: orderRow.customer_name,
    phone: orderRow.phone,
    itemsCount: itemsRows.reduce((sum, item) => sum + item.quantity, 0),
    items: itemsRows.map(item => ({
      id: item.id,
      productId: item.product_id,
      product_id: item.product_id,
      name: item.product_name || item.name || 'Unknown Product',
      product_name: item.product_name || item.name || 'Unknown Product',
      imageUrl: item.image_url || '',
      image_url: item.image_url || '',
      quantity: item.quantity,
      price: Number(item.price),
      subtotal: Number((item.quantity * item.price).toFixed(2))
    })),
    createdAt: orderRow.created_at,
    created_at: orderRow.created_at
  };
}

/**
 * Process order creation atomically within a SQLite transaction
 */
export function createOrder({ userId, items, customer }) {
  if (!userId) {
    throw new OrderError('User authentication required.', 'UNAUTHORIZED', 401);
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new OrderError('Order items must not be empty.', 'EMPTY_CART', 400);
  }

  // Define transaction function
  const executeOrderTransaction = db.transaction(() => {
    // 1. Prepare statements
    const getProductStmt = db.prepare('SELECT id, name, price, stock FROM products WHERE id = ?');
    const updateStockStmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');
    const insertOrderStmt = db.prepare(`
      INSERT INTO orders (user_id, total_amount, status, customer_name, customer_email, address, city, postal_code, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertOrderItemStmt = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES (?, ?, ?, ?)
    `);
    const getOrderStmt = db.prepare('SELECT * FROM orders WHERE id = ?');
    const getOrderItemsStmt = db.prepare(`
      SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, p.name as product_name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC
    `);

    // 2. Validate all products and stock upfront using SQLite as single source of truth
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = getProductStmt.get(item.productId);

      if (!product) {
        throw new OrderError(
          `Product with ID ${item.productId} was not found.`,
          'PRODUCT_NOT_FOUND',
          404
        );
      }

      if (product.stock < item.quantity) {
        throw new OrderError(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`,
          'INSUFFICIENT_STOCK',
          409
        );
      }

      // Calculate authoritative server-side price
      const itemPrice = Number(product.price);
      const itemSubtotal = Number((itemPrice * item.quantity).toFixed(2));
      calculatedTotal += itemSubtotal;

      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    const finalTotalAmount = Number(calculatedTotal.toFixed(2));

    // 3. Create Order Record
    const orderResult = insertOrderStmt.run(
      userId,
      finalTotalAmount,
      'completed',
      customer.name,
      customer.email,
      customer.address,
      customer.city,
      customer.postalCode,
      customer.phone
    );

    const orderId = Number(orderResult.lastInsertRowid);

    // 4. Create Order Items & Atomically Decrement Stock
    for (const item of validatedItems) {
      // Record purchase price for historical permanence
      insertOrderItemStmt.run(orderId, item.productId, item.quantity, item.price);

      // Decrement stock
      const stockResult = updateStockStmt.run(item.quantity, item.productId, item.quantity);
      if (stockResult.changes !== 1) {
        throw new OrderError(
          `Stock decrement conflict for product ID ${item.productId}.`,
          'INSUFFICIENT_STOCK',
          409
        );
      }
    }

    // 5. Retrieve created order & items for response
    const createdOrderRow = getOrderStmt.get(orderId);
    const createdItemsRows = getOrderItemsStmt.all(orderId);

    return formatOrderResponse(createdOrderRow, createdItemsRows);
  });

  // Execute transaction (better-sqlite3 handles BEGIN/COMMIT/ROLLBACK automatically)
  const createdOrder = executeOrderTransaction();

  // Asynchronously sync the created order to Firestore in active runtime (non-test)
  if (process.env.NODE_ENV !== 'test') {
    try {
      const docId = `ORD-${createdOrder.id}`;
      setDoc(doc(firestoreDb, 'orders', docId), {
        ...createdOrder,
        orderNumber: docId,
        syncedToFirestoreAt: new Date().toISOString()
      }, { merge: true }).catch((err) => {
        console.warn('Could not sync order to Firestore:', err.message);
      });

      // Update stock in Firestore for ordered items
      for (const item of (createdOrder.items || [])) {
        const prodRef = doc(firestoreDb, 'products', String(item.productId));
        updateDoc(prodRef, {
          stock: increment(-item.quantity)
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Error initiating Firestore sync for order:', err);
    }
  }

  return createdOrder;
}

/**
 * Retrieve all orders for a specific authenticated user
 */
export function getUserOrders(userId) {
  if (!userId) {
    throw new OrderError('User authentication required.', 'UNAUTHORIZED', 401);
  }

  const getOrdersStmt = db.prepare(`
    SELECT * FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC, id DESC
  `);

  const getOrderItemsStmt = db.prepare(`
    SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, p.name as product_name, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
    ORDER BY oi.id ASC
  `);

  const orders = getOrdersStmt.all(userId);

  return orders.map(order => {
    const items = getOrderItemsStmt.all(order.id);
    return formatOrderResponse(order, items);
  });
}

/**
 * Retrieve a specific order by ID, enforcing authenticated user ownership
 */
export function getUserOrderById(orderId, userId) {
  if (!userId) {
    throw new OrderError('User authentication required.', 'UNAUTHORIZED', 401);
  }

  const getOrderStmt = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?');
  const orderRow = getOrderStmt.get(orderId, userId);

  if (!orderRow) {
    return null;
  }

  const getOrderItemsStmt = db.prepare(`
    SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, p.name as product_name, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
    ORDER BY oi.id ASC
  `);

  const itemsRows = getOrderItemsStmt.all(orderRow.id);
  return formatOrderResponse(orderRow, itemsRows);
}

/**
 * Retrieve all orders across the store
 */
export function getAllOrders() {
  const getOrdersStmt = db.prepare(`
    SELECT * FROM orders
    ORDER BY created_at DESC, id DESC
  `);

  const getOrderItemsStmt = db.prepare(`
    SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, p.name as product_name, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
    ORDER BY oi.id ASC
  `);

  const orders = getOrdersStmt.all();

  return orders.map(order => {
    const items = getOrderItemsStmt.all(order.id);
    return formatOrderResponse(order, items);
  });
}

/**
 * Update order status and sync to Firestore
 */
export function updateOrderStatus(orderId, status) {
  const getOrderStmt = db.prepare('SELECT * FROM orders WHERE id = ?');
  const orderRow = getOrderStmt.get(orderId);
  if (!orderRow) return null;

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);

  // Sync to Firestore
  if (process.env.NODE_ENV !== 'test') {
    import('../config/firebase.js').then(({ db: firestoreDb }) => {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(firestoreDb, 'orders', String(orderId)), {
          status,
          updated_at: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      }).catch(() => {});
    }).catch(() => {});
  }

  const getOrderItemsStmt = db.prepare(`
    SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price, p.name as product_name, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
    ORDER BY oi.id ASC
  `);
  const itemsRows = getOrderItemsStmt.all(orderRow.id);
  return formatOrderResponse({ ...orderRow, status }, itemsRows);
}

