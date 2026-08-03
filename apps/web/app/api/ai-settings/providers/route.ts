import { encryptCredential, getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getWorkspaceContext } from "@/lib/workspace-context";

const providerSchema = z.object({
  provider: z.enum(["openai-compatible", "ollama"]),
  credential: z.string().min(1).max(10_000),
});

export async function GET() {
  try {
    const context = await getWorkspaceContext();
    const providers = await getDatabase().aIProviderCredential.findMany({
      where: { workspaceId: context.workspaceId },
      select: { id: true, provider: true, enabled: true, createdAt: true, updatedAt: true },
      orderBy: { provider: "asc" },
    });
    return Response.json({ data: providers });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
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
