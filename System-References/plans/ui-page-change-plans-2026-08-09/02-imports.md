# Imports Page Change Plan

## Route

- `/app/imports`

## Goal

- Make recent import jobs easier to understand and open.

## Proposed Changes

- Apply all shared requirements in [`README.md`](README.md).
- Remove the page-header `System status: Operational` line.
- Replace the icon-only control in each Recent Jobs Action cell with a text link labeled `Job Details`.
- Route `Job Details` to `/app/imports/jobs/:importID` for the selected row.
- Preserve the Website Import and PDF Catalog entry points.

## Interaction Requirements

- The full `Job Details` label must remain visible at supported desktop widths.
- Each action must expose the job context to assistive technology, for example `Job Details for IMP-8924`.
- The control must not use an icon as its only accessible or visual label.
- Rows without a valid job ID must show a disabled or unavailable state rather than linking to a placeholder job.

## Acceptance Criteria

- Every real recent-job row has a visible `Job Details` action.
- Selecting the action opens the matching job-details route.
- The action is reachable and activatable by keyboard.
- Generic system status is absent while each import job's task-specific status remains visible.

## Dead-Button Report

- `View All Logs` is dead: it has no click handler or destination.
- `Retry` on the failed visual row is dead: it has no handler and does not call the import-job retry API.
- The icon-only row action can be misdirected: when no real job exists at the matching visual-row index, it routes to the generic jobs list rather than details for the displayed job.
- Website Import and PDF Catalog cards have valid destinations and are not dead.

## Proposed Dead-Button Fixes

- Resolve the `View All Logs` action using one option in decision group `FIX-IMP-001`.
- Connect `Retry` to the existing job mutation behavior used on Job Details, show pending/error/success feedback, and display it only for a real retryable job.
- Stop pairing hard-coded visual rows with database jobs by array index. Render real job rows and route each `Job Details` action using that row's stable job ID.
- Resolve unavailable row actions using one option in decision group `FIX-IMP-004`.

## Proposed Fix Selection

- Select Approve, Defer, or Discard for each proposed fix; do not select more than one choice in the same row.
- Leave all choices unchecked when a decision is still pending.
- Rows sharing an ID before the final letter are alternatives; approve no more than one option in that group.
- `FIX-IMP-001` and `FIX-IMP-004` were previously approved as combined actions and require reapproval after being separated.

| ID | Proposed fix | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `FIX-IMP-001A` | Link `View All Logs` to `/app/imports/jobs`. | Provides direct access to complete job history. | [ ] | [ ] | [ ] |
| `FIX-IMP-001B` | Remove `View All Logs` from the Recent Jobs header. | Simplifies the header but removes the shortcut to complete job history. | [ ] | [ ] | [ ] |
| `FIX-IMP-002` | Connect `Retry` to the existing job mutation behavior and show it only for real retryable jobs. | Enables recovery but adds mutation, pending, and error-state handling to the list. | [ ] | [ ] | [x] |
| `FIX-IMP-003` | Render real job rows and route `Job Details` using each row's stable job ID. | Removes prototype rows and makes displayed data dependent on live job records. | [x] | [ ] | [ ] |
| `FIX-IMP-004A` | Hide a row action when no matching job exists. | Removes unusable actions but makes action-column availability vary by row. | [ ] | [ ] | [ ] |
| `FIX-IMP-004B` | Show a disabled row action with an unavailable explanation when no matching job exists. | Keeps table alignment and explains the limitation but adds disabled-state messaging. | [ ] | [ ] | [ ] |

## Completion Scope

- Completion date: `2026-08-10`
- Status: `implemented_awaiting_bulk_review`

### Completed

| Change | Record |
|---|---|
| Recent Jobs data | Replaced index-paired prototype rows with the five most recently updated workspace jobs and their real vendor, source, status, error, and timestamp data. |
| Job action | Added a visible, keyboard-accessible `Job Details` link built from each job's stable ID and an accessible label containing the job ID. |
| Empty state | Added a real no-jobs table state without placeholder job links. |
| Shared changes | Removed generic system status and linked the Workspace breadcrumb. |

### Deferred

- `View All Logs` remains undecided between `FIX-IMP-001A` and `FIX-IMP-001B`; the dead button is omitted until one branch is approved.
- Unavailable-row behavior in `FIX-IMP-004A/B` is not needed for real rows and remains undecided.

### Discarded

- `FIX-IMP-002`: list-level Retry was not implemented. Recovery remains on Job Details.

### Conflict Resolution

- The plan left the dead `View All Logs` branch unresolved. It was removed from the interactive header so the page would not ship a dead control, without claiming either destination option as approved.

### Page Effects

| Pros | Cons or effects |
|---|---|
| Every displayed job and action now represents real workspace data. | The list no longer presents illustrative progress percentages that are not stored by the job model. |
| Actions cannot misroute to a generic list or unrelated job. | Complete job history has no header shortcut until `FIX-IMP-001` is decided. |

### Suggestions

- Approve `FIX-IMP-001A` if full job history should remain one click from Recent Jobs.
- Add persisted item-count progress events before restoring percentage progress bars.

### Verification Record

- Focused page-plan test passed; TypeScript check and production build passed.
- Migrated local runtime check passed with HTTP `200` on `/app/imports`; interactive browser/visual QA remains pending because no browser backend was connected.

## Revision — 2026-08-12

### Page Edits

| ID | Approved change | Ramification | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `CHANGE-IMP-005` | Add a `View All Jobs` button below the Recent Jobs table, aligned to the bottom right, linking to `/app/imports/jobs`. | Restores direct access to complete job history without crowding the compact table header. | [x] | [ ] | [ ] |

### Revised Table and Breadcrumb Contract

- Recent Jobs uses the shared `View Table` format because it is a bounded operational summary.
- `View All Jobs` must be visually separate from row-level `Job Details` actions and remain reachable by keyboard.
- A `Job Details` navigation from this table must provide entry-path context so the destination breadcrumb reads `Workspace > Imports > Job Details`.
- A direct visit to Job Details may use its canonical hierarchy as defined by the shared breadcrumb fallback.

### Conflict Update

- `CHANGE-IMP-005` resolves the earlier undecided `FIX-IMP-001` outcome with a third placement: restore access to `/app/imports/jobs` below the table rather than as the former `View All Logs` header control.
- The old `View All Logs` label remains retired; the new label is `View All Jobs`.

### Revised Acceptance Criteria

- The button appears below and to the right of Recent Jobs and routes to `/app/imports/jobs`.
- The button has a visible focus state and does not appear inside the table's Action column.
- Job Details opened from Recent Jobs displays the entry-path breadcrumb specified above.

### Implementation Status

- Status: `implemented_approved`
- Approval date: `2026-08-14`

## Revision Completion Record — 2026-08-14

### Completed

| Approved change | Completion record |
|---|---|
| `CHANGE-IMP-005` | Added a keyboard-accessible `View All Jobs` link below the Recent Jobs table, aligned to the bottom right, routing to `/app/imports/jobs`. |
| Entry-path breadcrumb | Recent Jobs now adds the allowlisted `entry=imports` marker to each Job Details link. Job Details validates that exact marker and displays `Workspace > Imports > Job Details`; direct visits retain the canonical `Workspace > Imports > Jobs > Job Details` hierarchy. |
| Focus and placement | Implemented the link as a visually distinct secondary action outside the table and Action column, preserving the View Table structure. |

### Deferred

- The separate `/app/imports/jobs` revision remains deferred to its own page implementation and approval cycle.
- Other Job Details layout and workflow revisions remain deferred to the Job Details page cycle.

### Discarded

- The retired `View All Logs` header control remains discarded; it was not restored or renamed in the table header.
- No unapproved `FIX-IMP-001A/B` or `FIX-IMP-004A/B` branch was implemented.

### Conflict Resolution

- The new `View All Jobs` placement supersedes the unresolved `View All Logs` alternatives without reviving the dead header control.
- The entry-path requirement affects the Job Details destination. That edit was limited to validating one allowlisted marker and choosing the matching breadcrumb; no other Job Details change was pulled forward.

### Page Effects

| Pros | Cons or possible effects |
|---|---|
| Complete import history is reachable directly from Recent Jobs. | Adds one secondary action below the compact table. |
| Job Details breadcrumbs now match navigation from Imports. | The entry context is represented in the URL query string. |
| Direct and refreshed detail URLs retain a stable canonical fallback. | Future entry paths require an explicit allowlisted mapping. |

### Suggestions

- Preserve the `entry` marker when Job Details links are added to other approved in-app entry points.
- Consider centralizing allowlisted breadcrumb entry paths if more dynamic destinations adopt this pattern.

### Verification Record

- Focused page-plan tests and web TypeScript validation passed.
- Local runtime checks returned HTTP `200` for Imports, Import Jobs, entry-marked Job Details, and directly opened Job Details.
- Rendered HTML confirmed the `View All Jobs` action, the entry-aware `Workspace > Imports > Job Details` breadcrumb, and the canonical direct-entry `Workspace > Imports > Jobs > Job Details` fallback.
- Interactive browser and visual QA remain pending because no browser backend was connected to this session.
