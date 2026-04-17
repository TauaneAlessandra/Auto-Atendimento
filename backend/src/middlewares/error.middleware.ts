import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';

export const errorHandler = (
  err: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }
  if (err.statusCode) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }
  console.error('[Error]', err.message);
  res.status(500).json({ message: 'Erro interno do servidor' });
};

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Rota não encontrada' });
};
