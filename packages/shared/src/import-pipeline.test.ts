import { describe, expect, it } from "vitest";
import { buildCandidateDrafts, buildImportCompletionDetail } from "./import-pipeline.js";

describe("import candidate pipeline", () => {
  it("creates deterministic review candidates from PDF records", () => {
    expect(buildCandidateDrafts("pdf", {
      records: [
        { name: "Jasmine Tea", sku: " tea-1 ", priceCents: 1299, currency: "usd" },
        { name: "Missing SKU" },
      ],
    })).toEqual([
      expect.objectContaining({ name: "Jasmine Tea", sku: "TEA-1", priceCents: 1299, currency: "USD", state: "new" }),
      expect.objectContaining({ name: "Missing SKU", state: "conflict" }),
    ]);
  });

  it("creates a review candidate for a discovered website", () => {
    expect(buildCandidateDrafts("website", { title: "Acme Catalog", url: "https://acme.test/catalog" })).toEqual([
      expect.objectContaining({ name: "Acme Catalog", currency: "USD", state: "new" }),
    ]);
  });

  it("creates one review candidate per normalized Shopify variant", () => {
    expect(buildCandidateDrafts("website", {
      products: [{
        title: "Linen Shirt",
        canonicalUrl: "https://vendor.example/products/linen-shirt",
        variants: [{ id: "101", title: "Small", sku: "LIN-S", priceCents: 4500, available: true }],
      }],
    })).toEqual([
      expect.objectContaining({ name: "Linen Shirt — Small", sku: "LIN-S", priceCents: 4500, currency: "USD", state: "new" }),
    ]);
  });

  it("records scraper adapter counters and manual-review outcomes", () => {
    expect(buildImportCompletionDetail({ sessionId: "session_1", candidateCount: 2 }, {
      platform: "shopify",
      checkpoint: { counters: { pagesCompleted: 2, productsDiscovered: 2, productsCompleted: 2, productsFailed: 0, duplicatesSkipped: 1 } },
      extractionMode: "deterministic",
    })).toEqual({
      sessionId: "session_1",
      candidateCount: 2,
      platform: "shopify",
      extractionMode: "deterministic",
      counters: { pagesCompleted: 2, productsDiscovered: 2, productsCompleted: 2, productsFailed: 0, duplicatesSkipped: 1 },
    });
  });
});
