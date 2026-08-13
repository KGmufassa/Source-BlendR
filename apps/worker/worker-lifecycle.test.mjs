import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { URL } from "node:url";

import { canClaimImportJob, workerHealth } from "./src/import-jobs.js";

test("a retry can reclaim a processing job after a stalled worker", () => {
  assert.equal(canClaimImportJob("queued", 1), true);
  assert.equal(canClaimImportJob("processing", 1), false);
  assert.equal(canClaimImportJob("processing", 2), true);
  assert.equal(canClaimImportJob("completed", 2), false);
  assert.equal(canClaimImportJob("canceled", 2), false);
});

test("worker health requires BullMQ and Redis and reports shutdown", () => {
  assert.deepEqual(workerHealth({ workerRunning: true, redisStatus: "ready", shuttingDown: false }), {
    status: "ready",
    checks: { worker: true, redis: true, shuttingDown: false },
  });
  assert.deepEqual(workerHealth({ workerRunning: true, redisStatus: "ready", shuttingDown: true }), {
    status: "not_ready",
    checks: { worker: true, redis: true, shuttingDown: true },
  });
});

test("worker image installs the repository-pinned pnpm without bundled Corepack", async () => {
  const dockerfile = await readFile(new URL("./Dockerfile", import.meta.url), "utf8");
  assert.match(dockerfile, /npm install --global pnpm@10\.13\.1/);
});

test("worker runtime image preserves pnpm workspace dependency links", async () => {
  const dockerfile = await readFile(new URL("./Dockerfile", import.meta.url), "utf8");
  assert.match(dockerfile, /COPY --from=build \/app\/apps\/worker\/node_modules \.\/apps\/worker\/node_modules/);
  assert.match(dockerfile, /CMD \["node", "apps\/worker\/dist\/index\.js"\]/);
});

test("worker runtime image pins the matching Playwright Chromium image", async () => {
  const dockerfile = await readFile(new URL("./Dockerfile", import.meta.url), "utf8");
  assert.match(dockerfile, /FROM mcr\.microsoft\.com\/playwright:v1\.55\.1-noble/);
});
