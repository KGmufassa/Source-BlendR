import { createCategoryJobRequests, normalizeDiscoveredCategories } from "@source-blendr/domain";
import { getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getImportQueue } from "@/lib/import-queue";
import { requireSameOrigin } from "@/lib/request-security";
import { getWorkspaceContext } from "@/lib/workspace-context";

const selectionSchema = z.object({ categoryUrls: z.array(z.url()).min(1).max(50) });

export async function GET(_: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const context = await getWorkspaceContext();
    const { jobId } = await params;
    const source = await getDatabase().normalizedSourceRecord.findFirst({
      where: { jobId, workspaceId: context.workspaceId },
      orderBy: { createdAt: "desc" },
    });
    if (!source) throw new Error("import_source_not_found");
    const payload = source.payload as Record<string, unknown>;
    const categories = normalizeDiscoveredCategories(Array.isArray(payload.categories) ? payload.categories : []);
    return Response.json({ data: { jobId, categories, count: categories.length, truncated: categories.length >= 50 } });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const { jobId } = await params;
    const { categoryUrls } = selectionSchema.parse(await request.json());
    const database = getDatabase();
    const parent = await database.importJob.findFirst({ where: { id: jobId, workspaceId: context.workspaceId }, include: { sources: { orderBy: { createdAt: "desc" }, take: 1 } } });
    if (!parent) throw new Error("import_job_not_found");
    const payload = parent.sources[0]?.payload as Record<string, unknown> | undefined;
    const requests = createCategoryJobRequests({ sourceJobId: jobId, discovered: Array.isArray(payload?.categories) ? payload.categories : [], selectedUrls: categoryUrls });
    const jobs = [];

    for (const category of requests) {
      let job = await database.importJob.findUnique({ where: { workspaceId_idempotencyKey: { workspaceId: context.workspaceId, idempotencyKey: category.idempotencyKey } } });
      if (!job) {
        job = await database.importJob.create({ data: {
          workspaceId: context.workspaceId,
          vendorId: parent.vendorId,
          sourceType: "website",
          sourceUri: category.sourceUri,
          requestedByUserId: context.userId,
          idempotencyKey: category.idempotencyKey,
          events: { create: { workspaceId: context.workspaceId, type: "queued", detail: { sourceJobId: jobId, categoryName: category.name } } },
        } });
        await getImportQueue().add("website_scrape", { jobId: job.id, workspaceId: context.workspaceId, sourceType: "website", sourceUri: category.sourceUri }, { jobId: job.id, attempts: 3, backoff: { type: "exponential", delay: 1_000 } });
      }
      jobs.push(job);
    }
    return Response.json({ data: { sourceJobId: jobId, jobs } }, { status: 202 });
  } catch (error) {
    return apiError(error);
  }
}
