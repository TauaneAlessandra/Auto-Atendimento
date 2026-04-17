import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  role: z.enum(['admin', 'chat'], { message: 'Role deve ser admin ou chat' }),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['admin', 'chat']).optional(),
  active: z.boolean().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(200),
  price: z.coerce.number().positive('Preço deve ser maior que zero'),
  categoryId: z.coerce.number().int().positive('Categoria inválida'),
  description: z.string().min(5, 'Descrição deve ter pelo menos 5 caracteres').max(1000),
  unitId: z.coerce.number().int().positive('Unidade inválida'),
  minQty: z.coerce.number().int().min(1, 'Quantidade mínima deve ser pelo menos 1'),
  maxQty: z.coerce.number().int().min(1, 'Quantidade máxima deve ser pelo menos 1'),
}).refine((d) => d.maxQty >= d.minQty, {
  message: 'Quantidade máxima deve ser maior ou igual à mínima',
  path: ['maxQty'],
});

export const createOrderSchema = z.object({
  clientName: z.string().min(2, 'Nome do cliente é obrigatório').max(200),
  phone: z.string().min(8, 'Telefone inválido').max(20),
  responsible: z.string().min(2, 'Responsável é obrigatório').max(200),
  address: z.string().min(5, 'Endereço é obrigatório').max(500),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    qty: z.number().int().min(1, 'Quantidade deve ser pelo menos 1'),
  })).min(1, 'Pelo menos um item é obrigatório'),
});

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message).join('; ');
    const error = new Error(messages) as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }
  return result.data;
}
