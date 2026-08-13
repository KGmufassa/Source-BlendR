import { getDatabase } from "@source-blendr/shared";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { WebsiteImportClient } from "./website-import-client";

export const dynamic = "force-dynamic";

export default async function WebsiteImportPage({ searchParams }: Readonly<{ searchParams: Promise<{ vendorId?: string }> }>) {
  const context = await getWorkspaceContext();
  const { vendorId } = await searchParams;
  const vendors = await getDatabase().vendor.findMany({ where: { workspaceId: context.workspaceId, archivedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true } });
  return <WebsiteImportClient vendors={vendors} initialVendorId={vendors.some((vendor) => vendor.id === vendorId) ? vendorId : undefined} />;
}
