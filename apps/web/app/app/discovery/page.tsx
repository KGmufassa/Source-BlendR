import { getDatabase } from "@source-blendr/shared";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { DiscoveryOverviewClient, type DiscoveryItem } from "./discovery-overview-client";

export const dynamic = "force-dynamic";

function payloadRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function integer(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

export default async function DiscoveryPage() {
  const context = await getWorkspaceContext();
  const [candidates, manualItems, catalogs] = await Promise.all([
    getDatabase().candidateItem.findMany({
      where: { workspaceId: context.workspaceId },
      include: { session: { include: { importJob: { include: { vendor: { select: { id: true, name: true } } } } } }, sourceRecord: { select: { sourceType: true, sourceUri: true } } },
      orderBy: { updatedAt: "desc" },
      take: 500,
    }),
    getDatabase().catalogItem.findMany({ where: { workspaceId: context.workspaceId }, include: { vendor: { select: { id: true, name: true } } }, orderBy: { updatedAt: "desc" }, take: 500 }),
    getDatabase().catalog.findMany({ where: { workspaceId: context.workspaceId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const items: DiscoveryItem[] = [
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

  return <DiscoveryOverviewClient initialItems={items} catalogs={catalogs} />;
}
