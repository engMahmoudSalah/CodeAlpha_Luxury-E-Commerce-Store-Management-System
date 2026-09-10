import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateCreateOrder, validateOrderId } from '../middleware/validator.js';
import {
  createOrderHandler,
  getUserOrdersHandler,
  getOrderByIdHandler,
  getAllOrdersHandler,
  updateOrderStatusHandler
} from '../controllers/orderController.js';

const router = Router();

// Order endpoints
router.post('/', requireAuth, validateCreateOrder, createOrderHandler);
router.get('/', requireAuth, getUserOrdersHandler);
router.get('/all', getAllOrdersHandler);
router.get('/:id', requireAuth, validateOrderId, getOrderByIdHandler);
router.put('/:id/status', updateOrderStatusHandler);

export default router;

