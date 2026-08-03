import { promoteCandidates } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getWorkspaceContext } from "@/lib/workspace-context";

const selectionSchema = z.object({
  candidateIds: z.array(z.string().min(1)).min(1).max(500),
});

export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const context = await getWorkspaceContext();
    const { sessionId } = await params;
    const { candidateIds } = selectionSchema.parse(await request.json());
    return Response.json({ data: await promoteCandidates(context.workspaceId, sessionId, candidateIds) });
  } catch (error) {
    return apiError(error);
  }
}
