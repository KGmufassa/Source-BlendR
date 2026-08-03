import { blueprintActions } from "../../workspace-routes";
import { ButtonLink, DataTable, PageHeader, StatusBadge } from "../page-actions";
import { importJobs } from "../ui-fixtures";

export default function ImportsPage() {
  return (
    <>
      <PageHeader eyebrow="UI-BLUEPRINT-SCREEN-002" title="Imports Workspace" description="Start import methods and monitor recent jobs.">
        <ButtonLink href={blueprintActions.websiteImport.href} elementId={blueprintActions.websiteImport.elementId} primary>{blueprintActions.websiteImport.label}</ButtonLink>
        <ButtonLink href={blueprintActions.pdfImport.href} elementId={blueprintActions.pdfImport.elementId}>{blueprintActions.pdfImport.label}</ButtonLink>
      </PageHeader>
      <section className="panel">
        <h2>Recent jobs</h2>
        <DataTable label="Recent import jobs">
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
