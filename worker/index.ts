import { Worker } from "bullmq";
import {
  CLAIM_QUEUE_NAME,
  getRedisConnection,
  getRedisHostForLog,
} from "@/lib/queue";
import { processClaim } from "./jobs/processClaim";

const connection = getRedisConnection();

const concurrency = Number(process.env.WORKER_CONCURRENCY ?? "5");
const drainDelay = Number(process.env.WORKER_DRAIN_DELAY_SEC ?? "120");

if (
  process.env.NODE_ENV === "development" &&
  getRedisHostForLog().includes("upstash.io")
) {
  console.warn(
    "[worker] Running in development against Upstash — this adds idle Redis polling. Prefer `npm run claim-test` unless testing the queue."
  );
}

const worker = new Worker(
  CLAIM_QUEUE_NAME,
  async (job) => {
    await processClaim(job.data);
  },
  {
    connection,
    concurrency,
    drainDelay,
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
  `[worker] GoClaim claim worker starting (redis: ${getRedisHostForLog()}, concurrency: ${concurrency}, drainDelay: ${drainDelay}s)`
);

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  console.error("[worker] unhandled rejection:", reason);
});
