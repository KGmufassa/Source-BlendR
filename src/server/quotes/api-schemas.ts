import { z } from "zod";

const quoteLineSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  pricingSnapshotId: z.string().optional()
});

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  pricingTier: z.enum(["retail", "wholesale", "contract"]).optional()
});

export const createQuoteSchema = z.object({
  customerId: z.string().min(1),
  title: z.string().min(1),
  lines: z.array(quoteLineSchema).default([])
});

export const updateQuoteLinesSchema = z.object({
  lines: z.array(quoteLineSchema)
});

export const rejectQuoteSchema = z.object({
  reason: z.string().min(1)
});

export const createShareLinkSchema = z.object({
  expiresAt: z.string().datetime()
});

export const markGeneratedSchema = z.object({
  outputObjectKey: z.string().min(1)
});
