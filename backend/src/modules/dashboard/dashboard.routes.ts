import { Router } from 'express';
import { getStats } from './dashboard.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/stats', authenticate, requireAdmin, getStats);

export default router;
