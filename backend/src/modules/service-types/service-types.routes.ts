import { Router } from 'express';
import { listCategories, createCategory, updateCategory, removeCategory } from './service-types.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', listCategories);
router.post('/', authenticate, requireAdmin as any, createCategory);
router.put('/:id', authenticate, requireAdmin as any, updateCategory);
router.delete('/:id', authenticate, requireAdmin as any, removeCategory);

export default router;
