import { Router } from 'express';
import {
  listOrders, getOrderById, getOrderByToken,
  createOrder, approveOrder, rejectOrder, updateWorkStatus,
} from './orders.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes (no auth required)
router.get('/approval/:token', getOrderByToken);
router.post('/', createOrder);
router.patch('/approval/:token/approve', approveOrder);
router.patch('/approval/:token/reject', rejectOrder);

// Admin routes
router.get('/', authenticate, requireAdmin as any, listOrders);
router.get('/:id', authenticate, requireAdmin as any, getOrderById);
router.patch('/:id/work-status', authenticate, requireAdmin as any, updateWorkStatus);

export default router;
