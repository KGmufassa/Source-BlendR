import { getDatabase } from "@source-blendr/shared";
import { apiError } from "@/lib/http";
import { getWorkspaceContext } from "@/lib/workspace-context";

export async function GET(_: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const context = await getWorkspaceContext();
    const { sessionId } = await params;
    const candidates = await getDatabase().candidateItem.findMany({
      where: { workspaceId: context.workspaceId, sessionId },
      orderBy: { updatedAt: "desc" },
    });
    return Response.json({ data: candidates });
  } catch (error) {
    return apiError(error);
  }
}
