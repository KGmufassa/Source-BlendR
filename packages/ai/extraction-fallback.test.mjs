import assert from "node:assert/strict";
import test from "node:test";

import { runExtractionFallback } from "./src/extraction.js";

test("deterministic extraction bypasses AI", async () => {
  let calls = 0;
  const result = await runExtractionFallback({
    deterministic: { products: [{ title: "Tea", canonicalUrl: "https://vendor.example/products/tea", variants: [] }] },
    executeAi: async () => { calls += 1; },
    budget: { maxCalls: 1 },
  });
  assert.equal(calls, 0);
  assert.equal(result.mode, "deterministic");
});

test("AI output is schema validated or routed to manual review", async () => {
  const valid = await runExtractionFallback({
    deterministic: { products: [] },
    executeAi: async () => ({ products: [{ title: "Tea", canonicalUrl: "https://vendor.example/products/tea", variants: [] }] }),
    budget: { maxCalls: 1 },
  });
  assert.equal(valid.mode, "ai_validated");
  assert.equal(valid.callsUsed, 1);

  const invalid = await runExtractionFallback({ deterministic: { products: [] }, executeAi: async () => ({ products: [{ title: "Missing URL" }] }), budget: { maxCalls: 1 } });
  assert.deepEqual(invalid, { mode: "manual_review", reason: "ai_output_invalid", products: [], callsUsed: 1 });
});

test("zero AI budget routes to manual review", async () => {
  assert.deepEqual(await runExtractionFallback({ deterministic: { products: [] }, executeAi: async () => ({}), budget: { maxCalls: 0 } }), {
    mode: "manual_review",
    reason: "ai_budget_exhausted",
    products: [],
    callsUsed: 0,
  });
});
