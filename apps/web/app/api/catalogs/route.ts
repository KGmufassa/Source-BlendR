import { getDatabase } from "@source-blendr/shared";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { requireSameOrigin } from "@/lib/request-security";
import { getWorkspaceContext } from "@/lib/workspace-context";

const catalogSchema = z.object({
  name: z.string().trim().min(1).max(120),
  categoryType: z.string().trim().min(1).max(80),
});

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
    return apiError(error);
  }
}
