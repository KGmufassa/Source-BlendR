import { NextResponse } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { getQuoteService } from "@/server/infrastructure/app-runtime";
import { markGeneratedSchema } from "@/server/quotes/api-schemas";

type RouteContext = {
  params: Promise<{ workspaceId: string; quoteId: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const { workspaceId, quoteId } = await params;
  try {
    const { session } = await requireWorkspacePermission(workspaceId, "quote:create");
    const quote = await getQuoteService().requestGeneratedOutput(
      { workspaceId, actorUserId: session.user.id },
      quoteId
    );
    return NextResponse.json({ quote }, { status: 202 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { workspaceId, quoteId } = await params;
  try {
    const { session } = await requireWorkspacePermission(workspaceId, "quote:create");
    const input = markGeneratedSchema.parse(await request.json());
    const quote = await getQuoteService().markGenerated(
      { workspaceId, actorUserId: session.user.id },
      quoteId,
      input.outputObjectKey
    );
    return NextResponse.json({ quote });
  } catch (error) {
    return jsonError(error);
  }
}
