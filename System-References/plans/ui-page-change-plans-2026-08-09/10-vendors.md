# Vendors Page Change Plan

## Route

- `/app/vendors`

## Goal

- Make vendors searchable and align their list with the revised Discovery table pattern.

## Proposed Changes

- Apply all shared requirements in [`README.md`](README.md).
- Change the Action-column link from `Open` to `View Details`.
- Remove the `Live`, `Loading`, `Empty`, `Error`, and `Denied` demo-state controls from the page header.
- Add search using the revised Discovery/Catalog search pattern.
- Search vendor name, website/domain, source coverage, and relevant contact fields when present.
- Convert the table to the revised Discovery baseline, including toolbar placement, consistent row density, labeled action, pagination, and responsive overflow.
- Retain real loading, empty, error, denied, no-results, active, onboarding, and inactive behavior where applicable; render these from actual state rather than demo switches.

## Filtering and Pagination

- Do not include the `All statuses` or `All sources` filter dropdowns in the vendor toolbar.
- Reset to page 1 when search or page size changes.
- Apply the approved vendor page-size behavior.
- Preserve `New Vendor` as the primary page action.

## Acceptance Criteria

- No demo-state tab group appears in the header.
- Each row has a visible `View Details` action linked to `/app/vendors/:vendorID`.
- Search does not include a separate `Reset filters` button.
- The result range, total count, and pagination are accurate.
- An authorization failure is presented as a real access state, not selectable demo content.
- Generic `System Status` footer content is absent under the shared removal requirement.

## Open Decision Selection

- Approve no more than one option in each decision group.

| Decision group | Option | Clear action | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|---|
| `DEC-VEN-001` | A | Add the same 20/50/100 page-size selector used by Discovery. | Creates consistent list controls but adds page-size state to Vendors. | [x] | [ ] | [ ] |
| `DEC-VEN-001` | B | Use a fixed 20 vendors per page. | Simplifies the toolbar but gives users no density control. | [ ] | [x] | [ ] |

## Dead-Button Report

- `Live`, `Loading`, `Empty`, `Error`, and `Denied` are dead demo-state buttons with no handlers.
- Footer items `Privacy Policy`, `Operations Log`, and `System Status` are anchors without `href` values and are dead navigation.
- When fallback vendor rows are displayed, `Open` routes to `/app/vendors/new` instead of details for the displayed vendor, so the action is misdirected.
- `New vendor` has a valid destination, and real database-backed vendor rows have valid vendor-detail routes.
- The `Workspace` breadcrumb ancestor is inert text and is covered by the shared linked-breadcrumb change.

## Proposed Dead-Button Fixes

- Remove the five demo-state buttons as already specified.
- Remove the generic footer under the shared status cleanup. Restore a footer link only when its real destination exists.
- Do not render fictional fallback vendors as actionable production rows. Use a real empty state when vendor data is absent.
- Build every `View Details` action from the displayed vendor's stable ID and never redirect a details action to the creation form.

## Proposed Fix Selection

- Select Approve, Defer, or Discard for each proposed fix; do not select more than one choice in the same row.
- Leave all choices unchecked when a decision is still pending.

| ID | Proposed fix | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `FIX-VEN-001` | Remove the five demo-state buttons. | Simplifies the header and requires real state to drive list feedback. | [x] | [ ] | [ ] |
| `FIX-VEN-002` | Remove the generic footer and restore each link only when its real destination exists. | Eliminates dead links but temporarily removes those footer entry points. | [x] | [ ] | [ ] |
| `FIX-VEN-003` | Replace fictional fallback vendors with a real empty state. | Removes sample content and exposes true workspace vendor availability. | [ ] | [x] | [ ] |
| `FIX-VEN-004` | Build every `View Details` action from the displayed vendor's stable ID. | Prevents misrouting and requires all actionable rows to represent real vendors. | [x] | [ ] | [ ] |

## Completion Scope

- Completion date: `2026-08-10`
- Status: `implemented_awaiting_bulk_review`

### Completed

| Change | Record |
|---|---|
| Header cleanup | Removed Live, Loading, Empty, Error, and Denied demo controls. |
| Search | Added search across name, website, and sources. |
| Table | Uses the Discovery-style toolbar, row density, labeled action, responsive overflow, real result range, pagination, and 20/50/100 page size. |
| Actions | Real vendors use `View Details` built from their stable vendor IDs. |
| Footer cleanup | Removed the generic version/status footer and dead anchors. |
| Real derived data | Source coverage and last import are derived from workspace-scoped import jobs. |

### Deferred

- `FIX-VEN-003`: fictional fallback vendors remain temporarily when the workspace has no real vendors. They are labeled Sample vendor and deliberately have no details action.
- A fully database-backed empty state remains deferred with that decision.

### Discarded

- None selected.

### Conflict Resolution

- Acceptance asks every row to have View Details, but `FIX-VEN-003` defers removing fallback vendors. Placeholder rows remain visible but non-interactive so `FIX-VEN-004` never creates a fake or misdirected details link.

### Page Effects

| Pros | Cons or effects |
|---|---|
| Real vendor navigation and filtering are accurate and keyboard operable. | Empty workspaces still display clearly labeled sample rows until the fallback decision changes. |
| Dead demo controls and footer anchors are gone. | Contact-field search is limited because contact fields are not yet stored. |

### Suggestions

- Approve `FIX-VEN-003` and replace sample rows with a create-first empty state.
- Add persisted contact fields so search can cover primary contact, email, and phone.
- Persist page size in URL state if vendor views need to be shareable.

### Verification Record

- Focused page-plan test passed; TypeScript check and production build passed.
- Migrated local runtime check passed with HTTP `200` on `/app/vendors`; interactive browser/visual QA remains pending because no browser backend was connected.

## Revision — 2026-08-12

### Revised Page Goal

- Let users create vendors, find existing vendors, and open vendor information for editing.

### Page Edits

| ID | Approved change | Ramification | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `CHANGE-VEN-005` | Redesign the vendor search area with a cleaner structure and stronger visual hierarchy. | Improves scanability while preserving search, page size, and pagination behavior. | [x] | [ ] | [ ] |
| `CHANGE-VEN-006` | Move `New Vendor` into the search section. | Groups list-level actions in one place but requires the primary action to remain visually distinct from search controls. | [x] | [ ] | [ ] |

### Search Table Toolbar Contract

- Vendors uses the shared `Search Table` family.
- Search is the dominant control; Status and Source Coverage filter dropdowns are not included.
- New Vendor sits within the same toolbar region but uses primary-action styling and must not look like a filter.
- Page size, result range, and pagination metadata remain visually secondary.
- The toolbar wraps into deliberate rows at narrower widths instead of scattering or clipping controls.

### Acceptance Criteria

- Search, New Vendor, and page-size controls have aligned heights, predictable grouping, and clear visual priority.
- New Vendor remains a keyboard-accessible link to `/app/vendors/new`.
- Moving the action does not alter filtering, pagination, empty, no-results, error, or denied behavior.

### Implementation Status

- Completion date: `2026-08-16`
- Approval date: `2026-08-16`
- Status: `implemented_approved`

### Revised Completion Scope

| Change | Completion record |
|---|---|
| Search hierarchy | Search is the dominant labeled control in the first toolbar row; the separate `Reset filters` button was removed at the user's direction. |
| Primary action | Moved the keyboard-accessible `New Vendor` link into the search toolbar while preserving distinct warm-orange primary styling. |
| Filter removal | Removed the `All statuses` and `All sources` toolbar filters at the user's direction. |
| Search Table | Preserved the Discovery-aligned table density, responsive overflow, result range, 20/50/100 page-size choices, and pagination controls. |
| Discovery page flow | Corrected the shared Vendors canvas from forced flex layout to the same block-flow layout used by Discovery, keeping the header, toolbar, table, and footer stacked at full content width. |
| Pagination placement | Moved the unlabeled visual page-size selector beside the result-range text and retained an accessible `Vendors per page` name. |
| Row actions | Real rows retain stable-ID `View Details` links; deferred sample rows remain clearly labeled and non-interactive. |
| State handling | Preserved real no-results behavior and added dedicated route loading and error/access views using linked breadcrumbs. |
| Cleanup | No demo-state controls, dead footer links, or generic System Status content are rendered. |

### Revised Deferred Scope

- `FIX-VEN-003` remains deferred: when no real vendors exist, the two clearly labeled sample rows remain visible without detail links.
- Contact-field search remains deferred until vendor contact information is persisted.
- URL-persisted search and page size remain deferred.
- Interactive browser and responsive visual QA remain pending because no connected browser backend is available.

### Revised Discarded Scope

- Discarded the prior header placement for `New Vendor`; the action now belongs to the approved toolbar.
- Discarded the previous single-row, evenly weighted control layout and removed the later Status/Source Coverage filter group.
- No approved decision option was discarded.

### Revised Conflict Resolution Record

- The acceptance criterion expects every production row to offer View Details, while deferred `FIX-VEN-003` keeps fictional fallback rows. Sample rows remain visibly marked and non-interactive so they cannot route to nonexistent records.
- Source Coverage remains visible in the table, but it is no longer available as a toolbar filter.

### Revised Page Effects

| Pros | Cons or resulting effects |
|---|---|
| The toolbar now has a clear Search-first hierarchy and keeps the creation action close to list controls. | The first toolbar row contains three controls and may wrap on narrower layouts. |
| Search, page size, result count, and pagination remain predictable across Discovery and Vendors. | Vendor search is client-side and does not place state in shareable URLs. |
| The page now follows Discovery's full-width vertical content flow instead of laying major sections side by side. | The fixed desktop minimum width still relies on horizontal overflow on smaller viewports. |
| Manual source coverage remains visible in the table. | Users can no longer narrow the list by status or source coverage from the toolbar. |
| Dedicated loading and failure views preserve the shared page shell. | Empty workspaces still show deferred sample rows rather than a create-first empty state. |

### Revised Suggestions

- Approve `FIX-VEN-003` in a future revision and replace sample rows with a create-first empty state.
- Add persisted contact name, email, and phone fields so vendor search can cover contact details.
- Move search and pagination to URL-backed server queries if vendor counts grow or views need to be shareable.

### Revised Verification Record

- All seven focused page-plan implementation tests pass.
- TypeScript validation and focused ESLint validation pass with no errors or warnings.
- A regression assertion verifies that the Vendors page canvas remains block-flow like Discovery rather than reverting to flex layout.
- The live local `/app/vendors` route returned HTTP `200` and rendered Search, New Vendor, Status, Source Coverage, and View Details.
- The rendered route did not include Live, Denied, or System Status demo content.
- Runtime validation was read-only; no vendor data was created or changed.

## Post-Review Bulk Revision — 2026-08-16

### Approved Added Scope

| Change | Completion record |
|---|---|
| Selection column | Added accessible row checkboxes and a Select visible vendors control before Vendor Name. Deferred sample rows are disabled and cannot enter a bulk request. |
| Bulk section | Added a dedicated Discovery-style Bulk actions section between the search toolbar and table containing only the selected count and `Delete selected`. |
| Confirmation | Delete selected requires confirmation that the action is permanent and that import-job vendor links will be cleared. |
| Persistence | Added a same-origin, workspace-scoped bulk DELETE operation that validates the complete selection and deletes it atomically. |
| Relationship protection | If any selected vendor is assigned to a catalog item, the entire deletion is rejected and no selected vendor is removed. Import jobs remain, with their vendor reference cleared by the database relationship contract. |
| Selection lifecycle | Search, page-size, and page changes clear the selection to avoid acting on hidden rows. |

### Added Deferred Scope

- Bulk editing names or websites is deferred because one shared value would rarely be valid across multiple vendors.
- Cross-page selection remains deferred; bulk deletion applies to explicitly selected visible records.

### Added Discarded Scope

- Discarded all bulk status choices and the Apply changes action at the user's direction; Delete selected is the only bulk operation.
- Discarded selectable sample rows because they do not represent persisted vendor records.

### Added Effects

| Pros | Cons or resulting effects |
|---|---|
| Users can permanently remove multiple unreferenced vendors in one atomic operation. | Deletion cannot be undone. |
| Invalid, cross-workspace, or catalog-item-linked selections change nothing and return actionable feedback. | A single protected vendor blocks deletion of the complete selection. |
| Import-job history is preserved when its vendor is deleted. | The historical job loses its direct vendor-record relationship. |
| The bulk section now matches Discovery's selection-and-action hierarchy. | Table width increases slightly because of the selection column. |

### Added Suggestions

- Replace browser-native confirmation with an accessible review dialog listing every vendor that will be deleted.
- Add server-backed selection across pages if users need to update more than the currently visible page.
- Consider preserving a vendor-name snapshot on import jobs before deletion so historical job attribution remains readable.

### Added Verification Record

- Focused implementation tests verify the selection controls, delete-only bulk section, atomic API transaction, invalid-selection guard, and catalog-item reference protection.
- TypeScript validation and focused ESLint validation pass.
- The live route returned HTTP `200`, rendered Delete selected, and did not render bulk Status or Apply changes controls.
- The live route did not render the `All statuses` or `All sources` toolbar filters; Status and Source Coverage remain as table columns only.
- The live route did not render the `Reset filters` button.
- Runtime validation was read-only; no vendor was deleted.
