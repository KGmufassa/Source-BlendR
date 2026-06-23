import { createAuditEvent, type AuditSink } from "@/domain/audit/audit-log";
import type { Supplier, SupplierSource } from "@/domain/suppliers/supplier";
import type { DatabaseAdapter, EntityRecord } from "@/server/persistence/database";

export const SUPPLIERS_TABLE = "suppliers";
export const SUPPLIER_SOURCES_TABLE = "supplier_sources";

export type ActorContext = {
  workspaceId: string;
  actorUserId: string;
};

export type CreateSupplierInput = {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  accountNumber?: string;
  notes?: string;
  preferred?: boolean;
};

export type UpdateSupplierInput = Partial<CreateSupplierInput> & {
  status?: Supplier["status"];
};

export type CreateSupplierSourceInput = {
  type: SupplierSource["type"];
  name: string;
  status?: SupplierSource["status"];
  healthStatus?: SupplierSource["healthStatus"];
  lastCheckedAt?: string;
  fileName?: string;
  fileObjectKey?: string;
  manualReference?: string;
  notes?: string;
};

export type UpdateSupplierSourceInput = Partial<CreateSupplierSourceInput>;

export class SupplierService {
  constructor(
    private readonly database: DatabaseAdapter,
    private readonly audit: AuditSink
  ) {}

  async createSupplier(context: ActorContext, input: CreateSupplierInput): Promise<Supplier> {
    const record = await this.database.insert(SUPPLIERS_TABLE, {
      workspaceId: context.workspaceId,
      data: {
        name: input.name,
        status: input.preferred ? "preferred" : "active",
        contactName: input.contactName,
        email: input.email,
        phone: input.phone,
        accountNumber: input.accountNumber,
        notes: input.notes,
        preferred: input.preferred ?? false
      }
    });

    const supplier = supplierFromRecord(record);
    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "supplier.created",
        targetId: supplier.id,
        metadata: { name: supplier.name }
      })
    );

    return supplier;
  }

  async listSuppliers(workspaceId: string): Promise<Supplier[]> {
    const records = await this.database.listByWorkspace(SUPPLIERS_TABLE, workspaceId);
    return records.map(supplierFromRecord);
  }

  async getSupplier(workspaceId: string, supplierId: string): Promise<Supplier> {
    const record = await this.getWorkspaceRecord(SUPPLIERS_TABLE, workspaceId, supplierId);
    return supplierFromRecord(record);
  }

  async updateSupplier(context: ActorContext, supplierId: string, input: UpdateSupplierInput): Promise<Supplier> {
    await this.getSupplier(context.workspaceId, supplierId);
    const record = await this.database.update(SUPPLIERS_TABLE, supplierId, compactObject(input));
    const supplier = supplierFromRecord(record);

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: supplier.status === "archived" ? "supplier.archived" : "supplier.updated",
        targetId: supplier.id,
        metadata: { name: supplier.name, status: supplier.status }
      })
    );

    return supplier;
  }

  async archiveSupplier(context: ActorContext, supplierId: string): Promise<Supplier> {
    return this.updateSupplier(context, supplierId, { status: "archived", preferred: false });
  }

  async createSource(
    context: ActorContext,
    supplierId: string,
    input: CreateSupplierSourceInput
  ): Promise<SupplierSource> {
    await this.getSupplier(context.workspaceId, supplierId);
    const record = await this.database.insert(SUPPLIER_SOURCES_TABLE, {
      workspaceId: context.workspaceId,
      data: {
        supplierId,
        type: input.type,
        name: input.name,
        status: input.status ?? "needs_review",
        healthStatus: input.healthStatus ?? "unknown",
        lastCheckedAt: input.lastCheckedAt,
        fileName: input.fileName,
        fileObjectKey: input.fileObjectKey,
        manualReference: input.manualReference,
        notes: input.notes
      }
    });

    const source = supplierSourceFromRecord(record);
    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "supplier_source.created",
        targetId: source.id,
        metadata: { supplierId, type: source.type, name: source.name }
      })
    );

    return source;
  }

  async listSources(workspaceId: string, supplierId: string): Promise<SupplierSource[]> {
    await this.getSupplier(workspaceId, supplierId);
    const records = await this.database.listByWorkspace(SUPPLIER_SOURCES_TABLE, workspaceId);
    return records.map(supplierSourceFromRecord).filter((source) => source.supplierId === supplierId);
  }

  async updateSource(
    context: ActorContext,
    supplierId: string,
    sourceId: string,
    input: UpdateSupplierSourceInput
  ): Promise<SupplierSource> {
    await this.getSupplier(context.workspaceId, supplierId);
    const existing = await this.getWorkspaceRecord(SUPPLIER_SOURCES_TABLE, context.workspaceId, sourceId);
    const existingSource = supplierSourceFromRecord(existing);
    if (existingSource.supplierId !== supplierId) {
      throw new SupplierNotFoundError("supplier_source", sourceId);
    }

    const record = await this.database.update(SUPPLIER_SOURCES_TABLE, sourceId, compactObject(input));
    const source = supplierSourceFromRecord(record);
    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "supplier_source.updated",
        targetId: source.id,
        metadata: { supplierId, status: source.status, healthStatus: source.healthStatus }
      })
    );

    return source;
  }

  private async getWorkspaceRecord(table: string, workspaceId: string, id: string): Promise<EntityRecord> {
    const record = await this.database.get(table, id);
    if (!record || record.workspaceId !== workspaceId) {
      throw new SupplierNotFoundError(table, id);
    }

    return record;
  }
}

export class SupplierNotFoundError extends Error {
  constructor(
    public readonly entity: string,
    public readonly id: string
  ) {
    super(`${entity} ${id} was not found.`);
    this.name = "SupplierNotFoundError";
  }
}

function supplierFromRecord(record: EntityRecord): Supplier {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    name: String(record.data.name),
    status: (record.data.status as Supplier["status"]) ?? "active",
    contactName: optionalString(record.data.contactName),
    email: optionalString(record.data.email),
    phone: optionalString(record.data.phone),
    accountNumber: optionalString(record.data.accountNumber),
    notes: optionalString(record.data.notes),
    preferred: Boolean(record.data.preferred),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function supplierSourceFromRecord(record: EntityRecord): SupplierSource {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    supplierId: String(record.data.supplierId),
    type: record.data.type as SupplierSource["type"],
    name: String(record.data.name),
    status: (record.data.status as SupplierSource["status"]) ?? "needs_review",
    healthStatus: (record.data.healthStatus as SupplierSource["healthStatus"]) ?? "unknown",
    lastCheckedAt: optionalString(record.data.lastCheckedAt),
    fileName: optionalString(record.data.fileName),
    fileObjectKey: optionalString(record.data.fileObjectKey),
    manualReference: optionalString(record.data.manualReference),
    notes: optionalString(record.data.notes),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function compactObject<T extends Record<string, unknown>>(input: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}
