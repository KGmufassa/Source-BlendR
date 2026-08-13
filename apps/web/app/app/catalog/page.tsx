import { getDatabase } from "@source-blendr/shared";
import { CatalogClient, type CatalogSummary } from "./catalog-client";
import { getWorkspaceContext } from "@/lib/workspace-context";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const context = await getWorkspaceContext();
  const catalogs = await getDatabase().catalog.findMany({ where: { workspaceId: context.workspaceId }, include: { _count: { select: { members: true } } }, orderBy: { updatedAt: "desc" } });
  return <CatalogClient initialCatalogs={catalogs.map((catalog): CatalogSummary => ({ id: catalog.id, name: catalog.name, categoryType: catalog.categoryType, status: catalog.status, itemCount: catalog._count.members, updatedAt: catalog.updatedAt.toISOString() }))} />;
}
