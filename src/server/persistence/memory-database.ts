import { randomUUID } from "node:crypto";
import type { DatabaseAdapter, EntityRecord, InsertRecordInput, RecordId } from "@/server/persistence/database";

export class MemoryDatabaseAdapter implements DatabaseAdapter {
  private readonly tables = new Map<string, Map<RecordId, EntityRecord>>();

  async insert(table: string, input: InsertRecordInput): Promise<EntityRecord> {
    const now = new Date().toISOString();
    const record: EntityRecord = {
      id: input.id ?? randomUUID(),
      workspaceId: input.workspaceId,
      createdAt: now,
      updatedAt: now,
      data: { ...input.data }
    };

    this.table(table).set(record.id, record);
    return { ...record, data: { ...record.data } };
  }

  async get(table: string, id: RecordId): Promise<EntityRecord | null> {
    const record = this.table(table).get(id);
    return record ? { ...record, data: { ...record.data } } : null;
  }

  async list(table: string): Promise<EntityRecord[]> {
    return [...this.table(table).values()].map((record) => ({ ...record, data: { ...record.data } }));
  }

  async listByWorkspace(table: string, workspaceId: string): Promise<EntityRecord[]> {
    return [...this.table(table).values()]
      .filter((record) => record.workspaceId === workspaceId)
      .map((record) => ({ ...record, data: { ...record.data } }));
  }

  async update(table: string, id: RecordId, data: Record<string, unknown>): Promise<EntityRecord> {
    const existing = this.table(table).get(id);
    if (!existing) {
      throw new RecordNotFoundError(table, id);
    }

    const updated: EntityRecord = {
      ...existing,
      updatedAt: new Date().toISOString(),
      data: {
        ...existing.data,
        ...data
      }
    };

    this.table(table).set(id, updated);
    return { ...updated, data: { ...updated.data } };
  }

  private table(name: string): Map<RecordId, EntityRecord> {
    const existing = this.tables.get(name);
    if (existing) {
      return existing;
    }

    const table = new Map<RecordId, EntityRecord>();
    this.tables.set(name, table);
    return table;
  }
}

export class RecordNotFoundError extends Error {
  constructor(
    public readonly table: string,
    public readonly id: RecordId
  ) {
    super(`Record ${id} was not found in ${table}.`);
    this.name = "RecordNotFoundError";
  }
}
