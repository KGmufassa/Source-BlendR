import { assertWorkspaceAccess, type Permission } from "@/domain/auth/rbac";
import { getCurrentSession } from "@/server/auth/session";

export async function requireWorkspacePermission(workspaceId: string, permission: Permission) {
  const session = await getCurrentSession();
  const membership = session.user.memberships.find((item) => item.workspaceId === workspaceId);

  assertWorkspaceAccess(membership, workspaceId, permission);

  return {
    session,
    membership
  };
}
