import assert from "node:assert/strict";
import test from "node:test";

import {
  createImportJobPayload,
  createMemoryJobEventLog,
  summarizeImportJob,
} from "./src/import-jobs.js";

test("import job payloads keep queue work workspace-scoped", () => {
  const payload = createImportJobPayload({
    jobId: "job_1",
    workspaceId: "workspace_1",
    sourceType: "website",
    sourceUri: "https://vendor.example/catalog",
    requestedByUserId: "user_1",
  });

  assert.deepEqual(payload, {
    jobId: "job_1",
    workspaceId: "workspace_1",
    sourceType: "website",
    sourceUri: "https://vendor.example/catalog",
    requestedByUserId: "user_1",
    attempt: 1,
  });
});

test("job event log exposes observable terminal status", () => {
  const log = createMemoryJobEventLog();
  log.append({ jobId: "job_1", workspaceId: "workspace_1", type: "queued" });
  log.append({ jobId: "job_1", workspaceId: "workspace_1", type: "completed" });
  log.append({ jobId: "job_2", workspaceId: "workspace_2", type: "failed" });

  assert.deepEqual(summarizeImportJob(log.list("workspace_1", "job_1")), {
    jobId: "job_1",
    status: "completed",
    events: ["queued", "completed"],
  });
  assert.deepEqual(log.list("workspace_1", "job_2"), []);
});
