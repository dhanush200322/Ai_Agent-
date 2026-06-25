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

  // Create a default organization for the providers
  const org = await prisma.organization.upsert({
    where: { slug: 'system-default-org' },
    update: {},
    create: {
      name: 'System Default Org',
      slug: 'system-default-org',
    }
  });

  // Seed default AI Providers
  const providers = ['openai', 'anthropic', 'gemini', 'groq', 'openrouter', 'ollama'];
  let providerCount = 0;
  for (const name of providers) {
    await prisma.aIProvider.upsert({
      where: {
        organizationId_name: {
          organizationId: org.id,
          name: name
        }
      },
      update: {},
      create: {
        organizationId: org.id,
        name: name,
        isActive: true
      }
    });
    providerCount++;
  }
  console.log(`Successfully seeded ${providerCount} AI Providers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
