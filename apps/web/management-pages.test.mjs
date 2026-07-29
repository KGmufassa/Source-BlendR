import assert from "node:assert/strict";
import test from "node:test";

import { renderAiSettingsPage, renderCatalogManagementPage } from "./src/management-pages.js";

test("catalog management page exposes approved route actions and responsive table contract", () => {
  const html = renderCatalogManagementPage({
    items: [{ name: "Tea", sku: "TEA", priceCents: 300 }],
  });

  assert.match(html, /href="\/app\/catalog"/);
  assert.match(html, /href="\/app\/catalog\/new"/);
  assert.match(html, /data-action="ACTION-SEARCH-CATALOG"/);
  assert.match(html, /data-component="DataTable"/);
  assert.match(html, /data-mobile-behavior="stacked_labeled_records"/);
});

test("ai settings page exposes provider health and manual fallback states", () => {
  const html = renderAiSettingsPage({
    providers: [{ id: "local", status: "healthy", capability: "normalize_item" }],
  });

  assert.match(html, /href="\/app\/settings\/ai"/);
  assert.match(html, /data-action="ACTION-HEALTH-CHECK"/);
  assert.match(html, /data-state="manual_fallback"/);
  assert.match(html, /Save AI settings/);
});
