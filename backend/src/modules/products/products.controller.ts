import { Request, Response } from 'express';
import prisma from '../../config/database';
import fs from 'fs';
import path from 'path';

const INCLUDE_RELATIONS = { category: true, unit: true };

export const listProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({ include: INCLUDE_RELATIONS, orderBy: { name: 'asc' } });
    res.json(products);
  } catch (error) {
    console.error('[products.listProducts]', error);
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
};

export const listActiveProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: INCLUDE_RELATIONS,
      orderBy: { name: 'asc' },
    });
    res.json(products);
  } catch (error) {
    console.error('[products.listActiveProducts]', error);
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price, categoryId, description, unitId, minQty, maxQty } = req.body;
    const photo = (req.file as Express.Multer.File | undefined)?.filename ?? null;
    if (!name || !price || !categoryId || !description || !unitId || !minQty || !maxQty) {
      res.status(400).json({ message: 'Preencha todos os campos obrigatórios' });
      return;
    }
    const product = await prisma.product.create({
      data: { name, price: Number(price), categoryId: Number(categoryId), description, unitId: Number(unitId), minQty: Number(minQty), maxQty: Number(maxQty), photo },
      include: INCLUDE_RELATIONS,
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('[products.createProduct]', error);
    res.status(500).json({ message: 'Erro ao criar produto' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, price, categoryId, description, unitId, minQty, maxQty, active } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (price !== undefined) data.price = Number(price);
    if (categoryId !== undefined) data.categoryId = Number(categoryId);
    if (description !== undefined) data.description = description;
    if (unitId !== undefined) data.unitId = Number(unitId);
    if (minQty !== undefined) data.minQty = Number(minQty);
    if (maxQty !== undefined) data.maxQty = Number(maxQty);
    if (active !== undefined) data.active = active === 'true' || active === true;

    if (req.file) {
      const old = await prisma.product.findUnique({ where: { id: Number(id) } });
      if (old?.photo) {
        const oldPath = path.join(__dirname, '../../../uploads', old.photo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.photo = req.file.filename;
    }

    const product = await prisma.product.update({ where: { id: Number(id) }, data, include: INCLUDE_RELATIONS });
    res.json(product);
  } catch (error) {
    console.error('[products.updateProduct]', error);
    res.status(500).json({ message: 'Erro ao atualizar produto' });
  }
};

export const removeProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.product.update({ where: { id: Number(id) }, data: { active: false } });
    res.json({ message: 'Produto desativado com sucesso' });
  } catch (error) {
    console.error('[products.removeProduct]', error);
    res.status(500).json({ message: 'Erro ao remover produto' });
  }
};
