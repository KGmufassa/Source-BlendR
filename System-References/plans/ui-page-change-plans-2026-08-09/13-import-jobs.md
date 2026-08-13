# Import Jobs Page Change Plan

## Route

- `/app/imports/jobs`

## Revision Date

- `2026-08-12`

## Page Goal

- Present a complete, workspace-scoped history of import jobs that have taken place.

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

- Status: `planned_not_implemented`
- No code changes were made for this plan.
