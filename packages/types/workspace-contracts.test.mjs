import assert from "node:assert/strict";
import test from "node:test";

import {
  WORKSPACE_ROLES,
  buildWorkspaceContext,
  canAccessWorkspace,
  requireWorkspaceAccess,
} from "./src/workspace.js";

test("workspace context keeps tenant identity explicit", () => {
  const context = buildWorkspaceContext({
    userId: "user_1",
    workspaceId: "workspace_1",
    role: "owner",
  });

  assert.equal(context.userId, "user_1");
  assert.equal(context.workspaceId, "workspace_1");
  assert.equal(context.role, "owner");
  assert.deepEqual(WORKSPACE_ROLES, ["owner", "admin", "member", "viewer"]);
});

test("workspace access denies cross-tenant requests", () => {
  const context = buildWorkspaceContext({
    userId: "user_1",
    workspaceId: "workspace_1",
    role: "member",
  });

  assert.equal(canAccessWorkspace(context, "workspace_1"), true);
  assert.equal(canAccessWorkspace(context, "workspace_2"), false);
  assert.throws(
    () => requireWorkspaceAccess(context, "workspace_2"),
    /workspace_forbidden/,
  );
});
