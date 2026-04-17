import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { validateBody, loginSchema } from '../../lib/validation';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = validateBody(loginSchema, req.body);
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({ message: 'Credenciais inválidas' });
        return;
      }
      const err = error as Error & { statusCode?: number };
      if (err.statusCode === 400) {
        res.status(400).json({ message: err.message });
        return;
      }
    }
    console.error('[auth.login]', error);
    res.status(500).json({ message: 'Erro ao realizar login' });
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await AuthService.me(req.user!.id);
    if (!user) { res.status(404).json({ message: 'Usuário não encontrado' }); return; }
    res.json(user);
  } catch (error) {
    console.error('[auth.me]', error);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
};
