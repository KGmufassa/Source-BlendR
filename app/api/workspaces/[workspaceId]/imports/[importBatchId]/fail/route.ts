import { NextResponse, type NextRequest } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { failImportBatchSchema } from "@/server/imports/api-schemas";
import { createImportService } from "@/server/imports/api-service";

type ImportRouteContext = {
  params: Promise<{ workspaceId: string; importBatchId: string }>;
};

export async function POST(request: NextRequest, context: ImportRouteContext) {
  try {
    const { workspaceId, importBatchId } = await context.params;
    const { session } = await requireWorkspacePermission(workspaceId, "import:create");
    const input = failImportBatchSchema.parse(await request.json());
    const batch = await createImportService().failBatch(
      {
        workspaceId,
        actorUserId: session.user.id
      },
      importBatchId,
      input.reason
    );

    return NextResponse.json({ batch });
  } catch (error) {
    return jsonError(error);
  }
}
