import assert from "node:assert/strict";
import test from "node:test";

import { assertPublicHttpUrl, fetchPublic, robotsAllows } from "./src/url-security.js";

test("URL validation rejects credentials and every private DNS answer", async () => {
  await assert.rejects(() => assertPublicHttpUrl("https://user:pass@example.com", async () => [{ address: "93.184.216.34" }] ), /source_credentials_forbidden/);
  await assert.rejects(() => assertPublicHttpUrl("https://example.com", async () => [{ address: "93.184.216.34" }, { address: "127.0.0.1" }] ), /source_address_forbidden/);
  assert.equal((await assertPublicHttpUrl("https://example.com/path", async () => [{ address: "93.184.216.34" }])).hostname, "example.com");
});

test("public fetch revalidates redirects", async () => {
  const fetchImpl = async (url) => String(url) === "https://example.com/"
    ? { status: 302, headers: { get: () => "http://127.0.0.1/admin" } }
    : { status: 200, headers: { get: () => null } };
  await assert.rejects(() => fetchPublic("https://example.com", { fetchImpl, lookupImpl: async (host) => [{ address: host === "example.com" ? "93.184.216.34" : host }] }), /source_address_forbidden/);
});

test("robots policy applies the wildcard user agent", () => {
  const robots = "User-agent: *\nDisallow: /private\nAllow: /private/catalog";
  assert.equal(robotsAllows(robots, "/products/tea"), true);
  assert.equal(robotsAllows(robots, "/private/orders"), false);
  assert.equal(robotsAllows(robots, "/private/catalog"), true);
});
