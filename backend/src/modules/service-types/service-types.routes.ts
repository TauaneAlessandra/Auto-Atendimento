import { Router } from 'express';
import { listServiceTypes, createServiceType, updateServiceType, removeServiceType } from './service-types.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', listServiceTypes);
router.post('/', authenticate, requireAdmin as any, createServiceType);
router.put('/:id', authenticate, requireAdmin as any, updateServiceType);
router.delete('/:id', authenticate, requireAdmin as any, removeServiceType);

export default router;
