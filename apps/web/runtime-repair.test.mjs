import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import test from "node:test";

const root = cwd();
const app = join(root, "apps/web/app");

function read(relativePath) {
  return readFileSync(join(app, relativePath), "utf8");
}

const runtimePages = [
  "app/page.tsx",
  "app/imports/page.tsx",
  "app/imports/website/page.tsx",
  "app/imports/pdf/page.tsx",
  "app/imports/jobs/page.tsx",
  "app/imports/jobs/[jobId]/page.tsx",
  "app/discovery/page.tsx",
  "app/discovery/[sessionId]/page.tsx",
  "app/vendors/page.tsx",
  "app/vendors/[vendorId]/page.tsx",
  "app/catalog/[itemId]/page.tsx",
  "app/settings/ai/page.tsx",
];

test("repair runtime pages use workspace data instead of UI fixtures", () => {
  for (const page of runtimePages) {
    assert.doesNotMatch(read(page), /ui-fixtures/, page);
  }
});

test("repair forms use browser handlers with visible response states", () => {
  const pages = [
    "app/imports/website/page.tsx",
    "app/imports/pdf/page.tsx",
    "app/catalog/new/page.tsx",
    "app/vendors/new/page.tsx",
    "app/settings/ai/page.tsx",
  ].map(read).join("\n");

  assert.doesNotMatch(pages, /action="\/api\//);
  assert.match(pages, /WebsiteImportForm/);
  assert.match(pages, /PdfImportForm/);
  assert.match(pages, /CatalogItemForm/);
  assert.match(pages, /VendorForm/);
  assert.match(pages, /AiSettingsClient/);
});

test("repair APIs expose vendor, job, and candidate mutations", () => {
  for (const route of [
    "api/vendors/route.ts",
    "api/vendors/[vendorId]/route.ts",
    "api/imports/jobs/[jobId]/route.ts",
    "api/discovery-sessions/[sessionId]/candidates/route.ts",
  ]) {
    assert.doesNotThrow(() => read(route), route);
  }

  assert.match(read("api/imports/jobs/[jobId]/route.ts"), /export async function PATCH/);
  assert.match(read("api/discovery-sessions/[sessionId]/candidates/route.ts"), /export async function PATCH/);
});

test("completed website jobs expose selectable independent category jobs", () => {
  assert.doesNotThrow(() => read("api/imports/jobs/[jobId]/categories/route.ts"));
  assert.match(read("api/imports/jobs/[jobId]/categories/route.ts"), /export async function POST/);
  assert.match(read("app/imports/jobs/[jobId]/page.tsx"), /CategoryJobSelector/);
  assert.match(read("app/imports/jobs/[jobId]/category-job-selector.tsx"), /categoryUrls/);
});

test("local smoke auth bypasses Clerk only outside production", () => {
  const proxy = readFileSync(join(root, "apps/web/proxy.ts"), "utf8");
  assert.match(proxy, /SOURCE_BLENDR_DEV_AUTH/);
  assert.match(proxy, /NODE_ENV !== "production"/);
  assert.match(proxy, /SOURCE_BLENDR_ALLOW_DEV_AUTH_IN_PRODUCTION/);
});
