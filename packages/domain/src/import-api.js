import { summarizeImportJob } from "../../../apps/worker/src/import-jobs.js";
import { requireWorkspaceAccess } from "../../types/src/workspace.js";

export function createImportApi({ eventLog, workspaceContext }) {
  const appendScopedEvent = (jobId, type) => {
    requireWorkspaceAccess(workspaceContext, workspaceContext.workspaceId);
    eventLog.append({ jobId, workspaceId: workspaceContext.workspaceId, type });
  };

  return {
    recordEvent: appendScopedEvent,
    retryJob(jobId) {
      appendScopedEvent(jobId, "retry_requested");
    },
    cancelJob(jobId) {
      appendScopedEvent(jobId, "cancel_requested");
    },
    getStatus(jobId) {
      requireWorkspaceAccess(workspaceContext, workspaceContext.workspaceId);
      const events = eventLog.list(workspaceContext.workspaceId, jobId);
      if (events.length === 0) {
        throw new Error("job_not_found");
      }

      return summarizeImportJob(events);
    },
  };
}
