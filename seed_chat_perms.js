const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addChatPermissions() {
  const permissions = [
    { name: 'chat:create', category: 'Chat', resource: 'chat', action: 'create' },
    { name: 'chat:read', category: 'Chat', resource: 'chat', action: 'read' },
    { name: 'chat:update', category: 'Chat', resource: 'chat', action: 'update' },
    { name: 'chat:delete', category: 'Chat', resource: 'chat', action: 'delete' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }
  console.log('Created chat permissions.');

  const roles = await prisma.role.findMany();
  for (const role of roles) {
    for (const p of permissions) {
      const permRecord = await prisma.permission.findUnique({ where: { name: p.name } });
      
      // check if relation exists
      const roleWithPerms = await prisma.role.findUnique({
        where: { id: role.id },
        include: { permissions: true }
      });
      
      const hasPerm = roleWithPerms.permissions.some(rp => rp.id === permRecord.id);
      if (!hasPerm) {
        await prisma.role.update({
          where: { id: role.id },
          data: {
            permissions: {
              connect: { id: permRecord.id }
            }
          }
        });
      }
    }
  }
  console.log('Assigned chat permissions to all roles.');
}

addChatPermissions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
