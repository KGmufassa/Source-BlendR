import { getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { requireSameOrigin } from "@/lib/request-security";
import { getWorkspaceContext } from "@/lib/workspace-context";

const addSchema = z.object({ candidateIds: z.array(z.string().min(1)).min(1).max(500) });
const removeSchema = z.object({ memberIds: z.array(z.string().min(1)).min(1).max(500) });
const updateSchema = z.object({ memberId: z.string().min(1), customPriceCents: z.number().int().nonnegative().nullable() });

export async function POST(request: Request, { params }: { params: Promise<{ catalogId: string }> }) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const { catalogId } = await params;
    const { candidateIds } = addSchema.parse(await request.json());
    const database = getDatabase();
    const [catalog, candidateCount] = await Promise.all([
      database.catalog.findFirst({ where: { id: catalogId, workspaceId: context.workspaceId } }),
      database.candidateItem.count({ where: { id: { in: [...new Set(candidateIds)] }, workspaceId: context.workspaceId } }),
    ]);
    if (!catalog) throw new Error("catalog_not_found");
    if (candidateCount !== new Set(candidateIds).size) throw new Error("candidate_selection_invalid");
    await database.catalogMember.createMany({ data: [...new Set(candidateIds)].map((candidateId) => ({ workspaceId: context.workspaceId, catalogId, candidateId })), skipDuplicates: true });
    return Response.json({ data: { catalogId, added: candidateIds.length } }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ catalogId: string }> }) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const { catalogId } = await params;
    const input = updateSchema.parse(await request.json());
    const result = await getDatabase().catalogMember.updateMany({ where: { id: input.memberId, catalogId, workspaceId: context.workspaceId }, data: { customPriceCents: input.customPriceCents } });
    if (!result.count) throw new Error("catalog_member_not_found");
    return Response.json({ data: { updated: result.count } });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ catalogId: string }> }) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const { catalogId } = await params;
    const { memberIds } = removeSchema.parse(await request.json());
    const result = await getDatabase().catalogMember.deleteMany({ where: { id: { in: [...new Set(memberIds)] }, catalogId, workspaceId: context.workspaceId } });
    if (result.count !== new Set(memberIds).size) throw new Error("catalog_member_selection_invalid");
    return Response.json({ data: { catalogId, removed: result.count } });
  } catch (error) {
    return apiError(error);
  }
}
