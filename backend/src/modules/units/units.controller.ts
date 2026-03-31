import { Request, Response } from 'express';
import prisma from '../../config/database';

export const listUnits = async (_req: Request, res: Response): Promise<void> => {
  try {
    const units = await prisma.unit.findMany({ orderBy: { name: 'asc' } });
    res.json(units);
  } catch {
    res.status(500).json({ message: 'Erro ao listar unidades' });
  }
};

export const createUnit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) { res.status(400).json({ message: 'Nome é obrigatório' }); return; }
    const exists = await prisma.unit.findUnique({ where: { name } });
    if (exists) { res.status(400).json({ message: 'Unidade já cadastrada' }); return; }
    const unit = await prisma.unit.create({ data: { name } });
    res.status(201).json(unit);
  } catch {
    res.status(500).json({ message: 'Erro ao criar unidade' });
  }
};

export const updateUnit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (active !== undefined) data.active = active;
    const unit = await prisma.unit.update({ where: { id: Number(id) }, data });
    res.json(unit);
  } catch {
    res.status(500).json({ message: 'Erro ao atualizar unidade' });
  }
};

export const removeUnit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.unit.update({ where: { id: Number(id) }, data: { active: false } });
    res.json({ message: 'Unidade desativada' });
  } catch {
    res.status(500).json({ message: 'Erro ao remover unidade' });
  }
};
