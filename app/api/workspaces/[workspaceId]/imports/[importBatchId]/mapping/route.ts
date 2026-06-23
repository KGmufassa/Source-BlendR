import { NextResponse, type NextRequest } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { updateImportMappingSchema } from "@/server/imports/api-schemas";
import { createImportService } from "@/server/imports/api-service";

type ImportRouteContext = {
  params: Promise<{ workspaceId: string; importBatchId: string }>;
};

export async function PATCH(request: NextRequest, context: ImportRouteContext) {
  try {
    const { workspaceId, importBatchId } = await context.params;
    const { session } = await requireWorkspacePermission(workspaceId, "import:create");
    const input = updateImportMappingSchema.parse(await request.json());
    const batch = await createImportService().updateMapping(
      {
        workspaceId,
        actorUserId: session.user.id
      },
      importBatchId,
      input.mapping
    );

    return NextResponse.json({ batch });
  } catch (error) {
    return jsonError(error);
  }
}
