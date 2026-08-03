import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

test("declares the approved pnpm workspace skeleton", async () => {
  const rootPackage = await readJson("package.json");
  const workspace = await readFile("pnpm-workspace.yaml", "utf8");

  assert.equal(rootPackage.private, true);
  assert.match(rootPackage.packageManager, /^pnpm@/);
  assert.deepEqual(rootPackage.engines, { node: ">=22.12", pnpm: ">=10" });
  assert.match(rootPackage.scripts["test:contracts"], /node --test/);
  assert.match(rootPackage.scripts["test:contracts"], /apps\/workspace-scaffold\.test\.mjs/);
  assert.match(workspace, /- "apps\/\*"/);
  assert.match(workspace, /- "packages\/\*"/);
});
