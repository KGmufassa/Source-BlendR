import { blueprintActions } from "../../../../workspace-routes";
import { ButtonLink, PageHeader, StatusBadge } from "../../../page-actions";
import { findJob } from "../../../ui-fixtures";

export default async function ImportJobDetailPage({ params }: Readonly<{ params: Promise<{ jobId: string }> }>) {
  const { jobId } = await params;
  const job = findJob(jobId);

  return (
    <>
      <PageHeader eyebrow="UI-BLUEPRINT-SCREEN-005" title={`Import Job ${job.id}`} description="Review job progress, retry failed work, or open the discovery session.">
        <button type="button" data-element={blueprintActions.retryJob.elementId} data-action={blueprintActions.retryJob.actionId}>{blueprintActions.retryJob.label}</button>
        <button className="danger-button" type="button" data-element={blueprintActions.cancelJob.elementId} data-action={blueprintActions.cancelJob.actionId}>{blueprintActions.cancelJob.label}</button>
        <ButtonLink href={`/app/discovery/${job.sessionId}`} elementId={blueprintActions.openDiscovery.elementId} primary>{blueprintActions.openDiscovery.label}</ButtonLink>
      </PageHeader>
      <section className="panel">
        <h2>JobProgressTimeline</h2>
        <p>Status: <StatusBadge>{job.status}</StatusBadge></p>
        <ol>
          <li>Queued</li>
          <li>Worker accepted source</li>
          <li>Partial results available</li>
        </ol>
      </section>
    </>
  );
}
