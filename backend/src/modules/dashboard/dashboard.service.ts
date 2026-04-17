import prisma from '../../config/database';
import { env } from '../../config/env.config';

function groupByDateUnit(
  data: { createdAt: Date; total: unknown }[],
  unit: 'day' | 'month',
): Record<string, { count: number; value: number }> {
  const grouped: Record<string, { count: number; value: number }> = {};
  for (const o of data) {
    const key = unit === 'day'
      ? o.createdAt.toISOString().split('T')[0]
      : `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) grouped[key] = { count: 0, value: 0 };
    grouped[key].count++;
    grouped[key].value += Number(o.total ?? 0);
  }
  return grouped;
}

export const DashboardService = {
  async getStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const lookbackMonths = env.DASHBOARD_LOOKBACK_MONTHS;
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - (lookbackMonths - 1), 1);

    const results = await Promise.allSettled([
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
        take: 500,
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

    const getValue = <T>(r: PromiseSettledResult<T>, fallback: T): T =>
      r.status === 'fulfilled' ? r.value : fallback;

    const today = getValue(results[0] as PromiseSettledResult<number>, 0);
    const thisMonth = getValue(results[1] as PromiseSettledResult<number>, 0);
    const thisYear = getValue(results[2] as PromiseSettledResult<number>, 0);
    const totalAgg = getValue(results[3] as PromiseSettledResult<{ _sum: { total: number | null } }>, { _sum: { total: null } });
    const pending = getValue(results[4] as PromiseSettledResult<number>, 0);
    const approved = getValue(results[5] as PromiseSettledResult<number>, 0);
    const rejected = getValue(results[6] as PromiseSettledResult<number>, 0);
    const recentData = getValue(results[7] as PromiseSettledResult<{ createdAt: Date; total: unknown }[]>, []);
    const topProductsRaw = getValue(results[8] as PromiseSettledResult<{ productId: number; _sum: { qty: number | null } }[]>, []);
    const recentOrders = getValue(results[9] as PromiseSettledResult<unknown[]>, []);

    // Resolve produtos em batch para eliminar N+1
    const productIds = topProductsRaw.map((p) => p.productId).filter(Boolean);
    const products = productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, photo: true },
        })
      : [];

    const productMap = new Map(products.map((p) => [p.id, p]));
    const topProducts = topProductsRaw.map((tp) => {
      const p = productMap.get(tp.productId);
      return { id: tp.productId, name: p?.name ?? 'Item Removido', photo: p?.photo, qty: tp._sum.qty ?? 0 };
    });

    const byDay = groupByDateUnit(recentData, 'day');
    const byMonth = groupByDateUnit(recentData, 'month');

    return {
      today, thisMonth, thisYear,
      totalValue: totalAgg._sum.total ?? 0,
      pendingOrders: pending, approvedOrders: approved, rejectedOrders: rejected,
      ordersByDay: Object.entries(byDay).map(([date, v]) => ({ date, ...v })),
      ordersByMonth: Object.entries(byMonth).map(([month, v]) => ({ month, ...v })),
      recentOrders, topProducts,
    };
  },
};
