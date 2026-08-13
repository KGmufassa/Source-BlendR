import { canonicalizeSourceUrl } from "../../scrapers/src/contracts.js";

export function normalizeDiscoveredCategories(categories = []) {
  const normalized = new Map();
  for (const category of categories) {
    const name = String(category?.name ?? "").trim();
    const url = canonicalizeSourceUrl(category?.url);
    if (name && !normalized.has(url)) normalized.set(url, { name, url });
  }
  return [...normalized.values()];
}

export function createCategoryJobRequests({ sourceJobId, discovered, selectedUrls }) {
  if (!String(sourceJobId ?? "").trim()) throw new Error("source_job_required");
  const categories = new Map(normalizeDiscoveredCategories(discovered).map((category) => [category.url, category]));
  return [...new Set(selectedUrls.map((url) => canonicalizeSourceUrl(url)))].map((url) => {
    const category = categories.get(url);
    if (!category) throw new Error("category_not_discovered");
    return { name: category.name, sourceUri: url, idempotencyKey: `category:${sourceJobId}:${url}` };
  });
}
