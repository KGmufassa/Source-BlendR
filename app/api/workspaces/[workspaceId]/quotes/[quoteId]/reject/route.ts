import { NextResponse } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { getQuoteService } from "@/server/infrastructure/app-runtime";
import { rejectQuoteSchema } from "@/server/quotes/api-schemas";

type RouteContext = {
  params: Promise<{ workspaceId: string; quoteId: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const { workspaceId, quoteId } = await params;
  try {
    const { session } = await requireWorkspacePermission(workspaceId, "quote:approve");
    const input = rejectQuoteSchema.parse(await request.json());
    const quote = await getQuoteService().rejectQuote({ workspaceId, actorUserId: session.user.id }, quoteId, input.reason);
    return NextResponse.json({ quote });
  } catch (error) {
    return jsonError(error);
  }
}
