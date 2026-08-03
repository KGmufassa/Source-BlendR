import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import test from "node:test";

const repoRoot = cwd();
const appRoot = join(repoRoot, "apps/web/app/app");

const plannedPageFiles = [
  "page.tsx",
  "imports/page.tsx",
  "imports/website/page.tsx",
  "imports/pdf/page.tsx",
  "imports/jobs/page.tsx",
  "imports/jobs/[jobId]/page.tsx",
  "discovery/page.tsx",
  "discovery/[sessionId]/page.tsx",
  "catalog/page.tsx",
  "catalog/catalog-client.tsx",
  "catalog/new/page.tsx",
  "catalog/[itemId]/page.tsx",
  "vendors/page.tsx",
  "vendors/new/page.tsx",
  "vendors/[vendorId]/page.tsx",
  "settings/page.tsx",
  "settings/ai/page.tsx",
];

function readAppFile(relativePath) {
  return readFileSync(join(appRoot, relativePath), "utf8");
}

test("live Next app contains planned route pages", () => {
  for (const relativePath of plannedPageFiles) {
    assert.doesNotThrow(() => readAppFile(relativePath), relativePath);
  }
});

test("live pages expose approved workflow actions", () => {
  const pageText = [
    ...plannedPageFiles.map(readAppFile),
    readFileSync(join(repoRoot, "apps/web/app/workspace-routes.ts"), "utf8"),
  ].join("\n");

  for (const expected of [
    "Start import",
    "Website import",
    "PDF Import",
    "Open job",
    "Retry failed work",
    "Cancel job",
    "Search candidates",
    "Import selected",
    "Ignore selected",
    "Archive selected",
    "Search catalog",
    "Type filter",
    "New catalog item",
    "Open item",
    "New vendor",
    "Add provider",
    "Run health check",
    "Save routing",
  ]) {
    assert.match(pageText, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), expected);
  }
});

test("live CSS uses approved design system tokens and responsive patterns", () => {
  const css = readFileSync(join(repoRoot, "apps/web/app/globals.css"), "utf8");

  assert.match(css, /--sb-canvas: #f7f9fb/);
  assert.match(css, /--sb-action: #006c49/);
  assert.match(css, /--sb-focus: #10b981/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /td::before/);
  assert.match(css, /\.drawer/);
});
