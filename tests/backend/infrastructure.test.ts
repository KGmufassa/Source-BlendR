import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createAuditEvent } from "@/domain/audit/audit-log";
import { AUDIT_EVENTS_TABLE } from "@/server/audit/database-audit-sink";
import { createRuntimeInfrastructure } from "@/server/infrastructure/runtime";

describe("runtime infrastructure scaffolds", () => {
  it("stores and updates workspace-scoped database records", async () => {
    const { database } = createRuntimeInfrastructure();

    const supplier = await database.insert("suppliers", {
      workspaceId: "workspace-1",
      data: {
        name: "Acme Apparel",
        status: "active"
      }
    });

    await database.insert("suppliers", {
      workspaceId: "workspace-2",
      data: {
        name: "Other Workspace Supplier"
      }
    });

    const updated = await database.update("suppliers", supplier.id, { status: "preferred" });
    const workspaceSuppliers = await database.listByWorkspace("suppliers", "workspace-1");

    expect(updated.data.status).toBe("preferred");
    expect(workspaceSuppliers).toHaveLength(1);
    expect(workspaceSuppliers[0]?.data.name).toBe("Acme Apparel");
  });

  it("stores and retrieves private object storage files", async () => {
    const storageRoot = await mkdtemp(path.join(tmpdir(), "source-blendr-storage-"));
    const { storage } = createRuntimeInfrastructure({ storageRoot });

    try {
      const stored = await storage.putObject({
        bucket: "imports",
        key: "workspace-1/products.csv",
        body: Buffer.from("sku,name\nA-1,Blank Tee"),
        contentType: "text/csv"
      });

      const body = await storage.getObject(stored.bucket, stored.key);

      expect(stored.size).toBeGreaterThan(0);
      expect(body.toString("utf8")).toContain("Blank Tee");
    } finally {
      await rm(storageRoot, { force: true, recursive: true });
    }
  });

  it("processes placeholder jobs through queue state transitions", async () => {
    const { queue } = createRuntimeInfrastructure();
    const job = await queue.enqueue({
      type: "import.validate",
      payload: {
        importBatchId: "batch-1"
      },
      maxAttempts: 2
    });

    const next = await queue.next("import.validate");
    expect(next?.id).toBe(job.id);
    expect(next?.state).toBe("processing");
    expect(next?.attempts).toBe(1);

    const failed = await queue.fail(job.id, "Unsupported file format");
    expect(failed.state).toBe("failed");

    const retried = await queue.retry(job.id);
    expect(retried.state).toBe("queued");

    const processingAgain = await queue.next();
    const completed = await queue.complete(processingAgain!.id);
    expect(completed.state).toBe("completed");
  });

  it("records audit events through the database-backed audit sink", async () => {
    const { audit, database } = createRuntimeInfrastructure();
    const event = createAuditEvent({
      workspaceId: "workspace-1",
      actorUserId: "user-1",
      action: "supplier.created",
      targetId: "supplier-1",
      metadata: {
        supplierName: "Acme Apparel"
      }
    });

    await audit.record(event);
    const auditEvents = await database.listByWorkspace(AUDIT_EVENTS_TABLE, "workspace-1");

    expect(auditEvents).toHaveLength(1);
    expect(auditEvents[0]?.data.action).toBe("supplier.created");
    expect(auditEvents[0]?.data.targetId).toBe("supplier-1");
  });
});
