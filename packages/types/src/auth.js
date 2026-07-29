import { buildWorkspaceContext } from "./workspace.js";

const CLERK_ROLE_MAP = Object.freeze({
  "org:admin": "admin",
  "org:member": "member",
  "org:viewer": "viewer",
});

export function buildWorkspaceContextFromClerk(claims) {
  return buildWorkspaceContext({
    userId: claims?.userId,
    workspaceId: claims?.organizationId,
    role: CLERK_ROLE_MAP[claims?.organizationRole] ?? "viewer",
  });
}
