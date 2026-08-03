import { blueprintActions } from "../../../workspace-routes";
import { ButtonLink, FormField, PageHeader, StatusBadge } from "../../page-actions";
import { importJobs, vendors } from "../../ui-fixtures";

export default function PdfImportPage() {
  const latestJob = importJobs[1] ?? {
    id: "job-preview",
    source: "PDF catalog",
    status: "queued",
    sessionId: "session-preview",
    eventCount: 0,
  };

  return (
    <>
      <PageHeader eyebrow="UI-BLUEPRINT-SCREEN-004" title="PDF Import" description="Upload a vendor catalog PDF and open the extraction job." />
      <section className="panel">
        <StatusBadge>runtime pending</StatusBadge>
        <h2>Upload</h2>
        <form className="form-grid">
          <FormField label="Vendor">
            <select name="vendor_id" data-element="EL-PDF-001">
              {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
            </select>
          </FormField>
          <FormField label="PDF catalog">
            <input data-element="EL-PDF-002" name="pdf_file" type="file" accept="application/pdf" />
          </FormField>
          <div className="wide"><button className="primary" type="button" data-element={blueprintActions.startPdf.elementId} data-action={blueprintActions.startPdf.actionId}>{blueprintActions.startPdf.label}</button></div>
        </form>
        <p role="status" className="muted">PDF storage/OCR runtime is still pending; retry upload or open the created job when available.</p>
        <ButtonLink href={`/app/imports/jobs/${latestJob.id}`} elementId="EL-PDF-004">{blueprintActions.openJob.label}</ButtonLink>
      </section>
    </>
  );
}
