import { CatalogService } from "@source-blendr/domain";
import { PrismaCatalogRepository } from "@source-blendr/shared";
import { CatalogClient } from "./catalog-client";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { PageHeader } from "../page-actions";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const context = await getWorkspaceContext();
  const items = await new CatalogService(new PrismaCatalogRepository()).list(context.workspaceId);
  return (
    <>
      <PageHeader eyebrow="UI-BLUEPRINT-SCREEN-007" title="Catalog" description="Workspace-owned products, services, rentals, labor, manufacturing, and installation." />
      <CatalogClient initialItems={items} />
    </>
  );
}
