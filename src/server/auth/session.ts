import type { WorkspaceMembership } from "@/domain/auth/rbac";

export type SessionUser = {
  id: string;
  email: string;
  memberships: WorkspaceMembership[];
};

export type Session = {
  user: SessionUser;
};

export async function getCurrentSession(): Promise<Session> {
  return {
    user: {
      id: "demo-user",
      email: "owner@source-blendr.local",
      memberships: [
        {
          userId: "demo-user",
          workspaceId: "demo-workspace",
          role: "owner"
        }
      ]
    }
  };
}
