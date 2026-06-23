import { NextResponse, type NextRequest } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { createPricingRuleSchema } from "@/server/pricing/api-schemas";
import { createPricingService } from "@/server/pricing/api-service";

export async function GET(_request: NextRequest, context: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await context.params;
    await requireWorkspacePermission(workspaceId, "pricing:manage");
    const rules = await createPricingService().listRules(workspaceId);

    return NextResponse.json({ rules });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await context.params;
    const { session } = await requireWorkspacePermission(workspaceId, "pricing:manage");
    const input = createPricingRuleSchema.parse(await request.json());
    const rule = await createPricingService().createRule(
      {
        workspaceId,
        actorUserId: session.user.id
      },
      input
    );

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
