import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error]', err.message);
  res.status(500).json({ message: err.message || 'Erro interno do servidor' });
};

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Rota não encontrada' });
};
