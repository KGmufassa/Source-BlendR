const SOURCE_TYPES = Object.freeze(["website", "pdf"]);
const TERMINAL_EVENTS = Object.freeze({
  completed: "completed",
  failed: "failed",
  canceled: "canceled",
});

export function createImportJobPayload(input) {
  for (const field of ["jobId", "workspaceId", "sourceUri", "requestedByUserId"]) {
    if (!String(input?.[field] ?? "").trim()) {
      throw new Error(`${field}_required`);
    }
  }
  if (!SOURCE_TYPES.includes(input.sourceType)) {
    throw new Error("source_type_invalid");
  }

  return {
    jobId: input.jobId,
    workspaceId: input.workspaceId,
    sourceType: input.sourceType,
    sourceUri: input.sourceUri,
    requestedByUserId: input.requestedByUserId,
    attempt: input.attempt ?? 1,
  };
}

export function createMemoryJobEventLog(seedEvents = []) {
  const events = [...seedEvents];

  return {
    append(event) {
      if (!event?.jobId || !event.workspaceId || !event.type) {
        throw new Error("job_event_invalid");
      }
      events.push({ ...event });
    },
    list(workspaceId, jobId) {
      return events.filter((event) => event.workspaceId === workspaceId && event.jobId === jobId);
    },
  };
}

export function summarizeImportJob(events) {
  if (events.length === 0) {
    throw new Error("job_events_required");
  }

  const lastTerminal = events.findLast((event) => TERMINAL_EVENTS[event.type]);

  return {
    jobId: events[0].jobId,
    status: lastTerminal?.type ?? events.at(-1).type,
    events: events.map((event) => event.type),
  };
}
