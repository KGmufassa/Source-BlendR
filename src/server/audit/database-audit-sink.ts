import type { AuditEvent, AuditSink } from "@/domain/audit/audit-log";
import type { DatabaseAdapter } from "@/server/persistence/database";

export const AUDIT_EVENTS_TABLE = "audit_events";

export class DatabaseAuditSink implements AuditSink {
  constructor(private readonly database: DatabaseAdapter) {}

  async record(event: AuditEvent): Promise<void> {
    await this.database.insert(AUDIT_EVENTS_TABLE, {
      id: event.id,
      workspaceId: event.workspaceId,
      data: {
        actorUserId: event.actorUserId,
        action: event.action,
        targetId: event.targetId,
        metadata: event.metadata ?? {},
        createdAt: event.createdAt
      }
    });
  }
}
