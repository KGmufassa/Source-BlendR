import { getDatabase } from "@source-blendr/shared";
import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { CatalogDetailsClient, type CatalogMemberView } from "./catalog-details-client";

export const dynamic = "force-dynamic";

function payload(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export default async function CatalogDetailsPage({ params }: Readonly<{ params: Promise<{ itemId: string }> }>) {
  const { itemId: catalogId } = await params;
  const context = await getWorkspaceContext();
  const database = getDatabase();
  const catalog = await database.catalog.findFirst({
    where: { id: catalogId, workspaceId: context.workspaceId },
    include: { members: { include: { candidate: { include: { session: { include: { importJob: { include: { vendor: { select: { name: true } } } } } } } }, catalogItem: { include: { vendor: { select: { name: true } } } } }, orderBy: { createdAt: "desc" } } },
  });
  if (!catalog) notFound();
  const currentCandidateIds = catalog.members.flatMap((member) => member.candidateId ? [member.candidateId] : []);
  const available = await database.candidateItem.findMany({ where: { workspaceId: context.workspaceId, id: { notIn: currentCandidateIds } }, orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, name: true, sku: true } });
  const members = catalog.members.flatMap((member): CatalogMemberView[] => {
    if (member.candidate) {
      const data = payload(member.candidate.payload);
      return [{ id: member.id, sourceId: member.candidate.id, name: member.candidate.name, sku: member.candidate.sku, vendor: member.candidate.session.importJob.vendor?.name ?? "Unassigned", category: typeof data.category === "string" ? data.category : "Uncategorized", priceCents: member.candidate.priceCents, currency: member.candidate.currency, status: member.candidate.state, imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : null }];
    }
    if (member.catalogItem) return [{ id: member.id, sourceId: member.catalogItem.id, name: member.catalogItem.name, sku: member.catalogItem.sku, vendor: member.catalogItem.vendor?.name ?? "Unassigned", category: member.catalogItem.category || "Uncategorized", priceCents: member.catalogItem.priceCents, currency: member.catalogItem.currency, status: member.catalogItem.status, imageUrl: member.catalogItem.imageUrl }];
    return [];
  });
  return <CatalogDetailsClient catalog={{ id: catalog.id, name: catalog.name, categoryType: catalog.categoryType, status: catalog.status }} initialMembers={members} availableCandidates={available} />;
}
