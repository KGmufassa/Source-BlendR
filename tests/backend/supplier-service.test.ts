import { describe, expect, it } from "vitest";
import { AUDIT_EVENTS_TABLE, DatabaseAuditSink } from "@/server/audit/database-audit-sink";
import { MemoryDatabaseAdapter } from "@/server/persistence/memory-database";
import { SupplierNotFoundError, SupplierService } from "@/server/suppliers/supplier-service";

function createService() {
  const database = new MemoryDatabaseAdapter();
  const audit = new DatabaseAuditSink(database);
  const service = new SupplierService(database, audit);

  return { database, service };
}

describe("SupplierService", () => {
  it("creates, updates, archives, and lists workspace suppliers", async () => {
    const { service } = createService();
    const context = { workspaceId: "workspace-a", actorUserId: "user-a" };

    const created = await service.createSupplier(context, {
      name: "Acme Blanks",
      email: "sourcing@acme.test",
      preferred: true
    });

    expect(created).toMatchObject({
      workspaceId: "workspace-a",
      name: "Acme Blanks",
      status: "preferred",
      preferred: true
    });

    const updated = await service.updateSupplier(context, created.id, {
      contactName: "Jordan Buyer",
      status: "active"
    });

    expect(updated.contactName).toBe("Jordan Buyer");
    expect(updated.status).toBe("active");

    const archived = await service.archiveSupplier(context, created.id);
    expect(archived.status).toBe("archived");
    expect(archived.preferred).toBe(false);

    await service.createSupplier({ workspaceId: "workspace-b", actorUserId: "user-b" }, { name: "Other Vendor" });

    await expect(service.listSuppliers("workspace-a")).resolves.toHaveLength(1);
    await expect(service.listSuppliers("workspace-b")).resolves.toHaveLength(1);
  });

  it("prevents cross-workspace supplier access", async () => {
    const { service } = createService();
    const supplier = await service.createSupplier(
      { workspaceId: "workspace-a", actorUserId: "user-a" },
      { name: "Scoped Supplier" }
    );

    await expect(service.getSupplier("workspace-b", supplier.id)).rejects.toBeInstanceOf(SupplierNotFoundError);
    await expect(
      service.updateSupplier({ workspaceId: "workspace-b", actorUserId: "user-b" }, supplier.id, { name: "Leaked" })
    ).rejects.toBeInstanceOf(SupplierNotFoundError);
  });

  it("manages supplier source records with file and manual intake metadata", async () => {
    const { service } = createService();
    const context = { workspaceId: "workspace-a", actorUserId: "user-a" };
    const supplier = await service.createSupplier(context, { name: "Decoration Partner" });

    const fileSource = await service.createSource(context, supplier.id, {
      type: "file",
      name: "Wholesale CSV",
      fileName: "wholesale.csv",
      fileObjectKey: "imports/wholesale.csv",
      healthStatus: "healthy",
      status: "available"
    });

    const manualSource = await service.createSource(context, supplier.id, {
      type: "manual",
      name: "Manual service table",
      manualReference: "2026 embroidery rate card"
    });

    expect(fileSource).toMatchObject({
      supplierId: supplier.id,
      type: "file",
      fileName: "wholesale.csv",
      fileObjectKey: "imports/wholesale.csv",
      healthStatus: "healthy"
    });
    expect(manualSource).toMatchObject({
      type: "manual",
      manualReference: "2026 embroidery rate card",
      status: "needs_review"
    });

    const updatedSource = await service.updateSource(context, supplier.id, manualSource.id, {
      status: "available",
      healthStatus: "healthy"
    });

    expect(updatedSource.status).toBe("available");
    expect(await service.listSources("workspace-a", supplier.id)).toHaveLength(2);
  });

  it("records audit events for supplier and source mutations", async () => {
    const { database, service } = createService();
    const context = { workspaceId: "workspace-a", actorUserId: "user-a" };
    const supplier = await service.createSupplier(context, { name: "Audit Supplier" });
    const source = await service.createSource(context, supplier.id, {
      type: "manual",
      name: "Manual catalog",
      notes: "Entered from vendor email"
    });

    await service.updateSupplier(context, supplier.id, { notes: "Preferred for rush orders" });
    await service.updateSource(context, supplier.id, source.id, { healthStatus: "warning" });

    const auditEvents = await database.listByWorkspace(AUDIT_EVENTS_TABLE, "workspace-a");
    expect(auditEvents.map((event) => event.data.action)).toEqual([
      "supplier.created",
      "supplier_source.created",
      "supplier.updated",
      "supplier_source.updated"
    ]);
  });
});
