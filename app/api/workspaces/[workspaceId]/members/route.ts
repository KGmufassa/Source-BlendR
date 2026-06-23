import { NextResponse, type NextRequest } from "next/server";
import { createAuditEvent, MemoryAuditSink } from "@/domain/audit/audit-log";
import { requireWorkspacePermission } from "@/server/auth/guards";
import { jsonError } from "@/server/http/errors";

const auditSink = new MemoryAuditSink();

export async function GET(_request: NextRequest, context: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await context.params;
    await requireWorkspacePermission(workspaceId, "workspace:read");

    return NextResponse.json({
      members: [
        {
          userId: "demo-user",
          email: "owner@source-blendr.local",
          role: "owner"
        }
      ]
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await context.params;
    const { session } = await requireWorkspacePermission(workspaceId, "member:invite");
    const body = (await request.json()) as { email?: string };

    const invitedEmail = body.email?.trim();
    if (!invitedEmail) {
      return NextResponse.json({ error: "validation_error", message: "Email is required." }, { status: 400 });
    }

    await auditSink.record(
      createAuditEvent({
        workspaceId,
        actorUserId: session.user.id,
        action: "member.invited",
        targetId: invitedEmail,
        metadata: { invitedEmail }
      })
    );

    return NextResponse.json(
      {
        member: {
          email: invitedEmail,
          role: "viewer",
          status: "invited"
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
