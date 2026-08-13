import { createServer } from "node:http";
import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { extractPdfText, getDatabase, log, persistImportResult, readStoredObject } from "@source-blendr/shared";
import { normalizePdfSource } from "../../../packages/scrapers/src/pdf.js";
import { canClaimImportJob, workerHealth } from "./import-jobs.js";
import { collectWebsiteSource } from "./website-collector.js";
import { collectRenderedPage } from "./browser.js";
import { assertPublicHttpUrl, fetchPublic, robotsAllows } from "./url-security.js";

type ImportPayload = {
  jobId: string;
  workspaceId: string;
  sourceType: "website" | "pdf";
  sourceUri: string;
};

type SourcePayload = Record<string, unknown>;

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error("REDIS_URL_required");

const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
let shuttingDown = false;
const worker = new Worker<ImportPayload>("source-blendr-imports", async (queueJob) => {
  const { jobId, workspaceId, sourceUri } = queueJob.data;
  const database = getDatabase();
  const attemptsStarted = queueJob.attemptsMade + 1;
  const claimableStatuses = ["queued", "processing"].filter((status) => canClaimImportJob(status, attemptsStarted));
  const accepted = await database.importJob.updateMany({
    where: { id: jobId, workspaceId, status: { in: claimableStatuses } },
    data: { status: "processing", attempt: attemptsStarted, errorCode: null },
  });
  if (!accepted.count) return;
  await database.importJobEvent.create({ data: { jobId, workspaceId, type: "processing", detail: { attempt: attemptsStarted } } });

  try {
    const payload = queueJob.data.sourceType === "pdf"
      ? await collectPdf(workspaceId, sourceUri)
      : await collectWebsite(workspaceId, sourceUri);
    await persistImportResult({ jobId, workspaceId, sourceType: queueJob.data.sourceType, sourceUri, payload });
  } catch (error) {
    const failed = await database.importJob.updateMany({
      where: { id: jobId, workspaceId, status: { not: "canceled" } },
      data: { status: "failed", errorCode: error instanceof Error ? error.message : "worker_failure" },
    });
    if (failed.count) await database.importJobEvent.create({ data: { jobId, workspaceId, type: "failed" } });
    throw error;
  }
}, { connection, concurrency: Number(process.env.WORKER_CONCURRENCY ?? 2) });

worker.on("completed", (job) => log("info", "import_job_completed", { jobId: job.id, workspaceId: job.data.workspaceId, attempt: job.attemptsMade + 1 }));
worker.on("failed", (job, error) => log("error", "import_job_failed", { jobId: job?.id, workspaceId: job?.data.workspaceId, attempt: (job?.attemptsMade ?? 0) + 1, error: error.message }));

const port = Number(process.env.PORT ?? 8080);
const healthServer = createServer(async (request, response) => {
  if (request.url !== "/health") {
    response.writeHead(404).end();
    return;
  }
  const health = workerHealth({ workerRunning: worker.isRunning(), redisStatus: connection.status, shuttingDown });
  response.writeHead(health.status === "ready" ? 200 : 503, { "content-type": "application/json" });
  response.end(JSON.stringify(health));
}).listen(port, () => log("info", "worker_health_listening", { port }));

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  log("info", "worker_shutdown_started", { signal });
  healthServer.close();
  await worker.close();
  await connection.quit();
  log("info", "worker_shutdown_completed", { signal });
}

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.once(signal, () => void shutdown(signal));
}

async function collectWebsite(workspaceId: string, sourceUri: string): Promise<SourcePayload> {
  const url = await assertPublicHttpUrl(sourceUri);
  const publicFetch = (target: string | URL, init?: RequestInit) => fetchPublic(target, init);
  const robotsResponse = await publicFetch(new URL("/robots.txt", url), { signal: AbortSignal.timeout(5_000) });
  if (robotsResponse.ok && !robotsAllows(await robotsResponse.text(), url.pathname)) throw new Error("source_robots_forbidden");
  return collectWebsiteSource(workspaceId, url.toString(), {
    fetchImpl: publicFetch,
    renderPage: (target: string) => collectRenderedPage(target, { validateUrl: assertPublicHttpUrl }),
  });
}

async function collectPdf(workspaceId: string, sourceUri: string): Promise<SourcePayload> {
  const bytes = await readStoredObject(sourceUri, workspaceId);
  const fileName = new URL(sourceUri).pathname.split("/").at(-1) ?? "catalog.pdf";
  const normalized = normalizePdfSource({ workspaceId, fileName, text: extractPdfText(bytes) });
  return {
    fileName: normalized.fileName,
    recordCount: normalized.records.length,
    records: normalized.records,
  };
}
