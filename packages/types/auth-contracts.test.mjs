import assert from "node:assert/strict";
import test from "node:test";

import { buildWorkspaceContextFromClerk } from "./src/auth.js";

test("clerk claims map to explicit workspace context", () => {
  const context = buildWorkspaceContextFromClerk({
    userId: "user_1",
    organizationId: "workspace_1",
    organizationRole: "org:admin",
  });

  assert.deepEqual(context, {
    userId: "user_1",
    workspaceId: "workspace_1",
    role: "admin",
  });
});

test("clerk claims without organization are denied", () => {
  assert.throws(
    () => buildWorkspaceContextFromClerk({ userId: "user_1" }),
    /workspace_required/,
  );
});
