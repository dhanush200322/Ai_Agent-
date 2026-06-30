const { PrismaClient } = require('@prisma/client');
const { DEFAULT_PERMISSIONS } = require('./dist/shared/constants/permissions');
const prisma = new PrismaClient();

async function fixPermissions() {
  console.log('Fixing permissions for all Owner and Admin roles...');
  
  // 1. Ensure all default permissions exist in DB
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
  
  console.log(`Ensured ${permissionIds.length} permissions exist in DB.`);

  // 2. Find all Owner and Admin roles
  const roles = await prisma.role.findMany({
    where: {
      name: { in: ['Owner', 'Admin'] }
    },
    include: { permissions: true }
  });
  
  console.log(`Found ${roles.length} Owner/Admin roles.`);

  // 3. Attach all default permissions to these roles
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
    } else {
      console.log(`Role ${role.name} (${role.id}) already has all permissions.`);
    }
  }

  console.log('Permissions fixed successfully.');
}

fixPermissions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
