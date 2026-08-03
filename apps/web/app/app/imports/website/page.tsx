import { blueprintActions } from "../../../workspace-routes";
import { ButtonLink, FormField, PageHeader, StatusBadge } from "../../page-actions";
import { importJobs, vendors } from "../../ui-fixtures";

export default function WebsiteImportPage() {
  const latestJob = importJobs[0] ?? {
    id: "job-preview",
    source: "Website",
    status: "queued",
    sessionId: "session-preview",
    eventCount: 0,
  };

  return (
    <>
      <PageHeader eyebrow="UI-BLUEPRINT-SCREEN-003" title="Website Import Wizard" description="Analyze a vendor website, select categories, and open the created import job." />
      <section className="panel">
        <StatusBadge>populated</StatusBadge>
        <h2>Source</h2>
        <form className="form-grid" action="/api/imports/website" method="post">
          <FormField label="Vendor">
            <select name="vendorId" data-element="EL-WEB-001">
              {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
            </select>
          </FormField>
          <FormField label="Website URL">
            <input data-element="EL-WEB-002" name="url" type="url" required defaultValue="https://example.test/catalog" />
          </FormField>
          <div className="wide"><button className="primary" type="submit" data-element={blueprintActions.analyzeWebsite.elementId} data-action={blueprintActions.analyzeWebsite.actionId}>{blueprintActions.analyzeWebsite.label}</button></div>
        </form>
      </section>
      <section className="panel">
        <h2>Categories</h2>
        {["Tea", "Coffee", "Equipment"].map((category) => (
          <label className="check-row" key={category}>
            <input type="checkbox" data-element="EL-WEB-004" /> {category}
          </label>
        ))}
        <button type="button" data-element={blueprintActions.queueCategories.elementId} data-action={blueprintActions.queueCategories.actionId}>{blueprintActions.queueCategories.label}</button>
      </section>
      <section className="panel">
        <h2>Result</h2>
        <ButtonLink href={`/app/imports/jobs/${latestJob.id}`} elementId="EL-WEB-006">{blueprintActions.openJob.label}</ButtonLink>
      </section>
    </>
  );
}
