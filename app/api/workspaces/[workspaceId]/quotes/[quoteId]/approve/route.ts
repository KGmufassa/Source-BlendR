import { NextResponse } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { getQuoteService } from "@/server/infrastructure/app-runtime";

type RouteContext = {
  params: Promise<{ workspaceId: string; quoteId: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const { workspaceId, quoteId } = await params;
  try {
    const { session } = await requireWorkspacePermission(workspaceId, "quote:approve");
    const quote = await getQuoteService().approveQuote({ workspaceId, actorUserId: session.user.id }, quoteId);
    return NextResponse.json({ quote });
  } catch (error) {
    return jsonError(error);
  }
}
