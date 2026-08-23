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

  it("derives an authenticated models check from an OpenAI-compatible base URL", async () => {
    let requestUrl = "";
    let authorization = "";
    const result = await assessProviderHealth({
      id: "provider-openai",
      provider: "workspace-openai",
      enabled: true,
      encryptedCredential: encryptCredential(JSON.stringify({
        providerType: "openai-compatible",
        baseUrl: "https://api.example.com/v1",
        modelId: "model-1",
        apiKey: "secret-token",
        capabilities: ["normalize_item"],
      }), key),
    }, {
      keyValue: key,
      fetchImpl: async (input, init) => {
        requestUrl = String(input);
        authorization = new Headers(init?.headers).get("authorization") ?? "";
        return new Response("ok", { status: 200 });
      },
    });

    expect(requestUrl).toBe("https://api.example.com/v1/models");
    expect(authorization).toBe("Bearer secret-token");
    expect(result).toMatchObject({ status: "healthy", liveCheck: "passed" });
  });

  it("checks local Ollama through its model-list endpoint", async () => {
    let requestUrl = "";
    const result = await assessProviderHealth({
      id: "provider-ollama",
      provider: "local-models",
      enabled: true,
      encryptedCredential: encryptCredential(JSON.stringify({
        providerType: "ollama",
        baseUrl: "http://localhost:11434",
        modelId: "gemma3",
        capabilities: ["normalize_item"],
      }), key),
    }, {
      keyValue: key,
      fetchImpl: async (input) => {
        requestUrl = String(input);
        return new Response("ok", { status: 200 });
      },
    });

    expect(requestUrl).toBe("http://localhost:11434/api/tags");
    expect(result).toMatchObject({ status: "healthy", liveCheck: "passed" });
  });
});
