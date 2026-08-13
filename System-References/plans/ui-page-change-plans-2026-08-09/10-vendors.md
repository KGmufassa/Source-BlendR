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

- Add filters for vendor status and source coverage at minimum when supported by the data.
- Reset to page 1 when search, filters, or page size changes.
- Apply the approved vendor page-size behavior.
- Preserve `New Vendor` as the primary page action.

## Acceptance Criteria

- No demo-state tab group appears in the header.
- Each row has a visible `View Details` action linked to `/app/vendors/:vendorID`.
- Search and approved filters combine correctly and expose a clear reset path.
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
| Search and filters | Added search across name, website, and sources plus Status and Source Coverage filters. |
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
| `CHANGE-VEN-005` | Redesign the vendor search/filter area with a cleaner structure and stronger visual hierarchy. | Improves scanability while preserving search, Status, Source Coverage, page size, and pagination behavior. | [x] | [ ] | [ ] |
| `CHANGE-VEN-006` | Move `New Vendor` into the search/filter section. | Groups list-level actions in one place but requires the primary action to remain visually distinct from filters. | [x] | [ ] | [ ] |

### Search Table Toolbar Contract

- Vendors uses the shared `Search Table` family.
- Search is the dominant control; Status and Source Coverage form a compact secondary filter group.
- New Vendor sits within the same toolbar region but uses primary-action styling and must not look like a filter.
- Page size, result range, and pagination metadata remain visually secondary.
- The toolbar wraps into deliberate rows at narrower widths instead of scattering or clipping controls.

### Acceptance Criteria

- Search, filters, New Vendor, and page-size controls have aligned heights, predictable grouping, and clear visual priority.
- New Vendor remains a keyboard-accessible link to `/app/vendors/new`.
- Moving the action does not alter filtering, pagination, empty, no-results, error, or denied behavior.

### Implementation Status

- Status: `planned_not_implemented`
- No code changes were made for this revision.
