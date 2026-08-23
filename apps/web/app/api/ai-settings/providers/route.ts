import { decryptCredential, encryptCredential, getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { requireSameOrigin } from "@/lib/request-security";

const providerSchema = z.object({
  provider: z.string().trim().min(1).max(80).regex(/^[\p{L}\p{N}][\p{L}\p{N} ._&'()+/-]*$/u, "Use a provider name without control characters."),
  credential: z.string().min(1).max(10_000),
});
const providerTypeSchema = z.enum(["openai-compatible", "anthropic", "gemini", "ollama", "azure-openai", "custom"]);
const newProviderCredentialSchema = z.object({
  providerType: providerTypeSchema,
  baseUrl: z.string().url(),
  modelId: z.string().trim().min(1).max(200),
  apiKey: z.string().min(1).optional(),
  capabilities: z.array(z.string().min(1)).min(1),
}).superRefine((config, context) => {
  if (config.providerType !== "ollama" && !config.apiKey) {
    context.addIssue({ code: "custom", path: ["apiKey"], message: "API key is required for hosted providers." });
  }
});
const providerEnabledSchema = z.object({ action: z.literal("provider-enabled"), providerId: z.string().min(1), enabled: z.boolean() });
const providerCredentialSchema = z.object({ action: z.literal("provider-credential"), providerId: z.string().min(1), credential: z.string().min(1).max(10_000) });
const routingSchema = z.object({ action: z.literal("routing"), routes: z.record(z.string(), z.string().min(1).nullable()) });
const legacyRouteSchema = z.object({ providerId: z.string().min(1).nullable() });

async function listProviders(workspaceId: string) {
  const database = getDatabase();
  const [providers, routes] = await Promise.all([
    database.aIProviderCredential.findMany({ where: { workspaceId }, select: { id: true, provider: true, enabled: true, encryptedCredential: true, lastConnectionStatus: true, lastConnectionCheckedAt: true, createdAt: true, updatedAt: true }, orderBy: { provider: "asc" } }),
    database.aIProviderRoute.findMany({ where: { workspaceId }, select: { capability: true, providerId: true } }),
  ]);
  return {
    providers: providers.map(({ encryptedCredential, ...provider }) => ({ ...provider, apiPreview: maskCredential(encryptedCredential) })),
    routes: Object.fromEntries(routes.map((route) => [route.capability, route.providerId])),
  };
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

function normalizeProvider(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function parseCredentialConfig(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed as Record<string, unknown> : { apiKey: value };
  } catch {
    return { apiKey: value };
  }
}

export async function GET() {
  try {
    const context = await getWorkspaceContext();
    return Response.json({ data: await listProviders(context.workspaceId) });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const body = await request.json();
    const database = getDatabase();
    const parsed = z.union([providerEnabledSchema, providerCredentialSchema, routingSchema, legacyRouteSchema]).parse(body);
    if ("action" in parsed && parsed.action === "provider-enabled") {
      const result = await database.aIProviderCredential.updateMany({ where: { id: parsed.providerId, workspaceId: context.workspaceId }, data: { enabled: parsed.enabled, lastConnectionStatus: parsed.enabled ? null : "not_connected", lastConnectionCheckedAt: null } });
      if (!result.count) throw new Error("ai_provider_not_found");
      return Response.json({ data: await listProviders(context.workspaceId) });
    }
    if ("action" in parsed && parsed.action === "provider-credential") {
      const currentProvider = await database.aIProviderCredential.findFirst({ where: { id: parsed.providerId, workspaceId: context.workspaceId } });
      if (!currentProvider) throw new Error("ai_provider_not_found");
      const mergedCredential = {
        ...parseCredentialConfig(decryptCredential(currentProvider.encryptedCredential)),
        ...parseCredentialConfig(parsed.credential),
      };
      const result = await database.aIProviderCredential.updateMany({
        where: { id: parsed.providerId, workspaceId: context.workspaceId },
        data: { encryptedCredential: encryptCredential(JSON.stringify(mergedCredential)), lastConnectionStatus: null, lastConnectionCheckedAt: null },
      });
      if (!result.count) throw new Error("ai_provider_not_found");
      const provider = await database.aIProviderCredential.findUniqueOrThrow({ where: { id: parsed.providerId } });
      const { encryptedCredential, ...safeProvider } = provider;
      return Response.json({ data: { ...safeProvider, apiPreview: maskCredential(encryptedCredential) } });
    }
    const routes = "action" in parsed ? parsed.routes : { normalize_item: parsed.providerId };
    await database.$transaction(async (transaction) => {
      for (const [capability, providerId] of Object.entries(routes)) {
        if (providerId) {
          const provider = await transaction.aIProviderCredential.findFirst({ where: { id: providerId, workspaceId: context.workspaceId, enabled: true } });
          if (!provider) throw new Error("ai_provider_not_found");
        }
        await transaction.aIProviderRoute.upsert({
          where: { workspaceId_capability: { workspaceId: context.workspaceId, capability } },
          update: { providerId },
          create: { workspaceId: context.workspaceId, capability, providerId },
        });
      }
    });
    const routeState = await listProviders(context.workspaceId);
    return Response.json({ data: { routes: routeState.routes } });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const input = providerSchema.parse(await request.json());
    const credentialConfig = newProviderCredentialSchema.parse(parseCredentialConfig(input.credential));
    const providerName = normalizeProvider(input.provider);
    const database = getDatabase();
    const existing = await database.aIProviderCredential.findUnique({ where: { workspaceId_provider: { workspaceId: context.workspaceId, provider: providerName } } });
    if (existing) {
      return Response.json({ error: { code: "ai_provider_exists", message: "This provider already exists. Use its Edit button to update the API key." } }, { status: 409 });
    }
    const provider = await database.aIProviderCredential.create({
      data: {
        workspaceId: context.workspaceId,
        provider: providerName,
        encryptedCredential: encryptCredential(JSON.stringify(credentialConfig)),
      },
      select: { id: true, provider: true, enabled: true, encryptedCredential: true, lastConnectionStatus: true, lastConnectionCheckedAt: true, createdAt: true, updatedAt: true },
    });
    const { encryptedCredential, ...safeProvider } = provider;
    return Response.json({ data: { ...safeProvider, apiPreview: maskCredential(encryptedCredential) } }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
