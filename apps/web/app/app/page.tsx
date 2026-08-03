import { blueprintActions } from "../workspace-routes";
import { ButtonLink, PageHeader, StatusBadge } from "./page-actions";
import { importJobs } from "./ui-fixtures";

export default function OverviewPage() {
  const activeJobs = importJobs.filter((job) => job.status !== "complete").length;

  return (
    <>
      <PageHeader
        eyebrow="UI-BLUEPRINT-SCREEN-001"
        title="Workspace Overview"
        description="Current task status and next safe actions for the workspace."
      >
        <ButtonLink href={blueprintActions.startImport.href} elementId={blueprintActions.startImport.elementId} primary>{blueprintActions.startImport.label}</ButtonLink>
        <ButtonLink href={blueprintActions.openCatalog.href} elementId={blueprintActions.openCatalog.elementId}>{blueprintActions.openCatalog.label}</ButtonLink>
        <ButtonLink href={blueprintActions.viewActiveJobs.href} elementId={blueprintActions.viewActiveJobs.elementId}>{blueprintActions.viewActiveJobs.label} ({activeJobs})</ButtonLink>
      </PageHeader>
      <div className="bento-grid">
        <section className="panel metric-card">
          <p className="muted">Catalog records</p>
          <strong>Ready</strong>
          <p>Create and manage workspace-owned products and services.</p>
        </section>
        <section className="panel metric-card">
          <p className="muted">Active import jobs</p>
          <strong>{activeJobs}</strong>
          <p>Website and PDF processing runs in the background worker.</p>
        </section>
        <section className="panel metric-card">
          <p className="muted">System</p>
          <StatusBadge>Runtime foundation active</StatusBadge>
        </section>
      </div>
    </>
  );
}
