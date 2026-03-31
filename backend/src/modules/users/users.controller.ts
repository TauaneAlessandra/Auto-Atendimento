import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/database';

const SELECT_FIELDS = { id: true, name: true, email: true, role: true, active: true, createdAt: true };

export const listUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({ select: SELECT_FIELDS, orderBy: { createdAt: 'desc' } });
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      res.status(400).json({ message: 'Todos os campos são obrigatórios' });
      return;
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) { res.status(400).json({ message: 'Email já cadastrado' }); return; }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, role }, select: SELECT_FIELDS });
    res.status(201).json(user);
  } catch {
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, password, role, active } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;
    if (active !== undefined) data.active = active;
    if (password) data.password = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({ where: { id: Number(id) }, data, select: SELECT_FIELDS });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
};

export const removeUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.user.update({ where: { id: Number(id) }, data: { active: false } });
    res.json({ message: 'Usuário desativado com sucesso' });
  } catch {
    res.status(500).json({ message: 'Erro ao remover usuário' });
  }
};
