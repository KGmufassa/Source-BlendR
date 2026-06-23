import { describe, expect, it } from "vitest";
import { AUDIT_EVENTS_TABLE, DatabaseAuditSink } from "@/server/audit/database-audit-sink";
import {
  calculatePreview,
  PricingService,
  PricingSnapshotImmutableError
} from "@/server/pricing/pricing-service";
import { MemoryDatabaseAdapter } from "@/server/persistence/memory-database";

const context = { workspaceId: "workspace-a", actorUserId: "user-a" };
const costComponents = [
  { type: "product" as const, label: "Blank hoodie", amount: 18.5 },
  { type: "service" as const, label: "Embroidery", amount: 7.5 },
  { type: "packaging" as const, label: "Poly bag", amount: 0.75 }
];

function createService() {
  const database = new MemoryDatabaseAdapter();
  const audit = new DatabaseAuditSink(database);
  const service = new PricingService(database, audit);

  return { database, service };
}

describe("PricingService", () => {
  it("calculates deterministic pricing previews and low-margin policy", async () => {
    const { service } = createService();
    const rule = await service.createRule(context, {
      name: "Wholesale margin floor",
      strategy: "percentage_markup",
      value: 25,
      minimumMarginPercent: 30
    });

    const preview = await service.preview(context, rule.id, costComponents);

    expect(preview).toEqual({
      subtotalCost: 26.75,
      price: 33.44,
      grossProfit: 6.69,
      marginPercent: 20.01,
      lowMargin: true,
      approvalRequired: true
    });
  });

  it("supports fixed markup and margin target calculation paths", () => {
    expect(
      calculatePreview(
        {
          id: "rule-fixed",
          workspaceId: "workspace-a",
          name: "Fixed",
          strategy: "fixed_markup",
          value: 12,
          minimumMarginPercent: 20,
          approvalRequiredBelowMargin: true,
          createdAt: "now",
          updatedAt: "now"
        },
        [{ type: "product", label: "Blank", amount: 20 }]
      )
    ).toMatchObject({ subtotalCost: 20, price: 32, marginPercent: 37.5, lowMargin: false });

    expect(
      calculatePreview(
        {
          id: "rule-margin",
          workspaceId: "workspace-a",
          name: "Target",
          strategy: "margin_target",
          value: 40,
          minimumMarginPercent: 35,
          approvalRequiredBelowMargin: true,
          createdAt: "now",
          updatedAt: "now"
        },
        [{ type: "product", label: "Blank", amount: 30 }]
      )
    ).toMatchObject({ subtotalCost: 30, price: 50, marginPercent: 40, lowMargin: false });
  });

  it("creates snapshots and prevents mutation once locked for generated output", async () => {
    const { service } = createService();
    const rule = await service.createRule(context, {
      name: "Retail",
      strategy: "margin_target",
      value: 45,
      minimumMarginPercent: 35
    });

    const snapshot = await service.createSnapshot(context, {
      sourceType: "asset",
      sourceId: "asset-001",
      pricingRuleId: rule.id,
      costComponents
    });

    expect(snapshot).toMatchObject({
      sourceId: "asset-001",
      pricingRuleId: rule.id,
      lockedForGeneratedOutput: false,
      price: 48.64
    });

    const updated = await service.replaceUnlockedSnapshotCosts(context, snapshot.id, [
      { type: "product", label: "Blank hoodie", amount: 19 }
    ]);
    expect(updated.subtotalCost).toBe(19);

    const locked = await service.lockSnapshotForGeneratedOutput(context, snapshot.id);
    expect(locked.lockedForGeneratedOutput).toBe(true);

    await expect(
      service.replaceUnlockedSnapshotCosts(context, snapshot.id, [{ type: "product", label: "Changed", amount: 1 }])
    ).rejects.toBeInstanceOf(PricingSnapshotImmutableError);
  });

  it("records audit events for pricing rules, previews, snapshots, and locks", async () => {
    const { database, service } = createService();
    const rule = await service.createRule(context, {
      name: "Audit rule",
      strategy: "fixed_markup",
      value: 10,
      minimumMarginPercent: 20
    });
    await service.preview(context, rule.id, costComponents);
    const snapshot = await service.createSnapshot(context, {
      sourceType: "bundle",
      sourceId: "bundle-001",
      pricingRuleId: rule.id,
      costComponents
    });
    await service.lockSnapshotForGeneratedOutput(context, snapshot.id);

    const auditEvents = await database.listByWorkspace(AUDIT_EVENTS_TABLE, context.workspaceId);
    expect(auditEvents.map((event) => event.data.action)).toEqual([
      "pricing.rule_created",
      "pricing.previewed",
      "pricing.snapshot_created",
      "pricing.snapshot_locked"
    ]);
  });
});
