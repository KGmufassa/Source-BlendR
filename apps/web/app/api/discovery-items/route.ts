import { getDatabase, promoteCandidates } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { requireSameOrigin } from "@/lib/request-security";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { loadDiscoveryItems } from "@/lib/discovery-index";

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
  inventoryQuantity: z.number().int().nonnegative(),
  currency: z.string().trim().length(3),
});
const bulkEdit = z.object({
  action: z.literal("bulk-edit"),
  items: z.array(z.object({ id: z.string().min(1), sourceKind: z.enum(["candidate", "manual"]) })).min(1).max(500),
  itemType: z.enum(["product", "service", "rental", "labor", "manufacturing", "installation"]).optional(),
  category: z.string().trim().min(1).max(120).optional(),
}).refine((input) => input.itemType !== undefined || input.category !== undefined, { message: "At least one bulk change is required." });
const removableItem = z.object({ id: z.string().min(1), sourceKind: z.enum(["candidate", "manual"]) });
const remove = z.union([
  removableItem,
  z.object({ items: z.array(removableItem).min(1).max(500) }),
]);

export async function GET() {
  try {
    const context = await getWorkspaceContext();
    const items = await loadDiscoveryItems(context.workspaceId, 500);
    return Response.json({ data: { items } }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const input = z.union([selection, save, bulkEdit]).parse(await request.json());
    const database = getDatabase();
    if (input.action === "save") {
      if (input.sourceKind === "manual") {
        const result = await database.catalogItem.updateMany({ where: { id: input.id, workspaceId: context.workspaceId }, data: { name: input.name, sku: input.sku.toUpperCase(), priceCents: input.priceCents, vendorPriceCents: input.vendorPriceCents, inventoryQuantity: input.inventoryQuantity, currency: input.currency.toUpperCase() } });
        if (!result.count) throw new Error("catalog_item_not_found");
      } else {
        const candidate = await database.candidateItem.findFirst({ where: { id: input.id, workspaceId: context.workspaceId } });
        if (!candidate) throw new Error("candidate_not_found");
        const payload = candidate.payload && typeof candidate.payload === "object" && !Array.isArray(candidate.payload) ? candidate.payload as Record<string, unknown> : {};
        await database.candidateItem.update({ where: { id: candidate.id }, data: { name: input.name, sku: input.sku.toUpperCase(), priceCents: input.priceCents, currency: input.currency.toUpperCase(), state: "updated", payload: { ...payload, vendorPriceCents: input.vendorPriceCents, inventoryQuantity: input.inventoryQuantity } } });
      }
      return Response.json({ data: { updated: 1 } });
    }

    if (input.action === "bulk-edit") {
      const uniqueItems = [...new Map(input.items.map((item) => [`${item.sourceKind}:${item.id}`, item])).values()];
      const candidateIds = uniqueItems.filter((item) => item.sourceKind === "candidate").map((item) => item.id);
      const manualIds = uniqueItems.filter((item) => item.sourceKind === "manual").map((item) => item.id);
      const updated = await database.$transaction(async (transaction) => {
        const [candidates, manualItems] = await Promise.all([
          transaction.candidateItem.findMany({ where: { id: { in: candidateIds }, workspaceId: context.workspaceId } }),
          transaction.catalogItem.findMany({ where: { id: { in: manualIds }, workspaceId: context.workspaceId }, select: { id: true } }),
        ]);
        if (candidates.length + manualItems.length !== uniqueItems.length) throw new Error("discovery_selection_invalid");
        await Promise.all([
          ...candidates.map((candidate) => {
            const payload = candidate.payload && typeof candidate.payload === "object" && !Array.isArray(candidate.payload) ? candidate.payload as Record<string, unknown> : {};
            return transaction.candidateItem.update({ where: { id: candidate.id }, data: { state: "updated", payload: { ...payload, ...(input.itemType ? { type: input.itemType } : {}), ...(input.category ? { category: input.category } : {}) } } });
          }),
          transaction.catalogItem.updateMany({ where: { id: { in: manualIds }, workspaceId: context.workspaceId }, data: { ...(input.itemType ? { type: input.itemType } : {}), ...(input.category ? { category: input.category } : {}) } }),
        ]);
        return uniqueItems.length;
      });
      return Response.json({ data: { updated } });
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

export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const input = remove.parse(await request.json());
    const database = getDatabase();
    const requestedItems = "items" in input ? input.items : [input];
    const uniqueItems = [...new Map(requestedItems.map((item) => [`${item.sourceKind}:${item.id}`, item])).values()];
    const candidateIds = uniqueItems.filter((item) => item.sourceKind === "candidate").map((item) => item.id);
    const manualIds = uniqueItems.filter((item) => item.sourceKind === "manual").map((item) => item.id);
    const deleted = await database.$transaction(async (transaction) => {
      const [candidateResult, manualResult] = await Promise.all([
        transaction.candidateItem.deleteMany({ where: { id: { in: candidateIds }, workspaceId: context.workspaceId } }),
        transaction.catalogItem.deleteMany({ where: { id: { in: manualIds }, workspaceId: context.workspaceId } }),
      ]);
      const count = candidateResult.count + manualResult.count;
      if (count !== uniqueItems.length) throw new Error("discovery_selection_invalid");
      return count;
    });
    return Response.json({ data: { deleted } });
  } catch (error) {
    return apiError(error);
  }
}
