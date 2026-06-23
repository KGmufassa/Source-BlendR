import { PageScaffold } from "@/ui/components/PageScaffold";

export default function SuppliersPage() {
  return (
    <PageScaffold
      title="Suppliers"
      description="Manage supplier profiles, source records, contacts, and workspace-scoped access."
      actionLabel="Create supplier"
    >
      <div className="panel">
        <div className="panel-header">Supplier workspace</div>
        <div className="panel-body muted">Supplier CRUD and source records are implemented in TICKET-004.</div>
      </div>
    </PageScaffold>
  );
}
