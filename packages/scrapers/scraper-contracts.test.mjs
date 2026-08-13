import assert from "node:assert/strict";
import test from "node:test";

import {
  SCRAPER_TERMINAL_STATES,
  canonicalizeSourceUrl,
  createCrawlCheckpoint,
  createCrawlPolicy,
  createProvenance,
} from "./src/contracts.js";

test("canonical target removes tracking while preserving crawl parameters", () => {
  assert.equal(
    canonicalizeSourceUrl("https://Example.com/collections/new/?utm_source=email&page=2&sort_by=best-selling&fbclid=x#products"),
    "https://example.com/collections/new?page=2&sort_by=best-selling",
  );
});

test("crawl policy is bounded and rejects unsafe overrides", () => {
  assert.deepEqual(createCrawlPolicy({ maxPages: 25 }), {
    allowedProtocols: ["http:", "https:"],
    maxPages: 25,
    maxDepth: 3,
    maxResponseBytes: 2_000_000,
    requestTimeoutMs: 20_000,
    hostDelayMs: 250,
    maxRedirects: 5,
    respectRobots: true,
  });
  assert.throws(() => createCrawlPolicy({ maxPages: 0 }), /crawl_policy_maxPages_invalid/);
});

test("provenance and checkpoints preserve resumable source evidence", () => {
  assert.deepEqual(createProvenance({
    sourceUrl: "https://vendor.example/products/tea?utm_campaign=spring",
    method: "shopify_json",
    confidence: 1,
  }), {
    sourceUrl: "https://vendor.example/products/tea",
    method: "shopify_json",
    confidence: 1,
  });

  assert.deepEqual(createCrawlCheckpoint({
    jobId: "job_1",
    pendingUrls: ["https://vendor.example/collections/tea?page=2"],
    completedUrls: ["https://vendor.example/collections/tea?page=1"],
  }), {
    jobId: "job_1",
    pendingUrls: ["https://vendor.example/collections/tea?page=2"],
    completedUrls: ["https://vendor.example/collections/tea?page=1"],
    failedUrls: [],
    updatedAt: null,
  });
  assert.deepEqual(SCRAPER_TERMINAL_STATES, ["completed", "partial", "failed", "unsupported", "manual_review"]);
});
