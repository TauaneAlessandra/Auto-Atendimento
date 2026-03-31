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
    console.log('✅ Admin criado: admin@admin.com / admin123');
  }

  const ti = await prisma.serviceType.upsert({ where: { name: 'TI' }, update: {}, create: { name: 'TI' } });
  const infra = await prisma.serviceType.upsert({ where: { name: 'Infraestrutura' }, update: {}, create: { name: 'Infraestrutura' } });

  const un = await prisma.unit.upsert({ where: { name: 'Unidade' }, update: {}, create: { name: 'Unidade' } });
  const hr = await prisma.unit.upsert({ where: { name: 'Hora' }, update: {}, create: { name: 'Hora' } });
  const mes = await prisma.unit.upsert({ where: { name: 'Mês' }, update: {}, create: { name: 'Mês' } });

  const pCount = await prisma.product.count();
  if (pCount === 0) {
    await prisma.product.createMany({
      data: [
        { name: 'Suporte Técnico', price: 150, serviceTypeId: ti.id, description: 'Suporte técnico presencial ou remoto', unitId: hr.id, minQty: 1, maxQty: 40 },
        { name: 'Instalação de Software', price: 200, serviceTypeId: ti.id, description: 'Instalação e configuração de software', unitId: un.id, minQty: 1, maxQty: 50 },
        { name: 'Manutenção de Rede', price: 500, serviceTypeId: infra.id, description: 'Manutenção e configuração de rede', unitId: mes.id, minQty: 1, maxQty: 12 },
      ],
    });
    console.log('✅ Produtos de exemplo criados');
  }

  console.log('🎉 Seed concluído!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
