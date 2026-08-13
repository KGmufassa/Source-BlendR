import assert from "node:assert/strict";
import test from "node:test";

import { createCategoryJobRequests, normalizeDiscoveredCategories } from "./src/category-jobs.js";

test("category discovery is canonical and idempotent", () => {
  assert.deepEqual(normalizeDiscoveredCategories([
    { name: " Shirts ", url: "https://vendor.example/collections/shirts?utm_source=nav" },
    { name: "Duplicate", url: "https://vendor.example/collections/shirts" },
  ]), [{ name: "Shirts", url: "https://vendor.example/collections/shirts" }]);
});

test("selected categories create stable independent job requests", () => {
  assert.deepEqual(createCategoryJobRequests({
    sourceJobId: "job_1",
    discovered: [{ name: "Shirts", url: "https://vendor.example/collections/shirts" }, { name: "Sets", url: "https://vendor.example/collections/sets" }],
    selectedUrls: ["https://vendor.example/collections/sets"],
  }), [{ name: "Sets", sourceUri: "https://vendor.example/collections/sets", idempotencyKey: "category:job_1:https://vendor.example/collections/sets" }]);
  assert.throws(() => createCategoryJobRequests({ sourceJobId: "job_1", discovered: [], selectedUrls: ["https://evil.example"] }), /category_not_discovered/);
});
