import { Request, Response } from 'express';
import { ProductsService } from './products.service';
import { validateBody, createProductSchema } from '../../lib/validation';

export const listProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
    res.json(await ProductsService.findAll(page, limit));
  } catch (error) {
    console.error('[products.listProducts]', error);
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
};

export const listActiveProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await ProductsService.findActive());
  } catch (error) {
    console.error('[products.listActiveProducts]', error);
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = validateBody(createProductSchema, req.body);
    const photo = (req.file as Express.Multer.File | undefined)?.filename ?? null;
    const product = await ProductsService.create({ ...data, photo });
    res.status(201).json(product);
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    if (err.statusCode === 400) {
      res.status(400).json({ message: err.message });
      return;
    }
    console.error('[products.createProduct]', error);
    res.status(500).json({ message: 'Erro ao criar produto' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }
    const { name, price, categoryId, description, unitId, minQty, maxQty, active } = req.body as Record<string, string | boolean | undefined>;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (price !== undefined) data.price = Number(price);
    if (categoryId !== undefined) data.categoryId = Number(categoryId);
    if (description !== undefined) data.description = description;
    if (unitId !== undefined) data.unitId = Number(unitId);
    if (minQty !== undefined) data.minQty = Number(minQty);
    if (maxQty !== undefined) data.maxQty = Number(maxQty);
    if (active !== undefined) data.active = active === 'true' || active === true;
    const product = await ProductsService.update(id, data, req.file?.filename);
    res.json(product);
  } catch (error) {
    console.error('[products.updateProduct]', error);
    res.status(500).json({ message: 'Erro ao atualizar produto' });
  }
};

export const removeProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }
    await ProductsService.deactivate(id);
    res.json({ message: 'Produto desativado com sucesso' });
  } catch (error) {
    console.error('[products.removeProduct]', error);
    res.status(500).json({ message: 'Erro ao remover produto' });
  }
};
