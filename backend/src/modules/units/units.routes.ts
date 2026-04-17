import { Router } from 'express';
import { listUnits, createUnit, updateUnit, removeUnit } from './units.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', listUnits);
router.post('/', authenticate, requireAdmin, createUnit);
router.put('/:id', authenticate, requireAdmin, updateUnit);
router.delete('/:id', authenticate, requireAdmin, removeUnit);

export default router;
