import { getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { requireSameOrigin } from "@/lib/request-security";
import { getWorkspaceContext } from "@/lib/workspace-context";

const catalogSchema = z.object({
  name: z.string().trim().min(1).max(120),
  categoryType: z.string().trim().min(1).max(80),
});
const catalogSelectionSchema = z.object({ catalogIds: z.array(z.string().min(1)).min(1).max(500) });
const bulkCatalogUpdateSchema = catalogSelectionSchema.extend({ categoryType: z.string().trim().min(1).max(80) });

function isUniqueConstraintError(error: unknown): error is { code: "P2002" } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function GET(request: Request) {
  try {
    const context = await getWorkspaceContext();
    const query = new URL(request.url).searchParams.get("query")?.trim() ?? "";
    const catalogs = await getDatabase().catalog.findMany({
      where: { workspaceId: context.workspaceId, ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { categoryType: { contains: query, mode: "insensitive" } }] } : {}) },
      include: { _count: { select: { members: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return Response.json({ data: catalogs });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const input = catalogSchema.parse(await request.json());
    const catalog = await getDatabase().catalog.create({ data: { workspaceId: context.workspaceId, ...input } });
    return Response.json({ data: catalog }, { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return Response.json({ error: { code: "catalog_name_conflict", message: "A catalog with this name already exists in this workspace.", field_errors: { name: ["Use a unique catalog name."] } } }, { status: 409 });
    }
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const input = bulkCatalogUpdateSchema.parse(await request.json());
    const catalogIds = [...new Set(input.catalogIds)];
    const updated = await getDatabase().$transaction(async (transaction) => {
      const count = await transaction.catalog.count({ where: { id: { in: catalogIds }, workspaceId: context.workspaceId } });
      if (count !== catalogIds.length) throw new Error("catalog_selection_invalid");
      const result = await transaction.catalog.updateMany({ where: { id: { in: catalogIds }, workspaceId: context.workspaceId }, data: { categoryType: input.categoryType } });
      if (result.count !== catalogIds.length) throw new Error("catalog_selection_invalid");
      return result;
    });
    return Response.json({ data: { updated: updated.count } });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const { catalogIds: requestedIds } = catalogSelectionSchema.parse(await request.json());
    const catalogIds = [...new Set(requestedIds)];
    const deleted = await getDatabase().$transaction(async (transaction) => {
      const count = await transaction.catalog.count({ where: { id: { in: catalogIds }, workspaceId: context.workspaceId } });
      if (count !== catalogIds.length) throw new Error("catalog_selection_invalid");
      const result = await transaction.catalog.deleteMany({ where: { id: { in: catalogIds }, workspaceId: context.workspaceId } });
      if (result.count !== catalogIds.length) throw new Error("catalog_selection_invalid");
      return result;
    });
    return Response.json({ data: { deleted: deleted.count } });
  } catch (error) {
    return apiError(error);
  }
}
