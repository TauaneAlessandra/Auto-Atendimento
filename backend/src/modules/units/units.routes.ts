import { Router } from 'express';
import { listUnits, createUnit, updateUnit, removeUnit } from './units.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', listUnits);
router.post('/', authenticate, requireAdmin as any, createUnit);
router.put('/:id', authenticate, requireAdmin as any, updateUnit);
router.delete('/:id', authenticate, requireAdmin as any, removeUnit);

export default router;
