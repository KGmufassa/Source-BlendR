import { Queue } from "bullmq";
import { Redis } from "ioredis";

export type ImportQueuePayload = {
  jobId: string;
  workspaceId: string;
  sourceType: "website" | "pdf";
  sourceUri: string;
};

let queue: Queue | undefined;

export function getImportQueue(): Queue<ImportQueuePayload> {
  if (queue) return queue;
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) throw new Error("REDIS_URL_required");
  const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
  queue = new Queue("source-blendr-imports", { connection });
  return queue;
}
