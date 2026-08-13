import { getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { requireSameOrigin } from "@/lib/request-security";

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

const mutationSchema = z.discriminatedUnion("action", [
  z.object({ action: z.enum(["ignore", "archive"]), candidateIds: z.array(z.string().min(1)).min(1).max(500) }),
  z.object({ action: z.literal("save"), candidateIds: z.array(z.string().min(1)).length(1), name: z.string().trim().min(1).max(200), sku: z.string().trim().min(1).max(80), priceCents: z.number().int().nonnegative(), currency: z.string().trim().length(3) }),
]);

export async function PATCH(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const { sessionId } = await params;
    const input = mutationSchema.parse(await request.json());
    const database = getDatabase();
    const session = await database.discoverySession.findFirst({ where: { id: sessionId, workspaceId: context.workspaceId } });
    if (!session) throw new Error("discovery_session_not_found");

    const data = input.action === "save"
      ? { name: input.name, sku: input.sku.toUpperCase(), priceCents: input.priceCents, currency: input.currency.toUpperCase(), state: "updated" }
      : { state: input.action === "ignore" ? "ignored" : "archived" };
    const result = await database.candidateItem.updateMany({ where: { workspaceId: context.workspaceId, sessionId, id: { in: [...new Set(input.candidateIds)] } }, data });
    if (result.count !== new Set(input.candidateIds).size) throw new Error("candidate_selection_invalid");
    return Response.json({ data: await database.candidateItem.findMany({ where: { workspaceId: context.workspaceId, sessionId }, orderBy: { updatedAt: "desc" } }) });
  } catch (error) {
    return apiError(error);
  }
}
