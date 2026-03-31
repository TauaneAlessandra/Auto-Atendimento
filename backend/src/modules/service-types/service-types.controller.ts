import { Request, Response } from 'express';
import prisma from '../../config/database';

export const listServiceTypes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const types = await prisma.serviceType.findMany({ orderBy: { name: 'asc' } });
    res.json(types);
  } catch {
    res.status(500).json({ message: 'Erro ao listar tipos de serviço' });
  }
};

export const createServiceType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) { res.status(400).json({ message: 'Nome é obrigatório' }); return; }
    const exists = await prisma.serviceType.findUnique({ where: { name } });
    if (exists) { res.status(400).json({ message: 'Tipo já cadastrado' }); return; }
    const type = await prisma.serviceType.create({ data: { name } });
    res.status(201).json(type);
  } catch {
    res.status(500).json({ message: 'Erro ao criar tipo de serviço' });
  }
};

export const updateServiceType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (active !== undefined) data.active = active;
    const type = await prisma.serviceType.update({ where: { id: Number(id) }, data });
    res.json(type);
  } catch {
    res.status(500).json({ message: 'Erro ao atualizar tipo de serviço' });
  }
};

export const removeServiceType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.serviceType.update({ where: { id: Number(id) }, data: { active: false } });
    res.json({ message: 'Tipo de serviço desativado' });
  } catch {
    res.status(500).json({ message: 'Erro ao remover tipo de serviço' });
  }
};
