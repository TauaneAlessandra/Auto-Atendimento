import prisma from '../../config/database';
import crypto from 'crypto';
import { env } from '../../config/env.config';

const QUOTATION_INCLUDE = { items: { include: { product: { include: { unit: true } } } } };
const ITEMS_INCLUDE = { items: true };

const ALLOWED_DELIVERY_STATUSES = ['em_andamento', 'concluido', 'pausado'] as const;
type DeliveryStatus = typeof ALLOWED_DELIVERY_STATUSES[number];

export type QuotationStatus = 'pending' | 'approved' | 'rejected' | 'expired';

interface QuotationItemInput { productId: number; qty: number; }

export const QuotationsService = {
  async findAll(page: number, limit: number) {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: QUOTATION_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count(),
    ]);
    return { data: orders, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async findById(id: number) {
    return prisma.order.findUnique({ where: { id }, include: QUOTATION_INCLUDE });
  },

  async findByToken(token: string) {
    const order = await prisma.order.findUnique({ where: { token }, include: ITEMS_INCLUDE });
    if (!order) return null;
    if (order.status === 'pending' && new Date() > order.validUntil) {
      await prisma.order.update({ where: { token }, data: { status: 'expired' } });
      order.status = 'expired';
    }
    return order;
  },

  async create(payload: { clientName: string; phone: string; responsible: string; address: string; items: QuotationItemInput[] }) {
    const { clientName, phone, responsible, address, items } = payload;
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
      include: { unit: true },
    });

    if (dbProducts.length !== [...new Set(productIds)].length) {
      throw new Error('INVALID_PRODUCTS');
    }

    const enrichedItems = items.map((item) => {
      const product = dbProducts.find((p) => p.id === item.productId)!;
      return {
        productId: product.id, productName: product.name, unitName: product.unit.name,
        price: product.price, qty: item.qty, subtotal: product.price * item.qty,
      };
    });

    const total = enrichedItems.reduce((sum, i) => sum + i.subtotal, 0);
    const validityDays = env.ORDER_VALIDITY_DAYS;
    const validUntil = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);
    const token = crypto.randomUUID();

    return prisma.order.create({
      data: {
        clientName, phone, responsible, address, total, validUntil, token,
        items: { create: enrichedItems },
      },
      include: ITEMS_INCLUDE,
    });
  },

  async approve(token: string) {
    const order = await prisma.order.findUnique({ where: { token } });
    if (!order) throw new Error('NOT_FOUND');
    if (order.status !== 'pending') throw new Error(`ALREADY_${order.status.toUpperCase()}`);
    if (new Date() > order.validUntil) {
      await prisma.order.update({ where: { token }, data: { status: 'expired' } });
      throw new Error('EXPIRED');
    }
    return prisma.order.update({
      where: { token },
      data: { status: 'approved', approvedAt: new Date(), deliveryStatus: 'em_andamento' },
      include: ITEMS_INCLUDE,
    });
  },

  async reject(token: string) {
    const order = await prisma.order.findUnique({ where: { token } });
    if (!order) throw new Error('NOT_FOUND');
    if (order.status !== 'pending') throw new Error(`ALREADY_${order.status.toUpperCase()}`);
    if (new Date() > order.validUntil) {
      await prisma.order.update({ where: { token }, data: { status: 'expired' } });
      throw new Error('EXPIRED');
    }
    return prisma.order.update({
      where: { token },
      data: { status: 'rejected', rejectedAt: new Date() },
      include: ITEMS_INCLUDE,
    });
  },

  isValidDeliveryStatus(status: string): status is DeliveryStatus {
    return ALLOWED_DELIVERY_STATUSES.includes(status as DeliveryStatus);
  },

  async updateDeliveryStatus(id: number, deliveryStatus: string) {
    return prisma.order.update({
      where: { id },
      data: { deliveryStatus },
      include: ITEMS_INCLUDE,
    });
  },
};
