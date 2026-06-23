import { NextResponse, type NextRequest } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { createPricingService } from "@/server/pricing/api-service";

type SnapshotRouteContext = {
  params: Promise<{ workspaceId: string; snapshotId: string }>;
};

export async function POST(_request: NextRequest, context: SnapshotRouteContext) {
  try {
    const { workspaceId, snapshotId } = await context.params;
    const { session } = await requireWorkspacePermission(workspaceId, "pricing:manage");
    const snapshot = await createPricingService().lockSnapshotForGeneratedOutput(
      {
        workspaceId,
        actorUserId: session.user.id
      },
      snapshotId
    );

    return NextResponse.json({ snapshot });
  } catch (error) {
    return jsonError(error);
  }
}
