import { createAuditEvent, type AuditSink } from "@/domain/audit/audit-log";
import type {
  ImportBatch,
  ImportCommitPreviewItem,
  ImportMapping,
  ImportRow,
  ImportRowError,
  NormalizedAsset
} from "@/domain/imports/import-batch";
import type { DatabaseAdapter, EntityRecord } from "@/server/persistence/database";
import type { JobQueueAdapter } from "@/server/queue/job-queue";
import { SupplierService } from "@/server/suppliers/supplier-service";

export const IMPORT_BATCHES_TABLE = "import_batches";
export const NORMALIZED_ASSETS_TABLE = "normalized_assets";
export const IMPORT_VALIDATION_JOB = "import.validation";

export type ImportActorContext = {
  workspaceId: string;
  actorUserId: string;
};

export type CreateImportBatchInput = {
  supplierId: string;
  sourceId: string;
  intakeType: "manual" | "file";
  rows: ImportRow[];
  mapping?: ImportMapping;
  rawObjectKey?: string;
};

export class ImportService {
  constructor(
    private readonly database: DatabaseAdapter,
    private readonly audit: AuditSink,
    private readonly queue: JobQueueAdapter,
    private readonly supplierService: SupplierService
  ) {}

  async createBatch(context: ImportActorContext, input: CreateImportBatchInput): Promise<ImportBatch> {
    await this.assertSupplierSource(context.workspaceId, input.supplierId, input.sourceId);
    const batch = await this.database.insert(IMPORT_BATCHES_TABLE, {
      workspaceId: context.workspaceId,
      data: {
        supplierId: input.supplierId,
        sourceId: input.sourceId,
        status: hasRequiredMapping(input.mapping) ? "ready_to_commit" : "mapping_required",
        intakeType: input.intakeType,
        rawObjectKey: input.rawObjectKey,
        rawRows: input.rows.map(cloneRow),
        mapping: input.mapping ?? {},
        rowErrors: [],
        committedAssetIds: []
      }
    });

    await this.queue.enqueue({
      type: IMPORT_VALIDATION_JOB,
      payload: { workspaceId: context.workspaceId, importBatchId: batch.id }
    });

    const importBatch = importBatchFromRecord(batch);
    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "import.created",
        targetId: importBatch.id,
        metadata: {
          supplierId: importBatch.supplierId,
          sourceId: importBatch.sourceId,
          intakeType: importBatch.intakeType
        }
      })
    );

    return importBatch;
  }

  async getBatch(workspaceId: string, importBatchId: string): Promise<ImportBatch> {
    const record = await this.getWorkspaceRecord(IMPORT_BATCHES_TABLE, workspaceId, importBatchId);
    return importBatchFromRecord(record);
  }

  async listBatches(workspaceId: string): Promise<ImportBatch[]> {
    const records = await this.database.listByWorkspace(IMPORT_BATCHES_TABLE, workspaceId);
    return records.map(importBatchFromRecord);
  }

  async updateMapping(
    context: ImportActorContext,
    importBatchId: string,
    mapping: ImportMapping
  ): Promise<ImportBatch> {
    const batch = await this.getBatch(context.workspaceId, importBatchId);
    this.assertNotCommitted(batch);
    const record = await this.database.update(IMPORT_BATCHES_TABLE, importBatchId, {
      mapping,
      rowErrors: [],
      failureReason: undefined,
      status: hasRequiredMapping(mapping) ? "ready_to_commit" : "mapping_required"
    });

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "import.mapping_updated",
        targetId: importBatchId,
        metadata: { mappedFields: Object.keys(mapping).length }
      })
    );

    return importBatchFromRecord(record);
  }

  async validateBatch(context: ImportActorContext, importBatchId: string): Promise<ImportBatch> {
    const batch = await this.getBatch(context.workspaceId, importBatchId);
    this.assertNotCommitted(batch);
    const rowErrors = validateRows(batch.rawRows, batch.mapping);
    const status = rowErrors.length > 0 ? "validation_error" : "ready_to_commit";
    const record = await this.database.update(IMPORT_BATCHES_TABLE, importBatchId, {
      status,
      rowErrors,
      failureReason: undefined
    });

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: status === "validation_error" ? "import.failed" : "import.validated",
        targetId: importBatchId,
        metadata: { rowErrorCount: rowErrors.length }
      })
    );

    return importBatchFromRecord(record);
  }

  async previewCommit(workspaceId: string, importBatchId: string): Promise<ImportCommitPreviewItem[]> {
    const batch = await this.getBatch(workspaceId, importBatchId);
    const errors = validateRows(batch.rawRows, batch.mapping);
    if (errors.length > 0) {
      throw new ImportValidationError(importBatchId, errors);
    }

    const existingAssets = await this.database.listByWorkspace(NORMALIZED_ASSETS_TABLE, workspaceId);
    return batch.rawRows.map((row, rowIndex) => {
      const normalized = normalizeRow(row, rowIndex, batch.mapping);
      const conflict = existingAssets.find((asset) => {
        return asset.data.sku === normalized.sku && asset.data.supplierId === batch.supplierId && asset.data.archived !== true;
      });

      return {
        rowIndex,
        sku: normalized.sku,
        name: normalized.name,
        unitCost: normalized.unitCost,
        currency: normalized.currency,
        willCreateAsset: !conflict,
        conflictAssetId: conflict?.id
      };
    });
  }

  async commitBatch(context: ImportActorContext, importBatchId: string): Promise<ImportBatch> {
    const existingBatch = await this.getBatch(context.workspaceId, importBatchId);
    if (existingBatch.status === "committed") {
      return existingBatch;
    }

    const batch = await this.validateBatch(context, importBatchId);
    if (batch.status === "validation_error") {
      throw new ImportValidationError(importBatchId, batch.rowErrors);
    }

    if (batch.status === "committed") {
      return batch;
    }

    const preview = await this.previewCommit(context.workspaceId, importBatchId);
    const conflicts = preview.filter((item) => item.conflictAssetId);
    if (conflicts.length > 0) {
      const record = await this.database.update(IMPORT_BATCHES_TABLE, importBatchId, {
        status: "failed",
        failureReason: "Import commit would overwrite existing normalized assets.",
        rowErrors: conflicts.map((item) => ({
          rowIndex: item.rowIndex,
          field: "sku",
          message: `SKU ${item.sku} already exists for this supplier.`
        }))
      });
      throw new ImportCommitConflictError(importBatchId, conflicts.map((item) => item.sku), importBatchFromRecord(record));
    }

    const committedAssetIds: string[] = [];
    for (const row of batch.rawRows) {
      const normalized = normalizeRow(row, committedAssetIds.length, batch.mapping);
      const asset = await this.database.insert(NORMALIZED_ASSETS_TABLE, {
        workspaceId: context.workspaceId,
        data: {
          ...normalized,
          supplierId: batch.supplierId,
          sourceId: batch.sourceId,
          importBatchId: batch.id,
          archived: false
        }
      });
      committedAssetIds.push(asset.id);
    }

    const record = await this.database.update(IMPORT_BATCHES_TABLE, importBatchId, {
      status: "committed",
      committedAssetIds,
      rowErrors: [],
      failureReason: undefined
    });

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "import.committed",
        targetId: importBatchId,
        metadata: { assetCount: committedAssetIds.length }
      })
    );

    return importBatchFromRecord(record);
  }

  async listAssets(workspaceId: string): Promise<NormalizedAsset[]> {
    const records = await this.database.listByWorkspace(NORMALIZED_ASSETS_TABLE, workspaceId);
    return records.map(normalizedAssetFromRecord);
  }

  async retryBatch(context: ImportActorContext, importBatchId: string): Promise<ImportBatch> {
    const batch = await this.getBatch(context.workspaceId, importBatchId);
    this.assertNotCommitted(batch);
    await this.queue.enqueue({
      type: IMPORT_VALIDATION_JOB,
      payload: { workspaceId: context.workspaceId, importBatchId },
      maxAttempts: 3
    });

    const record = await this.database.update(IMPORT_BATCHES_TABLE, importBatchId, {
      status: hasRequiredMapping(batch.mapping) ? "ready_to_commit" : "mapping_required",
      failureReason: undefined
    });

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "import.retry_requested",
        targetId: importBatchId,
        metadata: { previousStatus: batch.status }
      })
    );

    return importBatchFromRecord(record);
  }

  async failBatch(context: ImportActorContext, importBatchId: string, reason: string): Promise<ImportBatch> {
    const batch = await this.getBatch(context.workspaceId, importBatchId);
    this.assertNotCommitted(batch);
    const record = await this.database.update(IMPORT_BATCHES_TABLE, importBatchId, {
      status: "failed",
      failureReason: reason
    });

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "import.failed",
        targetId: importBatchId,
        metadata: { reason }
      })
    );

    return importBatchFromRecord(record);
  }

  private async assertSupplierSource(workspaceId: string, supplierId: string, sourceId: string): Promise<void> {
    const sources = await this.supplierService.listSources(workspaceId, supplierId);
    if (!sources.some((source) => source.id === sourceId)) {
      throw new ImportBatchNotFoundError("supplier_source", sourceId);
    }
  }

  private async getWorkspaceRecord(table: string, workspaceId: string, id: string): Promise<EntityRecord> {
    const record = await this.database.get(table, id);
    if (!record || record.workspaceId !== workspaceId) {
      throw new ImportBatchNotFoundError(table, id);
    }

    return record;
  }

  private assertNotCommitted(batch: ImportBatch): void {
    if (batch.status === "committed") {
      throw new ImportBatchAlreadyCommittedError(batch.id);
    }
  }
}

export class ImportBatchNotFoundError extends Error {
  constructor(
    public readonly entity: string,
    public readonly id: string
  ) {
    super(`${entity} ${id} was not found.`);
    this.name = "ImportBatchNotFoundError";
  }
}

export class ImportBatchAlreadyCommittedError extends Error {
  constructor(public readonly importBatchId: string) {
    super(`Import batch ${importBatchId} has already been committed.`);
    this.name = "ImportBatchAlreadyCommittedError";
  }
}

export class ImportValidationError extends Error {
  constructor(
    public readonly importBatchId: string,
    public readonly rowErrors: ImportRowError[]
  ) {
    super(`Import batch ${importBatchId} has validation errors.`);
    this.name = "ImportValidationError";
  }
}

export class ImportCommitConflictError extends Error {
  constructor(
    public readonly importBatchId: string,
    public readonly conflictingSkus: string[],
    public readonly batch: ImportBatch
  ) {
    super(`Import batch ${importBatchId} would overwrite existing assets.`);
    this.name = "ImportCommitConflictError";
  }
}

function importBatchFromRecord(record: EntityRecord): ImportBatch {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    supplierId: String(record.data.supplierId),
    sourceId: String(record.data.sourceId),
    status: record.data.status as ImportBatch["status"],
    intakeType: record.data.intakeType as ImportBatch["intakeType"],
    rawObjectKey: optionalString(record.data.rawObjectKey),
    rawRows: Array.isArray(record.data.rawRows) ? (record.data.rawRows as ImportRow[]).map(cloneRow) : [],
    mapping: isRecord(record.data.mapping) ? (record.data.mapping as ImportMapping) : {},
    rowErrors: Array.isArray(record.data.rowErrors) ? (record.data.rowErrors as ImportRowError[]) : [],
    committedAssetIds: Array.isArray(record.data.committedAssetIds) ? (record.data.committedAssetIds as string[]) : [],
    failureReason: optionalString(record.data.failureReason),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function normalizedAssetFromRecord(record: EntityRecord): NormalizedAsset {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    supplierId: String(record.data.supplierId),
    sourceId: String(record.data.sourceId),
    importBatchId: String(record.data.importBatchId),
    sku: String(record.data.sku),
    name: String(record.data.name),
    description: optionalString(record.data.description),
    unitCost: Number(record.data.unitCost),
    currency: String(record.data.currency),
    category: optionalString(record.data.category),
    archived: record.data.archived === true,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function validateRows(rows: ImportRow[], mapping: ImportMapping): ImportRowError[] {
  if (!hasRequiredMapping(mapping)) {
    return [{ rowIndex: -1, field: "row", message: "SKU, name, and unit cost mappings are required." }];
  }

  return rows.flatMap((row, rowIndex) => {
    const errors: ImportRowError[] = [];
    const sku = readMappedValue(row, mapping.sku);
    const name = readMappedValue(row, mapping.name);
    const unitCost = Number(readMappedValue(row, mapping.unitCost));

    if (!sku) {
      errors.push({ rowIndex, field: "sku", message: "SKU is required." });
    }
    if (!name) {
      errors.push({ rowIndex, field: "name", message: "Name is required." });
    }
    if (!Number.isFinite(unitCost) || unitCost < 0) {
      errors.push({ rowIndex, field: "unitCost", message: "Unit cost must be a non-negative number." });
    }

    return errors;
  });
}

function normalizeRow(row: ImportRow, rowIndex: number, mapping: ImportMapping) {
  const unitCost = Number(readMappedValue(row, mapping.unitCost));
  if (!hasRequiredMapping(mapping) || !Number.isFinite(unitCost)) {
    throw new ImportValidationError("unknown", [{ rowIndex, field: "row", message: "Row cannot be normalized." }]);
  }

  return {
    sku: String(readMappedValue(row, mapping.sku)).trim(),
    name: String(readMappedValue(row, mapping.name)).trim(),
    description: optionalString(readMappedValue(row, mapping.description)),
    unitCost,
    currency: optionalString(readMappedValue(row, mapping.currency)) ?? "USD",
    category: optionalString(readMappedValue(row, mapping.category))
  };
}

function readMappedValue(row: ImportRow, column: string | undefined): string | number | boolean | null | undefined {
  return column ? row[column] : undefined;
}

function hasRequiredMapping(mapping: ImportMapping | undefined): mapping is ImportMapping & {
  sku: string;
  name: string;
  unitCost: string;
} {
  return Boolean(mapping?.sku && mapping.name && mapping.unitCost);
}

function cloneRow(row: ImportRow): ImportRow {
  return { ...row };
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
