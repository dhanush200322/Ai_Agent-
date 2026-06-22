const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const adminRole = await prisma.role.findFirst({ where: { name: 'admin' } });
  if (adminRole) {
    try {
      await prisma.permission.create({
        data: {
          resource: 'chat',
          action: 'create',
          description: 'Create chat',
          roleId: adminRole.id
        }
      });
      console.log('Permission added!');
    } catch (err) {
      console.log('Permission may already exist:', err.message);
    }
  }
  await prisma.$disconnect();
}
run();
