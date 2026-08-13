import { encryptCredential, getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { requireSameOrigin } from "@/lib/request-security";

const providerSchema = z.object({
  provider: z.enum(["openai-compatible", "ollama"]),
  credential: z.string().min(1).max(10_000),
});
const routeSchema = z.object({ providerId: z.string().min(1).nullable() });

async function listProviders(workspaceId: string) {
  return getDatabase().aIProviderCredential.findMany({ where: { workspaceId }, select: { id: true, provider: true, enabled: true, createdAt: true, updatedAt: true }, orderBy: { provider: "asc" } });
}

export async function GET() {
  try {
    const context = await getWorkspaceContext();
    const providers = await listProviders(context.workspaceId);
    return Response.json({ data: providers });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const { providerId } = routeSchema.parse(await request.json());
    const database = getDatabase();
    if (providerId) {
      const provider = await database.aIProviderCredential.findFirst({ where: { id: providerId, workspaceId: context.workspaceId } });
      if (!provider) throw new Error("ai_provider_not_found");
    }
    await database.$transaction([
      database.aIProviderCredential.updateMany({ where: { workspaceId: context.workspaceId }, data: { enabled: false } }),
      ...(providerId ? [database.aIProviderCredential.updateMany({ where: { id: providerId, workspaceId: context.workspaceId }, data: { enabled: true } })] : []),
    ]);
    return Response.json({ data: await listProviders(context.workspaceId) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const input = providerSchema.parse(await request.json());
    const provider = await getDatabase().aIProviderCredential.upsert({
      where: { workspaceId_provider: { workspaceId: context.workspaceId, provider: input.provider } },
      update: { encryptedCredential: encryptCredential(input.credential), enabled: true },
      create: {
        workspaceId: context.workspaceId,
        provider: input.provider,
        encryptedCredential: encryptCredential(input.credential),
      },
      select: { id: true, provider: true, enabled: true, createdAt: true, updatedAt: true },
    });
    return Response.json({ data: provider }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
