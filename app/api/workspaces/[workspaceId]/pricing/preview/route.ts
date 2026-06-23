import { NextResponse, type NextRequest } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { pricingPreviewSchema } from "@/server/pricing/api-schemas";
import { createPricingService } from "@/server/pricing/api-service";

export async function POST(request: NextRequest, context: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await context.params;
    const { session } = await requireWorkspacePermission(workspaceId, "pricing:manage");
    const input = pricingPreviewSchema.parse(await request.json());
    const preview = await createPricingService().preview(
      {
        workspaceId,
        actorUserId: session.user.id
      },
      input.pricingRuleId,
      input.costComponents
    );

    return NextResponse.json({ preview });
  } catch (error) {
    return jsonError(error);
  }
}
