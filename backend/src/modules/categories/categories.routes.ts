import { Router } from 'express';
import { listCategories, createCategory, updateCategory, removeCategory } from './categories.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', listCategories);
router.post('/', authenticate, requireAdmin, createCategory);
router.put('/:id', authenticate, requireAdmin, updateCategory);
router.delete('/:id', authenticate, requireAdmin, removeCategory);

export default router;
