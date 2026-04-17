import prisma from '../../config/database';

export const CategoriesService = {
  async findAll() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  },

  async create(name: string) {
    const exists = await prisma.category.findUnique({ where: { name } });
    if (exists) throw new Error('CATEGORY_EXISTS');
    return prisma.category.create({ data: { name } });
  },

  async update(id: number, fields: { name?: string; active?: boolean }) {
    const data: Record<string, unknown> = {};
    if (fields.name !== undefined) data.name = fields.name;
    if (fields.active !== undefined) data.active = fields.active;
    return prisma.category.update({ where: { id }, data });
  },

  async deactivate(id: number) {
    return prisma.category.update({ where: { id }, data: { active: false } });
  },
};
