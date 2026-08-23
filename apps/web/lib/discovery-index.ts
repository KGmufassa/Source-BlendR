import { getDatabase } from "@source-blendr/shared";

export type DiscoveryItem = {
  id: string;
  sourceKind: "candidate" | "manual";
  sessionId: string | null;
  itemType: string;
  name: string;
  sku: string;
  priceCents: number;
  vendorPriceCents: number | null;
  inventoryQuantity: number;
  currency: string;
  status: string;
  vendorId: string | null;
  vendorName: string;
  sourceType: string;
  sourceLabel: string;
  category: string;
  imageUrl: string | null;
};

function payloadRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function integer(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

export async function loadDiscoveryItems(workspaceId: string, takePerSource: number): Promise<DiscoveryItem[]> {
  const [candidates, manualItems] = await Promise.all([
    getDatabase().candidateItem.findMany({
      where: { workspaceId },
      include: { session: { include: { importJob: { include: { vendor: { select: { id: true, name: true } } } } } }, sourceRecord: { select: { sourceType: true, sourceUri: true } } },
      orderBy: { updatedAt: "desc" },
      take: takePerSource,
    }),
    getDatabase().catalogItem.findMany({ where: { workspaceId }, include: { vendor: { select: { id: true, name: true } } }, orderBy: { updatedAt: "desc" }, take: takePerSource }),
  ]);

  return [
    ...candidates.map((candidate) => {
      const payload = payloadRecord(candidate.payload);
      return {
        id: candidate.id,
        sourceKind: "candidate" as const,
        sessionId: candidate.sessionId,
        itemType: text(payload.type) || "product",
        name: candidate.name,
        sku: candidate.sku,
        priceCents: candidate.priceCents,
        vendorPriceCents: integer(payload.vendorPriceCents),
        inventoryQuantity: integer(payload.inventoryQuantity) ?? 0,
        currency: candidate.currency,
        status: candidate.state,
        vendorId: candidate.session.importJob.vendor?.id ?? null,
        vendorName: candidate.session.importJob.vendor?.name ?? "Unassigned",
        sourceType: candidate.sourceRecord?.sourceType ?? candidate.session.importJob.sourceType,
        sourceLabel: candidate.sourceRecord?.sourceUri ?? candidate.session.importJob.sourceUri,
        category: text(payload.category) || "Uncategorized",
        imageUrl: text(payload.imageUrl) || text(payload.image) || null,
      };
    }),
    ...manualItems.map((item) => ({
      id: item.id,
      sourceKind: "manual" as const,
      sessionId: null,
      itemType: item.type,
      name: item.name,
      sku: item.sku,
      priceCents: item.priceCents,
      vendorPriceCents: item.vendorPriceCents,
      inventoryQuantity: item.inventoryQuantity,
      currency: item.currency,
      status: item.status,
      vendorId: item.vendor?.id ?? null,
      vendorName: item.vendor?.name ?? "Unassigned",
      sourceType: "manual",
      sourceLabel: "Manual input",
      category: item.category || "Uncategorized",
      imageUrl: item.imageUrl,
    })),
  ];
}

export async function countDiscoveryItems(workspaceId: string): Promise<number> {
  const [candidateCount, manualCount] = await Promise.all([
    getDatabase().candidateItem.count({ where: { workspaceId } }),
    getDatabase().catalogItem.count({ where: { workspaceId } }),
  ]);
  return candidateCount + manualCount;
}
