import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:2122@localhost:5432/enterprise_ai_agent?schema=public"
    }
  }
});

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("Successfully queried User table. Result:", user);
  } catch (error) {
    console.error("Error querying User:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
