import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function patch() {
  console.log('Patching RBAC Database...');

  // 1. Idempotently create the missing permission
  const perm = await prisma.permission.upsert({
    where: { name: 'organization:view' },
    update: {},
    create: {
      name: 'organization:view',
      resource: 'organization',
      action: 'view',
      category: 'Organization'
    }
  });
  console.log('Permission ensured:', perm.name);

  // 2. Attach to all 'Owner' roles in the system
  const owners = await prisma.role.findMany({
    where: { name: 'Owner' },
    include: { permissions: true }
  });

  let updatedCount = 0;
  for (const owner of owners) {
    const hasPerm = owner.permissions.some(p => p.name === 'organization:view');
    if (!hasPerm) {
      await prisma.role.update({
        where: { id: owner.id },
        data: {
          permissions: {
            connect: { id: perm.id }
          }
        }
      });
      updatedCount++;
    }
  }

  console.log(`Patch complete. Attached 'organization:view' to ${updatedCount} Owner roles.`);
}

patch()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
