import { getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { requireSameOrigin } from "@/lib/request-security";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { toJobCandidate } from "@/lib/job-candidates";

const pageSize = 20;

const categoryEditSchema = z.object({
  candidateIds: z.array(z.string().min(1)).min(1).max(500),
  category: z.string().trim().min(1).max(120),
});

function payloadRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const context = await getWorkspaceContext();
    const { jobId } = await params;
    const url = new URL(request.url);
    const query = url.searchParams.get("query")?.trim().slice(0, 200) ?? "";
    const rawPage = url.searchParams.get("page") ?? "1";
    const requestedPage = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
    const database = getDatabase();
    const job = await database.importJob.findFirst({ where: { id: jobId, workspaceId: context.workspaceId }, include: { vendor: { select: { name: true } }, session: { select: { id: true } } } });
    if (!job) throw new Error("import_job_not_found");
    if (!job.session) return Response.json({ data: { candidates: [], total: 0, page: 1, pageCount: 1 } });
    const where = {
      workspaceId: context.workspaceId,
      sessionId: job.session.id,
      ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" as const } }, { sku: { contains: query, mode: "insensitive" as const } }] } : {}),
    };
    const total = await database.candidateItem.count({ where });
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, requestedPage), pageCount);
    const candidates = await database.candidateItem.findMany({ where, orderBy: { updatedAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize });
    return Response.json({ data: { candidates: candidates.map((candidate) => toJobCandidate(candidate, job.vendor?.name ?? "Unassigned", job.sourceUri)), total, page, pageCount } });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const { jobId } = await params;
    const input = categoryEditSchema.parse(await request.json());
    const candidateIds = [...new Set(input.candidateIds)];
    const database = getDatabase();
    const session = await database.discoverySession.findFirst({ where: { importJobId: jobId, workspaceId: context.workspaceId }, select: { id: true } });
    if (!session) throw new Error("discovery_session_not_found");
    const candidates = await database.candidateItem.findMany({ where: { workspaceId: context.workspaceId, sessionId: session.id, id: { in: candidateIds } }, select: { id: true, payload: true } });
    if (candidates.length !== candidateIds.length) throw new Error("candidate_selection_invalid");
    await database.$transaction(candidates.map((candidate) => database.candidateItem.update({
      where: { id: candidate.id },
      data: { payload: { ...payloadRecord(candidate.payload), category: input.category }, state: "updated" },
    })));
    return Response.json({ data: { updated: candidates.length, category: input.category } });
  } catch (error) {
    return apiError(error);
  }
}
