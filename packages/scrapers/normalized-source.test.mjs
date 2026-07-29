import assert from "node:assert/strict";
import test from "node:test";

import { normalizePdfSource } from "./src/pdf.js";
import { normalizeWebsiteSource } from "./src/website.js";

test("website discovery fixture creates normalized source records", () => {
  const source = normalizeWebsiteSource({
    workspaceId: "workspace_1",
    sourceUri: "https://vendor.example/catalog",
    html: "<title>Vendor Catalog</title><a href='/tea'>Tea</a><a href='/coffee'>Coffee</a>",
  });

  assert.deepEqual(source, {
    sourceType: "website",
    workspaceId: "workspace_1",
    sourceUri: "https://vendor.example/catalog",
    title: "Vendor Catalog",
    records: ["Tea", "Coffee"],
  });
});

test("pdf pipeline rejects unsafe uploads and normalizes text records", () => {
  assert.throws(
    () => normalizePdfSource({ workspaceId: "workspace_1", fileName: "../bad.pdf", text: "Tea\\nCoffee" }),
    /file_name_invalid/,
  );

  assert.deepEqual(
    normalizePdfSource({ workspaceId: "workspace_1", fileName: "catalog.pdf", text: "Tea\\n\\nCoffee" }),
    {
      sourceType: "pdf",
      workspaceId: "workspace_1",
      fileName: "catalog.pdf",
      records: ["Tea", "Coffee"],
    },
  );
});
