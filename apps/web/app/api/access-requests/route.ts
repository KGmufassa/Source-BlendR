import { z } from "zod";
import { getDatabase } from "@source-blendr/shared";
import { apiError } from "@/lib/http";
import { requireSameOrigin } from "@/lib/request-security";
import { getWorkspaceContext } from "@/lib/workspace-context";

const requestSchema = z.object({ permission: z.literal("manage_ai_providers") });
const action = "workspace.access_requested";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const context = await getWorkspaceContext();
    const input = requestSchema.parse(await request.json());
    if (context.role.includes("admin")) throw new Error("access_request_not_required");

    const database = getDatabase();
    const entityId = `${input.permission}:${context.userId}`;
    const existing = await database.auditEvent.findFirst({
      where: { workspaceId: context.workspaceId, actorUserId: context.userId, action, entityType: "workspace_permission", entityId },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    });
    if (existing) return Response.json({ data: { ...existing, status: "pending", duplicate: true } });

    const accessRequest = await database.auditEvent.create({
      data: {
        workspaceId: context.workspaceId,
        actorUserId: context.userId,
        action,
        entityType: "workspace_permission",
        entityId,
        detail: { permission: input.permission, recipientRole: "org:admin", status: "pending" },
      },
      select: { id: true, createdAt: true },
    });
    return Response.json({ data: { ...accessRequest, status: "pending", duplicate: false } }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
