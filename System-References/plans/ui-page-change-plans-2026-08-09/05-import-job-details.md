# Import Job Details Page Change Plan

## Route

- `/app/imports/jobs/:importID`

## Goal

- Make category review flexible and align the page shell with the rest of the workspace.

## Proposed Changes

- Apply all shared requirements in [`README.md`](README.md).
- Replace any page-specific sidebar variation with the uniform shared sidebar template.
- In Discovered Categories, add a two-option view toggle for `Collections` and `Category Tree`.
- Use the category tree data removed from the Website Import page.
- Allow scrape-eligible category selection in either view.
- Keep the same underlying selection state when switching views.

## Category Selection Behavior

- `Collections` presents the established flat category-selection experience currently  in place.
- `Category Tree` presents parent and child relationships using expandable nodes.
- Selecting or clearing a category in one view immediately updates its state in the other view.
- Parent selection behavior must be explicit: select all eligible descendants, show partial selection, and never select ineligible descendants.
- Ineligible categories remain visible when useful for context but cannot be selected and include an explanation.
- Expansion state may be view-local, but selected categories must persist across refreshes when saved to the job.
- The toggle must be a labeled, keyboard-operable single-choice control with a clear active state.

## Acceptance Criteria

- The page sidebar matches the shared shell in structure, icons, labels, spacing, and active state.
- Both Collections and Category Tree views show the same discovered-category dataset.
- Switching views never clears or duplicates selections.
- The selected-category summary and downstream scrape submission match the current selection.
- Empty, detecting, failed, and completed category-discovery states appear in the category section.
- Non-website jobs do not show a meaningless category view toggle.

## Dead-Button Report

- No dead task buttons were found in the current source trace.
- `Retry failed work` and `Cancel job` call the job mutation API and are deliberately disabled when the job status does not permit the action.
- `Open Discovery Session` has a real session-specific destination and is conditionally rendered only when a session exists.
- `Scrape selected` loads category data, tracks selection, and posts selected category URLs; it is deliberately disabled until a selection exists.
- The `Workspace` breadcrumb ancestor is inert text and is covered by the shared linked-breadcrumb change.

## Proposed Dead-Button Fixes

- Preserve the existing API-backed retry, cancel, discovery, and scrape behavior while restyling the page.
- Add the Collections/Category Tree toggle only after both views share the same selection state; do not ship a visual-only toggle.
- Resolve the post-category-job outcome using one option in decision group `FIX-JOB-003`.

## Proposed Fix Selection

- Select Approve, Defer, or Discard for each proposed fix; do not select more than one choice in the same row.
- Leave all choices unchecked when a decision is still pending.
- Rows sharing an ID before the final letter are alternatives; approve no more than one option in that group.
- `FIX-JOB-003` was previously approved as a combined action and requires reapproval after being separated.

| ID | Proposed fix | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `FIX-JOB-001` | Preserve existing API-backed retry, cancel, discovery, and scrape behavior during the restyle. | Limits visual refactoring where it could disrupt working job operations. | [x] | [ ] | [ ] |
| `FIX-JOB-002` | Add Collections and Category Tree views backed by one shared selection state. | Adds view-state complexity but prevents selection loss and inconsistent submissions. | [x] | [ ] | [ ] |
| `FIX-JOB-003A` | Show direct links to the queued child jobs after category-job creation. | Makes each new job immediately accessible but requires child-job response data and UI. | [x] | [ ] | [ ] |
| `FIX-JOB-003B` | Refresh the current job's events and category state after category-job creation. | Keeps the user on one page but does not provide immediate child-job navigation. | [ ] | [x] | [ ] |

## Completion Scope

- Completion date: `2026-08-10`
- Status: `implemented_awaiting_bulk_review`

### Completed

| Change | Record |
|---|---|
| Uniform shell | The dynamic route uses the shared sidebar icons, labels, spacing, and active Imports state. |
| View toggle | Added keyboard-operable Collections and Category Tree controls backed by one selected-URL state. |
| Tree behavior | Added expandable grouped branches, parent select/clear, partial state, and eligible-child-only selection. |
| Submission | Preserved API-backed retry, cancel, discovery, and scrape operations. |
| Child jobs | After scrape submission, direct links are rendered for each returned child job under `FIX-JOB-003A`. |
| Breadcrumbs | Workspace, Imports, and Jobs ancestors are links. |

### Deferred

- `FIX-JOB-003B`: automatic event/category refresh after creating child jobs remains deferred.
- Persisting unsaved category selection across a full page refresh remains dependent on a saved-selection data contract.

### Discarded

- None selected.

### Page Effects

| Pros | Cons or effects |
|---|---|
| Users can switch views without losing selection and can reach every child job directly. | Grouping is inferred from detected URL paths because no explicit category-parent schema exists. |
| Parent selection communicates full and partial states. | Expansion state and unsaved selection remain local to the browser session. |

### Suggestions

- Persist category hierarchy and selection explicitly on the parent job rather than inferring hierarchy from URLs.
- Add polling for detecting and processing states so users need not refresh manually.

### Verification Record

- Focused page-plan test passed; TypeScript check and production build passed.
- Migrated local runtime check passed with HTTP `200` for real `/app/imports/jobs/:importID` and jobs-list routes; interactive browser/visual QA remains pending because no browser backend was connected.

## Revision — 2026-08-12

### Revised Page Goal

- Show the results of the initial source analysis and let users intentionally narrow and categorize what should be scraped next.

### Page Edits

| ID | Approved change | Ramification | Approve | Defer | Discard |
|---|---|---|---|---|---|---|
| `CHANGE-JOB-004` | Convert Event Log into an accessible collapsible section. | Reduces page length while keeping diagnostic history available on demand. | [x] | [ ] | [ ] |
| `CHANGE-JOB-005` | Restyle Category Tree to match the referenced image. | Requires the missing reference image before spacing, hierarchy, connectors, and node styling can be specified accurately. | [x] | [ ] | [ ] |
| `CHANGE-JOB-006` | Remove controls labeled `Import Selected`, `Ignore Selected`, and `Archive Selected` from this page. | Focuses the page on scrape intent and category assignment rather than Discovery lifecycle mutations. | [x] | [ ] | [ ] |
| `CHANGE-JOB-007` | Remove the candidate-table Select and Status columns and remove the Status filter. | Simplifies review but removes row selection as the basis for other bulk operations. | [x] | [ ] | [ ] |
| `CHANGE-JOB-008` | Add Category and Image columns before or alongside Product Name; render an image thumbnail when available. | Improves recognition and organization but requires a defined candidate dataset and image fallback. | [x] | [ ] | [ ] |
| `CHANGE-JOB-009` | Add bulk category editing for analyzed products and services. | Requires a new multi-row selection mechanism or an explicit apply-to scope despite removal of the Select column. | [x] | [ ] | [ ] |

### Event Log Behavior

- Use a semantic disclosure control with a visible Event Log label, event count, keyboard support, and expanded/collapsed state.
- Default state requires product confirmation; errors should remain discoverable even when collapsed.
- Collapsing must not discard events or job state.

### Candidate Review Table

- Use the shared `Search Table` family because users review, search, and bulk-edit analyzed products.
- Proposed columns are Image, Product or Service, SKU/reference when available, Vendor, Category, Price when applicable, and Action.
- Product images use a consistent thumbnail size and an accessible missing-image fallback.
- The exact named controls in `CHANGE-JOB-006` are removed; this does not remove `Scrape selected` from the category-selection workflow unless separately approved.

### Open Decision Selection

| Decision group | Option | Clear action | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|---|
| `DEC-JOB-004` | A | Use temporary row checkboxes only while Bulk Edit Category mode is open. | Satisfies bulk targeting without a permanent Select column but adds a mode-specific table state. | [ ] | [ ] | [ ] |
| `DEC-JOB-004` | B | Apply bulk category edits to every row in the current filtered result. | Avoids checkboxes but increases the risk of broad unintended edits and requires confirmation. | [ ] | [ ] | [ ] |
| `DEC-JOB-005` | A | Collapse Event Log by default except when the job has an error. | Keeps successful jobs concise while surfacing failures. | [ ] | [ ] | [ ] |
| `DEC-JOB-005` | B | Expand Event Log by default for every job. | Maximizes visibility but provides less reduction in page length. | [ ] | [ ] | [ ] |

### Conflicts and Dependencies

- Bulk category editing conflicts with permanent removal of row selection unless `DEC-JOB-004` defines another target scope.
- The requested product-level table is distinct from the existing Discovered Categories selector. Its source dataset, persistence route, and relationship to the later Discovery page must be defined during implementation planning.
- The Category Tree visual reference was written as `place image`, but no image was attached. Visual matching is blocked until that reference is supplied.

### Revised Acceptance Criteria

- Event Log is keyboard-operable and retains all job events when collapsed.
- The category tree matches the supplied reference after that asset is available.
- The removed buttons, Select column, Status column, and Status filter are absent from the intended candidate table.
- Image and Category columns use real job-analysis data.
- Bulk category edits persist to the explicitly approved scope and report partial or complete failure.
- Breadcrumbs reflect whether Job Details was entered from Recent Jobs or All Jobs, with canonical fallback for direct visits.

### Implementation Status

- Status: `planned_not_implemented`
- Blocked decisions: `DEC-JOB-004`, `DEC-JOB-005`, candidate-table data contract, and the missing Category Tree image reference.
- No code changes were made for this revision.
