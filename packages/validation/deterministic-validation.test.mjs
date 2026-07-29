import assert from "node:assert/strict";
import test from "node:test";

import { validateCatalogItem } from "./src/catalog-item.js";

test("catalog item validation returns stable field errors", () => {
  const result = validateCatalogItem({
    name: "",
    sku: "",
    priceCents: -1,
    currency: "usd",
    vendorId: "",
    workspaceId: "",
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [
    { field: "currency", code: "uppercase_currency_required" },
    { field: "name", code: "required" },
    { field: "priceCents", code: "non_negative_integer_required" },
    { field: "sku", code: "required" },
    { field: "vendorId", code: "required" },
    { field: "workspaceId", code: "required" },
  ]);
});
