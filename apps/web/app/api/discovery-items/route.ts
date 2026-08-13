import { getDatabase, promoteCandidates } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { requireSameOrigin } from "@/lib/request-security";
import { getWorkspaceContext } from "@/lib/workspace-context";

const selection = z.object({
  action: z.enum(["import", "ignore", "archive"]),
  items: z.array(z.object({ id: z.string().min(1), sourceKind: z.enum(["candidate", "manual"]), sessionId: z.string().optional() })).min(1).max(500),
});
const save = z.object({
  action: z.literal("save"),
  id: z.string().min(1),
  sourceKind: z.enum(["candidate", "manual"]),
  name: z.string().trim().min(1).max(200),
  sku: z.string().trim().min(1).max(80),
  priceCents: z.number().int().nonnegative(),
  vendorPriceCents: z.number().int().nonnegative().nullable(),
  currency: z.string().trim().length(3),
});

export async function PATCH(request: Request) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const input = z.union([selection, save]).parse(await request.json());
    const database = getDatabase();
    if (input.action === "save") {
      if (input.sourceKind === "manual") {
        const result = await database.catalogItem.updateMany({ where: { id: input.id, workspaceId: context.workspaceId }, data: { name: input.name, sku: input.sku.toUpperCase(), priceCents: input.priceCents, vendorPriceCents: input.vendorPriceCents, currency: input.currency.toUpperCase() } });
        if (!result.count) throw new Error("catalog_item_not_found");
      } else {
        const candidate = await database.candidateItem.findFirst({ where: { id: input.id, workspaceId: context.workspaceId } });
        if (!candidate) throw new Error("candidate_not_found");
        const payload = candidate.payload && typeof candidate.payload === "object" && !Array.isArray(candidate.payload) ? candidate.payload as Record<string, unknown> : {};
        await database.candidateItem.update({ where: { id: candidate.id }, data: { name: input.name, sku: input.sku.toUpperCase(), priceCents: input.priceCents, currency: input.currency.toUpperCase(), state: "updated", payload: { ...payload, vendorPriceCents: input.vendorPriceCents } } });
      }
      return Response.json({ data: { updated: 1 } });
    }

    const candidateIds = input.items.filter((item) => item.sourceKind === "candidate").map((item) => item.id);
    const manualIds = input.items.filter((item) => item.sourceKind === "manual").map((item) => item.id);
    if (input.action === "import") {
      const candidates = await database.candidateItem.findMany({ where: { id: { in: candidateIds }, workspaceId: context.workspaceId }, select: { id: true, sessionId: true } });
      if (candidates.length !== new Set(candidateIds).size) throw new Error("candidate_selection_invalid");
      const bySession = new Map<string, string[]>();
      for (const candidate of candidates) bySession.set(candidate.sessionId, [...(bySession.get(candidate.sessionId) ?? []), candidate.id]);
      for (const [sessionId, ids] of bySession) await promoteCandidates(context.workspaceId, sessionId, ids);
      return Response.json({ data: { imported: candidates.length, alreadyImported: manualIds.length } });
    }

    const state = input.action === "ignore" ? "ignored" : "archived";
    const [candidateResult, itemResult] = await Promise.all([
      database.candidateItem.updateMany({ where: { id: { in: candidateIds }, workspaceId: context.workspaceId }, data: { state } }),
      database.catalogItem.updateMany({ where: { id: { in: manualIds }, workspaceId: context.workspaceId }, data: { status: state } }),
    ]);
    if (candidateResult.count + itemResult.count !== new Set(input.items.map((item) => `${item.sourceKind}:${item.id}`)).size) throw new Error("discovery_selection_invalid");
    return Response.json({ data: { updated: candidateResult.count + itemResult.count } });
  } catch (error) {
    return apiError(error);
  }
}
