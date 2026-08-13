import { auth } from "@clerk/nextjs/server";
import { getDatabase } from "@source-blendr/shared";

export type WorkspaceContext = {
  userId: string;
  workspaceId: string;
  role: string;
};

export async function getWorkspaceContext(): Promise<WorkspaceContext> {
  if (process.env.SOURCE_BLENDR_DEV_AUTH === "1") {
    if (process.env.NODE_ENV === "production" && process.env.SOURCE_BLENDR_ALLOW_DEV_AUTH_IN_PRODUCTION !== "1") throw new Error("dev_auth_forbidden_in_production");
    return ensureWorkspace("dev-user", "dev-workspace", "admin");
  }

  const session = await auth();
  if (!session.userId) throw new Error("authentication_required");
  if (!session.orgId) throw new Error("active_organization_required");
  return ensureWorkspace(session.userId, session.orgId, session.orgRole ?? "org:member");
}

async function ensureWorkspace(userId: string, clerkOrgId: string, role: string): Promise<WorkspaceContext> {
  const workspace = await getDatabase().workspace.upsert({
    where: { clerkOrgId },
    update: {},
    create: { clerkOrgId, name: clerkOrgId === "dev-workspace" ? "Development workspace" : "Source BlendR workspace" },
  });
  await getDatabase().workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId } },
    update: { role },
    create: { workspaceId: workspace.id, userId, role },
  });
  return { userId, workspaceId: workspace.id, role };
}
