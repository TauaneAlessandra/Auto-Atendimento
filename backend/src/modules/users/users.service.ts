import bcrypt from 'bcryptjs';
import prisma from '../../config/database';

const SELECT_FIELDS = { id: true, name: true, email: true, role: true, active: true, createdAt: true };

export const UsersService = {
  async findAll() {
    return prisma.user.findMany({ select: SELECT_FIELDS, orderBy: { createdAt: 'desc' } });
  },

  async create(data: { name: string; email: string; password: string; role: string }) {
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new Error('EMAIL_TAKEN');
    const hashed = await bcrypt.hash(data.password, 10);
    return prisma.user.create({ data: { ...data, password: hashed }, select: SELECT_FIELDS });
  },

  async update(id: number, fields: { name?: string; email?: string; password?: string; role?: string; active?: boolean }) {
    const data: Record<string, unknown> = {};
    if (fields.name !== undefined) data.name = fields.name;
    if (fields.email !== undefined) data.email = fields.email;
    if (fields.role !== undefined) data.role = fields.role;
    if (fields.active !== undefined) data.active = fields.active;
    if (fields.password) data.password = await bcrypt.hash(fields.password, 10);
    return prisma.user.update({ where: { id }, data, select: SELECT_FIELDS });
  },

  async deactivate(id: number) {
    return prisma.user.update({ where: { id }, data: { active: false } });
  },
};
