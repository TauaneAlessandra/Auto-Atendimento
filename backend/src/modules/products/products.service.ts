import prisma from '../../config/database';
import fs from 'fs';
import path from 'path';

const INCLUDE_RELATIONS = { category: true, unit: true };

export const ProductsService = {
  async findAll(page: number, limit: number) {
    const [data, total] = await Promise.all([
      prisma.product.findMany({
        include: INCLUDE_RELATIONS,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count(),
    ]);
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async findActive() {
    return prisma.product.findMany({
      where: { active: true },
      include: INCLUDE_RELATIONS,
      orderBy: { name: 'asc' },
    });
  },

  async create(data: {
    name: string; price: number; categoryId: number; description: string;
    unitId: number; minQty: number; maxQty: number; photo: string | null;
  }) {
    return prisma.product.create({ data, include: INCLUDE_RELATIONS });
  },

  async update(id: number, data: Record<string, unknown>, newPhoto?: string) {
    if (newPhoto) {
      const old = await prisma.product.findUnique({ where: { id } });
      if (old?.photo) {
        const oldPath = path.join(__dirname, '../../../uploads', old.photo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.photo = newPhoto;
    }
    return prisma.product.update({ where: { id }, data, include: INCLUDE_RELATIONS });
  },

  async deactivate(id: number) {
    return prisma.product.update({ where: { id }, data: { active: false } });
  },
};
