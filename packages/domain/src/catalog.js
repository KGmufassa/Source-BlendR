import { validateCatalogItem } from "../../validation/src/catalog-item.js";

export function normalizeCatalogItemInput(input) {
  const item = {
    name: String(input?.name ?? "").trim(),
    sku: String(input?.sku ?? "").trim().toUpperCase(),
    priceCents: input?.priceCents,
    currency: String(input?.currency ?? "").trim().toUpperCase(),
    vendorId: String(input?.vendorId ?? "").trim(),
    workspaceId: String(input?.workspaceId ?? "").trim(),
  };

  const validation = validateCatalogItem(item);
  if (!validation.ok) {
    throw new Error(`catalog_item_invalid:${validation.errors.map((error) => error.field).join(",")}`);
  }

  return item;
}

export function createMemoryCatalogRepository(seedItems = []) {
  const items = seedItems.map(normalizeCatalogItemInput);

  return {
    save(item) {
      const normalized = normalizeCatalogItemInput(item);
      const existingIndex = items.findIndex(
        (saved) => saved.workspaceId === normalized.workspaceId && saved.sku === normalized.sku,
      );

      if (existingIndex >= 0) {
        items[existingIndex] = normalized;
      } else {
        items.push(normalized);
      }

      return normalized;
    },
    listByWorkspace(workspaceId) {
      return items.filter((item) => item.workspaceId === workspaceId);
    },
  };
}
