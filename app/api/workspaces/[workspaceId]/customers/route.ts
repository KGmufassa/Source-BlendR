import { NextResponse } from "next/server";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";
import { getQuoteService } from "@/server/infrastructure/app-runtime";
import { createCustomerSchema } from "@/server/quotes/api-schemas";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { workspaceId } = await params;
  try {
    await requireWorkspacePermission(workspaceId, "workspace:read");
    const customers = await getQuoteService().listCustomers(workspaceId);
    return NextResponse.json({ customers });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { workspaceId } = await params;
  try {
    const { session } = await requireWorkspacePermission(workspaceId, "quote:create");
    const input = createCustomerSchema.parse(await request.json());
    const customer = await getQuoteService().createCustomer(
      { workspaceId, actorUserId: session.user.id },
      input
    );
    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
