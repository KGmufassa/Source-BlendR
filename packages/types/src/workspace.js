export const WORKSPACE_ROLES = Object.freeze(["owner", "admin", "member", "viewer"]);

export function buildWorkspaceContext(input) {
  if (!input?.userId) {
    throw new Error("user_required");
  }
  if (!input.workspaceId) {
    throw new Error("workspace_required");
  }
  if (!WORKSPACE_ROLES.includes(input.role)) {
    throw new Error("workspace_role_invalid");
  }

  return {
    userId: input.userId,
    workspaceId: input.workspaceId,
    role: input.role,
  };
}

export function canAccessWorkspace(context, workspaceId) {
  return Boolean(context?.workspaceId && workspaceId && context.workspaceId === workspaceId);
}

export function requireWorkspaceAccess(context, workspaceId) {
  if (!canAccessWorkspace(context, workspaceId)) {
    throw new Error("workspace_forbidden");
  }

  return context;
}
