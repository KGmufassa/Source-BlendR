import { NextResponse, type NextRequest } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { createImportService } from "@/server/imports/api-service";

type ImportRouteContext = {
  params: Promise<{ workspaceId: string; importBatchId: string }>;
};

export async function GET(_request: NextRequest, context: ImportRouteContext) {
  try {
    const { workspaceId, importBatchId } = await context.params;
    await requireWorkspacePermission(workspaceId, "workspace:read");
    const preview = await createImportService().previewCommit(workspaceId, importBatchId);

    return NextResponse.json({ preview });
  } catch (error) {
    return jsonError(error);
  }
}
