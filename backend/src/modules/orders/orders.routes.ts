import { Router, RequestHandler } from 'express';
import {
  listOrders, getOrderById, getOrderByToken,
  createOrder, approveOrder, rejectOrder, updateDeliveryStatus,
} from './orders.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

const adminOnly = requireAdmin as unknown as RequestHandler;

// Public routes (no auth required)
router.get('/approval/:token', getOrderByToken);
router.post('/', createOrder);
router.patch('/approval/:token/approve', approveOrder);
router.patch('/approval/:token/reject', rejectOrder);

// Admin routes
router.get('/', authenticate, adminOnly, listOrders);
router.get('/:id', authenticate, adminOnly, getOrderById);
router.patch('/:id/delivery-status', authenticate, adminOnly, updateDeliveryStatus);

export default router;
