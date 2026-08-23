import { decryptCredential, getDatabase } from "@source-blendr/shared";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { AiSettingsClient } from "./ai-settings-client";

export const dynamic = "force-dynamic";

export default async function AiSettingsPage() {
  const context = await getWorkspaceContext();
  const database = getDatabase();
  const [providers, routes] = await Promise.all([
    database.aIProviderCredential.findMany({ where: { workspaceId: context.workspaceId }, select: { id: true, provider: true, enabled: true, encryptedCredential: true, lastConnectionStatus: true, lastConnectionCheckedAt: true }, orderBy: { provider: "asc" } }),
    database.aIProviderRoute.findMany({ where: { workspaceId: context.workspaceId }, select: { capability: true, providerId: true } }),
  ]);
  return <AiSettingsClient initialProviders={providers.map(({ encryptedCredential, ...provider }) => ({ ...provider, apiPreview: maskCredential(encryptedCredential) }))} initialRoutes={Object.fromEntries(routes.map((route) => [route.capability, route.providerId]))} />;
}

function maskCredential(encryptedCredential: string) {
  try {
    const parsed = JSON.parse(decryptCredential(encryptedCredential)) as { apiKey?: string };
    const apiKey = parsed.apiKey ?? "";
    return apiKey ? `•••• ${apiKey.slice(-4)}` : "Not provided";
  } catch {
    return "•••• ••••";
  }
}
