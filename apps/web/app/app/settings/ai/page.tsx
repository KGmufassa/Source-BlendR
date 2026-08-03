import { blueprintActions } from "../../../workspace-routes";
import { DataTable, FormField, PageHeader } from "../../page-actions";

export default function AiSettingsPage() {
  return (
    <>
      <PageHeader eyebrow="UI-BLUEPRINT-SCREEN-010" title="AI Provider Settings" description="Configure provider health and manual fallback routing." />
      <section className="panel" data-state="manual_fallback">
        <h2>Manual fallback active</h2>
        <p className="muted">Provider credentials are optional and remain workspace-scoped.</p>
        <div className="actions">
          <button type="button" data-element={blueprintActions.addProvider.elementId}>{blueprintActions.addProvider.label}</button>
          <button type="button" data-element={blueprintActions.healthCheck.elementId} data-action={blueprintActions.healthCheck.actionId}>{blueprintActions.healthCheck.label}</button>
        </div>
        <DataTable label="Provider list">
          <thead><tr><th>Provider</th><th>Status</th><th>Capability</th></tr></thead>
          <tbody>
            <tr><td data-label="Provider">manual</td><td data-label="Status">available</td><td data-label="Capability">review workflow</td></tr>
          </tbody>
        </DataTable>
        <FormField label="Capability route" wide>
          <select data-element="EL-AI-003">
            <option>Manual fallback</option>
            <option>Configured provider</option>
          </select>
        </FormField>
        <button type="button" data-element={blueprintActions.saveAi.elementId} data-action={blueprintActions.saveAi.actionId}>{blueprintActions.saveAi.label}</button>
      </section>
    </>
  );
}
