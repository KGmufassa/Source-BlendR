import assert from "node:assert/strict";
import test from "node:test";

import { createMemoryJobEventLog } from "../../apps/worker/src/import-jobs.js";
import { createImportApi } from "./src/import-api.js";

const context = { userId: "user_1", workspaceId: "workspace_1", role: "member" };

test("import api reports status events only for the active workspace", () => {
  const eventLog = createMemoryJobEventLog();
  const api = createImportApi({ eventLog, workspaceContext: context });

  api.recordEvent("job_1", "queued");
  eventLog.append({ jobId: "job_2", workspaceId: "workspace_2", type: "completed" });

  assert.deepEqual(api.getStatus("job_1"), {
    jobId: "job_1",
    status: "queued",
    events: ["queued"],
  });
  assert.throws(() => api.getStatus("job_2"), /job_not_found/);
});

test("import api records retry and cancel events", () => {
  const api = createImportApi({
    eventLog: createMemoryJobEventLog(),
    workspaceContext: context,
  });

  api.recordEvent("job_1", "failed");
  api.retryJob("job_1");
  api.cancelJob("job_1");

  assert.deepEqual(api.getStatus("job_1").events, ["failed", "retry_requested", "cancel_requested"]);
});
