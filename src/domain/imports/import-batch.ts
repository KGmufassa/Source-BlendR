export const importBatchStatuses = [
  "mapping_required",
  "validation_error",
  "ready_to_commit",
  "committed",
  "failed"
] as const;

export type ImportBatchStatus = (typeof importBatchStatuses)[number];

export type ImportField = "sku" | "name" | "description" | "unitCost" | "currency" | "category";

export type ImportMapping = Partial<Record<ImportField, string>>;

export type ImportRow = Record<string, string | number | boolean | null | undefined>;

export type ImportRowError = {
  rowIndex: number;
  field: ImportField | "row";
  message: string;
};

export type ImportCommitPreviewItem = {
  rowIndex: number;
  sku: string;
  name: string;
  unitCost: number;
  currency: string;
  willCreateAsset: boolean;
  conflictAssetId?: string;
};

export type ImportBatch = {
  id: string;
  workspaceId: string;
  supplierId: string;
  sourceId: string;
  status: ImportBatchStatus;
  intakeType: "manual" | "file";
  rawObjectKey?: string;
  rawRows: ImportRow[];
  mapping: ImportMapping;
  rowErrors: ImportRowError[];
  committedAssetIds: string[];
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type NormalizedAsset = {
  id: string;
  workspaceId: string;
  supplierId: string;
  sourceId: string;
  importBatchId: string;
  sku: string;
  name: string;
  description?: string;
  unitCost: number;
  currency: string;
  category?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};
