import { NextResponse } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { getQuoteService } from "@/server/infrastructure/app-runtime";
import { createQuoteSchema } from "@/server/quotes/api-schemas";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { workspaceId } = await params;
  try {
    await requireWorkspacePermission(workspaceId, "workspace:read");
    const quotes = await getQuoteService().listQuotes(workspaceId);
    return NextResponse.json({ quotes });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { workspaceId } = await params;
  try {
    const { session } = await requireWorkspacePermission(workspaceId, "quote:create");
    const input = createQuoteSchema.parse(await request.json());
    const quote = await getQuoteService().createQuote({ workspaceId, actorUserId: session.user.id }, input);
    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
