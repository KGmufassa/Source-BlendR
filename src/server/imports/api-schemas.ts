import { z } from "zod";

const importRowSchema = z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]));

export const importMappingSchema = z.object({
  sku: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  unitCost: z.string().trim().min(1).optional(),
  currency: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional()
});

export const createImportBatchSchema = z.object({
  supplierId: z.string().trim().min(1),
  sourceId: z.string().trim().min(1),
  intakeType: z.enum(["manual", "file"]),
  rawObjectKey: z.string().trim().min(1).optional(),
  rows: z.array(importRowSchema).min(1),
  mapping: importMappingSchema.optional()
});

export const updateImportMappingSchema = z.object({
  mapping: importMappingSchema
});

export const failImportBatchSchema = z.object({
  reason: z.string().trim().min(1)
});
