import { getDatabase } from "@source-blendr/shared";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { AiSettingsClient } from "./ai-settings-client";

export const dynamic = "force-dynamic";

export default async function AiSettingsPage() {
  const context = await getWorkspaceContext();
  const providers = await getDatabase().aIProviderCredential.findMany({ where: { workspaceId: context.workspaceId }, select: { id: true, provider: true, enabled: true }, orderBy: { provider: "asc" } });
  return <AiSettingsClient initialProviders={providers} />;
}
