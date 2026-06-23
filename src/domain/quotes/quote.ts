import type { PricingSnapshot } from "@/domain/pricing/pricing";
import type { JobState } from "@/server/queue/job-queue";

export type Customer = {
  id: string;
  workspaceId: string;
  name: string;
  contactName: string;
  email: string;
  pricingTier: "retail" | "wholesale" | "contract";
  createdAt: string;
  updatedAt: string;
};

export type QuoteStatus =
  | "draft"
  | "pricing_incomplete"
  | "review"
  | "approved"
  | "rejected"
  | "generating"
  | "generated"
  | "shared";

export type QuoteLine = {
  id: string;
  description: string;
  quantity: number;
  pricingSnapshotId?: string;
  pricingSnapshot?: PricingSnapshot;
};

export type GeneratedQuoteOutput = {
  jobId: string;
  state: JobState;
  attempts: number;
  maxAttempts: number;
  error?: string;
  outputObjectKey?: string;
  requestedAt: string;
  generatedAt?: string;
};

export type QuoteShareLink = {
  id: string;
  quoteId: string;
  workspaceId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Quote = {
  id: string;
  workspaceId: string;
  customerId: string;
  customer?: Customer;
  title: string;
  status: QuoteStatus;
  lines: QuoteLine[];
  totals: QuoteTotals;
  blockers: string[];
  generatedOutput?: GeneratedQuoteOutput;
  shareLinks: QuoteShareLink[];
  createdAt: string;
  updatedAt: string;
};

export type QuoteTotals = {
  subtotalCost: number;
  price: number;
  grossProfit: number;
  marginPercent: number;
  approvalRequired: boolean;
};

export type PublicQuote = {
  quoteId: string;
  title: string;
  status: "shared";
  customer: {
    name: string;
    contactName: string;
  };
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  totals: QuoteTotals;
  expiresAt: string;
};
