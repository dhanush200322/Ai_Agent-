const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findUnique({
    where: { email: 'hacker@evilcorp.com' },
    include: { role: true }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  const perms = ['agent:create', 'agent:view', 'agent:update', 'agent:delete'];

  for (const p of perms) {
    const perm = await prisma.permission.upsert({
      where: { name: p },
      update: {},
      create: { name: p, description: p, category: 'agent', resource: 'agent', action: p.split(':')[1] }
    });

    await prisma.role.update({
      where: { id: user.role.id },
      data: {
        permissions: {
          connect: { id: perm.id }
        }
      }
    });
  }

  console.log('Fixed permissions!');
}

run().catch(console.error).finally(() => prisma.$disconnect());
