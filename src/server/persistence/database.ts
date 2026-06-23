export type RecordId = string;

export type EntityRecord = {
  id: RecordId;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  data: Record<string, unknown>;
};

export type InsertRecordInput = {
  id?: RecordId;
  workspaceId: string;
  data: Record<string, unknown>;
};

export interface DatabaseAdapter {
  insert(table: string, input: InsertRecordInput): Promise<EntityRecord>;
  get(table: string, id: RecordId): Promise<EntityRecord | null>;
  list(table: string): Promise<EntityRecord[]>;
  listByWorkspace(table: string, workspaceId: string): Promise<EntityRecord[]>;
  update(table: string, id: RecordId, data: Record<string, unknown>): Promise<EntityRecord>;
}
