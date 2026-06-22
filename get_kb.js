const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const kb = await prisma.knowledgeBase.findFirst();
    if (kb) {
      console.log('KB_ID:', kb.id);
    } else {
      console.log('NO KNOWLEDGE BASE FOUND.');
    }
  } finally {
    await prisma.$disconnect();
  }
}
run();
