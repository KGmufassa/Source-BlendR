import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = new URL("./app/", import.meta.url);
const read = (path) => readFile(new URL(path, app), "utf8");

test("imports use real jobs and labeled detail actions", async () => {
  const page = await read("app/imports/page.tsx");
  assert.match(page, /importJobs\.map/);
  assert.match(page, /Job Details/);
  assert.doesNotMatch(page, /visualRows|System status|<button[^>]*>Retry/);
});

test("import setup removes demo category controls and preserves job handoff", async () => {
  const [pdf, website] = await Promise.all([read("app/imports/pdf/pdf-import-client.tsx"), read("app/imports/website/website-import-client.tsx")]);
  assert.doesNotMatch(pdf, /Demo States|Extraction Settings/);
  assert.match(pdf, /router\.push\(`\/app\/imports\/jobs\/\$\{job\.id\}`\)/);
  assert.doesNotMatch(website, /Detected Category Tree|Start Selected Categories|System Ready/);
  assert.match(website, /router\.push\(`\/app\/imports\/jobs\/\$\{job\.id\}`\)/);
});

test("job details offers shared category views and child-job links", async () => {
  const selector = await read("app/imports/jobs/[jobId]/category-job-selector.tsx");
  assert.match(selector, /Collections/);
  assert.match(selector, /Category Tree/);
  assert.match(selector, /Open child job/);
  assert.match(selector, /aria-checked=\{state\}/);
});

test("discovery has unified filtering pagination vendor data and persistent editing", async () => {
  const [page, client, route] = await Promise.all([read("app/discovery/page.tsx"), read("app/discovery/discovery-overview-client.tsx"), read("api/discovery-items/route.ts")]);
  assert.match(page, /candidateItem\.findMany/);
  assert.match(page, /catalogItem\.findMany/);
  for (const label of ["Vendor", "Vendor Price", "Items per page", "Product Details", "Save"]) assert.match(client, new RegExp(label));
  assert.doesNotMatch(client, /Discovery Session:|Confidence|>Preview<|Save & Resolve|Reference:/);
  assert.match(route, /promoteCandidates/);
  assert.match(route, /vendorPriceCents/);
});

test("catalog routes use collection persistence and member operations", async () => {
  const [list, form, details, schema] = await Promise.all([read("app/catalog/catalog-client.tsx"), read("app/catalog/new/new-catalog-item-client.tsx"), read("app/catalog/[itemId]/catalog-details-client.tsx"), readFile(new URL("../../prisma/schema.prisma", import.meta.url), "utf8")]);
  assert.match(list, /View Details/);
  assert.doesNotMatch(list, /POPULATED|LOADING|EMPTY|ERROR/);
  assert.match(form, /Category Type/);
  assert.match(form, /Save Catalog/);
  assert.doesNotMatch(form, /Pricing|Tax|Save item/);
  assert.match(details, /Add from Discovery/);
  assert.match(details, /Remove/);
  assert.match(schema, /model Catalog\s+\{/);
  assert.match(schema, /model CatalogMember\s+\{/);
});

test("vendors and workspace settings expose approved real actions", async () => {
  const [vendors, detail, settings, workspace, route] = await Promise.all([read("app/vendors/vendors-client.tsx"), read("app/vendors/[vendorId]/page.tsx"), read("app/settings/page.tsx"), read("app/settings/workspace/workspace-settings-client.tsx"), read("api/workspace-settings/route.ts")]);
  assert.match(vendors, /View Details/);
  assert.doesNotMatch(vendors, /Vendor demo states|System Status/);
  assert.match(detail, />Import<\/Link>/);
  assert.match(detail, /Contact Information|Website Details|Products and Services|Recent Import Activity/);
  assert.match(settings, /href="\/app\/settings\/workspace"/);
  assert.match(workspace, /beforeunload|Members and Access|Delete Workspace/);
  assert.match(route, /requireAdmin|workspace\.delete/);
});
