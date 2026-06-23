import { PageScaffold } from "@/ui/components/PageScaffold";

const recentImports = [
  { supplier: "Acme Apparel", state: "Mapping required", statusClass: "status-warning" },
  { supplier: "Metro Awards", state: "Committed", statusClass: "status-success" },
  { supplier: "Print Partner", state: "Failed validation", statusClass: "status-danger" }
];

export default function DashboardPage() {
  return (
    <PageScaffold
      title="Operational dashboard"
      description="Track supplier intake, margin alerts, quote activity, and background jobs."
      actionLabel="Create supplier"
    >
      <section className="grid" aria-label="Workflow summary">
        <div className="panel panel-body metric">
          <span className="metric-value">12</span>
          <span className="metric-label">Active suppliers</span>
        </div>
        <div className="panel panel-body metric">
          <span className="metric-value">3</span>
          <span className="metric-label">Imports need review</span>
        </div>
        <div className="panel panel-body metric">
          <span className="metric-value">7</span>
          <span className="metric-label">Low-margin alerts</span>
        </div>
        <div className="panel panel-body metric">
          <span className="metric-value">5</span>
          <span className="metric-label">Quotes in progress</span>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }} aria-label="Recent imports">
        <div className="panel-header">Recent imports</div>
        <div className="panel-body">
          <table className="table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Status</th>
                <th>Next action</th>
              </tr>
            </thead>
            <tbody>
              {recentImports.map((item) => (
                <tr key={item.supplier}>
                  <td>{item.supplier}</td>
                  <td>
                    <span className={`status ${item.statusClass}`}>{item.state}</span>
                  </td>
                  <td>Review details</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageScaffold>
  );
}
