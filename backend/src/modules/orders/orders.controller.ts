import { Request, Response } from 'express';
import prisma from '../../config/database';
import crypto from 'crypto';

const ORDER_INCLUDE = { items: { include: { product: { include: { unit: true } } } } };

export const listOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({ include: ORDER_INCLUDE, orderBy: { createdAt: 'desc' } });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Erro ao listar OS' });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id: Number(id) }, include: ORDER_INCLUDE });
    if (!order) { res.status(404).json({ message: 'OS não encontrada' }); return; }
    res.json(order);
  } catch {
    res.status(500).json({ message: 'Erro ao buscar OS' });
  }
};

export const getOrderByToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const order = await prisma.order.findUnique({ where: { token }, include: { items: true } });
    if (!order) { res.status(404).json({ message: 'Proposta não encontrada' }); return; }
    const now = new Date();
    if (order.status === 'pending' && now > order.validUntil) {
      await prisma.order.update({ where: { token }, data: { status: 'expired' } });
      order.status = 'expired';
    }
    res.json(order);
  } catch {
    res.status(500).json({ message: 'Erro ao buscar proposta' });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientName, phone, manager, costCenter, items } = req.body;
    if (!clientName || !phone || !manager || !costCenter || !items?.length) {
      res.status(400).json({ message: 'Dados incompletos para criar OS' });
      return;
    }
    const total = items.reduce((s: number, i: { price: number; qty: number }) => s + i.price * i.qty, 0);
    const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    const token = crypto.randomUUID();

    const order = await prisma.order.create({
      data: {
        clientName, phone, manager, costCenter, total, validUntil, token,
        items: {
          create: items.map((i: { productId: number; productName: string; unitName: string; price: number; qty: number }) => ({
            productId: i.productId, productName: i.productName, unitName: i.unitName,
            price: i.price, qty: i.qty, subtotal: i.price * i.qty,
          })),
        },
      },
      include: { items: true },
    });
    res.status(201).json(order);
  } catch {
    res.status(500).json({ message: 'Erro ao criar OS' });
  }
};

export const approveOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const order = await prisma.order.findUnique({ where: { token } });
    if (!order) { res.status(404).json({ message: 'OS não encontrada' }); return; }
    if (order.status !== 'pending') { res.status(400).json({ message: `OS já está ${order.status}` }); return; }
    if (new Date() > order.validUntil) {
      await prisma.order.update({ where: { token }, data: { status: 'expired' } });
      res.status(400).json({ message: 'Proposta expirada' });
      return;
    }
    const updated = await prisma.order.update({
      where: { token },
      data: { status: 'approved', approvedAt: new Date(), workStatus: 'em_andamento' },
      include: { items: true },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Erro ao aprovar OS' });
  }
};

export const rejectOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const order = await prisma.order.findUnique({ where: { token } });
    if (!order) { res.status(404).json({ message: 'OS não encontrada' }); return; }
    if (order.status !== 'pending') { res.status(400).json({ message: `OS já está ${order.status}` }); return; }
    const updated = await prisma.order.update({
      where: { token },
      data: { status: 'rejected', rejectedAt: new Date() },
      include: { items: true },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Erro ao rejeitar OS' });
  }
};

export const updateWorkStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { workStatus } = req.body;
    const allowed = ['em_andamento', 'concluido', 'pausado'];
    if (!allowed.includes(workStatus)) { res.status(400).json({ message: 'Status inválido' }); return; }
    const updated = await prisma.order.update({ where: { id: Number(id) }, data: { workStatus }, include: { items: true } });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Erro ao atualizar status' });
  }
};
