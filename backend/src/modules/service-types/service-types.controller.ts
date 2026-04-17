import { Request, Response } from 'express';
import prisma from '../../config/database';

export const listCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const types = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(types);
  } catch {
    res.status(500).json({ message: 'Erro ao listar categorias' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) { res.status(400).json({ message: 'Nome é obrigatório' }); return; }
    const exists = await prisma.category.findUnique({ where: { name } });
    if (exists) { res.status(400).json({ message: 'Categoria já cadastrada' }); return; }
    const type = await prisma.category.create({ data: { name } });
    res.status(201).json(type);
  } catch {
    res.status(500).json({ message: 'Erro ao criar categoria' });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (active !== undefined) data.active = active;
    const type = await prisma.category.update({ where: { id: Number(id) }, data });
    res.json(type);
  } catch {
    res.status(500).json({ message: 'Erro ao atualizar categoria' });
  }
};

export const removeCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.category.update({ where: { id: Number(id) }, data: { active: false } });
    res.json({ message: 'Categoria desativada' });
  } catch {
    res.status(500).json({ message: 'Erro ao remover categoria' });
  }
};
