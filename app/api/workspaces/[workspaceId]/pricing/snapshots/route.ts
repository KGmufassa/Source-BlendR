import { NextResponse, type NextRequest } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { createPricingSnapshotSchema } from "@/server/pricing/api-schemas";
import { createPricingService } from "@/server/pricing/api-service";

export async function POST(request: NextRequest, context: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await context.params;
    const { session } = await requireWorkspacePermission(workspaceId, "pricing:manage");
    const input = createPricingSnapshotSchema.parse(await request.json());
    const snapshot = await createPricingService().createSnapshot(
      {
        workspaceId,
        actorUserId: session.user.id
      },
      input
    );

    return NextResponse.json({ snapshot }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
