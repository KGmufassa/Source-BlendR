# Catalogs Page Change Plan

## Route

- `/app/catalog`

## Goal

- Change the route from an individual product-inventory table into a list of user-created catalogs containing custom product selections.

## Proposed Changes

- Apply all shared requirements in [`README.md`](README.md).
- Replace item-level rows with one row per catalog.
- Adopt the revised Discovery table's spacing, toolbar, pagination, responsive behavior, and labeled row-action pattern.
- Remove the visible `POPULATED`, `LOADING`, `EMPTY`, and `ERROR` demo-state control.
- Keep real loading, empty, failure, and no-search-results states inside the table region.
- Keep search, but change its scope to catalog name and category type, with additional catalog metadata only if useful.
- Keep `Create Catalog` as the primary action and route it to `/app/catalog/new`.
- Open a selected catalog at `/app/catalog/:catalogID`.

## Suggested Catalog Columns

- Catalog name.
- Category type.
- Item count.
- Created or last-updated date.
- Include or omit catalog status according to the approved status-column decision.
- A labeled `View Details` or approved equivalent action.

## Data and Migration Impact

- The current UI treats `/app/catalog` as an item inventory, so this change requires a catalog collection entity or equivalent grouping model.
- A catalog needs a stable ID, workspace ID, name, user-entered category type, item membership, timestamps, and any defined lifecycle state.
- Existing standalone items must not be deleted. Keep them available in Discovery and use the approved catalog-membership workflow.

## Open Decision Selection

- For each decision group, approve no more than one option.

| Decision group | Option | Clear action | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|---|
| `DEC-CAT-001` | A | Add items to catalogs from Discovery bulk selection only. | Keeps catalog creation source-driven but requires leaving Catalog Details to add members. | [ ] | [x] | [ ] |
| `DEC-CAT-001` | B | Add items through an `Add from Discovery` control on Catalog Details only. | Keeps membership management within a catalog but requires an item-picker interface. | [ ] | [x] | [ ] |
| `DEC-CAT-001` | C | Support both Discovery bulk selection and Catalog Details item picking. | Offers maximum flexibility but doubles membership entry points and validation paths. | [x] | [ ] | [ ] |
| `DEC-CAT-002` | A | Include a catalog Status column backed by a defined lifecycle state. | Enables lifecycle filtering but requires catalog-status data and transitions. | [x] | [ ] | [ ] |
| `DEC-CAT-002` | B | Omit catalog Status from the first release. | Simplifies the model and table but provides no lifecycle indicator. | [ ] | [x] | [ ] |

## Acceptance Criteria

- Every row represents a catalog rather than an individual product or service.
- Search and pagination operate on catalogs.
- The demo-state control is absent.
- Creating a catalog opens `/app/catalog/new`; opening a row uses that catalog's stable ID.
- Empty state explains how to create the first catalog and provides the creation action.
- Item records remain available for selection and are not silently migrated or discarded.

## Dead-Button Report

- Search, category filtering, Create Catalog, and pagination buttons have working client-side behavior or destinations in the current implementation.
- When fallback visual rows are used, both the product-name link and overflow action link back to `/app/catalog`, creating a self-loop instead of opening details.
- Row and select-all checkboxes are not connected to selection state or any bulk action, so they are functionally orphaned controls.
- `POPULATED`, `LOADING`, `EMPTY`, and `ERROR` are non-interactive prototype labels rather than buttons; they are already planned for removal.
- The `Workspace` breadcrumb ancestor is inert text and is covered by the shared linked-breadcrumb change.

## Proposed Dead-Button Fixes

- Remove fallback rows from the production interaction path. Render a real empty state when there are no catalogs.
- Build each catalog row action from that catalog's stable ID and route to `/app/catalog/:catalogID`.
- Add checkbox selection only if a defined catalog bulk action is implemented; otherwise remove selection controls from this list.
- Preserve search and pagination behavior while changing their data scope from products to catalog collections.

## Proposed Fix Selection

- Select Approve, Defer, or Discard for each proposed fix; do not select more than one choice in the same row.
- Leave all choices unchecked when a decision is still pending.

| ID | Proposed fix | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `FIX-CAT-001` | Remove production fallback rows and show a real empty state. | Eliminates sample content and exposes true workspace data availability. | [x] | [ ] | [ ] |
| `FIX-CAT-002` | Build each catalog row action from its stable catalog ID. | Requires the new catalog collection model and enables reliable details navigation. | [x] | [ ] | [ ] |
| `FIX-CAT-003` | Show selection checkboxes only when a catalog bulk action exists. | Reduces unused controls but postpones multi-catalog operations. | [x] | [ ] | [ ] |
| `FIX-CAT-004` | Preserve search and pagination while changing their scope to catalog collections. | Retains familiar behavior but requires collection-level queries and counts. | [x] | [ ] | [ ] |

## Completion Scope

- Completion date: `2026-08-10`
- Status: `implemented_awaiting_bulk_review`

### Completed

| Change | Record |
|---|---|
| Catalog persistence | Added workspace-scoped Catalog and CatalogMember models, migration, stable IDs, category type, lifecycle status, membership, and timestamps. |
| List information architecture | Every row now represents a real catalog collection with name, category type, item count, status, update date, and View Details. |
| Table behavior | Added catalog search, category filtering, real empty/no-results states, pagination, and responsive overflow using the Discovery baseline. |
| Prototype cleanup | Removed demo-state labels, fallback product rows, self-loop links, and orphaned selection checkboxes. |
| Membership entry points | Supports both Discovery bulk addition and Add from Discovery on Catalog Details under `DEC-CAT-001C`. |

### Deferred

- The single-entry membership alternatives `DEC-CAT-001A/B` remain deferred in favor of approved option C.
- Omitting lifecycle status remains deferred; the approved status column uses the initial `draft` state.

### Discarded

- None selected.

### Page Effects

| Pros | Cons or effects |
|---|---|
| Catalogs are now first-class collections rather than aliases for inventory items. | A database migration is required before the new routes can run against an existing database. |
| Stable details links and real empty states remove self-loops and sample-data ambiguity. | Supporting two membership entry points adds more validation and interaction paths. |

### Suggestions

- Define lifecycle transitions beyond the initial `draft` state and add status filtering when those transitions exist.
- Add catalog rename/archive behavior with audit history.
- Move list search and pagination server-side when catalog counts grow.

### Verification Record

- Prisma generation, focused page-plan test, TypeScript check, and production build passed.
- Migration `20260810000100_catalogs_workspace_settings` applied successfully; `/app/catalog` returned HTTP `200`. Interactive browser/visual QA remains pending because no browser backend was connected.

## Revision — 2026-08-12

### Revised Page Goal

- Provide the workspace entry point where users create and open custom catalogs.

### Page Edits

| ID | Approved change | Ramification | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `CHANGE-CAT-005` | Redesign the Catalogs search and filter area with a cleaner structure and stronger visual hierarchy. | Improves scanability without changing catalog query scope. | [x] | [ ] | [ ] |

### Search Table Toolbar Contract

- Catalogs uses the shared `Search Table` family.
- Search is the dominant control and continues to cover catalog name and category type.
- Category Type filtering is grouped beside Search using matching control heights and spacing.
- Create Catalog remains the primary page action and must be visually distinct from query controls.
- Result count and pagination metadata are not mixed into the primary search row unless the responsive layout requires it.
- Clear/no-results behavior remains explicit and keyboard accessible.

### Acceptance Criteria

- Search and Category Type appear as one coherent filter group with aligned labels, dimensions, spacing, and focus treatment.
- Create Catalog remains easy to locate without competing with the search input.
- The toolbar remains usable at supported responsive widths and does not clip its controls.

### Implementation Status

- Status: `planned_not_implemented`
- No code changes were made for this revision.
