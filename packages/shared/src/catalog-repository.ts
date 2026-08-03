import { catalogItemInputSchema, type CatalogItemInput, type CatalogItemRecord, type CatalogRepository } from "@source-blendr/domain";
import { getDatabase } from "./db.ts";

export class PrismaCatalogRepository implements CatalogRepository {
  async create(workspaceId: string, input: CatalogItemInput): Promise<CatalogItemRecord> {
    const item = await getDatabase().catalogItem.create({
      data: {
        ...input,
        vendorId: input.vendorId ?? null,
        workspaceId,
      },
    });
    return toRecord(item);
  }

  async list(workspaceId: string, query: string): Promise<CatalogItemRecord[]> {
    const items = await getDatabase().catalogItem.findMany({
      where: {
        workspaceId,
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { sku: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
    });
    return items.map(toRecord);
  }
}

function toRecord(item: {
  id: string;
  workspaceId: string;
  name: string;
  sku: string;
  type: string;
  description: string;
  priceCents: number;
  currency: string;
  vendorId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): CatalogItemRecord {
  return {
    ...catalogItemInputSchema.parse(item),
    id: item.id,
    workspaceId: item.workspaceId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
