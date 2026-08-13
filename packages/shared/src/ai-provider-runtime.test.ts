import { describe, expect, it } from "vitest";
import { assessProviderHealth, selectProviderRoute } from "./ai-provider-runtime.js";
import { encryptCredential } from "./credentials.js";

const key = "b".repeat(64);

describe("AI provider runtime health", () => {
  it("selects a healthy provider without exposing credentials", async () => {
    const result = await assessProviderHealth({
      id: "provider-1",
      provider: "openai-compatible",
      enabled: true,
      encryptedCredential: encryptCredential(JSON.stringify({
        apiKey: "secret-token",
        healthUrl: "https://provider.example/health",
        capabilities: ["normalize_item"],
      }), key),
    }, {
      keyValue: key,
      fetchImpl: async () => new Response("ok", { status: 200 }),
    });

    expect(result).toMatchObject({
      id: "provider-1",
      status: "healthy",
      liveCheck: "passed",
      supportsCapability: true,
    });
    expect(JSON.stringify(result)).not.toContain("secret-token");
    expect(selectProviderRoute([result])).toEqual({ mode: "provider", providerId: "provider-1" });
  });

  it("falls back when no healthy provider supports the capability", async () => {
    const result = await assessProviderHealth({
      id: "provider-1",
      provider: "openai-compatible",
      enabled: true,
      encryptedCredential: encryptCredential(JSON.stringify({ capabilities: ["classify_item"] }), key),
    }, { keyValue: key, capability: "normalize_item" });

    expect(result.status).toBe("degraded");
    expect(selectProviderRoute([result])).toEqual({
      mode: "manual_fallback",
      providerId: null,
      reason: "no_healthy_capable_provider",
    });
  });

  it("refuses private health endpoints for hosted providers", async () => {
    const result = await assessProviderHealth({
      id: "provider-1",
      provider: "openai-compatible",
      enabled: true,
      encryptedCredential: encryptCredential(JSON.stringify({ healthUrl: "http://169.254.169.254/latest/meta-data" }), key),
    }, { keyValue: key, fetchImpl: async () => new Response("should not run") });

    expect(result).toMatchObject({ status: "degraded", liveCheck: "failed", reason: "health_url_forbidden" });
  });
});
