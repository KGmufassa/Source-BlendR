export type CostComponent = {
  type: "product" | "service" | "labor" | "shipping" | "packaging" | "setup";
  label: string;
  amount: number;
};

export type PricingRule = {
  id: string;
  workspaceId: string;
  name: string;
  strategy: "percentage_markup" | "fixed_markup" | "margin_target";
  value: number;
  minimumMarginPercent: number;
  approvalRequiredBelowMargin: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PricingPreview = {
  subtotalCost: number;
  price: number;
  grossProfit: number;
  marginPercent: number;
  lowMargin: boolean;
  approvalRequired: boolean;
};

export type PricingSnapshot = PricingPreview & {
  id: string;
  workspaceId: string;
  sourceType: "asset" | "bundle" | "recipe" | "quote_line";
  sourceId: string;
  pricingRuleId: string;
  costComponents: CostComponent[];
  lockedForGeneratedOutput: boolean;
  createdAt: string;
  updatedAt: string;
};
