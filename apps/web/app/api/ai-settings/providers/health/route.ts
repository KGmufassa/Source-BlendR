import { assessProviderHealth, getDatabase, selectProviderRoute } from "@source-blendr/shared";
import { apiError } from "@/lib/http";
import { getWorkspaceContext } from "@/lib/workspace-context";

export async function GET(request: Request) {
  try {
    const context = await getWorkspaceContext();
    const capability = new URL(request.url).searchParams.get("capability") ?? "normalize_item";
    const credentials = await getDatabase().aIProviderCredential.findMany({
      where: { workspaceId: context.workspaceId },
      select: { id: true, provider: true, enabled: true, encryptedCredential: true },
      orderBy: { provider: "asc" },
    });
    const providers = await Promise.all(credentials.map((credential) => assessProviderHealth(credential, { capability })));
    const checkedAt = new Date();
    await Promise.all(providers.map((provider) => getDatabase().aIProviderCredential.updateMany({
      where: { id: provider.id, workspaceId: context.workspaceId },
      data: {
        lastConnectionStatus: provider.status === "healthy" && provider.liveCheck === "passed" ? "connected" : "not_connected",
        lastConnectionCheckedAt: checkedAt,
      },
    })));
    return Response.json({
      data: {
        capability,
        providers,
        route: selectProviderRoute(providers),
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
