import { NextResponse, type NextRequest } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { createImportService } from "@/server/imports/api-service";

type ImportRouteContext = {
  params: Promise<{ workspaceId: string; importBatchId: string }>;
};

export async function POST(_request: NextRequest, context: ImportRouteContext) {
  try {
    const { workspaceId, importBatchId } = await context.params;
    const { session } = await requireWorkspacePermission(workspaceId, "job:retry");
    const batch = await createImportService().retryBatch(
      {
        workspaceId,
        actorUserId: session.user.id
      },
      importBatchId
    );

    return NextResponse.json({ batch });
  } catch (error) {
    return jsonError(error);
  }
}
