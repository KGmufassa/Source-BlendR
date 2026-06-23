import { createAuditEvent, type AuditSink } from "@/domain/audit/audit-log";
import type { CostComponent, PricingPreview, PricingRule, PricingSnapshot } from "@/domain/pricing/pricing";
import type { DatabaseAdapter, EntityRecord } from "@/server/persistence/database";

export const PRICING_RULES_TABLE = "pricing_rules";
export const PRICING_SNAPSHOTS_TABLE = "pricing_snapshots";

export type PricingActorContext = {
  workspaceId: string;
  actorUserId: string;
};

export type CreatePricingRuleInput = {
  name: string;
  strategy: PricingRule["strategy"];
  value: number;
  minimumMarginPercent: number;
  approvalRequiredBelowMargin?: boolean;
};

export type CreatePricingSnapshotInput = {
  sourceType: PricingSnapshot["sourceType"];
  sourceId: string;
  pricingRuleId: string;
  costComponents: CostComponent[];
};

export class PricingService {
  constructor(
    private readonly database: DatabaseAdapter,
    private readonly audit: AuditSink
  ) {}

  async createRule(context: PricingActorContext, input: CreatePricingRuleInput): Promise<PricingRule> {
    assertNonNegative(input.value, "Pricing rule value");
    assertNonNegative(input.minimumMarginPercent, "Minimum margin percent");
    const record = await this.database.insert(PRICING_RULES_TABLE, {
      workspaceId: context.workspaceId,
      data: {
        name: input.name,
        strategy: input.strategy,
        value: input.value,
        minimumMarginPercent: input.minimumMarginPercent,
        approvalRequiredBelowMargin: input.approvalRequiredBelowMargin ?? true
      }
    });
    const rule = pricingRuleFromRecord(record);

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "pricing.rule_created",
        targetId: rule.id,
        metadata: { strategy: rule.strategy, value: rule.value }
      })
    );

    return rule;
  }

  async listRules(workspaceId: string): Promise<PricingRule[]> {
    const records = await this.database.listByWorkspace(PRICING_RULES_TABLE, workspaceId);
    return records.map(pricingRuleFromRecord);
  }

  async preview(
    context: PricingActorContext,
    pricingRuleId: string,
    costComponents: CostComponent[]
  ): Promise<PricingPreview> {
    const rule = await this.getRule(context.workspaceId, pricingRuleId);
    const preview = calculatePreview(rule, costComponents);

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "pricing.previewed",
        targetId: pricingRuleId,
        metadata: {
          subtotalCost: preview.subtotalCost,
          price: preview.price,
          marginPercent: preview.marginPercent,
          lowMargin: preview.lowMargin
        }
      })
    );

    return preview;
  }

  async createSnapshot(context: PricingActorContext, input: CreatePricingSnapshotInput): Promise<PricingSnapshot> {
    const rule = await this.getRule(context.workspaceId, input.pricingRuleId);
    const preview = calculatePreview(rule, input.costComponents);
    const record = await this.database.insert(PRICING_SNAPSHOTS_TABLE, {
      workspaceId: context.workspaceId,
      data: {
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        pricingRuleId: input.pricingRuleId,
        costComponents: input.costComponents.map((component) => ({ ...component })),
        lockedForGeneratedOutput: false,
        ...preview
      }
    });
    const snapshot = pricingSnapshotFromRecord(record);

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "pricing.snapshot_created",
        targetId: snapshot.id,
        metadata: {
          sourceId: snapshot.sourceId,
          marginPercent: snapshot.marginPercent,
          approvalRequired: snapshot.approvalRequired
        }
      })
    );

    return snapshot;
  }

  async lockSnapshotForGeneratedOutput(
    context: PricingActorContext,
    snapshotId: string
  ): Promise<PricingSnapshot> {
    const snapshot = await this.getSnapshot(context.workspaceId, snapshotId);
    const record = await this.database.update(PRICING_SNAPSHOTS_TABLE, snapshot.id, {
      lockedForGeneratedOutput: true
    });
    const locked = pricingSnapshotFromRecord(record);

    await this.audit.record(
      createAuditEvent({
        workspaceId: context.workspaceId,
        actorUserId: context.actorUserId,
        action: "pricing.snapshot_locked",
        targetId: snapshot.id,
        metadata: { sourceId: snapshot.sourceId }
      })
    );

    return locked;
  }

  async replaceUnlockedSnapshotCosts(
    context: PricingActorContext,
    snapshotId: string,
    costComponents: CostComponent[]
  ): Promise<PricingSnapshot> {
    const snapshot = await this.getSnapshot(context.workspaceId, snapshotId);
    if (snapshot.lockedForGeneratedOutput) {
      throw new PricingSnapshotImmutableError(snapshotId);
    }

    const rule = await this.getRule(context.workspaceId, snapshot.pricingRuleId);
    const preview = calculatePreview(rule, costComponents);
    const record = await this.database.update(PRICING_SNAPSHOTS_TABLE, snapshotId, {
      costComponents: costComponents.map((component) => ({ ...component })),
      ...preview
    });

    return pricingSnapshotFromRecord(record);
  }

  async getSnapshot(workspaceId: string, snapshotId: string): Promise<PricingSnapshot> {
    const record = await this.getWorkspaceRecord(PRICING_SNAPSHOTS_TABLE, workspaceId, snapshotId);
    return pricingSnapshotFromRecord(record);
  }

  private async getRule(workspaceId: string, pricingRuleId: string): Promise<PricingRule> {
    const record = await this.getWorkspaceRecord(PRICING_RULES_TABLE, workspaceId, pricingRuleId);
    return pricingRuleFromRecord(record);
  }

  private async getWorkspaceRecord(table: string, workspaceId: string, id: string): Promise<EntityRecord> {
    const record = await this.database.get(table, id);
    if (!record || record.workspaceId !== workspaceId) {
      throw new PricingNotFoundError(table, id);
    }
    return record;
  }
}

export class PricingNotFoundError extends Error {
  constructor(
    public readonly entity: string,
    public readonly id: string
  ) {
    super(`${entity} ${id} was not found.`);
    this.name = "PricingNotFoundError";
  }
}

export class PricingSnapshotImmutableError extends Error {
  constructor(public readonly snapshotId: string) {
    super(`Pricing snapshot ${snapshotId} is immutable because it is locked for generated output.`);
    this.name = "PricingSnapshotImmutableError";
  }
}

export function calculatePreview(rule: PricingRule, costComponents: CostComponent[]): PricingPreview {
  const subtotalCost = roundMoney(
    costComponents.reduce((total, component) => {
      assertNonNegative(component.amount, component.label);
      return total + component.amount;
    }, 0)
  );
  const price = roundMoney(calculatePrice(rule, subtotalCost));
  const grossProfit = roundMoney(price - subtotalCost);
  const marginPercent = price === 0 ? 0 : roundPercent((grossProfit / price) * 100);
  const lowMargin = marginPercent < rule.minimumMarginPercent;

  return {
    subtotalCost,
    price,
    grossProfit,
    marginPercent,
    lowMargin,
    approvalRequired: lowMargin && rule.approvalRequiredBelowMargin
  };
}

function calculatePrice(rule: PricingRule, subtotalCost: number): number {
  if (rule.strategy === "percentage_markup") {
    return subtotalCost * (1 + rule.value / 100);
  }
  if (rule.strategy === "fixed_markup") {
    return subtotalCost + rule.value;
  }

  if (rule.value >= 100) {
    throw new PricingCalculationError("Margin target must be below 100%.");
  }

  return subtotalCost / (1 - rule.value / 100);
}

function pricingRuleFromRecord(record: EntityRecord): PricingRule {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    name: String(record.data.name),
    strategy: record.data.strategy as PricingRule["strategy"],
    value: Number(record.data.value),
    minimumMarginPercent: Number(record.data.minimumMarginPercent),
    approvalRequiredBelowMargin: record.data.approvalRequiredBelowMargin !== false,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function pricingSnapshotFromRecord(record: EntityRecord): PricingSnapshot {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    sourceType: record.data.sourceType as PricingSnapshot["sourceType"],
    sourceId: String(record.data.sourceId),
    pricingRuleId: String(record.data.pricingRuleId),
    costComponents: Array.isArray(record.data.costComponents) ? (record.data.costComponents as CostComponent[]) : [],
    lockedForGeneratedOutput: record.data.lockedForGeneratedOutput === true,
    subtotalCost: Number(record.data.subtotalCost),
    price: Number(record.data.price),
    grossProfit: Number(record.data.grossProfit),
    marginPercent: Number(record.data.marginPercent),
    lowMargin: record.data.lowMargin === true,
    approvalRequired: record.data.approvalRequired === true,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function assertNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new PricingCalculationError(`${label} must be a non-negative number.`);
  }
}

export class PricingCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingCalculationError";
  }
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}
