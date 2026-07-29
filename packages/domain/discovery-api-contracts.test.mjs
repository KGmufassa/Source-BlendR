import assert from "node:assert/strict";
import test from "node:test";

import { createMemoryCatalogRepository } from "./src/catalog.js";
import { createDiscoveryApi } from "./src/discovery-api.js";

const context = { userId: "user_1", workspaceId: "workspace_1", role: "member" };

test("discovery api validates candidate state before promotion", () => {
  const api = createDiscoveryApi({
    catalogRepository: createMemoryCatalogRepository(),
    workspaceContext: context,
  });

  const candidate = api.addCandidate({
    sessionId: "session_1",
    name: "",
    sku: "",
    priceCents: -1,
    currency: "usd",
    vendorId: "vendor_1",
  });

  assert.equal(candidate.state, "needs_review");
  assert.throws(() => api.promoteCandidate(candidate.candidateId), /candidate_invalid/);
});

test("discovery api promotes valid candidates into catalog", () => {
  const repository = createMemoryCatalogRepository();
  const api = createDiscoveryApi({ catalogRepository: repository, workspaceContext: context });
  const candidate = api.addCandidate({
    sessionId: "session_1",
    name: "Tea",
    sku: "tea",
    priceCents: 300,
    currency: "USD",
    vendorId: "vendor_1",
  });

  assert.equal(api.promoteCandidate(candidate.candidateId).sku, "TEA");
  assert.deepEqual(repository.listByWorkspace("workspace_1").map((item) => item.sku), ["TEA"]);
});
