const { PrismaClient } = require('@prisma/client');
async function test() {
  const urls = [
    'postgresql://nexora_db_q198_user:rXWMUgmnT8bkpVH9gFtZ1pShDKYhiREe@dpg-d92i2k3tqb8s73fh9vcg-a.oregon-postgres.render.com/nexora_db_q198',
    'postgresql://nexora_db_q198_user:rXWMUgmnT8bkpVH9gFtZ1pShDKYhiREe@dpg-d92i2k3tqb8s73fh9vcg-a.oregon-postgres.render.com/nexora_db_q198?sslmode=require',
    'postgresql://nexora_db_q198_user:rXWMUgmnT8bkpVH9gFtZ1pShDKYhiREe@dpg-d92i2k3tqb8s73fh9vcg-a.oregon-postgres.render.com/nexora_db_q198?sslmode=no-verify',
    'postgresql://nexora_db_q198_user:rXWMUgmnT8bkpVH9gFtZ1pShDKYhiREe@dpg-d92i2k3tqb8s73fh9vcg-a.oregon-postgres.render.com/nexora_db_q198?sslmode=disable'
  ];
  for (const url of urls) {
    try {
      console.log('Testing: ' + url.split('?')[1]);
      const prisma = new PrismaClient({ datasources: { db: { url } } });
      await prisma.$connect();
      console.log('✅ SUCCESS');
      await prisma.$disconnect();
    } catch (e) {
      console.log('❌ FAILED: ' + e.message.substring(0, 100));
    }
  }
}
test();
