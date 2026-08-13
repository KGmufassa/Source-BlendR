import { CatalogService } from "@source-blendr/domain";
import { getDatabase, PrismaCatalogRepository } from "@source-blendr/shared";
import { apiError } from "@/lib/http";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { requireSameOrigin } from "@/lib/request-security";

const catalog = new CatalogService(new PrismaCatalogRepository());

export async function GET(request: Request) {
  try {
    const context = await getWorkspaceContext();
    const query = new URL(request.url).searchParams.get("query") ?? "";
    return Response.json({ data: await catalog.list(context.workspaceId, query) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const input = await request.json();
    if (input.vendorId) {
      const vendor = await getDatabase().vendor.findFirst({ where: { id: input.vendorId, workspaceId: context.workspaceId } });
      if (!vendor) throw new Error("vendor_not_found");
    }
    const item = await catalog.create(context.workspaceId, input);
    return Response.json({ data: item }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
