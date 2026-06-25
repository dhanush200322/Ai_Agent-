import { PrismaClient } from '@prisma/client';
import { RedisConnectionManager } from '../src/config/redis';
import os from 'os';

const prisma = new PrismaClient();

export async function runBenchmarks() {
  console.log('🏁 Starting Database & Redis Latency Benchmarks...');
  const results: any = {};

  // 1. Database Benchmarking
  try {
    const dbResults: any = {};
    const startSelect = Date.now();
    await prisma.user.findFirst();
    dbResults.selectLatencyMs = Date.now() - startSelect;

    // Test Bulk & Single inserts/updates/deletes on temporary logs or organizations
    const startInsert = Date.now();
    const tempOrg = await prisma.organization.create({
      data: {
        name: 'Benchmark Org ' + Date.now(),
        slug: 'bench-org-' + Date.now(),
      }
    });
    dbResults.insertLatencyMs = Date.now() - startInsert;

    const startUpdate = Date.now();
    await prisma.organization.update({
      where: { id: tempOrg.id },
      data: { name: 'Benchmark Org Updated' }
    });
    dbResults.updateLatencyMs = Date.now() - startUpdate;

    const startDelete = Date.now();
    await prisma.organization.delete({
      where: { id: tempOrg.id }
    });
    dbResults.deleteLatencyMs = Date.now() - startDelete;

    results.database = { status: 'PASS', ...dbResults };
    console.log('✅ DB Benchmark Passed:', dbResults);
  } catch (err: any) {
    results.database = { status: 'FAIL', error: err.message };
    console.error('❌ DB Benchmark Failed:', err);
  }

  // 2. Redis Benchmarking
  try {
    const redisResults: any = {};
    const client = RedisConnectionManager.getClient();

    const startSet = Date.now();
    await client.set('bench:key', 'value');
    redisResults.setLatencyMs = Date.now() - startSet;

    const startGet = Date.now();
    await client.get('bench:key');
    redisResults.getLatencyMs = Date.now() - startGet;

    const startExpire = Date.now();
    await client.expire('bench:key', 10);
    redisResults.expireLatencyMs = Date.now() - startExpire;

    await client.del('bench:key');
    results.redis = { status: 'PASS', ...redisResults };
    console.log('✅ Redis Benchmark Passed:', redisResults);
  } catch (err: any) {
    results.redis = { status: 'FAIL', error: err.message };
    console.error('❌ Redis Benchmark Failed:', err);
  }

  // 3. System Metrics
  results.system = {
    cpuModel: os.cpus()[0]?.model || 'Unknown',
    totalMemoryGb: (os.totalmem() / (1024 ** 3)).toFixed(2),
    freeMemoryGb: (os.freemem() / (1024 ** 3)).toFixed(2),
    loadAverage: os.loadavg(),
  };

  await prisma.$disconnect();
  return results;
}

if (require.main === module) {
  runBenchmarks().then(res => console.log(JSON.stringify(res, null, 2)));
}
