import { PageScaffold } from "@/ui/components/PageScaffold";

export default function SettingsPage() {
  return (
    <PageScaffold
      title="Workspace settings"
      description="Manage workspace membership, roles, permissions, and audit-sensitive settings."
      actionLabel="Invite member"
    >
      <div className="panel">
        <div className="panel-header">Role-based access</div>
        <div className="panel-body muted">Workspace RBAC foundation is implemented in TICKET-001.</div>
      </div>
    </PageScaffold>
  );
}
