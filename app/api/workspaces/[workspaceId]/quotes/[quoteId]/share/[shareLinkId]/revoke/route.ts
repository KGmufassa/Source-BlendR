import { NextResponse } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { getQuoteService } from "@/server/infrastructure/app-runtime";

type RouteContext = {
  params: Promise<{ workspaceId: string; shareLinkId: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const { workspaceId, shareLinkId } = await params;
  try {
    const { session } = await requireWorkspacePermission(workspaceId, "quote:share");
    const shareLink = await getQuoteService().revokeShareLink(
      { workspaceId, actorUserId: session.user.id },
      shareLinkId
    );
    return NextResponse.json({ shareLink });
  } catch (error) {
    return jsonError(error);
  }
}
