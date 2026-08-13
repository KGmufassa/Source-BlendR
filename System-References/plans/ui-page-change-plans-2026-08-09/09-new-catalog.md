# New Catalog Page Change Plan

## Route

- `/app/catalog/new`

## Goal

- Convert the current new-item form into a catalog-creation workflow for building a custom catalog.

## Proposed Changes

- Apply all shared requirements in [`README.md`](README.md).
- Change the page title, description, breadcrumb current label, and form language from new item to new catalog.
- Limit General Information to `Name` and `Category Type`.
- Make Category Type a user-entered text field rather than a dropdown.
- Remove SKU, description, vendor, pricing, tax, and any other item-specific fields from General Information and the page.
- Remove the entire Pricing and Tax section.
- Apply the approved catalog-member selection timing.
- Center `Cancel` within its button in both axes.
- Change `Save item` to `Save Catalog`; while submitting, use `Saving…` or `Saving Catalog…`.

## Validation and Submission

- Name is required, trimmed, and validated against the approved maximum length.
- Apply the approved Category Type requirement, trim the value when supplied, and validate the approved maximum length.
- User-entered Category Type must not be constrained to a hard-coded list.
- Duplicate-name handling must be defined at workspace scope.
- Successful creation routes to `/app/catalog/:catalogID` for the newly created catalog.
- Cancel returns to `/app/catalog` without creating a catalog.

## Acceptance Criteria

- Only Name and Category Type appear in General Information.
- Category Type accepts user input.
- No Pricing and Tax section or item-specific field remains.
- `Cancel` text is visually centered and the whole control is clickable.
- The primary action reads `Save Catalog` when idle.
- A successful save creates one catalog collection and opens its details page.
- Validation errors are associated with their inputs and announced accessibly.

## Open Decision Selection

- For each decision group, approve no more than one option.

| Decision group | Option | Clear action | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|---|
| `DEC-CATN-001` | A | Select catalog members on `/app/catalog/new` before saving. | Creates a complete catalog in one flow but adds complexity to the creation form. | [ ] | [x] | [ ] |
| `DEC-CATN-001` | B | Save Name and Category Type first, then add members on Catalog Details. | Keeps creation simple but requires a second step to populate the catalog. | [x] | [ ] | [ ] |
| `DEC-CATN-002` | A | Require Category Type. | Improves organization but blocks creation until the user supplies a category. | [x] | [ ] | [ ] |
| `DEC-CATN-002` | B | Make Category Type optional and display `Uncategorized` when empty. | Speeds creation but permits less structured catalogs. | [ ] | [x] | [ ] |

## Dead-Button Report

- No dead buttons were found in the current form source trace.
- Product and Service controls update form state, Cancel routes back to Catalog, and Save submits to the catalog-items API.
- The current Category and Tax controls are visual-only values that are not submitted, although they are fields rather than buttons. Both are superseded by this plan's catalog-form redesign.
- The `Workspace` and `Catalog` breadcrumb ancestors are inert text and are covered by the shared linked-breadcrumb change.

## Proposed Dead-Button Fixes

- Preserve working cancel and submit semantics while changing the submit target from item creation to catalog creation.
- Remove the item-type segmented buttons with the item-oriented form.
- Ensure `Save Catalog` calls a catalog-creation API, handles validation and request failure, and routes using the returned catalog ID.
- If member selection is included before save, do not display selection or continuation buttons until their state and destination are implemented.

## Proposed Fix Selection

- Select Approve, Defer, or Discard for each proposed fix; do not select more than one choice in the same row.
- Leave all choices unchecked when a decision is still pending.

| ID | Proposed fix | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `FIX-CATN-001` | Preserve working cancel and submit semantics while switching to catalog creation. | Retains familiar behavior but requires a new catalog persistence contract. | [x] | [ ] | [ ] |
| `FIX-CATN-002` | Remove item-type segmented buttons from the catalog-creation form. | Simplifies the form and removes product/service selection from this route. | [ ] | [x] | [ ] |
| `FIX-CATN-003` | Make `Save Catalog` create a catalog and route using its returned ID. | Changes the API target and establishes the new catalog-details handoff. | [x] | [ ] | [ ] |
| `FIX-CATN-004` | Hide member-selection or continuation controls until fully implemented. | Prevents dead steps but may defer item selection until after creation. | [x] | [ ] | [ ] |

## Completion Scope

- Completion date: `2026-08-10`
- Status: `implemented_awaiting_bulk_review`

### Completed

| Change | Record |
|---|---|
| Catalog language | Changed title, description, breadcrumbs, and form copy from item creation to catalog creation. |
| General Information | Contains only required Name and free-text Category Type fields with maximum lengths. |
| Removed item inputs | Removed SKU, type, vendor, pricing, tax, and other item-oriented controls. |
| Actions | Centered Cancel, renamed the primary action to Save Catalog, and added a submitting state. |
| Persistence | Save calls the catalog-creation API and opens the returned stable catalog ID. |
| Member timing | Uses approved `DEC-CATN-001B`: save metadata first and add members from Catalog Details. |

### Deferred

- Selecting catalog members before save remains deferred.
- The explicit `FIX-CATN-002` branch remains deferred, although the item-type control disappeared as part of the approved form replacement.

### Discarded

- None selected.

### Conflict Resolution

- The proposed changes require only Name and Category Type, while `FIX-CATN-002` separately deferred removal of item-type buttons. The core two-field form requirement took precedence because retaining Product/Service would violate the approved catalog information architecture.

### Page Effects

| Pros | Cons or effects |
|---|---|
| Creation is short, clear, and creates a real catalog rather than an inventory item. | Users need a second step to add members. |
| Category Type accepts workspace-specific language without a hard-coded taxonomy. | Free text can create near-duplicate category labels without normalization. |

### Suggestions

- Add category-type autocomplete from existing catalog values while preserving free entry.
- Provide an optional post-save prompt to open Add from Discovery.
- Add clearer duplicate-name error copy when the workspace uniqueness constraint is hit.

### Verification Record

- Focused page-plan test passed; TypeScript check and production build passed.
- Migrated local runtime check passed with HTTP `200` on `/app/catalog/new`; interactive browser/form QA remains pending because no browser backend was connected.
