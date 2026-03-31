import { Router } from 'express';
import { listProducts, listActiveProducts, createProduct, updateProduct, removeProduct } from './products.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();

router.get('/public', listActiveProducts);
router.get('/', authenticate, requireAdmin as any, listProducts);
router.post('/', authenticate, requireAdmin as any, upload.single('photo'), createProduct);
router.put('/:id', authenticate, requireAdmin as any, upload.single('photo'), updateProduct);
router.delete('/:id', authenticate, requireAdmin as any, removeProduct);

export default router;
