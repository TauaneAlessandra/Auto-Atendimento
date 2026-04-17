import { Router } from 'express';
import {
  listQuotations, getQuotationById, getQuotationByToken,
  createQuotation, approveQuotation, rejectQuotation, updateDeliveryStatus,
} from './quotations.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';
import { approvalLimiter } from '../../middlewares/limiter.middleware';

const router = Router();

// Rotas públicas com rate limiting específico
router.get('/approval/:token', approvalLimiter, getQuotationByToken);
router.post('/', approvalLimiter, createQuotation);
router.patch('/approval/:token/approve', approvalLimiter, approveQuotation);
router.patch('/approval/:token/reject', approvalLimiter, rejectQuotation);

// Rotas administrativas
router.get('/', authenticate, requireAdmin, listQuotations);
router.get('/:id', authenticate, requireAdmin, getQuotationById);
router.patch('/:id/delivery-status', authenticate, requireAdmin, updateDeliveryStatus);

export default router;
