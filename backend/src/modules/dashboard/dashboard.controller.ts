import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await DashboardService.getStats());
  } catch (error) {
    console.error('[dashboard.getStats]', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
};
