import { NextResponse } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { getQuoteService } from "@/server/infrastructure/app-runtime";
import { createShareLinkSchema } from "@/server/quotes/api-schemas";

type RouteContext = {
  params: Promise<{ workspaceId: string; quoteId: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const { workspaceId, quoteId } = await params;
  try {
    const { session } = await requireWorkspacePermission(workspaceId, "quote:share");
    const input = createShareLinkSchema.parse(await request.json());
    const shareLink = await getQuoteService().createShareLink(
      { workspaceId, actorUserId: session.user.id },
      quoteId,
      input.expiresAt
    );
    return NextResponse.json({ shareLink }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
