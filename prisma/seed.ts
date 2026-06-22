import { PrismaClient } from '@prisma/client';
import { DEFAULT_PERMISSIONS } from '../src/shared/constants/permissions';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Seed default permissions globally
  let count = 0;
  for (const perm of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: {
        name: perm.name,
        resource: perm.resource,
        action: perm.action,
        category: perm.category
      }
    });
    count++;
  }

  console.log(`Successfully seeded ${count} permissions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
