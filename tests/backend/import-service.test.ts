import { describe, expect, it } from "vitest";
import { AUDIT_EVENTS_TABLE, DatabaseAuditSink } from "@/server/audit/database-audit-sink";
import {
  ImportBatchAlreadyCommittedError,
  ImportCommitConflictError,
  ImportService,
  IMPORT_VALIDATION_JOB
} from "@/server/imports/import-service";
import { MemoryDatabaseAdapter } from "@/server/persistence/memory-database";
import { MemoryJobQueueAdapter } from "@/server/queue/job-queue";
import { SupplierService } from "@/server/suppliers/supplier-service";

const context = { workspaceId: "workspace-a", actorUserId: "user-a" };
const mapping = {
  sku: "SKU",
  name: "Name",
  description: "Description",
  unitCost: "Cost",
  currency: "Currency",
  category: "Category"
};

async function createImportFixture() {
  const database = new MemoryDatabaseAdapter();
  const audit = new DatabaseAuditSink(database);
  const queue = new MemoryJobQueueAdapter();
  const supplierService = new SupplierService(database, audit);
  const importService = new ImportService(database, audit, queue, supplierService);
  const supplier = await supplierService.createSupplier(context, { name: "Acme Blanks" });
  const source = await supplierService.createSource(context, supplier.id, {
    type: "file",
    name: "Wholesale CSV",
    fileName: "wholesale.csv"
  });

  return { audit, database, importService, queue, source, supplier };
}

describe("ImportService", () => {
  it("creates import batches, preserves raw rows, updates mappings, validates rows, and enqueues validation work", async () => {
    const { importService, queue, source, supplier } = await createImportFixture();

    const batch = await importService.createBatch(context, {
      supplierId: supplier.id,
      sourceId: source.id,
      intakeType: "file",
      rawObjectKey: "raw/imports/acme.csv",
      rows: [
        {
          SKU: "TSHIRT-001",
          Name: "Heavy Cotton Tee",
          Description: "Black tee",
          Cost: 4.25,
          Currency: "USD",
          Category: "Apparel"
        }
      ]
    });

    expect(batch.status).toBe("mapping_required");
    expect(batch.rawObjectKey).toBe("raw/imports/acme.csv");
    expect(batch.rawRows[0]).toMatchObject({ SKU: "TSHIRT-001", Name: "Heavy Cotton Tee" });

    const queuedJobs = await queue.list("queued");
    expect(queuedJobs).toHaveLength(1);
    expect(queuedJobs[0].type).toBe(IMPORT_VALIDATION_JOB);

    const mapped = await importService.updateMapping(context, batch.id, mapping);
    expect(mapped.status).toBe("ready_to_commit");

    const validated = await importService.validateBatch(context, batch.id);
    expect(validated.status).toBe("ready_to_commit");
    expect(validated.rowErrors).toHaveLength(0);
  });

  it("returns row errors for malformed imports", async () => {
    const { importService, source, supplier } = await createImportFixture();
    const batch = await importService.createBatch(context, {
      supplierId: supplier.id,
      sourceId: source.id,
      intakeType: "manual",
      rows: [{ SKU: "", Name: "Bad Row", Cost: "not-a-number" }],
      mapping
    });

    const validated = await importService.validateBatch(context, batch.id);

    expect(validated.status).toBe("validation_error");
    expect(validated.rowErrors).toEqual([
      { rowIndex: 0, field: "sku", message: "SKU is required." },
      { rowIndex: 0, field: "unitCost", message: "Unit cost must be a non-negative number." }
    ]);
  });

  it("commits assets with supplier provenance and import batch traceability", async () => {
    const { database, importService, source, supplier } = await createImportFixture();
    const batch = await importService.createBatch(context, {
      supplierId: supplier.id,
      sourceId: source.id,
      intakeType: "file",
      rows: [
        { SKU: "HOODIE-001", Name: "Pullover Hoodie", Cost: 18.5, Currency: "USD" },
        { SKU: "CAP-001", Name: "Structured Cap", Cost: 7.25, Currency: "USD" }
      ],
      mapping
    });

    const preview = await importService.previewCommit(context.workspaceId, batch.id);
    expect(preview).toEqual([
      expect.objectContaining({ rowIndex: 0, sku: "HOODIE-001", willCreateAsset: true }),
      expect.objectContaining({ rowIndex: 1, sku: "CAP-001", willCreateAsset: true })
    ]);

    const committed = await importService.commitBatch(context, batch.id);
    expect(committed.status).toBe("committed");
    expect(committed.committedAssetIds).toHaveLength(2);

    const repeatedCommit = await importService.commitBatch(context, batch.id);
    expect(repeatedCommit.committedAssetIds).toEqual(committed.committedAssetIds);

    const assets = await importService.listAssets(context.workspaceId);
    expect(assets).toEqual([
      expect.objectContaining({
        supplierId: supplier.id,
        sourceId: source.id,
        importBatchId: batch.id,
        sku: "HOODIE-001",
        unitCost: 18.5
      }),
      expect.objectContaining({
        supplierId: supplier.id,
        sourceId: source.id,
        importBatchId: batch.id,
        sku: "CAP-001",
        unitCost: 7.25
      })
    ]);

    const auditEvents = await database.listByWorkspace(AUDIT_EVENTS_TABLE, context.workspaceId);
    expect(auditEvents.map((event) => event.data.action)).toContain("import.committed");
  });

  it("blocks silent asset overwrites on conflicting SKU commits", async () => {
    const { importService, source, supplier } = await createImportFixture();
    const first = await importService.createBatch(context, {
      supplierId: supplier.id,
      sourceId: source.id,
      intakeType: "manual",
      rows: [{ SKU: "DUP-001", Name: "Original", Cost: 3 }],
      mapping
    });
    await importService.commitBatch(context, first.id);

    const second = await importService.createBatch(context, {
      supplierId: supplier.id,
      sourceId: source.id,
      intakeType: "manual",
      rows: [{ SKU: "DUP-001", Name: "Replacement", Cost: 4 }],
      mapping
    });

    await expect(importService.commitBatch(context, second.id)).rejects.toBeInstanceOf(ImportCommitConflictError);
    const failed = await importService.getBatch(context.workspaceId, second.id);
    expect(failed.status).toBe("failed");
    expect(failed.failureReason).toBe("Import commit would overwrite existing normalized assets.");
  });

  it("exposes failed imports as recoverable and prevents remapping after commit", async () => {
    const { importService, source, supplier } = await createImportFixture();
    const batch = await importService.createBatch(context, {
      supplierId: supplier.id,
      sourceId: source.id,
      intakeType: "manual",
      rows: [{ SKU: "RECOVER-001", Name: "Recoverable Item", Cost: 9 }],
      mapping
    });

    const failed = await importService.failBatch(context, batch.id, "Parser crashed while reading source file.");
    expect(failed.status).toBe("failed");
    expect(failed.failureReason).toBe("Parser crashed while reading source file.");

    const retried = await importService.retryBatch(context, batch.id);
    expect(retried.status).toBe("ready_to_commit");
    expect(retried.failureReason).toBeUndefined();

    const committed = await importService.commitBatch(context, batch.id);
    expect(committed.status).toBe("committed");

    await expect(importService.updateMapping(context, batch.id, mapping)).rejects.toBeInstanceOf(
      ImportBatchAlreadyCommittedError
    );
  });
});
