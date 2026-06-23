export const roles = ["owner", "admin", "contributor", "viewer"] as const;

export type Role = (typeof roles)[number];

export const permissions = [
  "workspace:read",
  "member:invite",
  "member:update_role",
  "supplier:create",
  "supplier:read",
  "supplier:update",
  "supplier:archive",
  "import:create",
  "import:commit",
  "asset:read",
  "asset:update",
  "pricing:manage",
  "quote:create",
  "quote:approve",
  "quote:share",
  "job:retry"
] as const;

export type Permission = (typeof permissions)[number];

export type WorkspaceMembership = {
  userId: string;
  workspaceId: string;
  role: Role;
};

const rolePermissions: Record<Role, ReadonlySet<Permission>> = {
  owner: new Set(permissions),
  admin: new Set(permissions.filter((permission) => permission !== "member:update_role")),
  contributor: new Set([
    "workspace:read",
    "supplier:create",
    "supplier:read",
    "supplier:update",
    "import:create",
    "import:commit",
    "asset:read",
    "asset:update",
    "pricing:manage",
    "quote:create",
    "job:retry"
  ]),
  viewer: new Set(["workspace:read", "supplier:read", "asset:read"])
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role].has(permission);
}

export function assertWorkspaceAccess(
  membership: WorkspaceMembership | undefined,
  workspaceId: string,
  permission: Permission
): asserts membership is WorkspaceMembership {
  if (!membership || membership.workspaceId !== workspaceId || !hasPermission(membership.role, permission)) {
    throw new WorkspaceAccessError(workspaceId, permission);
  }
}

export class WorkspaceAccessError extends Error {
  constructor(
    public readonly workspaceId: string,
    public readonly permission: Permission
  ) {
    super(`Permission ${permission} denied for workspace ${workspaceId}.`);
    this.name = "WorkspaceAccessError";
  }
}
