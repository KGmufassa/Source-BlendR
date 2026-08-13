# Catalog Details Page Change Plan

## Route

- `/app/catalog/:catalogID`

## Goal

- Present one catalog and its selected products or services using the same table conventions as Discovery.

## Proposed Changes

- Apply all shared requirements in [`README.md`](README.md).
- Resolve `:catalogID` as a catalog collection ID, not an individual item ID.
- Show catalog-level name and category type in the page header or summary region.
- Present catalog members in a table matching the revised Discovery baseline.
- Include search, relevant filters, accurate result counts, and pagination when the catalog can contain more than one page.
- Provide clear actions to edit an item, remove an item from this catalog, and add items from Discovery.
- Removing an item from a catalog must not delete the underlying discovered product or service.

## Suggested Member Columns

- Selection control when bulk actions are supported.
- Image.
- Product or service name.
- SKU/reference.
- Vendor.
- Category.
- Price when applicable.
- Status when meaningful.
- Labeled action.

## Acceptance Criteria

- The route loads the matching catalog and rejects a missing or cross-workspace ID safely.
- The table visually and behaviorally matches the revised Discovery format.
- Catalog metadata is clearly separated from member-level data.
- Search, filters, result count, and pagination operate only within the current catalog.
- Adding or removing membership updates item count and does not duplicate or delete source records.
- Breadcrumbs link back to `/app/catalog`.

## Dead-Button Report

- No dead task buttons were found in the current item-detail source trace.
- `Create Catalog` and `Back to catalog` have valid destinations.
- The current `Catalog` breadcrumb ancestor is inert text and is covered by the shared linked-breadcrumb change.
- The page labels the profile `editable` but exposes no edit action. This is a misleading affordance rather than a dead button.

## Proposed Dead-Button Fixes

- Remove the `editable` badge from the first release.
- Ensure every planned add, edit, remove, search, filter, and pagination control is backed by catalog-scoped state or an API operation before it is displayed.
- Require confirmation for remove-from-catalog, then update membership without deleting the underlying Discovery record.

## Proposed Fix Selection

- Select Approve, Defer, or Discard for each proposed fix; do not select more than one choice in the same row.
- Leave all choices unchecked when a decision is still pending.

| ID | Proposed fix | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `FIX-CATD-001` | Remove the `editable` badge from the first release. | Removes a misleading promise but makes the page explicitly read-only until edit actions ship. | [ ] | [x] | [ ] |
| `FIX-CATD-002` | Display only controls backed by catalog-scoped state or APIs. | Prevents dead UI but may reduce the first-release action set. | [x] | [ ] | [ ] |
| `FIX-CATD-003` | Confirm removal from a catalog and preserve the underlying Discovery record. | Adds a confirmation step and protects source data from accidental deletion. | [x] | [ ] | [ ] |

## Completion Scope

- Completion date: `2026-08-10`
- Status: `implemented_awaiting_bulk_review`

### Completed

| Change | Record |
|---|---|
| Route identity | The dynamic ID now resolves a workspace-scoped catalog collection and fails safely when missing. |
| Catalog summary | Displays catalog name, category type, status, and member count separately from member rows. |
| Member table | Added image, name, SKU, vendor, category, price, status, labeled actions, search, vendor filtering, counts, pagination, and overflow behavior. |
| Membership | Add from Discovery uses a real candidate picker and API; Remove requires confirmation and deletes only membership. |
| Editing | Edit opens the matching record in the Discovery drawer through a stable item query. |
| Breadcrumbs | Workspace and Catalog ancestors are working links. |

### Deferred

- The prior `editable`-badge decision remains deferred; the obsolete item-profile page was replaced and the new catalog page does not make that unsupported promise.
- Bulk member actions and more advanced filters remain deferred until a defined operation needs them.

### Discarded

- None selected.

### Conflict Resolution

- Keeping the old deferred `editable` badge was incompatible with replacing the item-detail route with catalog details. The new route omits the obsolete badge without claiming catalog metadata editing is implemented.

### Page Effects

| Pros | Cons or effects |
|---|---|
| Membership changes preserve the underlying Discovery record and update the catalog count. | The candidate picker currently loads at most 100 available candidates and refreshes after addition. |
| Table conventions now match Discovery and actions are API-backed. | Catalog metadata itself is still read-only. |

### Suggestions

- Add catalog metadata editing and lifecycle controls with audit events.
- Add server-backed picker search for workspaces with more than 100 available candidates.
- Replace browser-native removal confirmation with an accessible application dialog if richer context is needed.

### Verification Record

- Focused page-plan test passed; TypeScript check and production build passed.
- Catalog persistence and a dynamic detail route were validated with HTTP `200` using a temporary QA catalog that was removed immediately after the check.
- Interactive browser/visual QA remains pending because no browser backend was connected.

## Revision — 2026-08-12

### Revised Page Goal

- Let users add and customize products and services within one catalog without changing the underlying global record unless explicitly intended.

### Page Edits

| ID | Approved change | Ramification | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `CHANGE-CATD-004` | Open Edit in a dedicated catalog-item drawer. | Preserves catalog context but requires catalog-specific draft, validation, save, and dismissal behavior. | [x] | [ ] | [ ] |
| `CHANGE-CATD-005` | Style `Add from Discovery` like the primary `Create Catalog` button and place it in the search/filter section. | Creates a clear primary membership action but increases toolbar density. | [x] | [ ] | [ ] |
| `CHANGE-CATD-006` | Populate `All Vendors` from all current workspace vendors. | Enables filtering even when a vendor currently has no catalog member; requires workspace-scoped vendor loading. | [x] | [ ] | [ ] |
| `CHANGE-CATD-007` | Make the search/filter section follow the revised Discovery Search Table format. | Improves cross-page consistency and makes Discovery toolbar changes a dependency. | [x] | [ ] | [ ] |
| `CHANGE-CATD-008` | Render the Add from Discovery results using the same dimensions and typography as the main member table. | Avoids a visually disconnected picker but may require replacing the compact checkbox grid. | [x] | [ ] | [ ] |
| `CHANGE-CATD-009` | Remove `Remove` from the Action column. | Simplifies row actions; removal moves into the Edit drawer's Discard action. | [x] | [ ] | [ ] |
| `CHANGE-CATD-010` | Rename drawer `Cancel` to `Discard` and make it delete only the product's membership in this catalog. | Converts a harmless dismissal into a destructive catalog-membership action and therefore requires confirmation plus a separate non-destructive close path. | [x] | [ ] | [ ] |
| `CHANGE-CATD-011` | Rename `Vendor Price` to `Custom Price` in the drawer. | Clarifies that the value is catalog-specific and requires catalog-member price persistence rather than changing the source vendor price. | [x] | [ ] | [ ] |
| `CHANGE-CATD-012` | Remove the Status column. | Narrows the member table and removes lifecycle context from the list. | [x] | [ ] | [ ] |
| `CHANGE-CATD-013` | Truncate Product or Service descriptions to a concise preview ending in an ellipsis. | Improves scanability but requires full text in the drawer and accessible name. | [x] | [ ] | [ ] |

### Revised Catalog Search Table Contract

- One toolbar contains Search, All Vendors, clear/reset behavior, and the primary `Add from Discovery` button.
- All Vendors includes every active workspace vendor, not only vendors represented by current catalog members.
- The main table omits Status and keeps Edit as the only Action-column control.
- Main and Add from Discovery tables share header height, row height, font size, thumbnail size, borders, overflow behavior, and labeled actions.
- Descriptions use a bounded single-line preview without modifying stored content.

### Edit Drawer Contract

- Edit opens a catalog-specific drawer rather than navigating to Discovery.
- `Custom Price` is stored as a catalog override and does not overwrite global vendor or source pricing.
- `Discard` removes only the CatalogMember relationship after explicit confirmation; it must never delete the underlying Discovery or CatalogItem record.
- Because Discard is destructive, the drawer also requires a separate Close control that exits without saving or removing membership.
- Successful save or discard updates the catalog table and item count without a full-page ambiguity.

### Conflict Update

- The earlier plan supported both Discovery bulk membership and Catalog Details item picking. The revised Discovery plan removes Add to Catalog there, so Catalog Details becomes the only visible membership entry point.
- The earlier Edit link opened Discovery. `CHANGE-CATD-004` supersedes that behavior with a dedicated drawer.
- The word `Discard` can be mistaken for abandoning unsaved changes. The plan preserves the requested label but requires explicit removal copy and confirmation.

### Open Decision Selection

| Decision group | Option | Clear action | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|---|
| `DEC-CATD-004` | A | Show a persistent Close control in the drawer header and use `Discard` only for confirmed catalog removal. | Separates safe dismissal from destructive removal and reduces accidental deletion. | [ ] | [ ] | [ ] |
| `DEC-CATD-004` | B | Rename the destructive action to `Remove from Catalog` and retain `Cancel` for dismissal. | Uses clearer language but does not follow the requested `Discard` label exactly. | [ ] | [ ] | [ ] |

### Revised Acceptance Criteria

- Edit opens a catalog-specific drawer with Custom Price and full product/service text.
- Add from Discovery is in the toolbar and its result table matches the primary table.
- All Vendors contains all current workspace vendors.
- Remove and Status are absent from the main table.
- Discard cannot delete the source product/service and cannot run without confirmation.

### Implementation Status

- Status: `planned_not_implemented`
- `DEC-CATD-004` and catalog-specific Custom Price persistence must be resolved before implementation.
- No code changes were made for this revision.
