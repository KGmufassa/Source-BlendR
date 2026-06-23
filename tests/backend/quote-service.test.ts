import { describe, expect, it } from "vitest";
import { AUDIT_EVENTS_TABLE, DatabaseAuditSink } from "@/server/audit/database-audit-sink";
import { MemoryDatabaseAdapter } from "@/server/persistence/memory-database";
import { PricingService, PricingSnapshotImmutableError } from "@/server/pricing/pricing-service";
import { MemoryJobQueueAdapter } from "@/server/queue/job-queue";
import {
  QUOTE_OUTPUT_JOB,
  QuoteApprovalBlockedError,
  QuoteService,
  QuoteShareLinkError
} from "@/server/quotes/quote-service";

const context = { workspaceId: "workspace-a", actorUserId: "user-a" };

function createServices() {
  const database = new MemoryDatabaseAdapter();
  const audit = new DatabaseAuditSink(database);
  const queue = new MemoryJobQueueAdapter();
  const pricing = new PricingService(database, audit);
  const quotes = new QuoteService(database, audit, queue, pricing);

  return { audit, database, pricing, queue, quotes };
}

async function createApprovedQuote() {
  const services = createServices();
  const rule = await services.pricing.createRule(context, {
    name: "Quote margin",
    strategy: "margin_target",
    value: 40,
    minimumMarginPercent: 30
  });
  const snapshot = await services.pricing.createSnapshot(context, {
    sourceType: "quote_line",
    sourceId: "line-source-1",
    pricingRuleId: rule.id,
    costComponents: [
      { type: "product", label: "Blank shirt", amount: 10 },
      { type: "service", label: "DTF transfer", amount: 4 }
    ]
  });
  const customer = await services.quotes.createCustomer(context, {
    name: "Northstar Athletics",
    contactName: "Mara Lee",
    email: "mara@example.com",
    pricingTier: "wholesale"
  });
  const quote = await services.quotes.createQuote(context, {
    customerId: customer.id,
    title: "Team shirt order",
    lines: [{ description: "Premium tee with front DTF", quantity: 50, pricingSnapshotId: snapshot.id }]
  });
  const approved = await services.quotes.approveQuote(context, quote.id);

  return { ...services, approved, customer, rule, snapshot };
}

describe("QuoteService", () => {
  it("blocks approval until quote lines have pricing snapshots", async () => {
    const { quotes } = createServices();
    const customer = await quotes.createCustomer(context, {
      name: "Acme Buyer",
      contactName: "Avery",
      email: "avery@example.com"
    });
    const quote = await quotes.createQuote(context, {
      customerId: customer.id,
      title: "Incomplete quote",
      lines: [{ description: "Unpriced bundle", quantity: 12 }]
    });

    expect(quote.status).toBe("pricing_incomplete");
    expect(quote.blockers).toContain("Line 1 requires a pricing snapshot.");
    await expect(quotes.approveQuote(context, quote.id)).rejects.toBeInstanceOf(QuoteApprovalBlockedError);
  });

  it("approves quotes with snapshots and locks the pricing snapshot for generated output", async () => {
    const { approved, pricing, snapshot } = await createApprovedQuote();

    expect(approved.status).toBe("approved");
    expect(approved.totals).toMatchObject({ subtotalCost: 700, price: 1166.5, marginPercent: 39.99 });
    await expect(
      pricing.replaceUnlockedSnapshotCosts(context, snapshot.id, [{ type: "product", label: "Changed", amount: 1 }])
    ).rejects.toBeInstanceOf(PricingSnapshotImmutableError);
  });

  it("preserves generated output job state, attempts, and retry visibility", async () => {
    const { approved, queue, quotes } = await createApprovedQuote();

    const generating = await quotes.requestGeneratedOutput(context, approved.id);
    expect(generating.status).toBe("generating");
    expect(generating.generatedOutput).toMatchObject({ state: "queued", attempts: 0, maxAttempts: 3 });

    const job = await queue.next(QUOTE_OUTPUT_JOB);
    expect(job?.payload).toMatchObject({ workspaceId: context.workspaceId, quoteId: approved.id });
    await queue.fail(job!.id, "Renderer unavailable. support_ref=SUP-1042");

    const failedQuote = await quotes.getQuote(context.workspaceId, approved.id);
    expect(failedQuote.generatedOutput).toMatchObject({
      jobId: job!.id,
      state: "failed",
      attempts: 1,
      error: "Renderer unavailable. support_ref=SUP-1042"
    });

    const retried = await queue.retry(job!.id);
    expect(retried.state).toBe("queued");
  });

  it("creates scoped share links that expire, revoke, and hide workspace-private fields", async () => {
    const { approved, quotes } = await createApprovedQuote();
    const shareLink = await quotes.createShareLink(
      context,
      approved.id,
      new Date("2030-01-01T00:00:00.000Z").toISOString()
    );

    expect(shareLink.token).toBeTruthy();
    expect(shareLink.tokenHash).not.toBe(shareLink.token);

    const publicQuote = await quotes.resolveShareToken(shareLink.token, new Date("2029-01-01T00:00:00.000Z"));
    expect(publicQuote).toMatchObject({
      quoteId: approved.id,
      status: "shared",
      customer: { name: "Northstar Athletics", contactName: "Mara Lee" }
    });
    expect(JSON.stringify(publicQuote)).not.toContain("workspace-a");
    expect(JSON.stringify(publicQuote)).not.toContain("mara@example.com");

    await expect(quotes.resolveShareToken(shareLink.token, new Date("2031-01-01T00:00:00.000Z"))).rejects.toBeInstanceOf(
      QuoteShareLinkError
    );

    await quotes.revokeShareLink(context, shareLink.id);
    await expect(quotes.resolveShareToken(shareLink.token, new Date("2029-01-01T00:00:00.000Z"))).rejects.toBeInstanceOf(
      QuoteShareLinkError
    );
  });

  it("records audit events for approve, output, share, and revoke transitions", async () => {
    const { approved, database, quotes } = await createApprovedQuote();
    const generating = await quotes.requestGeneratedOutput(context, approved.id);
    await quotes.markGenerated(context, generating.id, "quotes/workspace-a/team-shirt-order.pdf");
    const shareLink = await quotes.createShareLink(
      context,
      approved.id,
      new Date("2030-01-01T00:00:00.000Z").toISOString()
    );
    await quotes.revokeShareLink(context, shareLink.id);

    const auditEvents = await database.listByWorkspace(AUDIT_EVENTS_TABLE, context.workspaceId);
    expect(auditEvents.map((event) => event.data.action)).toEqual(
      expect.arrayContaining([
        "customer.created",
        "quote.created",
        "quote.approved",
        "quote.output_requested",
        "quote.output_generated",
        "quote.shared",
        "quote.share_revoked"
      ])
    );
  });
});
