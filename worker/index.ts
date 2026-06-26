import { Worker } from "bullmq";
import {
  CLAIM_QUEUE_NAME,
  getRedisConnection,
  getRedisHostForLog,
} from "@/lib/queue";
import { processClaim } from "./jobs/processClaim";

const connection = getRedisConnection();

const worker = new Worker(
  CLAIM_QUEUE_NAME,
  async (job) => {
    await processClaim(job.data);
  },
  {
    connection,
    concurrency: 50,
  }
);

worker.on("ready", () => {
  console.log(`[worker] Redis connected (${getRedisHostForLog()})`);
});

worker.on("error", (err) => {
  console.error("[worker] Redis error:", err.message);
});

worker.on("completed", (job) => {
  console.log(`[worker] completed job ${job.id} for user ${job.data.userId}`);
});

worker.on("failed", (job, err) => {
  console.error(
    `[worker] failed job ${job?.id} for user ${job?.data.userId}:`,
    err.message
  );
});

console.log(
  `[worker] GoClaim claim worker starting (redis: ${getRedisHostForLog()})`
);

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  console.error("[worker] unhandled rejection:", reason);
});
