import { getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getImportQueue } from "@/lib/import-queue";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { requireSameOrigin } from "@/lib/request-security";

export async function GET(_: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const context = await getWorkspaceContext();
    const { jobId } = await params;
    const job = await getDatabase().importJob.findFirst({
      where: { id: jobId, workspaceId: context.workspaceId },
      include: { events: { orderBy: { createdAt: "asc" } }, session: { select: { id: true } } },
    });
    if (!job) return Response.json({ error: { code: "not_found", message: "Import job not found." } }, { status: 404 });
    return Response.json({ data: job });
  } catch (error) {
    return apiError(error);
  }
}

const actionSchema = z.object({ action: z.enum(["retry", "cancel"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const { jobId } = await params;
    const { action } = actionSchema.parse(await request.json());
    const database = getDatabase();
    const job = await database.importJob.findFirst({ where: { id: jobId, workspaceId: context.workspaceId } });
    if (!job) throw new Error("import_job_not_found");

    if (action === "cancel") {
      if (!["queued", "processing"].includes(job.status)) throw new Error("import_job_state_invalid");
      await database.$transaction([
        database.importJob.updateMany({ where: { id: jobId, workspaceId: context.workspaceId }, data: { status: "canceled", canceledAt: new Date() } }),
        database.importJobEvent.create({ data: { jobId, workspaceId: context.workspaceId, type: "canceled", detail: { actorUserId: context.userId } } }),
      ]);
    } else {
      if (!["failed", "canceled"].includes(job.status)) throw new Error("import_job_state_invalid");
      const attempt = job.attempt + 1;
      await database.$transaction([
        database.importJob.updateMany({ where: { id: jobId, workspaceId: context.workspaceId }, data: { status: "queued", canceledAt: null, errorCode: null, attempt } }),
        database.importJobEvent.create({ data: { jobId, workspaceId: context.workspaceId, type: "retried", detail: { attempt, actorUserId: context.userId } } }),
      ]);
      await getImportQueue().add(job.sourceType === "pdf" ? "pdf_extract" : "website_scrape", { jobId, workspaceId: context.workspaceId, sourceType: job.sourceType as "website" | "pdf", sourceUri: job.sourceUri }, { jobId: `${jobId}-attempt-${attempt}`, attempts: 3, backoff: { type: "exponential", delay: 1_000 } });
    }
    return GET(request, { params: Promise.resolve({ jobId }) });
  } catch (error) {
    return apiError(error);
  }
}
