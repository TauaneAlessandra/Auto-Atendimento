import { Router } from 'express';
import { listUsers, createUser, updateUser, removeUser } from './users.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin as any);
router.get('/', listUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', removeUser);

export default router;
