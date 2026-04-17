import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/users/users.routes';
import productRoutes from '../modules/products/products.routes';
import categoryRoutes from '../modules/categories/categories.routes';
import unitRoutes from '../modules/units/units.routes';
import quotationRoutes from '../modules/quotations/quotations.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/units', unitRoutes);
router.use('/orders', quotationRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
