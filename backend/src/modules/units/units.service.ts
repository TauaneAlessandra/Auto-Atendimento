import prisma from '../../config/database';

export const UnitsService = {
  async findAll() {
    return prisma.unit.findMany({ orderBy: { name: 'asc' } });
  },

  async create(name: string) {
    const exists = await prisma.unit.findUnique({ where: { name } });
    if (exists) throw new Error('UNIT_EXISTS');
    return prisma.unit.create({ data: { name } });
  },

  async update(id: number, fields: { name?: string; active?: boolean }) {
    const data: Record<string, unknown> = {};
    if (fields.name !== undefined) data.name = fields.name;
    if (fields.active !== undefined) data.active = fields.active;
    return prisma.unit.update({ where: { id }, data });
  },

  async deactivate(id: number) {
    return prisma.unit.update({ where: { id }, data: { active: false } });
  },
};
