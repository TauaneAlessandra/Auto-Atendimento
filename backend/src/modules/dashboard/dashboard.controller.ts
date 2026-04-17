import { Request, Response } from 'express';
import prisma from '../../config/database';

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [today, thisMonth, thisYear, totalAgg, pending, approved, rejected, recentData, topProductsRaw, recentOrders] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfYear } } }),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'approved' } }),
      prisma.order.count({ where: { status: 'rejected' } }),
      prisma.order.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { qty: true },
        orderBy: { _sum: { qty: 'desc' } },
        take: 5,
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { items: { take: 1 } },
      }),
    ]);

    // Safety: only look up products if there are top product records
    const productIds = topProductsRaw.map(p => p.productId).filter(Boolean);
    const products = productIds.length > 0 
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, photo: true },
        })
      : [];

    const topProducts = topProductsRaw.map(tp => {
      const p = products.find(prod => prod.id === tp.productId);
      return {
        id: tp.productId,
        name: p?.name || 'Item Removido',
        photo: p?.photo,
        qty: tp._sum.qty || 0,
      };
    });

    const byDay: Record<string, { count: number; value: number }> = {};
    const byMonth: Record<string, { count: number; value: number }> = {};

    recentData.forEach((o) => {
      const day = o.createdAt.toISOString().split('T')[0];
      const month = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!byDay[day]) byDay[day] = { count: 0, value: 0 };
      if (!byMonth[month]) byMonth[month] = { count: 0, value: 0 };
      byDay[day].count++;
      byDay[day].value += Number(o.total || 0);
      byMonth[month].count++;
      byMonth[month].value += Number(o.total || 0);
    });

    res.json({
      today, thisMonth, thisYear,
      totalValue: totalAgg._sum.total ?? 0,
      pendingOrders: pending,
      approvedOrders: approved,
      rejectedOrders: rejected,
      ordersByDay: Object.entries(byDay).map(([date, v]) => ({ date, ...v })),
      ordersByMonth: Object.entries(byMonth).map(([month, v]) => ({ month, ...v })),
      recentOrders,
      topProducts,
    });
  } catch (error) {
    console.error('[dashboard.getStats]', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
};
