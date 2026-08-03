import { getDatabase } from "@source-blendr/shared";
import { apiError } from "@/lib/http";
import { getWorkspaceContext } from "@/lib/workspace-context";

export async function GET(_: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const context = await getWorkspaceContext();
    const { jobId } = await params;
    const job = await getDatabase().importJob.findFirst({
      where: { id: jobId, workspaceId: context.workspaceId },
      include: { events: { orderBy: { createdAt: "asc" } } },
    });
    if (!job) return Response.json({ error: { code: "not_found", message: "Import job not found." } }, { status: 404 });
    return Response.json({ data: job });
  } catch (error) {
    return apiError(error);
  }
}
