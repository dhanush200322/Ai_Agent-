import IORedis from "ioredis";

async function main() {
  const redis = new IORedis({
    host: "localhost",
    port: 6379,
  });

  await redis.set("hello", "enterprise-ai");

  const value = await redis.get("hello");

  console.log(value);

  await redis.quit();
}

main();