import { Router } from 'express';
import { login, me } from './auth.controller';
import { authenticate, AuthRequest } from '../../middlewares/auth.middleware';
import { loginLimiter } from '../../middlewares/limiter.middleware';

const router = Router();

router.post('/login', loginLimiter, login);
router.get('/me', authenticate, (req, res) => me(req as AuthRequest, res));

export default router;
