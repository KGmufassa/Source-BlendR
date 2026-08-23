# Import Jobs Page Change Plan

## Route

- `/app/imports/jobs`

## Revision Date

- `2026-08-12`

## Page Goal

- Present a complete, workspace-scoped history of import jobs that have taken place.

## Shared Requirements

- Apply every shared shell, sidebar-icon, system-status, linked-breadcrumb, focus, data-state, table-family, and entry-path requirement in [`README.md`](README.md) to populated, empty, loading, and error/access-failure renders.
- Use the Imports shared-shell treatment so this route has the same sidebar dimensions, outline icon mapping, active Imports state, warm-orange accent, and content canvas as `/app/imports`.
- Render only the route-specific linked breadcrumb in the page header; do not duplicate it with the shell's generic topbar breadcrumb.
- Keep task-specific import statuses because they are operational job data, not generic system-status UI.

## Page Edits

| ID | Approved change | Ramification |  Approve | Defer | Discard |
|---|---|---|---|---|---|
| `CHANGE-JOBS-001` | Convert the table to the shared `View Table` format used by `/app/imports`. | Creates visual continuity with Recent Jobs while retaining a complete history view. | [x] | [ ] | [ ] |
| `CHANGE-JOBS-002` | Add a `Vendor` column immediately before `Source`. | Improves source ownership visibility and requires an `Unassigned` state for jobs without a vendor. | [x] | [ ] | [ ] |
| `CHANGE-JOBS-003` | Paginate the table at 10 jobs per page. | Keeps rows scannable but requires accurate totals, range text, and page controls. | [x] | [ ] | [ ] |
| `CHANGE-JOBS-004` | Remove the Events column. | Simplifies the history table; event detail remains available on Job Details. | [x] | [ ] | [ ] |

## Table Contract

- Use the shared `View Table` family rather than the Discovery Search Table family.
- Recommended columns are Job ID, Vendor, Source, Status, Created or Started, Updated or Completed, and Action.
- Every actionable row uses a visible `Job Details` link built from the stable job ID.
- Missing vendor association displays `Unassigned`; it must not fabricate a vendor.
- Pagination shows 10 jobs per page, the visible range, total result count, current page, and working Previous/Next controls.
- Empty, loading, error, and permission-denied states render inside the table card.

## Breadcrumb Contract

- Navigation from `/app/imports` through `View All Jobs` displays `Workspace > Imports > Jobs`.
- Selecting Job Details from this page provides entry-path context for `Workspace > Imports > Jobs > Job Details`.
- Direct visits use the canonical breadcrumb hierarchy.

## Acceptance Criteria

- The table visually follows `/app/imports` while displaying complete job history.
- Vendor appears before Source in every populated render path.
- No Events column appears.
- No more than 10 rows appear on one page and pagination remains accurate after data changes.
- Each Job Details action resolves the correct workspace-scoped job.

## Possible Effects

| Pros | Cons or possible effects |
|---|---|
| The history page is consistent with the Recent Jobs summary and easier to scan. | A fixed 10-row page may require more navigation in high-volume workspaces. |
| Vendor association is visible without opening each job. | Older or unassigned jobs require a neutral missing-vendor state. |

## Suggestions

- Add search or filters only if job volume makes pagination alone insufficient; doing so would move this route toward the Search Table family and should be a separate decision.
- Preserve task-specific status and error information even though Events is removed.

## Implementation Status

- Status: `implemented_approved`
- Approval date: `2026-08-15`

## Completion Scope — 2026-08-15

### Completed

| Approved change | Completion record |
|---|---|
| `CHANGE-JOBS-001` | Reworked the complete history table as a compact View Table consistent with Recent Jobs, with a card header, concise columns, visible text actions, responsive overflow, and an in-card empty state. |
| `CHANGE-JOBS-002` | Added Vendor immediately before Source using the workspace-scoped job relation and displays `Unassigned` when no vendor is associated. |
| `CHANGE-JOBS-003` | Added server-backed pagination at 10 rows per page, clamped invalid or out-of-range requests, and added range, total, current-page, Previous, and Next output. |
| `CHANGE-JOBS-004` | Removed the Events column while retaining task-specific job status. |
| Job actions | Every populated row now exposes a visible `Job Details` link built from the stable job ID. |
| Entry-path breadcrumb | Job Details links carry the allowlisted `entry=jobs` marker for `Workspace > Imports > Jobs > Job Details`; direct visits retain the same canonical hierarchy. |
| History metrics | Preserved the existing status summary cards and changed their counts to workspace-wide grouped totals rather than counts from only the visible page. |
| Data states | Added route-level loading and recoverable error/access-failure presentations inside the same View Table card; the existing empty state remains in-card. |
| Shared shell | Added Import Jobs to the shared Imports canvas classification, preserving the reference SVG sidebar icons and active Imports treatment while removing the duplicate generic topbar breadcrumb. |
| Shared data paths | Loading and error/access-failure states use the same page class, shell treatment, linked ancestors, current-page semantics, and table-card presentation as the populated route. |

### Deferred

- Search and filtering remain deferred as suggested because the approved page stays within the View Table family.
- Page-size selection remains deferred; the approved page size is fixed at 10.

### Discarded

- The Events column was discarded from the history table under `CHANGE-JOBS-004`; event details remain on Job Details.
- The former 100-job client-sized fetch was discarded in favor of accurate server pagination.

### Conflict Resolution

- Preserving the existing status cards while paginating the table would have made their counts page-local and misleading. They now use a separate workspace-wide grouped count, while the table query retrieves only its 10 visible rows.
- The plan calls this a complete history view and a View Table. Completeness is provided through pagination without adding search controls that would change its table family.
- Applying the generic shell and the page-owned breadcrumb simultaneously produced duplicate route labels. Import Jobs now uses the same full-canvas shell branch as Imports, leaving one authoritative page breadcrumb.

### Page Effects

| Pros | Cons or possible effects |
|---|---|
| Vendor ownership and job timing are visible without opening each record. | Seven columns require horizontal overflow at narrower widths. |
| Server pagination limits each table query to 10 rows. | Reviewing large histories requires paging. |
| Summary counts remain accurate across the full workspace history. | The page performs aggregate queries in addition to the paginated row query. |
| Stable text actions and entry context improve navigation clarity. | The entry marker appears in the Job Details URL. |
| The shared Imports shell creates consistent icons, active state, and spacing across data states. | Full-canvas classification intentionally hides the shell's generic topbar on this route. |

### Suggestions

- Add a date or status filter only if paging alone becomes insufficient; document that as a move toward the Search Table family.
- Consider cursor pagination if concurrent high-volume imports make offset pagination inconsistent.
- Add a compact error-code indicator for failed jobs if users need failure triage without opening Job Details.

### Verification Record

- Focused page-plan tests, web TypeScript validation, changed-application-file lint, and diff checks passed.
- Local runtime checks returned HTTP `200` for the first page, an out-of-range page request, and Job Details with the Jobs entry marker.
- Rendered output confirmed the approved column order, absence of Events, accurate range text, page clamping, nine current rows with nine stable Job Details actions, and the 10-row maximum.
- Rendered Job Details output confirmed `Workspace > Imports > Jobs > Job Details` for the allowlisted Jobs entry path.
- Rendered Import Jobs output confirmed the shared Imports shell, six reference-mapped SVG sidebar icons, active Imports route, linked page breadcrumb, removal of the generic shell breadcrumb, and absence of generic system-status text.
- Streaming output contains the loading-state breadcrumb before the populated breadcrumb replaces it; both states use the same linked ancestors and current-page semantics rather than displaying simultaneous shell and page breadcrumbs.
- Interactive pagination and visual QA remain pending because no browser backend is connected to this session.
