const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.findFirst();
    if (user) {
      const token = jwt.sign(
        { userId: user.id }, 
        process.env.JWT_ACCESS_SECRET, 
        { expiresIn: '1h' }
      );
      console.log('TOKEN:', token);
    } else {
      console.log('NO USER FOUND');
    }
  } finally {
    await prisma.$disconnect();
  }
}
run();
