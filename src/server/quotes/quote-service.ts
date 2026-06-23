import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createAuditEvent, type AuditSink } from "@/domain/audit/audit-log";
import type { PricingSnapshot } from "@/domain/pricing/pricing";
import type {
  Customer,
  GeneratedQuoteOutput,
  PublicQuote,
  Quote,
  QuoteLine,
  QuoteShareLink,
  QuoteStatus,
  QuoteTotals
} from "@/domain/quotes/quote";
import type { DatabaseAdapter, EntityRecord } from "@/server/persistence/database";
import type { PricingActorContext, PricingService } from "@/server/pricing/pricing-service";
import type { Job, JobQueueAdapter } from "@/server/queue/job-queue";

export const CUSTOMERS_TABLE = "customers";
export const QUOTES_TABLE = "quotes";
export const QUOTE_SHARE_LINKS_TABLE = "quote_share_links";
export const QUOTE_OUTPUT_JOB = "quote.output.generate";

export type CreateCustomerInput = {
  name: string;
  contactName: string;
  email: string;
  pricingTier?: Customer["pricingTier"];
};

export type CreateQuoteLineInput = {
  description: string;
  quantity: number;
  pricingSnapshotId?: string;
};

export type CreateQuoteInput = {
  customerId: string;
  title: string;
  lines: CreateQuoteLineInput[];
};

export class QuoteService {
  constructor(
    private readonly database: DatabaseAdapter,
    private readonly audit: AuditSink,
    private readonly queue: JobQueueAdapter,
    private readonly pricing: PricingService
  ) {}

  async createCustomer(context: PricingActorContext, input: CreateCustomerInput): Promise<Customer> {
    const record = await this.database.insert(CUSTOMERS_TABLE, {
      workspaceId: context.workspaceId,
      data: {
        name: input.name,
        contactName: input.contactName,
        email: input.email,
        pricingTier: input.pricingTier ?? "retail"
      }
    });
    const customer = customerFromRecord(record);

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "customer.created",
        targetId: customer.id,
        metadata: { name: customer.name, pricingTier: customer.pricingTier }
      })
    );

    return customer;
  }

  async listCustomers(workspaceId: string): Promise<Customer[]> {
    const records = await this.database.listByWorkspace(CUSTOMERS_TABLE, workspaceId);
    return records.map(customerFromRecord);
  }

  async createQuote(context: PricingActorContext, input: CreateQuoteInput): Promise<Quote> {
    await this.getCustomer(context.workspaceId, input.customerId);
    const lines = input.lines.map((line) => ({
      id: randomUUID(),
      description: line.description,
      quantity: line.quantity,
      pricingSnapshotId: line.pricingSnapshotId
    }));
    const record = await this.database.insert(QUOTES_TABLE, {
      workspaceId: context.workspaceId,
      data: {
        customerId: input.customerId,
        title: input.title,
        status: "draft",
        lines
      }
    });
    const quote = await this.hydrateQuote(record);

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "quote.created",
        targetId: quote.id,
        metadata: { customerId: quote.customerId, lineCount: quote.lines.length }
      })
    );

    return quote;
  }

  async listQuotes(workspaceId: string): Promise<Quote[]> {
    const records = await this.database.listByWorkspace(QUOTES_TABLE, workspaceId);
    return Promise.all(records.map((record) => this.hydrateQuote(record)));
  }

  async getQuote(workspaceId: string, quoteId: string): Promise<Quote> {
    return this.hydrateQuote(await this.getWorkspaceRecord(QUOTES_TABLE, workspaceId, quoteId));
  }

  async updateQuoteLines(
    context: PricingActorContext,
    quoteId: string,
    linesInput: CreateQuoteLineInput[]
  ): Promise<Quote> {
    await this.getQuote(context.workspaceId, quoteId);
    const lines = linesInput.map((line) => ({
      id: randomUUID(),
      description: line.description,
      quantity: line.quantity,
      pricingSnapshotId: line.pricingSnapshotId
    }));
    const record = await this.database.update(QUOTES_TABLE, quoteId, {
      lines,
      status: "draft"
    });
    const quote = await this.hydrateQuote(record);

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "quote.updated",
        targetId: quote.id,
        metadata: { lineCount: quote.lines.length }
      })
    );

    return quote;
  }

  async approveQuote(context: PricingActorContext, quoteId: string): Promise<Quote> {
    const quote = await this.getQuote(context.workspaceId, quoteId);
    if (quote.blockers.length > 0) {
      throw new QuoteApprovalBlockedError(quoteId, quote.blockers);
    }

    for (const line of quote.lines) {
      if (line.pricingSnapshotId) {
        await this.pricing.lockSnapshotForGeneratedOutput(context, line.pricingSnapshotId);
      }
    }

    const updated = await this.updateQuoteStatus(context.workspaceId, quoteId, "approved");
    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "quote.approved",
        targetId: quoteId,
        metadata: { price: updated.totals.price, marginPercent: updated.totals.marginPercent }
      })
    );

    return updated;
  }

  async rejectQuote(context: PricingActorContext, quoteId: string, reason: string): Promise<Quote> {
    await this.getQuote(context.workspaceId, quoteId);
    const updated = await this.updateQuoteStatus(context.workspaceId, quoteId, "rejected", { rejectionReason: reason });
    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "quote.rejected",
        targetId: quoteId,
        metadata: { reason }
      })
    );
    return updated;
  }

  async requestGeneratedOutput(context: PricingActorContext, quoteId: string): Promise<Quote> {
    const quote = await this.getQuote(context.workspaceId, quoteId);
    if (quote.status !== "approved" && quote.status !== "generated" && quote.status !== "shared") {
      throw new QuoteStateError(quoteId, "Quote must be approved before output generation.");
    }

    const job = await this.queue.enqueue({
      type: QUOTE_OUTPUT_JOB,
      payload: {
        workspaceId: context.workspaceId,
        quoteId
      },
      maxAttempts: 3
    });
    const updated = await this.updateQuoteStatus(context.workspaceId, quoteId, "generating", {
      generatedOutputJobId: job.id,
      generatedOutputRequestedAt: job.createdAt,
      generatedOutputObjectKey: undefined,
      generatedOutputGeneratedAt: undefined
    });

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "quote.output_requested",
        targetId: quoteId,
        metadata: { jobId: job.id }
      })
    );

    return updated;
  }

  async markGenerated(context: PricingActorContext, quoteId: string, outputObjectKey: string): Promise<Quote> {
    const quote = await this.getQuote(context.workspaceId, quoteId);
    if (!quote.generatedOutput?.jobId) {
      throw new QuoteStateError(quoteId, "Quote does not have a generated output job.");
    }
    const completed = await this.queue.complete(quote.generatedOutput.jobId);
    const updated = await this.updateQuoteStatus(context.workspaceId, quoteId, "generated", {
      generatedOutputObjectKey: outputObjectKey,
      generatedOutputGeneratedAt: completed.updatedAt
    });
    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "quote.output_generated",
        targetId: quoteId,
        metadata: { jobId: completed.id }
      })
    );
    return updated;
  }

  async createShareLink(context: PricingActorContext, quoteId: string, expiresAt: string): Promise<QuoteShareLink & { token: string }> {
    const quote = await this.getQuote(context.workspaceId, quoteId);
    if (quote.status !== "approved" && quote.status !== "generated" && quote.status !== "shared") {
      throw new QuoteStateError(quoteId, "Quote must be approved or generated before sharing.");
    }
    const expiresDate = new Date(expiresAt);
    if (Number.isNaN(expiresDate.getTime()) || expiresDate.getTime() <= Date.now()) {
      throw new QuoteShareLinkError("Share link expiration must be a future date.");
    }

    const token = randomBytes(32).toString("base64url");
    const record = await this.database.insert(QUOTE_SHARE_LINKS_TABLE, {
      workspaceId: context.workspaceId,
      data: {
        quoteId,
        tokenHash: hashShareToken(token),
        expiresAt: expiresDate.toISOString(),
        revokedAt: undefined
      }
    });
    await this.database.update(QUOTES_TABLE, quoteId, { status: "shared" });
    const shareLink = shareLinkFromRecord(record);

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "quote.shared",
        targetId: quoteId,
        metadata: { shareLinkId: shareLink.id, expiresAt: shareLink.expiresAt }
      })
    );

    return { ...shareLink, token };
  }

  async revokeShareLink(context: PricingActorContext, shareLinkId: string): Promise<QuoteShareLink> {
    const existing = await this.getWorkspaceRecord(QUOTE_SHARE_LINKS_TABLE, context.workspaceId, shareLinkId);
    const updatedRecord = await this.database.update(QUOTE_SHARE_LINKS_TABLE, shareLinkId, {
      revokedAt: new Date().toISOString()
    });
    const link = shareLinkFromRecord(updatedRecord);

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "quote.share_revoked",
        targetId: link.quoteId,
        metadata: { shareLinkId: existing.id }
      })
    );

    return link;
  }

  async resolveShareToken(token: string, now = new Date()): Promise<PublicQuote> {
    const tokenHash = hashShareToken(token);
    const record = (await this.database.list(QUOTE_SHARE_LINKS_TABLE)).find(
      (candidate) => candidate.data.tokenHash === tokenHash
    );
    if (!record) {
      throw new QuoteShareLinkError("Share link is invalid.");
    }

    const link = shareLinkFromRecord(record);
    if (link.revokedAt) {
      throw new QuoteShareLinkError("Share link has been revoked.");
    }
    if (new Date(link.expiresAt).getTime() <= now.getTime()) {
      throw new QuoteShareLinkError("Share link has expired.");
    }

    const quote = await this.getQuote(link.workspaceId, link.quoteId);
    return {
      quoteId: quote.id,
      title: quote.title,
      status: "shared",
      customer: {
        name: quote.customer?.name ?? "Customer",
        contactName: quote.customer?.contactName ?? ""
      },
      lines: quote.lines.map((line) => ({
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.pricingSnapshot ? roundMoney(line.pricingSnapshot.price) : 0,
        lineTotal: line.pricingSnapshot ? roundMoney(line.pricingSnapshot.price * line.quantity) : 0
      })),
      totals: quote.totals,
      expiresAt: link.expiresAt
    };
  }

  private async hydrateQuote(record: EntityRecord): Promise<Quote> {
    const rawLines = Array.isArray(record.data.lines) ? (record.data.lines as StoredQuoteLine[]) : [];
    const lines = await Promise.all(
      rawLines.map(async (line) => {
        const pricingSnapshot = line.pricingSnapshotId
          ? await this.pricing.getSnapshot(record.workspaceId, line.pricingSnapshotId)
          : undefined;
        return {
          id: String(line.id),
          description: String(line.description),
          quantity: Number(line.quantity),
          pricingSnapshotId: line.pricingSnapshotId,
          pricingSnapshot
        };
      })
    );
    const shareLinks = (await this.database.listByWorkspace(QUOTE_SHARE_LINKS_TABLE, record.workspaceId))
      .map(shareLinkFromRecord)
      .filter((link) => link.quoteId === record.id);
    const generatedOutput = await this.generatedOutputFromRecord(record);
    const blockers = quoteBlockers(lines);
    const status = quoteStatusFromRecord(record.data.status, blockers);

    return {
      id: record.id,
      workspaceId: record.workspaceId,
      customerId: String(record.data.customerId),
      customer: await this.getCustomer(record.workspaceId, String(record.data.customerId)),
      title: String(record.data.title),
      status,
      lines,
      totals: calculateQuoteTotals(lines),
      blockers,
      generatedOutput,
      shareLinks,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  private async generatedOutputFromRecord(record: EntityRecord): Promise<GeneratedQuoteOutput | undefined> {
    const jobId = record.data.generatedOutputJobId;
    if (typeof jobId !== "string") {
      return undefined;
    }
    const job = (await this.queue.list()).find((candidate) => candidate.id === jobId);
    if (!job) {
      return undefined;
    }
    return generatedOutputFromJob(
      job,
      String(record.data.generatedOutputRequestedAt ?? job.createdAt),
      typeof record.data.generatedOutputObjectKey === "string" ? record.data.generatedOutputObjectKey : undefined,
      typeof record.data.generatedOutputGeneratedAt === "string" ? record.data.generatedOutputGeneratedAt : undefined
    );
  }

  private async getCustomer(workspaceId: string, customerId: string): Promise<Customer> {
    return customerFromRecord(await this.getWorkspaceRecord(CUSTOMERS_TABLE, workspaceId, customerId));
  }

  private async updateQuoteStatus(
    workspaceId: string,
    quoteId: string,
    status: QuoteStatus,
    extraData: Record<string, unknown> = {}
  ): Promise<Quote> {
    const record = await this.database.update(QUOTES_TABLE, quoteId, {
      status,
      ...extraData
    });
    if (record.workspaceId !== workspaceId) {
      throw new QuoteNotFoundError(QUOTES_TABLE, quoteId);
    }
    return this.hydrateQuote(record);
  }

  private async getWorkspaceRecord(table: string, workspaceId: string, id: string): Promise<EntityRecord> {
    const record = await this.database.get(table, id);
    if (!record || record.workspaceId !== workspaceId) {
      throw new QuoteNotFoundError(table, id);
    }
    return record;
  }

}

type StoredQuoteLine = {
  id: string;
  description: string;
  quantity: number;
  pricingSnapshotId?: string;
};

function customerFromRecord(record: EntityRecord): Customer {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    name: String(record.data.name),
    contactName: String(record.data.contactName),
    email: String(record.data.email),
    pricingTier: (record.data.pricingTier as Customer["pricingTier"]) ?? "retail",
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function shareLinkFromRecord(record: EntityRecord): QuoteShareLink {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    quoteId: String(record.data.quoteId),
    tokenHash: String(record.data.tokenHash),
    expiresAt: String(record.data.expiresAt),
    revokedAt: typeof record.data.revokedAt === "string" ? record.data.revokedAt : undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function generatedOutputFromJob(
  job: Job,
  requestedAt: string,
  outputObjectKey?: string,
  generatedAt?: string
): GeneratedQuoteOutput {
  return {
    jobId: job.id,
    state: job.state,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    error: job.error,
    outputObjectKey,
    requestedAt,
    generatedAt
  };
}

function quoteBlockers(lines: QuoteLine[]): string[] {
  const blockers: string[] = [];
  if (lines.length === 0) {
    blockers.push("At least one quote line is required.");
  }
  lines.forEach((line, index) => {
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) {
      blockers.push(`Line ${index + 1} requires a positive quantity.`);
    }
    if (!line.pricingSnapshotId || !line.pricingSnapshot) {
      blockers.push(`Line ${index + 1} requires a pricing snapshot.`);
    }
  });
  return blockers;
}

function quoteStatusFromRecord(status: unknown, blockers: string[]): QuoteStatus {
  if (blockers.length > 0 && (status === "draft" || status === "pricing_incomplete")) {
    return "pricing_incomplete";
  }
  return (status as QuoteStatus) ?? "draft";
}

function calculateQuoteTotals(lines: QuoteLine[]): QuoteTotals {
  const subtotalCost = roundMoney(
    lines.reduce((total, line) => total + (line.pricingSnapshot?.subtotalCost ?? 0) * line.quantity, 0)
  );
  const price = roundMoney(lines.reduce((total, line) => total + (line.pricingSnapshot?.price ?? 0) * line.quantity, 0));
  const grossProfit = roundMoney(price - subtotalCost);
  const marginPercent = price === 0 ? 0 : roundPercent((grossProfit / price) * 100);
  return {
    subtotalCost,
    price,
    grossProfit,
    marginPercent,
    approvalRequired: lines.some((line) => line.pricingSnapshot?.approvalRequired)
  };
}

function hashShareToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

export class QuoteNotFoundError extends Error {
  constructor(
    public readonly entity: string,
    public readonly id: string
  ) {
    super(`${entity} ${id} was not found.`);
    this.name = "QuoteNotFoundError";
  }
}

export class QuoteApprovalBlockedError extends Error {
  constructor(
    public readonly quoteId: string,
    public readonly blockers: string[]
  ) {
    super(`Quote ${quoteId} cannot be approved until blockers are resolved.`);
    this.name = "QuoteApprovalBlockedError";
  }
}

export class QuoteStateError extends Error {
  constructor(
    public readonly quoteId: string,
    message: string
  ) {
    super(message);
    this.name = "QuoteStateError";
  }
}

export class QuoteShareLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuoteShareLinkError";
  }
}
