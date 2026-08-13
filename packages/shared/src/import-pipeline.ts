import { createHash } from "node:crypto";
import type { Prisma } from "./generated/prisma/client.ts";
import { getDatabase } from "./db.ts";

export type CandidateDraft = {
  name: string;
  sku: string;
  priceCents: number;
  currency: string;
  state: "new" | "conflict";
  payload: Prisma.InputJsonValue;
};

export function buildCandidateDrafts(sourceType: "website" | "pdf", payload: Record<string, unknown>): CandidateDraft[] {
  if (sourceType === "website") {
    const products = Array.isArray(payload.products) ? payload.products.filter(isRecord) : [];
    if (products.length) return products.flatMap(candidateDraftsFromWebsiteProduct);
    const name = text(payload.title) || text(payload.url) || "Discovered website item";
    return [{ name, sku: generatedSku(name), priceCents: 0, currency: "USD", state: "new", payload: jsonValue(payload) }];
  }

  const records = Array.isArray(payload.records) ? payload.records : [];
  return records.slice(0, 5_000).map((record, index) => candidateFromRecord(record, index));
}

function candidateDraftsFromWebsiteProduct(product: Record<string, unknown>): CandidateDraft[] {
  const title = text(product.title) || "Discovered website item";
  const variants = Array.isArray(product.variants) ? product.variants.filter(isRecord) : [];
  if (!variants.length) {
    return [{ name: title, sku: generatedSku(text(product.canonicalUrl) || title), priceCents: 0, currency: "USD", state: "conflict", payload: jsonValue(product) }];
  }
  return variants.map((variant, index) => {
    const variantTitle = text(variant.title);
    const name = variantTitle && variantTitle !== "Default Title" ? `${title} — ${variantTitle}` : title;
    const sku = text(variant.sku).toUpperCase();
    const priceCents = integer(variant.priceCents) ?? 0;
    return {
      name,
      sku: sku || generatedSku(`${text(product.canonicalUrl)}-${text(variant.id) || index}`),
      priceCents: Math.max(0, priceCents),
      currency: "USD",
      state: sku && priceCents >= 0 ? "new" : "conflict",
      payload: jsonValue({ product, variant }),
    };
  });
}

export async function persistImportResult(input: {
  jobId: string;
  workspaceId: string;
  sourceType: "website" | "pdf";
  sourceUri: string;
  payload: Record<string, unknown>;
}): Promise<{ sessionId: string; candidateCount: number }> {
  const database = getDatabase();
  const sourceHash = createHash("sha256").update(JSON.stringify(input.payload)).digest("hex");
  const drafts = buildCandidateDrafts(input.sourceType, input.payload);

  return database.$transaction(async (transaction) => {
    const job = await transaction.importJob.findFirst({ where: { id: input.jobId, workspaceId: input.workspaceId } });
    if (!job) throw new Error("import_job_not_found");
    if (job.status === "canceled") throw new Error("import_job_canceled");

    const source = await transaction.normalizedSourceRecord.upsert({
      where: { workspaceId_sourceHash: { workspaceId: input.workspaceId, sourceHash } },
      update: { payload: jsonValue(input.payload) },
      create: { workspaceId: input.workspaceId, jobId: input.jobId, sourceHash, sourceType: input.sourceType, sourceUri: input.sourceUri, payload: jsonValue(input.payload) },
    });
    const session = await transaction.discoverySession.upsert({
      where: { importJobId: input.jobId },
      update: { status: "open" },
      create: { workspaceId: input.workspaceId, importJobId: input.jobId },
    });

    for (const draft of drafts) {
      await transaction.candidateItem.upsert({
        where: { workspaceId_sessionId_sku: { workspaceId: input.workspaceId, sessionId: session.id, sku: draft.sku } },
        update: { ...draft, sourceRecordId: source.id },
        create: { ...draft, workspaceId: input.workspaceId, sessionId: session.id, sourceRecordId: source.id },
      });
    }
    await transaction.importJob.updateMany({ where: { id: input.jobId, workspaceId: input.workspaceId }, data: { status: "completed", errorCode: null } });
    await transaction.importJobEvent.create({ data: { jobId: input.jobId, workspaceId: input.workspaceId, type: "completed", detail: jsonValue(buildImportCompletionDetail({ sessionId: session.id, candidateCount: drafts.length }, input.payload)) } });
    return { sessionId: session.id, candidateCount: drafts.length };
  });
}

export function buildImportCompletionDetail(result: { sessionId: string; candidateCount: number }, payload: Record<string, unknown>): Record<string, unknown> {
  const checkpoint = isRecord(payload.checkpoint) ? payload.checkpoint : {};
  return {
    ...result,
    ...(text(payload.platform) ? { platform: text(payload.platform) } : {}),
    ...(text(payload.extractionMode) ? { extractionMode: text(payload.extractionMode) } : {}),
    ...(isRecord(checkpoint.counters) ? { counters: checkpoint.counters } : {}),
  };
}

function candidateFromRecord(record: unknown, index: number): CandidateDraft {
  const value = typeof record === "string" ? parseLine(record) : isRecord(record) ? record : {};
  const name = text(value.name) || text(value.title) || `Imported record ${index + 1}`;
  const suppliedSku = text(value.sku).toUpperCase();
  const currency = (text(value.currency) || "USD").toUpperCase();
  const priceCents = integer(value.priceCents) ?? decimalCents(value.price) ?? 0;
  const valid = Boolean(suppliedSku) && /^[A-Z]{3}$/.test(currency) && priceCents >= 0;
  return { name, sku: suppliedSku || generatedSku(`${name}-${index}`), priceCents: Math.max(0, priceCents), currency: /^[A-Z]{3}$/.test(currency) ? currency : "USD", state: valid ? "new" : "conflict", payload: jsonValue(value) };
}

function parseLine(line: string): Record<string, unknown> {
  const [sku, name, price, currency] = line.split("|").map((value) => value.trim());
  return name ? { sku, name, price, currency } : { name: line.trim() };
}

function generatedSku(value: string): string {
  return `DISC-${createHash("sha256").update(value).digest("hex").slice(0, 10).toUpperCase()}`;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function integer(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function decimalCents(value: unknown): number | null {
  const parsed = typeof value === "string" || typeof value === "number" ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
