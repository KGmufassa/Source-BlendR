import assert from "node:assert/strict";
import test from "node:test";

import { createMemoryCatalogRepository } from "./src/catalog.js";
import { createCatalogApi } from "./src/catalog-api.js";

const workspaceContext = {
  userId: "user_1",
  workspaceId: "workspace_1",
  role: "member",
};

test("catalog api creates and searches only within the active workspace", () => {
  const repository = createMemoryCatalogRepository([
    {
      name: "Other Workspace Tea",
      sku: "other-tea",
      priceCents: 300,
      currency: "USD",
      vendorId: "vendor_2",
      workspaceId: "workspace_2",
    },
  ]);
  const api = createCatalogApi({ repository, workspaceContext });

  api.createItem({
    name: "Green Tea",
    sku: "tea-1",
    priceCents: 450,
    currency: "USD",
    vendorId: "vendor_1",
  });

  assert.deepEqual(api.searchItems("tea").map((item) => item.sku), ["TEA-1"]);
});

test("catalog api rejects invalid catalog writes before repository save", () => {
  const api = createCatalogApi({
    repository: createMemoryCatalogRepository(),
    workspaceContext,
  });

  assert.throws(
    () => api.createItem({ name: "", sku: "", priceCents: -1, currency: "usd", vendorId: "" }),
    /catalog_item_invalid/,
  );
});
