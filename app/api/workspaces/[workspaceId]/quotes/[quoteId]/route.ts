import { NextResponse } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { getQuoteService } from "@/server/infrastructure/app-runtime";
import { updateQuoteLinesSchema } from "@/server/quotes/api-schemas";

type RouteContext = {
  params: Promise<{ workspaceId: string; quoteId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { workspaceId, quoteId } = await params;
  try {
    await requireWorkspacePermission(workspaceId, "workspace:read");
    const quote = await getQuoteService().getQuote(workspaceId, quoteId);
    return NextResponse.json({ quote });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { workspaceId, quoteId } = await params;
  try {
    const { session } = await requireWorkspacePermission(workspaceId, "quote:create");
    const input = updateQuoteLinesSchema.parse(await request.json());
    const quote = await getQuoteService().updateQuoteLines(
      { workspaceId, actorUserId: session.user.id },
      quoteId,
      input.lines
    );
    return NextResponse.json({ quote });
  } catch (error) {
    return jsonError(error);
  }
}
