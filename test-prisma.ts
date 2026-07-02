import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:postgres@localhost:5434/postgres?schema=public"
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
