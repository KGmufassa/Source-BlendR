import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .min(1)
  .optional();

export const createSupplierSchema = z.object({
  name: z.string().trim().min(1),
  contactName: optionalTrimmedString,
  email: z.string().trim().email().optional(),
  phone: optionalTrimmedString,
  accountNumber: optionalTrimmedString,
  notes: optionalTrimmedString,
  preferred: z.boolean().optional()
});

export const updateSupplierSchema = createSupplierSchema
  .partial()
  .extend({
    status: z.enum(["active", "preferred", "archived"]).optional()
  })
  .refine((value) => Object.keys(value).length > 0, "At least one supplier field is required.");

const supplierSourceBaseSchema = z.object({
  type: z.enum(["manual", "file"]),
  name: z.string().trim().min(1),
  status: z.enum(["available", "needs_review", "failed", "archived"]).optional(),
  healthStatus: z.enum(["unknown", "healthy", "warning", "failed"]).optional(),
  lastCheckedAt: optionalTrimmedString,
  fileName: optionalTrimmedString,
  fileObjectKey: optionalTrimmedString,
  manualReference: optionalTrimmedString,
  notes: optionalTrimmedString
});

export const createSupplierSourceSchema = supplierSourceBaseSchema.superRefine((value, context) => {
    if (value.type === "file" && !value.fileName && !value.fileObjectKey) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fileName"],
        message: "File sources require fileName or fileObjectKey."
      });
    }

    if (value.type === "manual" && !value.manualReference && !value.notes) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["manualReference"],
        message: "Manual sources require manualReference or notes."
      });
    }
  });

export const updateSupplierSourceSchema = supplierSourceBaseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one source field is required.");
