import { getDatabase } from "@source-blendr/shared";
import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { CatalogDetailsClient, type CandidateOption, type CatalogMemberView } from "./catalog-details-client";

export const dynamic = "force-dynamic";

function payload(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export default async function CatalogDetailsPage({ params }: Readonly<{ params: Promise<{ itemId: string }> }>) {
  const { itemId: catalogId } = await params;
  const context = await getWorkspaceContext();
  const database = getDatabase();
  const [catalog, vendors] = await Promise.all([
    database.catalog.findFirst({
      where: { id: catalogId, workspaceId: context.workspaceId },
      include: {
        members: {
          include: {
            candidate: { include: { session: { include: { importJob: { include: { vendor: { select: { name: true } } } } } } } },
            catalogItem: { include: { vendor: { select: { name: true } } } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    database.vendor.findMany({ where: { workspaceId: context.workspaceId, archivedAt: null }, orderBy: { name: "asc" }, select: { name: true } }),
  ]);
  if (!catalog) notFound();

  const currentCandidateIds = catalog.members.flatMap((member) => member.candidateId ? [member.candidateId] : []);
  const availableRecords = await database.candidateItem.findMany({ where: { workspaceId: context.workspaceId, id: { notIn: currentCandidateIds } }, include: { session: { include: { importJob: { include: { vendor: { select: { name: true } } } } } } }, orderBy: { updatedAt: "desc" }, take: 100 });
  const available: CandidateOption[] = availableRecords.map((candidate) => {
    const data = payload(candidate.payload);
    return { id: candidate.id, name: candidate.name, description: typeof data.description === "string" ? data.description : "", sku: candidate.sku, vendor: candidate.session.importJob.vendor?.name ?? "Unassigned", category: typeof data.category === "string" ? data.category : "Uncategorized", priceCents: candidate.priceCents, currency: candidate.currency, imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : null };
  });

  const members = catalog.members.flatMap((member): CatalogMemberView[] => {
    if (member.candidate) {
      const data = payload(member.candidate.payload);
      return [{ id: member.id, sourceId: member.candidate.id, name: member.candidate.name, description: typeof data.description === "string" ? data.description : "", sku: member.candidate.sku, vendor: member.candidate.session.importJob.vendor?.name ?? "Unassigned", category: typeof data.category === "string" ? data.category : "Uncategorized", basePriceCents: member.candidate.priceCents, customPriceCents: member.customPriceCents, currency: member.candidate.currency, imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : null }];
    }
    if (member.catalogItem) return [{ id: member.id, sourceId: member.catalogItem.id, name: member.catalogItem.name, description: member.catalogItem.description, sku: member.catalogItem.sku, vendor: member.catalogItem.vendor?.name ?? "Unassigned", category: member.catalogItem.category || "Uncategorized", basePriceCents: member.catalogItem.priceCents, customPriceCents: member.customPriceCents, currency: member.catalogItem.currency, imageUrl: member.catalogItem.imageUrl }];
    return [];
  });

  return <CatalogDetailsClient catalog={{ id: catalog.id, name: catalog.name, categoryType: catalog.categoryType, status: catalog.status }} initialMembers={members} availableCandidates={available} workspaceVendors={vendors.map((vendor) => vendor.name)} />;
}
