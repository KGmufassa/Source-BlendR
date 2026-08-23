# Vendor Details Page Change Plan

## Route

- `/app/vendors/:vendorID`

## Goal

- Provide a complete, useful vendor profile and a direct import entry point.

## Proposed Changes

- Apply all shared requirements in [`README.md`](README.md).
- Expand the page beyond the current summary row into structured vendor details.
- Replace the existing `Open` action with `Import`.
- Route `Import` using the approved import-method behavior while preserving the current vendor selection.

## Vendor Information

- Identity: vendor name, status, description, and logo when available.
- Contact: primary contact name, role, email, phone, and address when available.
- Website: URL as a safe external link, domain, source/import method, and last successful access or import where available.
- Offering: what the vendor sells or the services it provides, represented by category/type and a concise description.
- Import activity: most recent import, import status, and a route to relevant job details.
- Show `Not provided` for absent optional data; do not invent placeholder contact or business details.

## Data and Safety Requirements

- Vendor details must be workspace-scoped and protected from cross-workspace ID access.
- Validate and safely render external URLs; opening a vendor website should use the application's external-link policy.
- Email and phone links must be correctly formatted when provided.
- Offering type must support both products and services.
- The import handoff must pass a stable vendor ID rather than relying only on a display name.

## Acceptance Criteria

- The page displays all available contact, website, offering, status, and recent-import information in clearly labeled sections.
- Missing optional information has a consistent neutral state.
- The action reads `Import` and opens an applicable import flow with the vendor context preserved.
- Breadcrumbs link back to `/app/vendors`.
- Invalid or unauthorized vendor IDs fail safely without revealing another workspace's data.

## Open Decision Selection

- Approve no more than one option in each decision group.

| Decision group | Option | Clear action | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|---|
| `DEC-VEND-001` | A | Open a method chooser when multiple methods are available; route directly when only one method is configured. | Adapts to vendor capabilities but adds chooser UI for multi-source vendors. | [ ] | [x] | [ ] |
| `DEC-VEND-001` | B | Always route directly to the vendor's configured default import method. | Keeps the action fast but prevents method choice at launch. | [x] | [ ] | [ ] |

## Dead-Button Report

- No dead task buttons were found in the current vendor-detail source trace.
- `New vendor` has a valid destination.
- The current `Open` action has a valid vendor-scoped website-import destination, but its label does not describe the action; the planned rename to `Import` resolves that mismatch.
- `Vendors` is a working breadcrumb link. The `Workspace` ancestor is inert text and is covered by the shared linked-breadcrumb change.

## Proposed Dead-Button Fixes

- Preserve the stable vendor ID in the renamed `Import` handoff.
- Apply the approved import-method behavior from `DEC-VEND-001`.
- Do not add contact, website, offering, or import-history actions unless the underlying value and destination exist.

## Proposed Fix Selection

- Select Approve, Defer, or Discard for each proposed fix; do not select more than one choice in the same row.
- Leave all choices unchecked when a decision is still pending.

| ID | Proposed fix | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `FIX-VEND-001` | Preserve the stable vendor ID in the renamed `Import` handoff. | Maintains vendor context and prevents incorrect source assignment. | [x] | [ ] | [ ] |
| `FIX-VEND-002` | Apply the import-method behavior approved in `DEC-VEND-001`. | Makes the action deterministic but depends on completing the route decision. | [x] | [ ] | [ ] |
| `FIX-VEND-003` | Show vendor-detail actions only when their values and destinations exist. | Prevents dead controls but hides actions for incomplete vendor records. | [x] | [ ] | [ ] |

## Completion Scope

- Completion date: `2026-08-10`
- Status: `implemented_awaiting_bulk_review`

### Completed

| Change | Record |
|---|---|
| Complete layout | Added Identity, Contact Information, Website Details, Products and Services, and Recent Import Activity sections. |
| Honest missing data | Optional data not present in the model displays `Not provided`; no contact or business information is fabricated. |
| Offering summary | Derives product/service types and categories from real vendor items. |
| Website safety | Validates HTTP(S) before rendering an external link and uses a new-tab safety policy. |
| Import action | Renamed Open to Import and preserves the stable vendor ID in the handoff. |
| Default method | Implements `DEC-VEND-001B`: Website when a valid vendor website is configured; otherwise PDF. |
| Activity links | Recent jobs link to their stable Job Details routes. |

### Deferred

- The multi-method chooser in `DEC-VEND-001A` remains deferred.
- Contact, address, description, logo, and richer offering editing remain deferred until their persistence fields and form are defined.

### Discarded

- None selected.

### Conflict Resolution

- The current vendor model has no explicit default-import field. The direct default uses the available capability: valid website URL selects Website, otherwise PDF. This inference should be replaced when a configured default is persisted.

### Page Effects

| Pros | Cons or effects |
|---|---|
| The page now gives a useful, workspace-safe vendor profile and import history. | Several sections show Not provided until the vendor model captures richer profile data. |
| Import retains vendor context and no longer uses a misleading label. | Inferring the default method from website presence may not match every vendor's preferred workflow. |

### Suggestions

- Add explicit contact, address, description, logo, offering description, and default-import-method fields.
- Add an Edit Vendor workflow with validation and audit history.
- Use a chooser only after multiple configured source capabilities are stored per vendor.

### Verification Record

- Focused page-plan test passed; TypeScript check and production build passed.
- A real workspace-scoped vendor detail route returned HTTP `200` on the migrated runtime; interactive browser/action QA remains pending because no browser backend was connected.

## Revision — 2026-08-12

### Page Edits

| ID | Approved change | Ramification | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `CHANGE-VEND-004` | Make every vendor-detail card editable, including Identity, Contact Information, Website Details, Products and Services, and other editable vendor-owned details. | Requires new persisted vendor profile fields, validation, permissions, dirty-state handling, and save feedback across multiple cards. | [x] | [ ] | [ ] |

### Editable Card Requirements

- Each card must have an explicit view and edit state; static text must not unexpectedly become form fields without an Edit action or clear page edit mode.
- Identity editing covers name, status, description, and logo when persistence exists.
- Contact editing covers primary contact, role, email, phone, and address.
- Website editing covers URL, domain-derived display, default import method, and other vendor-owned settings; system-derived last-access timestamps remain read-only.
- Products and Services editing covers vendor offering type, categories, and description; imported item rows and computed record counts remain managed by their source workflows.
- Recent Import Activity is system-derived and remains read-only even though its containing card participates in the editable-page design.
- Validation, pending, success, failure, permission-denied, cancel/discard, and unsaved-navigation behavior must be defined.
- All mutations remain workspace-scoped and must not expose or update another workspace's vendor.

### Open Decision Selection

| Decision group | Option | Clear action | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|---|
| `DEC-VEND-002` | A | Give each editable card its own Edit, Save, and Cancel controls. | Limits the scope of each mutation but adds repeated actions and partial-page saved states. | [x] | [ ] | [ ] |
| `DEC-VEND-002` | B | Use one page-wide Edit mode with a single Save and Cancel action. | Produces one coherent transaction but increases form size, validation scope, and unsaved-change complexity. | [ ] | [x] | [ ] |
| `DEC-VEND-003` | A | Store vendor categories as reusable structured values with multi-select and free-entry support. | Improves filtering consistency but requires category normalization and relation or array persistence. | [x] | [ ] | [ ] |
| `DEC-VEND-003` | B | Store offering categories as free text. | Reduces schema and UI complexity but permits inconsistent labels. | [ ] | [x] | [ ] |

### Data Model Impact

- The current vendor model does not contain most requested profile fields. Implementation requires persisted description, logo, contact name/role/email/phone/address, default import method, offering type, offering categories, and offering description, or an approved normalized equivalent.
- Derived fields such as domain, last access, latest import, record count, and import history must remain read-only.

### Acceptance Criteria

- Every vendor-owned field shown in the profile can be edited and persisted according to the selected edit-mode decision.
- Derived operational information is clearly read-only and cannot be overwritten through the profile form.
- Invalid contact and website values are rejected with field-associated feedback.
- Cancel or page navigation cannot silently lose unsaved edits.
- Permission-denied users can view permitted details without receiving enabled edit controls.

### Implementation Status

- Completion date: `2026-08-16`
- Approval date: `2026-08-16`
- Status: `implemented_approved`

### Revised Completion Scope

| Change | Completion record |
|---|---|
| Editable cards | Identity, Contact Information, Website Details, and Products and Services each have their own Edit, Save, and Cancel controls. |
| Read-only activity | Recent Import Activity remains read-only and continues linking to stable Job Details routes. |
| Persistence | Added vendor-owned profile fields for description, logo URL, contact details, address, default import method, offering type, offering categories, and offering description. |
| API updates | Expanded the workspace-scoped vendor PATCH route with same-origin protection, editor mutation gating, URL/email validation, category normalization, and empty-string cleanup. |
| Header action cleanup | Removed the page-level `Import` button at the user's direction. |
| Structured categories | Offering categories are persisted as a string array; the edit card supports selecting derived categories and adding free-entry categories. |
| Permission behavior | Workspace editors can edit vendor details; viewer users can view permitted details but do not receive enabled edit controls. |

### Revised Deferred Scope

- A page-wide edit mode remains deferred under `DEC-VEND-002B`.
- A fully normalized reusable category table remains deferred; the current implementation stores structured category values on the vendor record.
- Logo upload/storage remains deferred; the profile stores a safe HTTP(S) logo URL only.
- Interactive browser and responsive visual QA remain pending because no connected browser backend is available.

### Revised Discarded Scope

- Discarded static `Not provided` placeholders for vendor-owned fields now covered by persistence.
- Discarded editing for system-derived values such as domain, last access, record count, imported rows, and import history.

### Revised Conflict Resolution Record

- The request said all cards should be editable, but the plan explicitly marks Recent Import Activity as system-derived. It remains visibly read-only so users cannot overwrite operational history.
- The approved structured category decision is implemented as a persisted string array with free-entry support rather than a separate normalized category table, keeping this page scoped while preserving multi-value data.

### Revised Page Effects

| Pros | Cons or resulting effects |
|---|---|
| Vendor profiles can now be maintained without leaving the detail page. | The Vendor table gains several nullable profile fields. |
| Each card saves independently, reducing accidental broad updates. | Partial saves can leave different cards updated at different times. |
| The vendor profile now stays focused on viewing and editing vendor information. | Users must start imports from the import workflows instead of this page header. |
| Read-only operational history is protected from profile edits. | Users must use import workflows to change activity/history data. |

### Revised Suggestions

- Add an accessible unsaved-change dialog if users navigate away while a card is in edit mode.
- Replace logo URL entry with managed workspace asset upload once storage rules are defined.
- Promote offering categories into a normalized workspace taxonomy if category reuse becomes important across Vendors, Discovery, and Catalog.

### Revised Verification Record

- Focused implementation tests cover editable-card UI, editor/viewer gating, profile schema fields, PATCH validation, import handoff, and read-only import activity.
- Migration `20260816000200_vendor_profile_fields` was applied successfully to the local PostgreSQL development database.
- Prisma client generation completed successfully after the schema update.
- TypeScript validation, focused implementation tests, focused app/API ESLint validation, and whitespace checks pass.
- A real workspace-scoped `/app/vendors/:vendorID` route returned HTTP `200`.
- Runtime mutation validation was not performed to avoid changing vendor data before review approval.

### Post-Review Correction — 2026-08-16

| Issue | Correction |
|---|---|
| Editable controls were not visible for non-admin workspace users. | Changed the page and API mutation gate from admin-only to workspace editor access; only viewer users are blocked from editing. |
| The local dev server was serving stale page code from before the editable-card correction. | Restarted the Next development server on `http://localhost:3000`. |
| Identity card saves could return the generic `The request could not be completed.` error. | The vendor PATCH route now removes undefined fields before calling Prisma, so partial card saves send only fields present in the request. |
| The vendor detail header still exposed an `Import` button. | Removed the page-level `Import` button. |

### Correction Verification Record

- TypeScript validation, focused implementation tests, focused app/API ESLint validation, and whitespace checks pass after the permission correction.
- The restarted live `/app/vendors/:vendorID` route returned HTTP `200` and rendered Identity, Contact Information, Website Details, Products and Services, Recent Import Activity, and Edit controls.
- A same-origin Identity PATCH request with unchanged vendor data returned HTTP `200`.
- The restarted live `/app/vendors/:vendorID` route no longer renders the page-level `Import` button.
