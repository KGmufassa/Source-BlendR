import { z } from "zod";

export const costComponentSchema = z.object({
  type: z.enum(["product", "service", "labor", "shipping", "packaging", "setup"]),
  label: z.string().trim().min(1),
  amount: z.number().nonnegative()
});

export const createPricingRuleSchema = z.object({
  name: z.string().trim().min(1),
  strategy: z.enum(["percentage_markup", "fixed_markup", "margin_target"]),
  value: z.number().nonnegative(),
  minimumMarginPercent: z.number().nonnegative(),
  approvalRequiredBelowMargin: z.boolean().optional()
});

export const pricingPreviewSchema = z.object({
  pricingRuleId: z.string().trim().min(1),
  costComponents: z.array(costComponentSchema).min(1)
});

export const createPricingSnapshotSchema = pricingPreviewSchema.extend({
  sourceType: z.enum(["asset", "bundle", "recipe", "quote_line"]),
  sourceId: z.string().trim().min(1)
});
