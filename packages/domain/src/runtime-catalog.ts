import { z } from "zod";

export const catalogItemInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  sku: z.string().trim().min(1).max(80).transform((value) => value.toUpperCase()),
  type: z.enum(["product", "service", "rental", "labor", "manufacturing", "installation"]).default("product"),
  description: z.string().trim().max(10_000).default(""),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  vendorId: z.string().trim().min(1).nullable().optional(),
});

export type CatalogItemInput = z.infer<typeof catalogItemInputSchema>;

export type CatalogItemRecord = CatalogItemInput & {
  id: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface CatalogRepository {
  create(workspaceId: string, input: CatalogItemInput): Promise<CatalogItemRecord>;
  list(workspaceId: string, query: string): Promise<CatalogItemRecord[]>;
}

export class CatalogService {
  constructor(private readonly repository: CatalogRepository) {}

  create(workspaceId: string, input: unknown): Promise<CatalogItemRecord> {
    return this.repository.create(workspaceId, catalogItemInputSchema.parse(input));
  }

  list(workspaceId: string, query = ""): Promise<CatalogItemRecord[]> {
    return this.repository.list(workspaceId, query.trim());
  }
}
