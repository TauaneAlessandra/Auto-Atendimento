import { Router } from 'express';
import { listProducts, listActiveProducts, createProduct, updateProduct, removeProduct } from './products.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();

router.get('/public', listActiveProducts);
router.get('/', authenticate, requireAdmin, listProducts);
router.post('/', authenticate, requireAdmin, upload.single('photo'), createProduct);
router.put('/:id', authenticate, requireAdmin, upload.single('photo'), updateProduct);
router.delete('/:id', authenticate, requireAdmin, removeProduct);

export default router;
