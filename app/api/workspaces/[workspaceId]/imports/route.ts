import { NextResponse, type NextRequest } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { createImportBatchSchema } from "@/server/imports/api-schemas";
import { createImportService } from "@/server/imports/api-service";

export async function GET(_request: NextRequest, context: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await context.params;
    await requireWorkspacePermission(workspaceId, "workspace:read");
    const batches = await createImportService().listBatches(workspaceId);

    return NextResponse.json({ batches });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await context.params;
    const { session } = await requireWorkspacePermission(workspaceId, "import:create");
    const input = createImportBatchSchema.parse(await request.json());
    const batch = await createImportService().createBatch(
      {
        workspaceId,
        actorUserId: session.user.id
      },
      input
    );

    return NextResponse.json({ batch }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
