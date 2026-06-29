const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findUnique({
    where: { email: 'hacker@evilcorp.com' },
    include: { role: { include: { permissions: true } } }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  // Create a brand new role so that PermissionCache (which keys by roleId) cache misses!
  const newRole = await prisma.role.create({
    data: {
      name: user.role.name + '_NEW_' + Date.now(),
      description: user.role.description,
      organizationId: user.role.organizationId,
      permissions: {
        connect: user.role.permissions.map(p => ({ id: p.id }))
      }
    }
  });

  // Assign the new role to the user
  await prisma.user.update({
    where: { id: user.id },
    data: { roleId: newRole.id }
  });

  console.log('Successfully switched user to new role to bypass in-memory PermissionCache!');
}

run().catch(console.error).finally(() => prisma.$disconnect());
