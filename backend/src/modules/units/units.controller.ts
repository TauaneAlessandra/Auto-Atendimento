import { Request, Response } from 'express';
import { UnitsService } from './units.service';

export const listUnits = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await UnitsService.findAll());
  } catch {
    res.status(500).json({ message: 'Erro ao listar unidades' });
  }
};

export const createUnit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) { res.status(400).json({ message: 'Nome é obrigatório' }); return; }
    const unit = await UnitsService.create(name);
    res.status(201).json(unit);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNIT_EXISTS') {
      res.status(400).json({ message: 'Unidade já cadastrada' });
      return;
    }
    res.status(500).json({ message: 'Erro ao criar unidade' });
  }
};

export const updateUnit = async (req: Request, res: Response): Promise<void> => {
  try {
    const unit = await UnitsService.update(Number(req.params.id), req.body);
    res.json(unit);
  } catch {
    res.status(500).json({ message: 'Erro ao atualizar unidade' });
  }
};

export const removeUnit = async (req: Request, res: Response): Promise<void> => {
  try {
    await UnitsService.deactivate(Number(req.params.id));
    res.json({ message: 'Unidade desativada' });
  } catch {
    res.status(500).json({ message: 'Erro ao remover unidade' });
  }
};
