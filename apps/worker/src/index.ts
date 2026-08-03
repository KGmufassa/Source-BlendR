import { createServer } from "node:http";
import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
import { createHash } from "node:crypto";
import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { getDatabase, log } from "@source-blendr/shared";

type ImportPayload = {
  jobId: string;
  workspaceId: string;
  sourceUri: string;
};

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error("REDIS_URL_required");

const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
const worker = new Worker<ImportPayload>("source-blendr-imports", async (queueJob) => {
  const { jobId, workspaceId, sourceUri } = queueJob.data;
  const database = getDatabase();
  await database.importJob.updateMany({ where: { id: jobId, workspaceId }, data: { status: "processing" } });
  await database.importJobEvent.create({ data: { jobId, workspaceId, type: "processing" } });

  try {
    const payload = await collectWebsite(sourceUri);
    const sourceHash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    await database.$transaction([
      database.normalizedSourceRecord.upsert({
        where: { workspaceId_sourceHash: { workspaceId, sourceHash } },
        update: { payload },
        create: { workspaceId, jobId, sourceHash, sourceType: "website", sourceUri, payload },
      }),
      database.importJob.update({ where: { id: jobId }, data: { status: "completed" } }),
      database.importJobEvent.create({ data: { jobId, workspaceId, type: "completed" } }),
    ]);
  } catch (error) {
    await database.importJob.updateMany({
      where: { id: jobId, workspaceId },
      data: { status: "failed", errorCode: error instanceof Error ? error.message : "worker_failure" },
    });
    await database.importJobEvent.create({ data: { jobId, workspaceId, type: "failed" } });
    throw error;
  }
}, { connection, concurrency: Number(process.env.WORKER_CONCURRENCY ?? 2) });

worker.on("completed", (job) => log("info", "import_job_completed", { jobId: job.id }));
worker.on("failed", (job, error) => log("error", "import_job_failed", { jobId: job?.id, error: error.message }));

const port = Number(process.env.PORT ?? 8080);
createServer(async (request, response) => {
  if (request.url !== "/health") {
    response.writeHead(404).end();
    return;
  }
  const ready = worker.isRunning() && connection.status === "ready";
  response.writeHead(ready ? 200 : 503, { "content-type": "application/json" });
  response.end(JSON.stringify({ status: ready ? "ready" : "not_ready" }));
}).listen(port, () => log("info", "worker_health_listening", { port }));

async function collectWebsite(sourceUri: string): Promise<Record<string, string>> {
  const url = new URL(sourceUri);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("source_protocol_invalid");
  const address = isIP(url.hostname) ? url.hostname : (await lookup(url.hostname)).address;
  if (isPrivateAddress(address)) throw new Error("source_address_forbidden");

  // lazy: native fetch covers the MVP collector; replace with Playwright when representative sites require browser execution.
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`source_http_${response.status}`);
  const html = (await response.text()).slice(0, 2_000_000);
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? url.hostname;
  return { url: url.toString(), title, html };
}

function isPrivateAddress(address: string): boolean {
  return address === "::1"
    || address.startsWith("127.")
    || address.startsWith("10.")
    || address.startsWith("192.168.")
    || /^172\\.(1[6-9]|2\\d|3[01])\\./.test(address)
    || address.startsWith("169.254.")
    || address.startsWith("fc")
    || address.startsWith("fd")
    || address.startsWith("fe80:");
}
