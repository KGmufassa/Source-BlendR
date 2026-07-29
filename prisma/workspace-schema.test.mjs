import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("prisma schema defines workspace-scoped catalog models", async () => {
  const schema = await readFile(new URL("./schema.prisma", import.meta.url), "utf8");

  assert.match(schema, /model Workspace/);
  assert.match(schema, /model Vendor/);
  assert.match(schema, /model CatalogItem/);
  assert.match(schema, /workspaceId\s+String/);
  assert.match(schema, /@@unique\(\[workspaceId, sku\]\)/);
});
