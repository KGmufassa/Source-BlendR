import { describe, expect, it } from "vitest";
import { CatalogService, type CatalogItemRecord, type CatalogRepository } from "./runtime-catalog.js";

describe("CatalogService", () => {
  it("normalizes catalog writes and supplies the authenticated workspace", async () => {
    let saved: CatalogItemRecord | undefined;
    const repository: CatalogRepository = {
      async create(workspaceId, input) {
        saved = { ...input, id: "item-1", workspaceId, createdAt: new Date(0), updatedAt: new Date(0) };
        return saved;
      },
      async list() {
        return [];
      },
    };

    await new CatalogService(repository).create("workspace-1", {
      name: " Widget ",
      sku: " widget-1 ",
      priceCents: 1250,
      currency: "usd",
    });

    expect(saved).toMatchObject({ workspaceId: "workspace-1", name: "Widget", sku: "WIDGET-1", currency: "USD" });
  });

  it("rejects negative prices", async () => {
    const repository = { create: async () => { throw new Error("unreachable"); }, list: async () => [] };
    expect(() => new CatalogService(repository).create("workspace-1", {
      name: "Widget",
      sku: "W-1",
      priceCents: -1,
      currency: "USD",
    })).toThrow();
  });
});
