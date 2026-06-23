export const supplierStatuses = ["active", "preferred", "archived"] as const;

export type SupplierStatus = (typeof supplierStatuses)[number];

export type Supplier = {
  id: string;
  workspaceId: string;
  name: string;
  status: SupplierStatus;
  contactName?: string;
  email?: string;
  phone?: string;
  accountNumber?: string;
  notes?: string;
  preferred: boolean;
  createdAt: string;
  updatedAt: string;
};

export const sourceTypes = ["manual", "file"] as const;

export type SourceType = (typeof sourceTypes)[number];

export const sourceStatuses = ["available", "needs_review", "failed", "archived"] as const;

export type SourceStatus = (typeof sourceStatuses)[number];

export type SupplierSource = {
  id: string;
  workspaceId: string;
  supplierId: string;
  type: SourceType;
  name: string;
  status: SourceStatus;
  healthStatus: "unknown" | "healthy" | "warning" | "failed";
  lastCheckedAt?: string;
  fileName?: string;
  fileObjectKey?: string;
  manualReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
