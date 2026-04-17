import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  const adminExists = await prisma.user.findUnique({ where: { email: 'admin@admin.com' } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@admin.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
      },
    });
    console.log('✅ Admin criado com sucesso');
  }

  const utencilios = await prisma.category.upsert({ where: { name: 'Utencílios Domésticos' }, update: {}, create: { name: 'Utencílios Domésticos' } });
  const decoracao = await prisma.category.upsert({ where: { name: 'Decoração' }, update: {}, create: { name: 'Decoração' } });
  const papelaria = await prisma.category.upsert({ where: { name: 'Papelaria' }, update: {}, create: { name: 'Papelaria' } });

  const un = await prisma.unit.upsert({ where: { name: 'Unidade' }, update: {}, create: { name: 'Unidade' } });
  await prisma.unit.upsert({ where: { name: 'Pacote' }, update: {}, create: { name: 'Pacote' } });
  const conj = await prisma.unit.upsert({ where: { name: 'Conjunto' }, update: {}, create: { name: 'Conjunto' } });

  const pCount = await prisma.product.count();
  if (pCount === 0) {
    await prisma.product.createMany({
      data: [
        { name: 'Jogo de Copos (6 un)', price: 45.90, categoryId: utencilios.id, description: 'Conjunto de copos de vidro resistente', unitId: conj.id, minQty: 1, maxQty: 50 },
        { name: 'Porta Retrato Moderno', price: 29.90, categoryId: decoracao.id, description: 'Porta retrato em metal e vidro 10x15', unitId: un.id, minQty: 1, maxQty: 100 },
        { name: 'Caderno Universitário 10 Matérias', price: 18.50, categoryId: papelaria.id, description: 'Capa dura, 200 folhas estampa sortida', unitId: un.id, minQty: 2, maxQty: 200 },
      ],
    });
    console.log('✅ Produtos de exemplo criados');
  }

  console.log('🎉 Seed concluído!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
