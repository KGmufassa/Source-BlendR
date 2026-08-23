import { getWorkspaceContext } from "@/lib/workspace-context";
import { countDiscoveryItems, loadDiscoveryItems } from "@/lib/discovery-index";
import { DiscoveryOverviewClient } from "./discovery-overview-client";

export const dynamic = "force-dynamic";

export default async function DiscoveryPage() {
  const context = await getWorkspaceContext();
  const [items, totalItems] = await Promise.all([
    loadDiscoveryItems(context.workspaceId, 20),
    countDiscoveryItems(context.workspaceId),
  ]);
  return <DiscoveryOverviewClient initialItems={items} initialTotal={totalItems} />;
}
