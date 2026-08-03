import { blueprintActions } from "../../../workspace-routes";
import { AccessibleDrawer, BulkActionToolbar, DataTable, PageHeader, SearchFilterBar, StatusBadge } from "../../page-actions";
import { candidates } from "../../ui-fixtures";

export default async function DiscoverySessionPage({ params }: Readonly<{ params: Promise<{ sessionId: string }> }>) {
  const { sessionId } = await params;

  return (
    <>
      <PageHeader eyebrow="UI-BLUEPRINT-SCREEN-006" title={`Discovery Session ${sessionId}`} description="Search, filter, preview, and safely bulk-process imported candidates." />
      <section className="panel">
        <SearchFilterBar>
          <label>Search candidates
            <input type="search" data-element={blueprintActions.searchCandidates.elementId} data-action={blueprintActions.searchCandidates.actionId} />
          </label>
          <label>Status filter
            <select data-element={blueprintActions.filterCandidates.elementId} data-action={blueprintActions.filterCandidates.actionId}>
              <option>all</option>
              <option>ready</option>
              <option>conflict</option>
              <option>ignored</option>
            </select>
          </label>
        </SearchFilterBar>
        <DataTable label="Candidate table">
          <thead><tr><th>Select</th><th>Name</th><th>SKU</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td data-label="Select"><input type="checkbox" data-element={blueprintActions.selectCandidate.elementId} aria-label={`Select ${candidate.name}`} /></td>
                <td data-label="Name">{candidate.name}</td>
                <td data-label="SKU">{candidate.sku}</td>
                <td data-label="Status"><StatusBadge>{candidate.status}</StatusBadge></td>
                <td data-label="Action"><button type="button" data-element={blueprintActions.previewCandidate.elementId} data-action={blueprintActions.previewCandidate.actionId}>{blueprintActions.previewCandidate.label}</button></td>
              </tr>
            ))}
          </tbody>
        </DataTable>
        <BulkActionToolbar>
          <button type="button" data-element={blueprintActions.importSelected.elementId} data-action={blueprintActions.importSelected.actionId}>{blueprintActions.importSelected.label}</button>
          <button type="button" data-element={blueprintActions.ignoreSelected.elementId} data-action={blueprintActions.ignoreSelected.actionId}>{blueprintActions.ignoreSelected.label}</button>
          <button className="danger-button" type="button" data-element={blueprintActions.archiveSelected.elementId} data-action={blueprintActions.archiveSelected.actionId}>{blueprintActions.archiveSelected.label}</button>
        </BulkActionToolbar>
      </section>
      <AccessibleDrawer title="Candidate preview">
        <p className="muted">Preview and edit imported fields before promotion. Use save or cancel before leaving this review gate.</p>
        <button type="button">Close preview</button>
      </AccessibleDrawer>
    </>
  );
}
