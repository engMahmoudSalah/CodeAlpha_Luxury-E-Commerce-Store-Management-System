import {
  createOrder,
  getUserOrders,
  getUserOrderById,
  getAllOrders,
  updateOrderStatus,
  OrderError
} from '../services/orderService.js';

/**
 * Handle new order creation
 * POST /api/orders
 */
export function createOrderHandler(req, res, next) {
  try {
    const userId = req.user?.id || req.session?.userId;
    const items = req.body.items;
    const customer = req.normalizedCustomer || req.body.customer;

    const order = createOrder({
      userId,
      items,
      customer
    });

    return res.status(201).json({
      success: true,
      data: {
        order
      },
      message: 'Order created successfully.'
    });
  } catch (error) {
    if (error instanceof OrderError) {
      return res.status(error.status).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }
    next(error);
  }
}

/**
 * Handle retrieving authenticated user's order history
 * GET /api/orders
 */
export function getUserOrdersHandler(req, res, next) {
  try {
    const userId = req.user?.id || req.session?.userId;
    const orders = getUserOrders(userId);

    return res.status(200).json({
      success: true,
      data: {
        orders,
        total: orders.length
      },
      message: 'Orders retrieved successfully.'
    });
  } catch (error) {
    if (error instanceof OrderError) {
      return res.status(error.status).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }
    next(error);
  }
}

/**
 * Handle retrieving a specific order by ID
 * GET /api/orders/:id
 */
export function getOrderByIdHandler(req, res, next) {
  try {
    const userId = req.user?.id || req.session?.userId;
    const orderId = req.numericOrderId;

    const order = getUserOrderById(orderId, userId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found.'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        order
      },
      message: 'Order details retrieved successfully.'
    });
  } catch (error) {
    if (error instanceof OrderError) {
      return res.status(error.status).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }
    next(error);
  }
}

/**
 * Handle retrieving all orders (admin)
 * GET /api/orders/all
 */
export function getAllOrdersHandler(req, res, next) {
  try {
    const orders = getAllOrders();
    return res.status(200).json({
      success: true,
      data: {
        orders,
        total: orders.length
      },
      message: 'All orders retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle updating order status
 * PUT /api/orders/:id/status
 */
export function updateOrderStatusHandler(req, res, next) {
  try {
    const orderId = req.numericOrderId || Number(req.params.id);
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Status is required.' }
      });
    }

    const updated = updateOrderStatus(orderId, status);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Order not found.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: { order: updated },
      message: 'Order status updated and synced successfully.'
    });
  } catch (error) {
    next(error);
  }
}

