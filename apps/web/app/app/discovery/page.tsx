import { ButtonLink, DataTable, PageHeader, StatusBadge } from "../page-actions";
import { importJobs } from "../ui-fixtures";

export default function DiscoveryPage() {
  return (
    <>
      <PageHeader title="Discovery sessions" description="Open candidate review sessions created by import jobs." />
      <section className="panel">
        <h2>Open sessions</h2>
        <DataTable label="Open discovery sessions">
          <thead><tr><th>Session</th><th>Source</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {importJobs.map((job) => (
              <tr key={job.sessionId}>
                <td data-label="Session">{job.sessionId}</td>
                <td data-label="Source">{job.source}</td>
                <td data-label="Status"><StatusBadge>{job.status}</StatusBadge></td>
                <td data-label="Action"><ButtonLink href={`/app/discovery/${job.sessionId}`}>Open Discovery Session</ButtonLink></td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
    </>
  );
}
