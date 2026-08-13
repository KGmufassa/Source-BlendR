import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appDirectory = new URL("./app/", import.meta.url);

test("overview implements approved analytics and removes generic system status", async () => {
  const page = await readFile(new URL("app/page.tsx", appDirectory), "utf8");
  for (const label of ["Items Awaiting Review", "Failed or Stalled Imports", "Potential Duplicates", "Recently Resolved"]) assert.match(page, new RegExp(label));
  assert.match(page, />Analytics<\/h2>/);
  assert.doesNotMatch(page, />Needs Analytics<\/h2>/);
  assert.doesNotMatch(page, /System status:/);
  assert.match(page, /stalledBefore/);
  assert.match(page, /rollingThirtyDays/);
});

test("overview access request is persisted and duplicate-aware", async () => {
  const route = await readFile(new URL("api/access-requests/route.ts", appDirectory), "utf8");
  const client = await readFile(new URL("app/request-provider-access.tsx", appDirectory), "utf8");
  assert.match(route, /auditEvent\.findFirst/);
  assert.match(route, /auditEvent\.create/);
  assert.match(route, /recipientRole: "org:admin"/);
  assert.match(client, /An access request is already pending/);
});

test("shared sidebar uses SVG outline icons instead of unicode route glyphs", async () => {
  const shell = await readFile(new URL("workspace-shell.tsx", appDirectory), "utf8");
  assert.match(shell, /function SidebarIcon/);
  assert.match(shell, /<svg aria-hidden="true"/);
  assert.doesNotMatch(shell, /"\/app": "▦"/);
});
