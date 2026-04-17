import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token não fornecido' });
    return;
  }
  
  const token = authHeader.split(' ')[1];
  
  // ── MOCK BYPASS (Temporário p/ Desenvolvimento) ──
  if (token === 'mock-token') {
    req.user = { id: 1, email: 'admin@mock.com', role: 'admin' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: number; email: string; role: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Acesso restrito ao administrador' });
    return;
  }
  next();
};
