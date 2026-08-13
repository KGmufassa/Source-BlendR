import assert from "node:assert/strict";
import test from "node:test";

import { collectWebsiteSource } from "./src/website-collector.js";

test("Shopify collection uses deterministic product JSON before browser rendering", async () => {
  let browserCalls = 0;
  const fetchImpl = async (url) => {
    if (String(url).endsWith(".js")) return response({ json: { id: 1, handle: "tea", title: "Tea", variants: [{ id: 2, title: "Default Title", sku: "TEA", price: 1200, available: true }] } });
    return response({ html: '<title>Tea</title><script src="https://cdn.shopify.com/a.js"></script><a href="/collections/tea">Tea</a><a href="/products/tea">Tea</a>', headers: { "powered-by": "Shopify" } });
  };

  const result = await collectWebsiteSource("workspace_1", "https://vendor.example/collections/tea", {
    fetchImpl,
    sleep: async () => {},
    renderPage: async () => { browserCalls += 1; throw new Error("browser_should_not_run"); },
  });

  assert.equal(browserCalls, 0);
  assert.equal(result.platform, "shopify");
  assert.equal(result.products.length, 1);
  assert.equal(result.categories[0].url, "https://vendor.example/collections/tea");
});

test("generic storefront uses rendered DOM fallback", async () => {
  const result = await collectWebsiteSource("workspace_1", "https://vendor.example/catalog", {
    fetchImpl: async () => response({ html: "<title>Loading</title>" }),
    renderPage: async () => ({ url: "https://vendor.example/catalog", html: "<title>Catalog</title><a href='/products/tea'>Tea</a>" }),
  });

  assert.equal(result.platform, "generic_browser");
  assert.equal(result.title, "Catalog");
  assert.deepEqual(result.records, ["Tea"]);
});

test("Shopify collector paginates until no new products and reconciles counters", async () => {
  const fetchImpl = async (url) => {
    const value = String(url);
    if (value.endsWith("tea.js")) return response({ json: { id: 1, title: "Tea", variants: [] } });
    if (value.endsWith("coffee.js")) return response({ json: { id: 2, title: "Coffee", variants: [] } });
    if (value.includes("page=2")) return response({ html: '<script src="https://cdn.shopify.com/a.js"></script><a href="/products/coffee">Coffee</a>' });
    if (value.includes("page=3")) return response({ html: '<script src="https://cdn.shopify.com/a.js"></script>' });
    return response({ html: '<script src="https://cdn.shopify.com/a.js"></script><a href="/products/tea">Tea</a>' });
  };

  const result = await collectWebsiteSource("workspace_1", "https://vendor.example/collections/drinks", { fetchImpl, maxPages: 5, sleep: async () => {} });

  assert.deepEqual(result.products.map((product) => product.title), ["Tea", "Coffee"]);
  assert.deepEqual(result.checkpoint.counters, { pagesCompleted: 3, productsDiscovered: 2, productsCompleted: 2, productsFailed: 0, duplicatesSkipped: 0 });
});

test("Shopify product requests honor throttling and retry rate limits", async () => {
  let productCalls = 0;
  const delays = [];
  const result = await collectWebsiteSource("workspace_1", "https://vendor.example/pages/tea", {
    sleep: async (delay) => delays.push(delay),
    fetchImpl: async (url) => {
      if (!String(url).endsWith(".js")) return response({ html: '<script src="https://cdn.shopify.com/a.js"></script><a href="/products/tea">Tea</a>' });
      productCalls += 1;
      if (productCalls === 1) return response({ status: 429, headers: { "retry-after": "1" } });
      return response({ json: { id: 1, title: "Tea", variants: [] } });
    },
  });
  assert.equal(result.products.length, 1);
  assert.deepEqual(delays, [250, 1000]);
});

function response({ html = "", json, headers = {}, status = 200 }) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => headers[name.toLowerCase()] ?? null },
    text: async () => html,
    json: async () => json,
  };
}
