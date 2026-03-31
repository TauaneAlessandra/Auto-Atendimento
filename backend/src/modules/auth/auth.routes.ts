import { Router } from 'express';
import { login, me } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, (req, res) => me(req as any, res));

export default router;
