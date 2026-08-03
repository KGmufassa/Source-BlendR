import { CatalogService } from "@source-blendr/domain";
import { PrismaCatalogRepository } from "@source-blendr/shared";
import { apiError } from "@/lib/http";
import { getWorkspaceContext } from "@/lib/workspace-context";

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
    const context = await getWorkspaceContext();
    const item = await catalog.create(context.workspaceId, await request.json());
    return Response.json({ data: item }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
