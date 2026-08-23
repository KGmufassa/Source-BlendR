# Discovery Page Change Plan

## Route

- `/app/discovery`

## Goal

- Make Discovery the unified review list for imported products and services and the handoff point for creating catalogs and custom price sheets.

## Information Architecture

- List all workspace-scoped product and service records discovered through website, PDF, and manual input.
- Preserve source and import provenance so users can understand where each record came from.
- Provide clear actions to edit an item, select items, build a catalog, and create a custom price sheet.
- Treat this route as the cross-import inventory staging area rather than presenting a single session as the page identity.

## Proposed Changes

- Apply all shared requirements in [`README.md`](README.md).
- Remove `Discovery Session: SES-8812` and any session identifier from the page header.
- Add a search control using the same visual and interaction pattern as the current Catalog search.
- Search across product or service name, SKU or reference, vendor, category, and relevant source metadata.
- Add product/service filters. At minimum include type, vendor, source type, category, and review/status state when those values exist.
- Replace the `Confidence` column with `Vendor` and display the associated vendor name.
- Rename each `Preview` row action to `Edit` and open the approved editing surface for that record.
- Populate the Image column with the source image when available; otherwise show a consistent accessible placeholder.
- Add a page-size selector with `20`, `50`, and `100` options.
- Keep selection and bulk actions compatible with pagination and filtering.
- Add another column thats labeled `vendor price` make it an editable input in the preview drawer. 
- Change the "candidate details" text in the preview drawer to "Product Details"
- remove the "reference" text in the preview drawer.
- Change the "save & resolve" text to just save


## Pagination and Filtering

- Apply the approved page-size preference behavior, with 20 items as the fallback default.
- Changing page size resets to page 1 and updates the visible range and total.
- Changing search or filters resets to page 1.
- The result count reflects the filtered dataset, while the page range reflects the current slice.
- Prefer server-side querying once the workspace dataset can exceed a single safe response size.
- Apply the approved select-all scope and state that scope in the UI.

## Data Requirements

- Each row needs item ID, item type, name, SKU/reference when applicable, price when applicable, vendor ID/name, source type, category, review status, and image URL or asset reference.
- Manual items must be included even when they have no import job.
- Missing vendor data must display `Unassigned` or another approved neutral label, not a fabricated vendor.
- Image rendering must handle invalid URLs, missing assets, and suitable alternative text.

## Acceptance Criteria

- The list can include website, PDF, and manual products and services in one result set.
- The header contains no discovery-session identifier.
- Search and all approved filters can be combined, cleared, and used by keyboard.
- Vendor replaces Confidence in every render state and displays the correct source vendor.
- `Edit` opens the matching record and persists valid changes.
- Available images render in the Image column; missing or failed images use the standard placeholder.
- Users can choose 20, 50, or 100 items per page and pagination remains accurate.
- Catalog-building and custom-price-sheet entry points act on an explicitly defined selection scope.

## Open Decision Selection

- For each decision group, approve no more than one option.
- Use Defer to postpone a choice and Discard to reject an option.

| Decision group | Option | Clear action | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|---|
| `DEC-DIS-001` | A | Edit records in a right-side drawer on `/app/discovery`. | Preserves list context but limits editing width. | [x] | [ ] | [ ] |
| `DEC-DIS-001` | B | Edit records in a modal on `/app/discovery`. | Keeps the user on the list but adds focus-trap and responsive-modal complexity. | [ ] | [x] | [ ] |
| `DEC-DIS-001` | C | Edit records on a dedicated item route. | Provides maximum form space but navigates away from the list. | [ ] | [x] | [ ] |
| `DEC-DIS-002` | A | Launch with Type, Vendor, Source Type, Category, and Status filters. | Provides full filtering but increases toolbar and query complexity. | [x] | [ ] | [ ] |
| `DEC-DIS-002` | B | Launch with Type, Vendor, and Status filters only. | Keeps the toolbar simpler but offers less precise filtering. | [ ] | [x] | [ ] |
| `DEC-DIS-003` | A | Persist search, filters, page, and page size in URL query parameters. | Supports refresh and shareable views but requires URL-state synchronization. | [x] | [ ] | [ ] |
| `DEC-DIS-003` | B | Keep search and filter state only for the current visit. | Simplifies state handling but resets the view after navigation or refresh. | [ ] | [x] | [ ] |
| `DEC-DIS-004` | A | Preserve selected item IDs across pages within the same filtered result set. | Enables cross-page bulk work but requires persistent selection state and clear scope messaging. | [ ] | [x] | [ ] |
| `DEC-DIS-004` | B | Clear selection when the user changes pages. | Simplifies selection but limits bulk actions to one page. | [x] | [ ] | [ ] |
| `DEC-DIS-005` | A | Route selected items to `/app/price-sheets/new` with Name, Currency, Effective Date, and selected items. | Establishes a price-sheet workflow and adds a new route and data contract. | [ ] | [x] | [ ] |
| `DEC-DIS-005` | B | Remove the custom price-sheet action from the first release. | Reduces scope but postpones price-sheet creation. | [ ] | [x] | [ ] |
| `DEC-DIS-006` | A | Make select-all select only the visible page. | Keeps selection predictable but requires repeated selection across pages. | [x] | [ ] | [ ] |
| `DEC-DIS-006` | B | Make select-all select every item in the filtered result set. | Enables large bulk actions but requires explicit confirmation and server-side scope handling. | [ ] | [x] | [ ] |
| `DEC-DIS-007` | A | Persist the chosen page size between visits. | Preserves user preference but requires preference storage. | [x] | [ ] | [ ] |
| `DEC-DIS-007` | B | Reset page size to 20 on every visit. | Avoids preference storage but requires users to reselect larger sizes. | [ ] | [x] | [ ] |

## Dead-Button Report

- `All`, `New`, `Conflicts`, and `Duplicates` are dead filter buttons with no handlers.
- `More Filters` is dead and opens no filter UI.
- `Ignore` and `Archive` are dead bulk-action buttons.
- `Import Selected` is simulated: it shows a success toast but does not track the row checkboxes or persist an import.
- Row and select-all checkboxes are not connected to selection state, so bulk actions cannot use them.
- Pagination chevrons are rendered as text, not controls, and cannot change pages.
- `Preview` and drawer close controls successfully open and close the drawer and are not dead.
- `+ Add Attribute` is dead.
- Attribute chips display a removal `×` but are spans and cannot remove anything.
- `Discard` only closes the drawer and does not discard or revert a candidate.
- `Save & Resolve` only closes the drawer and does not save field edits or resolve status.
- The `Workspace` breadcrumb ancestor is inert text and is covered by the shared linked-breadcrumb change.

## Proposed Dead-Button Fixes

- Replace prototype tabs and More Filters with state-backed search/filter controls tied to the unified Discovery query.
- Track row selection by stable item ID, apply the approved select-all scope, and disable bulk actions when nothing is selected.
- Connect import, ignore, and archive actions to real workspace-scoped mutations; refresh affected rows and announce partial or complete failures.
- Implement real pagination controls and the planned 20/50/100 page-size selector.
- Rename `Preview` to `Edit` and connect the edit surface to a real save mutation with validation, pending state, and error feedback.
- Make `Discard` mean either revert unsaved changes or perform a persisted discard action; rename it to `Cancel` if its only purpose is closing without saving.
- Resolve attribute editing using one option in decision group `FIX-DIS-007`.
- Do not display a success toast until the server confirms the represented operation.

## Proposed Fix Selection

- Select Approve, Defer, or Discard for each proposed fix; do not select more than one choice in the same row.
- Leave all choices unchecked when a decision is still pending.
- Rows sharing an ID before the final letter are alternatives; approve no more than one option in that group.
- `FIX-DIS-007` was previously approved as a combined action and requires reapproval after being separated.

| ID | Proposed fix | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `FIX-DIS-001` | Replace prototype tabs and More Filters with state-backed search and filters. | Enables real discovery queries but expands filter-state and URL-state handling. | [x] | [ ] | [ ] |
| `FIX-DIS-002` | Track selection by stable item ID and define select-all scope. | Enables reliable bulk work but requires cross-page selection rules. | [x] | [ ] | [ ] |
| `FIX-DIS-003` | Connect import, ignore, and archive actions to workspace-scoped mutations. | Makes bulk actions real and introduces partial-failure and refresh handling. | [x] | [ ] | [ ] |
| `FIX-DIS-004` | Implement pagination and the 20/50/100 page-size selector. | Supports large datasets but requires accurate counts and query paging. | [x] | [ ] | [ ] |
| `FIX-DIS-005` | Rename `Preview` to `Edit` and persist validated edits. | Converts a read-only drawer into a mutation workflow with error handling. | [x] | [ ] | [ ] |
| `FIX-DIS-006` | Rename `Discard` to `Cancel`. | Removes ambiguous behavior but requires one explicit product decision. | [x] | [ ] | [ ] |
| `FIX-DIS-007A` | Implement persistent add/remove attribute controls. | Expands editing and requires attribute validation and persistence. | [x] | [ ] | [ ] |
| `FIX-DIS-007B` | Remove add/remove attribute affordances until persistence exists. | Reduces editing scope but eliminates misleading controls. | [ ] | [x] | [ ] |
| `FIX-DIS-008` | Show success feedback only after server confirmation. | Improves accuracy but may make feedback wait on request completion. | [x] | [ ] | [ ] |

## Completion Scope

- Completion date: `2026-08-10`
- Status: `implemented_awaiting_bulk_review`

### Completed

| Change | Record |
|---|---|
| Unified inventory | Loads workspace candidates across import sessions plus manual/promoted catalog items into one list, with source provenance. |
| Header and navigation | Removed the session identifier, linked Workspace, and added Create Catalog. |
| Search and filters | Added URL-backed search plus Type, Vendor, Source, Category, and Status filters with a clear action. |
| Table | Replaced Confidence with Vendor, added Vendor Price, renders source images with an accessible fallback, and renamed Preview to Edit. |
| Pagination | Added working Previous/Next controls and 20/50/100 page sizes with filtered ranges and totals. |
| Selection and mutations | Select-all applies to the visible page; import, ignore, archive, and Add to Catalog use stable IDs and workspace-scoped APIs. |
| Edit drawer | Uses the approved right drawer, reads `Product Details`, omits Reference, includes editable Vendor Price, uses Cancel, and persists with `Save`. |
| Feedback | Success appears only after the server confirms the represented mutation. |

### Deferred

- Cross-page selection and filtered-result select-all remain deferred under `DEC-DIS-004A` and `DEC-DIS-006B`.
- Both custom price-sheet options remain deferred, so no first-release price-sheet action is shown.
- Attribute editing branches `FIX-DIS-007A/B` remain undecided; add/remove affordances are omitted to avoid dead controls.
- Server-side query paging beyond the current 500-candidate and 500-manual-item safety caps remains deferred.

### Discarded

- None selected.

### Conflict Resolution

| Conflict | Resolution |
|---|---|
| `DEC-DIS-003A` approves URL persistence including page size while `DEC-DIS-007` has no approved branch | Page size is stored in the approved URL query state; no separate user-preference record was introduced. |
| Attribute behavior is undecided but the old controls were dead | Omitted the controls without choosing either persistence branch. |

### Page Effects

| Pros | Cons or effects |
|---|---|
| Discovery now works as a cross-import operational staging list with real mutations. | Loading all records into client-side filtering is capped and will need server pagination at larger scale. |
| Filtered URLs can be refreshed, shared, and opened from Overview analytics. | Frequent search changes update the URL and can trigger additional server navigation work. |
| Drawer edits and Vendor Price persist instead of simulating success. | Candidate and manual records have different underlying persistence models, increasing API complexity. |

### Suggestions

- Move filtering, counts, and pagination to a unified server query before exceeding the current safety caps.
- Add a dedicated vendor-assignment control in Product Details for unassigned records.
- Decide the price-sheet route and attribute-editing branch before adding either affordance.
- Add image upload/selection instead of relying only on imported URLs.

### Verification Record

- Focused page-plan test passed; TypeScript check and production build passed.
- Migrated local runtime checks passed with HTTP `200` on unified and real session-specific Discovery routes; interactive browser/visual QA remains pending because no browser backend was connected.

## Revision — 2026-08-12

### Revised Page Goal

- Allow users to search the complete workspace database of scraped products and services and manually edit records individually or through approved bulk operations.

### Page Edits

| ID | Approved change | Ramification | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `CHANGE-DIS-009` | Remove `Create Catalog`, `Import Selected`, `Ignore`, `Archive`, and `Add to Catalog` from Discovery. | Reduces workflow branching and removes the currently implemented bulk lifecycle/catalog actions from this page. | [x] | [ ] | [ ] |
| `CHANGE-DIS-010` | Truncate Product or Service text to a concise preview such as `Heavyweight Bomber Jacket — Olive Green…`. | Improves scanability but requires the full value to remain accessible and available in Edit. | [x] | [ ] | [ ] |
| `CHANGE-DIS-011` | Truncate SKU text to a consistent maximum visual length. | Prevents wide identifiers from distorting rows but requires access to the complete SKU. | [x] | [ ] | [ ] |
| `CHANGE-DIS-012` | Remove Status, Source, and Category columns. | Produces a narrower table but removes at-a-glance provenance and workflow-state context. | [x] | [ ] | [ ] |
| `CHANGE-DIS-013` | Change the search field's accessible label and visible copy from `Search discovery` to `Search`. | Simplifies copy while retaining a descriptive placeholder or helper. | [x] | [ ] | [ ] |
| `CHANGE-DIS-014` | Consolidate search and filters into a cleaner, structured toolbar matching the supplied reference. | Improves hierarchy but requires the missing reference image before exact visual matching. | [x] | [ ] | [ ] |

### Revised Search Table Contract

- Discovery remains the shared `Search Table` reference.
- Place Search as the primary, widest control; group filters in one aligned secondary region; place Clear/Reset consistently; keep page-size controls visually separate from query filters.
- Retain the approved Type, Vendor, Source Type, Category, and Status filter capabilities unless separately removed; removing table columns does not automatically remove their filters.
- Avoid scattered controls, uneven heights, and unrelated primary actions inside the toolbar.
- Product/service names and SKUs must use single-line ellipsis or an equivalent fixed-length presentation without changing stored values.
- Provide full truncated values through an accessible mechanism such as the Edit drawer and a descriptive title/accessible name; do not rely on hover alone.

### Conflict Update

| Conflict | Resolution for this revision |
|---|---|
| Earlier plans approved import, ignore, archive, and Add to Catalog actions on Discovery. | The newer explicit removal request supersedes those earlier page actions; their APIs and data are not deleted merely because controls are removed. |
| Earlier Catalog plan approved Discovery as one catalog-membership entry point. | Catalog membership from Discovery is withdrawn by `CHANGE-DIS-009`; Catalog Details remains the visible membership entry point unless a future decision restores it. |
| The requested search/filter image is missing. | Record the structural toolbar requirements now; defer pixel-level visual specification until the image is supplied. |

### Revised Acceptance Criteria

- None of the five removed actions is visible on Discovery.
- Product/service and SKU cells remain one-line, bounded, and expose the complete stored value accessibly.
- Status, Source, and Category columns are absent; approved filters continue to work unless separately revised.
- The search label reads `Search`.
- Search, filters, reset, page size, result count, and pagination form a clear visual hierarchy.

### Implementation Status

- Revision completion date: `2026-08-15`
- Approval date: `2026-08-16`
- Status: `implemented_approved`
- Exact pixel matching remains dependent on the missing search/filter reference image.

### Revision Completed

| Scope | Completion record |
|---|---|
| Removed page actions | Removed `Create Catalog`, `Import Selected`, `Ignore`, `Archive`, and `Add to Catalog` from Discovery. The underlying APIs and records were not deleted. |
| Selection and bulk delete | Added a selection column before Image, stable candidate/manual selection keys, visible-page select-all, selected-count feedback, and a real `Delete selected` action. Bulk controls occupy a dedicated section between the search/filter toolbar and table, and Delete remains disabled without a selection. Selection clears when search, filters, page size, or page changes. |
| Product and SKU previews | Added bounded, one-line Product or Service and SKU values with concise character limits and ellipsis. The full values remain in accessible names, native titles, and the Edit drawer. |
| Table columns | Removed Status, Source, and Vendor columns; later restored Category immediately after Type. The table now contains Selection, Image, Product or Service, Type, Category, SKU, Vendor Price, and Action. |
| Filter reduction | Removed the Source Type dropdown that exposed the Website selection and removed the Status dropdown that displayed `All status`. Type, Vendor, and Category filters remain, while category and source metadata remain searchable. |
| Atomic bulk deletion | Bulk deletion requires confirmation, scopes both record types to the active workspace, deduplicates stable IDs, and deletes all selected records in one transaction. Any missing or invalid selection rolls back the complete operation. |
| Product Type and Category bulk changes | Added visible `Product Type` and `Category` titles above matching text-input controls in the dedicated bulk section. Product Type suggests and validates the approved product/service/rental/labor/manufacturing/installation values; Category offers existing-value suggestions and accepts custom text. `Apply changes` persists both record families atomically and updates visible rows after server confirmation. |
| Vendor Price synchronization | The table's `Vendor Price` column now displays `priceCents`, matching the drawer field currently labeled `Vendor Price`. A confirmed drawer save updates the same client record and is reflected in the table immediately. |
| Search copy | Changed the visible and accessible label to `Search` and retained a descriptive multi-field placeholder. |
| Search Table toolbar | Made Search the widest primary control, placed `Reset filters` directly beside it at the same 40-pixel control height, and grouped the remaining Type, Vendor, and Category filters in one secondary region. |
| Pagination footer | Moved the page-size selector out of the toolbar and placed it immediately to the left of the `Showing…` result range. Added the missing shared `sr-only` utility so `Items per page` is no longer visible while remaining the control's accessible name. |
| Drawer deletion | Replaced the drawer `Cancel` button with a real `Delete` action. It requires explicit confirmation, uses a same-origin workspace-scoped API mutation, removes the deleted row after server confirmation, and reports failures in the drawer. |
| Drawer price labels | Swapped the visible `Unit Price` and `Vendor Price` labels as requested without swapping or migrating their underlying stored field values. |
| Drawer inventory | Added a required whole-number `Inventory Quantity` input with a minimum of zero. Saving persists the value to catalog items or candidate payloads, and candidate promotion carries the quantity into the resulting catalog item. |
| Inventory migration | Added and locally applied migration `20260815000100_discovery_inventory_quantity`; existing catalog items receive a quantity of `0` and the database rejects negative catalog quantities. |
| Refresh performance | Reduced the blocking server render from up to 1,000 embedded records to a 20-record slice per source plus fast aggregate counts. The complete capped index loads through a private, uncached workspace API immediately after first paint. |
| Progressive index state | Preserved the correct initial total, announces background loading to assistive technology, and temporarily disables pagination until the complete client index is ready. Search, filters, counts, and pagination then use the loaded index without changing their URL contract. |
| Data states | Added route-level loading and error surfaces with the same Discovery shell class, linked Workspace breadcrumb, explicit state messaging, and a working retry action. Existing empty and filtered-to-zero states remain distinct. |
| Shared requirements | Preserved the shared sidebar/icon shell, removed generic status UI, kept the current breadcrumb non-interactive with `aria-current`, linked Workspace, and retained horizontal table overflow. |

### Revision Deferred

- Pixel-level matching of the search/filter area is deferred until the missing reference image is supplied.
- Server-side search, filtering, total counts, and pagination beyond the existing 500-candidate and 500-manual-item safety caps remain deferred; this means the complete-database goal is not yet guaranteed for larger workspaces.
- Interactive browser, responsive, focus-order, and screen-reader validation remains deferred because no browser backend is connected to this session.

### Revision Discarded

- The five superseded page actions and their visible catalog destination control were discarded from this page under `CHANGE-DIS-009`.
- Status and Source table columns remain discarded under `CHANGE-DIS-012`; Category was restored by the subsequent explicit request.
- Source Type and Status filter controls were discarded by the subsequent explicit request.
- The Vendor table column was discarded by the subsequent explicit request; vendor search and filtering remain available.
- The drawer `Cancel` footer action was discarded and replaced by the requested destructive `Delete` action. The separate header `Close` action remains available for leaving the drawer without saving or deleting.

### Revision Conflict Resolution

| Conflict | Resolution |
|---|---|
| Earlier approved fixes implemented import, ignore, archive, and catalog-membership actions. | The newer explicit removal request takes precedence on Discovery. APIs remain available for other approved workflows. |
| The action-removal revision made selection inert, so it was removed at that time; a later request explicitly restores selection for bulk actions such as delete. | Reintroduced visible-page selection only with a working bulk-delete consumer. Import, ignore, archive, and catalog-membership bulk actions remain removed. |
| The original information architecture names Discovery as a catalog-building handoff. | Discovery is now limited to search and individual editing; Catalog Details remains the visible catalog-membership entry point. |
| The requested toolbar image is absent. | Implemented the approved structural hierarchy and deferred exact visual matching. |

### Revision Page Effects

| Pros | Cons or resulting effects |
|---|---|
| The narrower table and one-line values are faster to scan and less prone to horizontal sprawl. | Status and source context now requires Search or opening Edit instead of reading the row. |
| Category is visible beside Type, and the filter row is simpler without Source Type or Status. | Source/status-specific filtering is no longer available, though source metadata remains searchable and Category retains its filter. |
| Search, filters, reset, and page size have clearer visual roles. | Exact fidelity to the intended reference cannot be judged without the missing image. |
| Reset is easier to associate with Search, while page size is grouped with result count and pagination. | The footer contains more controls and may wrap into two lines at narrower widths. |
| Removing unrelated actions focuses Discovery on finding and editing records. | Users must use Catalog Details or another workflow for catalog membership and lifecycle actions. |
| Users can permanently remove an unwanted product or scrape candidate without leaving Discovery. | Deletion cannot be undone and also removes that record's catalog-membership links through existing database cascade rules. |
| Multiple visible records can be selected and deleted in one confirmed operation without partial success. | Bulk deletion increases the impact of a mistaken confirmation; selection is intentionally limited to the current page and clears when the view changes. |
| Selected records can receive a consistent Product Type, Category, or both without opening each drawer. | Custom category text can create near-duplicate category names until a controlled taxonomy or normalization rule is introduced. |
| The two drawer price labels use the requested wording. | The stored property names remain legacy implementation details and should be clarified if these values are exposed through public contracts. |
| The drawer and table now display the same stored value for `Vendor Price`, so confirmed edits are visible immediately. | The separate `vendorPriceCents` value is now labeled `Unit Price` and is available only in Edit, not as a table column. |
| Inventory quantities can be entered and retained for both scraped and manual items. | Existing items begin at `0`, so unknown inventory and confirmed zero inventory are not yet distinguished. |
| First render carries substantially less serialized data and requires less hydration work. | The client makes one follow-up request, and complete filter options are available only after that request finishes. |
| Loading, empty, no-results, populated, and error paths now communicate distinct states. | Client-side data loading still caps the searchable dataset in large workspaces. |

### Revision Suggestions

- Replace the two independent safety-capped queries with one workspace-scoped server query that returns a stable total and supports search/filter pagination.
- Supply the missing toolbar reference image, then run a pixel-level responsive review at desktop and narrow viewport sizes.
- Consider exposing compact non-column context inside Edit for status, source, and category so removed row context remains easy to inspect.
- Add a deliberate post-edit focus return to the triggering row action during interactive accessibility QA.
- Consider a recoverable archive or short undo window if accidental permanent deletion becomes a support concern.
- Confirm the intended business definitions of `Unit Price` and `Vendor Price` so the drawer and table can use consistent terminology in a future revision.
- Decide whether inventory needs an `Unknown` state, reserved quantity, unit of measure, or low-stock threshold before adding inventory analytics.
- Consider category normalization or a managed taxonomy before the number of custom bulk-entered categories grows.

### Revision Verification Record

- Focused page-plan tests passed: `7/7`.
- Web TypeScript check passed.
- ESLint passed for all changed Discovery route files.
- Local runtime request to `/app/discovery` returned HTTP `200`; rendered output included the revised controls and omitted the removed actions.
- Static coverage verifies both manual-item and scrape-candidate delete branches, workspace scoping, the confirmation prompt, and the swapped price labels.
- Static coverage verifies the selection column precedes Image, select-all uses the visible page, view changes clear selection, and bulk deletion is transactional and workspace-scoped.
- Static coverage verifies Product Type and Category bulk controls, allowed product types, category validation, atomic workspace-scoped persistence, and immediate client-row updates.
- Static coverage verifies Inventory Quantity input constraints, API validation, persistence for both record types, and promotion carry-forward.
- Static coverage verifies Reset follows Search and Items per page precedes the visible result range.
- Static coverage verifies the 20-record-per-source initial slice, aggregate initial count, progressive index request, accessible loading announcement, and private no-store API response.
- The warmed local HTML response decreased from approximately `318 KB` to `77 KB` (about 76% smaller); warmed total transfer time decreased from approximately `0.13 s` to `0.07 s`.
- The follow-up index endpoint returned `505` current workspace records successfully without mutating them.
- Migration `20260815000100_discovery_inventory_quantity` applied successfully and `prisma migrate status` reports the local database is up to date.
- No product edit, delete, or other record mutation was invoked during runtime verification, preserving local records.
- Interactive visual QA remains pending because no browser backend was connected.
