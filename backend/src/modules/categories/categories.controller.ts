import { Request, Response } from 'express';
import { CategoriesService } from './categories.service';

export const listCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await CategoriesService.findAll());
  } catch {
    res.status(500).json({ message: 'Erro ao listar categorias' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) { res.status(400).json({ message: 'Nome é obrigatório' }); return; }
    const type = await CategoriesService.create(name);
    res.status(201).json(type);
  } catch (error) {
    if (error instanceof Error && error.message === 'CATEGORY_EXISTS') {
      res.status(400).json({ message: 'Categoria já cadastrada' });
      return;
    }
    res.status(500).json({ message: 'Erro ao criar categoria' });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const type = await CategoriesService.update(Number(req.params.id), req.body);
    res.json(type);
  } catch {
    res.status(500).json({ message: 'Erro ao atualizar categoria' });
  }
};

export const removeCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    await CategoriesService.deactivate(Number(req.params.id));
    res.json({ message: 'Categoria desativada' });
  } catch {
    res.status(500).json({ message: 'Erro ao remover categoria' });
  }
};
