import assert from "node:assert/strict";
import test from "node:test";

import { collectRenderedPage } from "./src/browser.js";

test("browser collector returns rendered HTML and always closes Chromium", async () => {
  const calls = [];
  const page = {
    goto: async (url, options) => calls.push(["goto", url, options.waitUntil]),
    content: async () => "<main><a href='/products/tea'>Tea</a></main>",
  };
  const context = { newPage: async () => page, close: async () => calls.push(["context.close"]) };
  const browser = { newContext: async () => context, close: async () => calls.push(["browser.close"]) };
  const chromium = { launch: async () => browser };

  const result = await collectRenderedPage("https://vendor.example/collections/tea", { chromium, timeoutMs: 5000, validateUrl: async () => {} });

  assert.equal(result.html, "<main><a href='/products/tea'>Tea</a></main>");
  assert.equal(result.url, "https://vendor.example/collections/tea");
  assert.deepEqual(calls, [
    ["goto", "https://vendor.example/collections/tea", "domcontentloaded"],
    ["context.close"],
    ["browser.close"],
  ]);
});

test("browser collector closes Chromium after navigation failure", async () => {
  let closed = false;
  const chromium = {
    launch: async () => ({
      newContext: async () => ({ newPage: async () => ({ goto: async () => { throw new Error("timeout"); } }), close: async () => {} }),
      close: async () => { closed = true; },
    }),
  };

  await assert.rejects(() => collectRenderedPage("https://vendor.example", { chromium, validateUrl: async () => {} }), /timeout/);
  assert.equal(closed, true);
});
