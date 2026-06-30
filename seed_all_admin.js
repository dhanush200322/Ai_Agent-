const { PrismaClient } = require('@prisma/client');
const { DEFAULT_PERMISSIONS } = require('./dist/shared/constants/permissions');
const prisma = new PrismaClient();

async function fixPermissions() {
  console.log('Fixing permissions for all roles containing Admin or Owner...');
  
  const permissionIds = [];
  for (const perm of DEFAULT_PERMISSIONS) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: {
        name: perm.name,
        resource: perm.resource,
        action: perm.action,
        category: perm.category
      }
    });
    permissionIds.push(p.id);
  }

  const roles = await prisma.role.findMany({
    where: {
      OR: [
        { name: { contains: 'Admin' } },
        { name: { contains: 'Owner' } }
      ]
    },
    include: { permissions: true }
  });
  
  for (const role of roles) {
    const existingPermIds = role.permissions.map(p => p.id);
    const missingPermIds = permissionIds.filter(id => !existingPermIds.includes(id));
    
    if (missingPermIds.length > 0) {
      console.log(`Role ${role.name} (${role.id}) is missing ${missingPermIds.length} permissions. Adding...`);
      await prisma.role.update({
        where: { id: role.id },
        data: {
          permissions: {
            connect: missingPermIds.map(id => ({ id }))
          }
        }
      });
    }
  }
  console.log('Done fixing all Admin/Owner roles.');
}

fixPermissions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
