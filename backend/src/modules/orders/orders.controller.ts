import { Request, Response } from 'express';
import prisma from '../../config/database';
import crypto from 'crypto';

const ORDER_INCLUDE = { items: { include: { product: { include: { unit: true } } } } };

const ALLOWED_DELIVERY_STATUSES = ['em_andamento', 'concluido', 'pausado'] as const;

interface OrderItemInput {
  productId: number;
  qty: number;
}

interface EnrichedItem {
  productId: number;
  productName: string;
  unitName: string;
  price: number;
  qty: number;
  subtotal: number;
}

export const listOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count(),
    ]);

    res.json({ data: orders, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[orders.listOrders]', error);
    res.status(500).json({ message: 'Erro ao listar cotações' });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id: Number(id) }, include: ORDER_INCLUDE });
    if (!order) { res.status(404).json({ message: 'Cotação não encontrada' }); return; }
    res.json(order);
  } catch (error) {
    console.error('[orders.getOrderById]', error);
    res.status(500).json({ message: 'Erro ao buscar cotação' });
  }
};

export const getOrderByToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const order = await prisma.order.findUnique({ where: { token }, include: { items: true } });
    if (!order) { res.status(404).json({ message: 'Cotação não encontrada' }); return; }
    const now = new Date();
    if (order.status === 'pending' && now > order.validUntil) {
      await prisma.order.update({ where: { token }, data: { status: 'expired' } });
      order.status = 'expired';
    }
    res.json(order);
  } catch (error) {
    console.error('[orders.getOrderByToken]', error);
    res.status(500).json({ message: 'Erro ao buscar cotação' });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientName, phone, responsible, address, items } = req.body as {
      clientName: string;
      phone: string;
      responsible: string;
      address: string;
      items: OrderItemInput[];
    };

    if (!clientName || !phone || !responsible || !address || !items?.length) {
      res.status(400).json({ message: 'Dados incompletos para criar cotação' });
      return;
    }

    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
      include: { unit: true },
    });

    if (dbProducts.length !== [...new Set(productIds)].length) {
      res.status(400).json({ message: 'Um ou mais produtos selecionados são inválidos ou estão inativos' });
      return;
    }

    const enrichedItems: EnrichedItem[] = items.map((item) => {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Produto ${item.productId} não encontrado após validação`);
      return {
        productId: product.id,
        productName: product.name,
        unitName: product.unit.name,
        price: product.price,
        qty: item.qty,
        subtotal: product.price * item.qty,
      };
    });

    const total = enrichedItems.reduce((sum, i) => sum + i.subtotal, 0);
    const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    const token = crypto.randomUUID();

    const order = await prisma.order.create({
      data: {
        clientName, phone, responsible, address, total, validUntil, token,
        items: {
          create: enrichedItems.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            unitName: i.unitName,
            price: i.price,
            qty: i.qty,
            subtotal: i.subtotal,
          })),
        },
      },
      include: { items: true },
    });
    res.status(201).json(order);
  } catch (error) {
    console.error('[orders.createOrder]', error);
    res.status(500).json({ message: 'Erro ao criar cotação' });
  }
};

export const approveOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const order = await prisma.order.findUnique({ where: { token } });
    if (!order) { res.status(404).json({ message: 'Cotação não encontrada' }); return; }
    if (order.status !== 'pending') { res.status(400).json({ message: `Cotação já está ${order.status}` }); return; }
    if (new Date() > order.validUntil) {
      await prisma.order.update({ where: { token }, data: { status: 'expired' } });
      res.status(400).json({ message: 'Proposta expirada' });
      return;
    }
    const updated = await prisma.order.update({
      where: { token },
      data: { status: 'approved', approvedAt: new Date(), deliveryStatus: 'em_andamento' },
      include: { items: true },
    });
    res.json(updated);
  } catch (error) {
    console.error('[orders.approveOrder]', error);
    res.status(500).json({ message: 'Erro ao aprovar cotação' });
  }
};

export const rejectOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const order = await prisma.order.findUnique({ where: { token } });
    if (!order) { res.status(404).json({ message: 'Cotação não encontrada' }); return; }
    if (order.status !== 'pending') { res.status(400).json({ message: `Cotação já está ${order.status}` }); return; }
    const updated = await prisma.order.update({
      where: { token },
      data: { status: 'rejected', rejectedAt: new Date() },
      include: { items: true },
    });
    res.json(updated);
  } catch (error) {
    console.error('[orders.rejectOrder]', error);
    res.status(500).json({ message: 'Erro ao rejeitar cotação' });
  }
};

export const updateDeliveryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body as { deliveryStatus: string };
    if (!ALLOWED_DELIVERY_STATUSES.includes(deliveryStatus as typeof ALLOWED_DELIVERY_STATUSES[number])) {
      res.status(400).json({ message: 'Status inválido' });
      return;
    }
    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: { deliveryStatus },
      include: { items: true },
    });
    res.json(updated);
  } catch (error) {
    console.error('[orders.updateDeliveryStatus]', error);
    res.status(500).json({ message: 'Erro ao atualizar status' });
  }
};
