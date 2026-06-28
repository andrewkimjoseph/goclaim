import { Queue, type ConnectionOptions } from "bullmq";

function parseRedisUrl(raw: string): {
  connection: ConnectionOptions;
  hostForLog: string;
} {
  const trimmed = raw.trim();
  const parsed = new URL(trimmed);
  const host = parsed.hostname;
  const port = parsed.port ? Number(parsed.port) : 6379;

  if (!host || !parsed.password) {
    throw new Error(
      "UPSTASH_REDIS_URL is malformed — copy the full rediss:// URL from Upstash → Redis → Connect."
    );
  }

  return {
    hostForLog: `${parsed.protocol}//${host}:${port}`,
    connection: {
      host,
      port,
      username: parsed.username || "default",
      password: decodeURIComponent(parsed.password),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      connectTimeout: 30_000,
      tls: {},
      retryStrategy: (times) => {
        if (times > 20) return null;
        return Math.min(times * 500, 5_000);
      },
      reconnectOnError: (err) => {
        const msg = err.message;
        return (
          msg.includes("ECONNRESET") ||
          msg.includes("ETIMEDOUT") ||
          msg.includes("READONLY")
        );
      },
    },
  };
}

let cachedConnection: ConnectionOptions | null = null;
let cachedHostForLog: string | null = null;

function ensureRedisConfig(): void {
  if (cachedConnection) return;

  const url = process.env.UPSTASH_REDIS_URL;
  if (!url) {
    throw new Error("Missing UPSTASH_REDIS_URL");
  }

  const parsed = parseRedisUrl(url);
  cachedConnection = parsed.connection;
  cachedHostForLog = parsed.hostForLog;
}

export function getRedisConnection(): ConnectionOptions {
  ensureRedisConfig();
  return cachedConnection!;
}

export const CLAIM_QUEUE_NAME = "claimQueue";

let claimQueue: Queue | null = null;

export function getClaimQueue(): Queue {
  if (!claimQueue) {
    claimQueue = new Queue(CLAIM_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: "fixed", delay: 600_000 },
        removeOnComplete: { count: 100, age: 86_400 },
        removeOnFail: { count: 50, age: 604_800 },
      },
    });
  }
  return claimQueue;
}

export type ClaimJobData = {
  userId: string;
  waveIndex?: number;
};

export const WAVE_SIZE = 50;
export const INTER_WAVE_DELAY_MS = 2000;

export async function enqueueClaimWaves(userIds: string[]): Promise<{
  enqueued: number;
  waves: number;
}> {
  const queue = getClaimQueue();
  const waves: string[][] = [];
  for (let i = 0; i < userIds.length; i += WAVE_SIZE) {
    waves.push(userIds.slice(i, i + WAVE_SIZE));
  }

  let enqueued = 0;
  for (let waveIndex = 0; waveIndex < waves.length; waveIndex++) {
    const wave = waves[waveIndex];
    await queue.addBulk(
      wave.map((userId) => ({
        name: "process-claim",
        data: { userId, waveIndex } satisfies ClaimJobData,
      }))
    );
    enqueued += wave.length;
    if (waveIndex < waves.length - 1) {
      await new Promise((r) => setTimeout(r, INTER_WAVE_DELAY_MS));
    }
  }

  return { enqueued, waves: waves.length };
}

/** Log-safe host for startup diagnostics (no password). */
export function getRedisHostForLog(): string {
  const url = process.env.UPSTASH_REDIS_URL;
  if (!url) return "(missing)";

  if (cachedHostForLog) return cachedHostForLog;

  try {
    return parseRedisUrl(url).hostForLog;
  } catch {
    return "(invalid URL)";
  }
}
