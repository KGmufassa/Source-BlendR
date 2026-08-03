import { blueprintActions } from "../../../workspace-routes";
import { ButtonLink, DataTable, PageHeader, StatusBadge } from "../../page-actions";
import { importJobs } from "../../ui-fixtures";

export default function ImportJobsPage() {
  return (
    <>
      <PageHeader title="Active import jobs" description="Open a job to inspect progress and discovery handoff." />
      <section className="panel">
        <DataTable label="Active import jobs">
          <thead><tr><th>Source</th><th>Status</th><th>Events</th><th>Action</th></tr></thead>
          <tbody>
            {importJobs.map((job) => (
              <tr key={job.id}>
                <td data-label="Source">{job.source}</td>
                <td data-label="Status"><StatusBadge>{job.status}</StatusBadge></td>
                <td data-label="Events">{job.eventCount}</td>
                <td data-label="Action"><ButtonLink href={`/app/imports/jobs/${job.id}`} elementId={blueprintActions.openJob.elementId}>{blueprintActions.openJob.label}</ButtonLink></td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
    </>
  );
}
