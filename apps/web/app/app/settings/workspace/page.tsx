import { getDatabase } from "@source-blendr/shared";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { WorkspaceSettingsClient } from "./workspace-settings-client";

export const dynamic = "force-dynamic";

export default async function WorkspaceSettingsPage() {
  const context = await getWorkspaceContext(); const workspace = await getDatabase().workspace.findFirst({ where: { id: context.workspaceId }, include: { members: { orderBy: { createdAt: "asc" } } } }); if (!workspace) throw new Error("workspace_not_found"); const canEdit = ["admin", "org:admin"].includes(context.role);
  return <WorkspaceSettingsClient workspace={{ id: workspace.id, name: workspace.name, locale: workspace.locale, timezone: workspace.timezone, currency: workspace.currency, measurementSystem: workspace.measurementSystem, logoUrl: workspace.logoUrl }} members={workspace.members.map((member) => ({ id: member.id, userId: member.userId, role: member.role, displayName: member.displayName, email: member.email, current: member.userId === context.userId }))} canEdit={canEdit} />;
}
