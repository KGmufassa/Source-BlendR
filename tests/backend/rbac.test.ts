import { describe, expect, it } from "vitest";
import { assertWorkspaceAccess, hasPermission, WorkspaceAccessError } from "@/domain/auth/rbac";

describe("workspace RBAC", () => {
  it("allows owners to invite members", () => {
    expect(hasPermission("owner", "member:invite")).toBe(true);
  });

  it("limits viewers to read-only workspace access", () => {
    expect(hasPermission("viewer", "workspace:read")).toBe(true);
    expect(hasPermission("viewer", "supplier:update")).toBe(false);
  });

  it("rejects cross-workspace access", () => {
    expect(() =>
      assertWorkspaceAccess(
        {
          userId: "user-1",
          workspaceId: "workspace-a",
          role: "owner"
        },
        "workspace-b",
        "workspace:read"
      )
    ).toThrow(WorkspaceAccessError);
  });
});
