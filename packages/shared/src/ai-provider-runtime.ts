import { decryptCredential } from "./credentials.ts";

export type ProviderCredentialRecord = {
  id: string;
  provider: string;
  enabled: boolean;
  encryptedCredential: string;
};

export type ProviderHealthResult = {
  id: string;
  provider: string;
  enabled: boolean;
  capability: string;
  supportsCapability: boolean;
  status: "healthy" | "degraded" | "disabled";
  liveCheck: "passed" | "failed" | "not_configured";
  reason?: string;
};

type ProviderConfig = {
  apiKey?: string;
  healthUrl?: string;
  capabilities?: string[];
};

export async function assessProviderHealth(
  credential: ProviderCredentialRecord,
  options: {
    capability?: string;
    keyValue?: string;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<ProviderHealthResult> {
  const capability = options.capability ?? "normalize_item";
  if (!credential.enabled) {
    return baseResult(credential, capability, false, "disabled", "not_configured", "provider_disabled");
  }

  let config: ProviderConfig;
  try {
    config = parseProviderConfig(decryptCredential(credential.encryptedCredential, options.keyValue));
  } catch {
    return baseResult(credential, capability, false, "degraded", "failed", "credential_unreadable");
  }

  const supportsCapability = (config.capabilities ?? ["normalize_item"]).includes(capability);
  if (!supportsCapability) {
    return baseResult(credential, capability, false, "degraded", "not_configured", "capability_not_supported");
  }

  if (!config.healthUrl) {
    return baseResult(credential, capability, true, "healthy", "not_configured", "health_url_not_configured");
  }

  if (!healthUrlAllowed(credential.provider, config.healthUrl, Boolean(config.apiKey))) {
    return baseResult(credential, capability, true, "degraded", "failed", "health_url_forbidden");
  }

  try {
    const response = await (options.fetchImpl ?? fetch)(config.healthUrl, {
      headers: config.apiKey ? { authorization: `Bearer ${config.apiKey}` } : undefined,
      signal: AbortSignal.timeout(5_000),
    });
    const healthy = response.ok;
    return baseResult(credential, capability, supportsCapability, healthy ? "healthy" : "degraded", healthy ? "passed" : "failed", healthy ? undefined : `provider_http_${response.status}`);
  } catch {
    return baseResult(credential, capability, supportsCapability, "degraded", "failed", "provider_unreachable");
  }
}

function healthUrlAllowed(provider: string, value: string, hasCredential: boolean): boolean {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return false;
    const loopback = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname.toLowerCase());
    if (provider === "ollama" && loopback) return true;
    if (hasCredential && url.protocol !== "https:") return false;
    return !loopback && !isPrivateLiteral(url.hostname);
  } catch {
    return false;
  }
}

function isPrivateLiteral(hostname: string): boolean {
  const value = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return value === "0.0.0.0" || value === "169.254.169.254" || value.startsWith("127.") || value.startsWith("10.") || value.startsWith("192.168.")
    || /^172\.(1[6-9]|2\d|3[01])\./.test(value) || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:");
}

export function selectProviderRoute(results: ProviderHealthResult[]): { mode: "provider" | "manual_fallback"; providerId: string | null; reason?: string } {
  const provider = results.find((result) => result.status === "healthy" && result.supportsCapability);
  if (provider) return { mode: "provider", providerId: provider.id };
  return { mode: "manual_fallback", providerId: null, reason: "no_healthy_capable_provider" };
}

function parseProviderConfig(value: string): ProviderConfig {
  try {
    const parsed = JSON.parse(value) as ProviderConfig;
    return typeof parsed === "object" && parsed !== null ? parsed : { apiKey: value };
  } catch {
    return { apiKey: value };
  }
}

function baseResult(
  credential: ProviderCredentialRecord,
  capability: string,
  supportsCapability: boolean,
  status: ProviderHealthResult["status"],
  liveCheck: ProviderHealthResult["liveCheck"],
  reason?: string,
): ProviderHealthResult {
  return {
    id: credential.id,
    provider: credential.provider,
    enabled: credential.enabled,
    capability,
    supportsCapability,
    status,
    liveCheck,
    reason,
  };
}
