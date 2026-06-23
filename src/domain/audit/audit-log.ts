export type AuditAction =
  | "member.invited"
  | "member.role_updated"
  | "supplier.created"
  | "supplier.updated"
  | "supplier.archived"
  | "supplier_source.created"
  | "supplier_source.updated"
  | "import.created"
  | "import.mapping_updated"
  | "import.validated"
  | "import.failed"
  | "import.retry_requested"
  | "import.committed"
  | "pricing.rule_created"
  | "pricing.previewed"
  | "pricing.snapshot_created"
  | "pricing.snapshot_locked"
  | "customer.created"
  | "quote.created"
  | "quote.updated"
  | "quote.approved"
  | "quote.rejected"
  | "quote.output_requested"
  | "quote.output_generated"
  | "quote.shared"
  | "quote.share_revoked";

export type AuditEvent = {
  id: string;
  workspaceId: string;
  actorUserId: string;
  action: AuditAction;
  targetId: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
};

export interface AuditSink {
  record(event: AuditEvent): Promise<void>;
}

export class MemoryAuditSink implements AuditSink {
  private readonly events: AuditEvent[] = [];

  async record(event: AuditEvent): Promise<void> {
    this.events.push(event);
  }

  all(): AuditEvent[] {
    return [...this.events];
  }
}

export function createAuditEvent(input: Omit<AuditEvent, "id" | "createdAt">): AuditEvent {
  return {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString()
  };
}
import { randomUUID } from "node:crypto";
