import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

const queue = new Queue("test-queue", { connection: connection as any });

new Worker(
  "test-queue",
  async (job) => {
    console.log("Processing:", job.data);
  },
  { connection: connection as any }
);

(async () => {
  await queue.add("hello", {
    message: "BullMQ Working",
  });

  console.log("Job Added");
})();