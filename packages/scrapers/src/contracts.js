import { URL } from "node:url";

const TRACKING_PARAMETERS = new Set(["fbclid", "gclid", "dclid", "msclkid", "_ga", "_gl"]);
const POLICY_DEFAULTS = Object.freeze({
  allowedProtocols: ["http:", "https:"],
  maxPages: 200,
  maxDepth: 3,
  maxResponseBytes: 2_000_000,
  requestTimeoutMs: 20_000,
  hostDelayMs: 250,
  maxRedirects: 5,
  respectRobots: true,
});

export const SCRAPER_TERMINAL_STATES = Object.freeze(["completed", "partial", "failed", "unsupported", "manual_review"]);

export function canonicalizeSourceUrl(sourceUri, baseUri) {
  const url = new URL(sourceUri, baseUri);
  if (!POLICY_DEFAULTS.allowedProtocols.includes(url.protocol)) throw new Error("source_protocol_invalid");
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_") || TRACKING_PARAMETERS.has(key.toLowerCase())) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

export function createCrawlPolicy(overrides = {}) {
  const policy = { ...POLICY_DEFAULTS, ...overrides, allowedProtocols: [...(overrides.allowedProtocols ?? POLICY_DEFAULTS.allowedProtocols)] };
  for (const field of ["maxPages", "maxDepth", "maxResponseBytes", "requestTimeoutMs", "maxRedirects"]) {
    if (!Number.isInteger(policy[field]) || policy[field] < (field === "maxDepth" || field === "maxRedirects" ? 0 : 1)) {
      throw new Error(`crawl_policy_${field}_invalid`);
    }
  }
  if (!Number.isInteger(policy.hostDelayMs) || policy.hostDelayMs < 0) throw new Error("crawl_policy_hostDelayMs_invalid");
  return policy;
}

export function createProvenance({ sourceUrl, method, confidence, selector }) {
  if (!String(method ?? "").trim()) throw new Error("provenance_method_required");
  if (typeof confidence !== "number" || confidence < 0 || confidence > 1) throw new Error("provenance_confidence_invalid");
  return {
    sourceUrl: canonicalizeSourceUrl(sourceUrl),
    method,
    confidence,
    ...(selector ? { selector } : {}),
  };
}

export function createCrawlCheckpoint({ jobId, pendingUrls = [], completedUrls = [], failedUrls = [], updatedAt = null }) {
  if (!String(jobId ?? "").trim()) throw new Error("checkpoint_job_required");
  return {
    jobId,
    pendingUrls: pendingUrls.map((url) => canonicalizeSourceUrl(url)),
    completedUrls: completedUrls.map((url) => canonicalizeSourceUrl(url)),
    failedUrls: failedUrls.map((url) => canonicalizeSourceUrl(url)),
    updatedAt,
  };
}
