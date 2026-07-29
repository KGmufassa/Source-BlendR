import assert from "node:assert/strict";
import test from "node:test";

import {
  createMemoryCatalogRepository,
  normalizeCatalogItemInput,
} from "./src/catalog.js";

test("catalog input is normalized deterministically", () => {
  const item = normalizeCatalogItemInput({
    name: "  Oat Milk  ",
    sku: " oat-1 ",
    priceCents: 499,
    currency: "usd",
    vendorId: "vendor_1",
    workspaceId: "workspace_1",
  });

  assert.deepEqual(item, {
    name: "Oat Milk",
    sku: "OAT-1",
    priceCents: 499,
    currency: "USD",
    vendorId: "vendor_1",
    workspaceId: "workspace_1",
  });
});

test("catalog repository never returns another workspace item", () => {
  const repository = createMemoryCatalogRepository();
  repository.save(
    normalizeCatalogItemInput({
      name: "Tea",
      sku: "tea",
      priceCents: 300,
      currency: "USD",
      vendorId: "vendor_1",
      workspaceId: "workspace_1",
    }),
  );
  repository.save(
    normalizeCatalogItemInput({
      name: "Coffee",
      sku: "coffee",
      priceCents: 400,
      currency: "USD",
      vendorId: "vendor_2",
      workspaceId: "workspace_2",
    }),
  );

  assert.deepEqual(repository.listByWorkspace("workspace_1").map((item) => item.sku), ["TEA"]);
});
