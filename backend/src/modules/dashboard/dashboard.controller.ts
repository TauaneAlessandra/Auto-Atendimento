import { Request, Response } from 'express';
import prisma from '../../config/database';

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [today, thisMonth, thisYear, totalAgg, pending, approved, rejected, recent] = await Promise.all([
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
    ]);

    const byDay: Record<string, { count: number; value: number }> = {};
    const byMonth: Record<string, { count: number; value: number }> = {};

    recent.forEach((o) => {
      const day = o.createdAt.toISOString().split('T')[0];
      const month = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!byDay[day]) byDay[day] = { count: 0, value: 0 };
      if (!byMonth[month]) byMonth[month] = { count: 0, value: 0 };
      byDay[day].count++;
      byDay[day].value += o.total;
      byMonth[month].count++;
      byMonth[month].value += o.total;
    });

    res.json({
      today, thisMonth, thisYear,
      totalValue: totalAgg._sum.total ?? 0,
      pendingOrders: pending,
      approvedOrders: approved,
      rejectedOrders: rejected,
      ordersByDay: Object.entries(byDay).map(([date, v]) => ({ date, ...v })),
      ordersByMonth: Object.entries(byMonth).map(([month, v]) => ({ month, ...v })),
    });
  } catch {
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
};
