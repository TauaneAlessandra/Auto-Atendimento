import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { validateBody, createUserSchema, updateUserSchema } from '../../lib/validation';

export const listUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await UsersService.findAll());
  } catch (error) {
    console.error('[users.listUsers]', error);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = validateBody(createUserSchema, req.body);
    const user = await UsersService.create(data);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'EMAIL_TAKEN') {
        res.status(400).json({ message: 'Email já cadastrado' });
        return;
      }
      const err = error as Error & { statusCode?: number };
      if (err.statusCode === 400) {
        res.status(400).json({ message: err.message });
        return;
      }
    }
    console.error('[users.createUser]', error);
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }
    const data = validateBody(updateUserSchema, req.body);
    const user = await UsersService.update(id, data);
    res.json(user);
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    if (err.statusCode === 400) {
      res.status(400).json({ message: err.message });
      return;
    }
    console.error('[users.updateUser]', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
};

export const removeUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }
    await UsersService.deactivate(id);
    res.json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    console.error('[users.removeUser]', error);
    res.status(500).json({ message: 'Erro ao remover usuário' });
  }
};
