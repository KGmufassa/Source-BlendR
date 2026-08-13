# UI Page Change Plans

## Purpose

- Document the requested workspace UI changes without modifying application code.
- Use one plan file per affected route.
- Treat these plans as implementation guidance for a later Stage 5/Stage 6 change.

## Shared Requirements

- Replace every sidebar navigation glyph with the icon shown for the corresponding destination in the supplied reference image.
- Use one shared sidebar template on every route, including dynamic import-job, catalog-detail, and vendor-detail pages.
- Remove user-facing system-status text, status pills, status footers, and settings-status summaries from every page. Operational state that is necessary to complete a task, such as an import job's status, remains visible.
- Make every non-current header breadcrumb label a link to its corresponding ancestor route. The current-page label remains text and uses `aria-current="page"` where appropriate.
- Preserve visible keyboard focus, sensible tab order, accessible link names, and current-route indication in the sidebar and breadcrumbs.
- Apply shared changes to loading, empty, error, and populated render paths as well as the default populated view.

## Sidebar Icon Reference

- Use the supplied Source BlendR sidebar image as the visual reference for icon shape, sizing, stroke weight, spacing, and active-state treatment.
- Replace the current text glyphs with consistent outline icons using this mapping:

| Destination | Required icon |
|---|---|
| Overview | Four-square grid/dashboard icon |
| Imports | Document/file icon with a folded corner |
| Discovery | Compass icon inside a circle |
| Catalog | Archive/storage box icon |
| Vendors | Storefront/shop icon |
| Settings | Gear/cog icon |

- Keep all icons visually consistent: small outline icons, uniform dimensions, matching stroke weight, and aligned to the same left edge.
- Inactive icons and labels use the sidebar's neutral dark-gray treatment.
- The active destination uses the reference image's warm orange accent for both icon and label, with a subtle light-gray row background.
- Preserve the active route's left-side accent indicator shown in the reference.
- Icons are decorative when paired with visible navigation labels and therefore must use `aria-hidden="true"`; the link text provides the accessible name.
- Do not use Unicode characters as the final icon implementation.

## Table Baseline

When a plan says to follow the Discovery table format, use the revised Discovery table as the shared baseline:

- A clear table card with consistent header and row spacing.
- Optional leading selection and image columns where the workflow needs them.
- Search and filters above the table.
- A labeled text action in the final column.
- Pagination below the rows, including the current range and page controls.
- Responsive overflow behavior that does not clip actions or hide data.
- Explicit loading, empty, error, and no-results states in the table region rather than demo-state controls.

## Shared Requirements Revision — 2026-08-12

### Approved Table Families

- Every data table must use one of two approved formats; a page must not introduce a third table pattern without a documented exception.
- Use the `Search Table` format for datasets users search, filter, paginate, select, or edit, following `/app/discovery`.
- Use the `View Table` format for compact operational summaries users primarily scan and open, following `/app/imports`.

| Table family | Use when | Required structure | Approved reference |
|---|---|---|---|
| Search Table | Users need search, filters, pagination, selection, or data editing. | Structured search/filter toolbar, results table, labeled actions, result range, pagination, responsive overflow, and explicit data states. | `/app/discovery` |
| View Table | Users primarily scan a bounded operational summary and open a row. | Compact card header, concise columns, task-specific status, labeled row action, responsive overflow, and a route to the complete dataset when the table is intentionally limited. | `/app/imports` |

### Entry-Path Breadcrumbs

- Breadcrumbs on a destination page must reflect the in-app navigation path used to reach that page when the entry path is known.
- Example: selecting `Job Details` from `/app/imports` produces `Workspace > Imports > Job Details`; it must not insert `Jobs` merely because `/app/imports/jobs/:jobID` is nested under the jobs route.
- Direct visits, refreshed pages, shared URLs, and external entry points have no reliable prior in-app path. These cases must use the destination's canonical breadcrumb hierarchy.
- Entry-path context must be carried explicitly in navigation state or a validated return-path query contract; browser history must not be read as the sole source of truth.
- The current page remains non-interactive with `aria-current="page"`; every displayed ancestor must link to the route represented by that entry path.
- Entry-path labels and destinations must be allowlisted so arbitrary URLs cannot be injected into breadcrumbs.

### Revision Acceptance Criteria

- Every affected table identifies itself as either Search Table or View Table in its page plan.
- Navigating through an in-app row action produces breadcrumbs matching the actual entry path.
- Refreshing or directly opening a dynamic URL produces a stable canonical breadcrumb rather than a broken or invented history trail.
- Breadcrumb context never exposes cross-workspace routes or accepts an unvalidated external return destination.

## Page Plans

| Route | Plan |
|---|---|
| `/app` | [`01-overview.md`](01-overview.md) |
| `/app/imports` | [`02-imports.md`](02-imports.md) |
| `/app/imports/pdf` | [`03-pdf-import.md`](03-pdf-import.md) |
| `/app/imports/website` | [`04-website-import.md`](04-website-import.md) |
| `/app/imports/jobs/:importID` | [`05-import-job-details.md`](05-import-job-details.md) |
| `/app/imports/jobs` | [`13-import-jobs.md`](13-import-jobs.md) |
| `/app/discovery` | [`06-discovery.md`](06-discovery.md) |
| `/app/catalog` | [`07-catalogs.md`](07-catalogs.md) |
| `/app/catalog/:catalogID` | [`08-catalog-details.md`](08-catalog-details.md) |
| `/app/catalog/new` | [`09-new-catalog.md`](09-new-catalog.md) |
| `/app/vendors` | [`10-vendors.md`](10-vendors.md) |
| `/app/vendors/:vendorID` | [`11-vendor-details.md`](11-vendor-details.md) |
| `/app/settings` | [`12-settings.md`](12-settings.md) |
| `/app/settings/ai` | [`14-ai-settings.md`](14-ai-settings.md) |

## Cross-Page Delivery Order

1. Establish the shared shell, reference-image icon mapping, linked breadcrumbs, and revised table baseline.
1. Update Discovery because Catalog and Vendors use its table pattern.
1. Update the Catalog information architecture from individual items to catalog collections.
1. Update import workflows and move the category tree to job details.
1. Update Vendors and Vendor Details.
1. Add the Workspace Settings destination and route.

## Global Validation

- All planned routes use the shared sidebar template, the reference-image icon mapping, and the correct active navigation state.
- No page displays generic system-status UI or demo-state controls.
- Breadcrumb ancestor links navigate without losing the workspace context.
- Table search, filter, page-size, pagination, and row actions are keyboard operable and screen-reader labeled.
- Empty data, failed requests, loading, and filtered-to-zero results have distinct user-facing states.
- Existing import job status, item status, validation errors, and other task-specific operational feedback are not removed under the system-status requirement.

## Implementation Status

- Implementation date: `2026-08-10`
- Overview was implemented and explicitly approved before bulk work began.
- The remaining eleven page plans are implemented and marked `implemented_awaiting_bulk_review` in their individual Completion Scope sections.
- The catalog collection, catalog membership, workspace regional settings, branding URL, and workspace membership contracts require migration `20260810000100_catalogs_workspace_settings`.
- Each page plan records completed, deferred, discarded, conflict, effect, suggestion, and verification details.

## Runtime Validation Update

- Validation date: `2026-08-10`
- Applied migration `20260810000100_catalogs_workspace_settings` successfully to the local PostgreSQL development database.
- Restarted the development app with local development authentication and the documented local service environment.
- All fourteen tested static and dynamic routes returned HTTP `200`; this included real job, discovery-session, and vendor IDs.
- Interactive browser and visual validation remains pending because no browser backend was connected to the session.

## Planning Revision — 2026-08-12

- Added new approved change requests for Imports, Website Import, Import Jobs, Job Details, Discovery, Catalogs, Catalog Details, Vendors, Vendor Details, and AI Provider Settings.
- Added dedicated plans for `/app/imports/jobs` and `/app/settings/ai` so each independently changing page retains its own decisions and acceptance criteria.
- Status of the 2026-08-12 revision: `planned_not_implemented`.
- No application code was changed as part of this planning revision.
- Exact visual matching remains dependent on the missing Category Tree and search/filter reference images identified as `place image` in the request.

## Dead-Control Audit Method

- Audit date: 2026-08-09.
- Evidence: static trace of each route's rendered links, buttons, form handlers, client state, API calls, and destination routes. Interactive browser verification was unavailable during this audit.
- `Dead` means a control accepts interaction but has no handler, navigation, submission, or meaningful state change.
- `Simulated` means a control changes prototype UI or shows success without completing the represented operation.
- `Misdirected` means a control navigates, but not to the record or workflow promised by its label.
- `Incomplete` means part of the behavior works, but required state, persistence, or context is lost.
- Intentionally disabled actions with a valid enabling condition are not dead.
- Each page plan includes its own findings and proposed fixes. Fixes must be verified interactively when implementation begins.

## Dead-Control Summary

| Route | Audit result |
|---|---|
| `/app` | One dead permission-request button. |
| `/app/imports` | Two dead buttons and a fallback row action that can be misdirected. |
| `/app/imports/pdf` | No fully inert primary action; several prototype-only or incomplete controls. |
| `/app/imports/website` | Two dead category-selection buttons in a section already planned for removal. |
| `/app/imports/jobs/:importID` | No dead task buttons found. |
| `/app/discovery` | Multiple dead filters and bulk actions, a simulated import, non-persistent drawer actions, inert selection, and non-interactive pagination. |
| `/app/catalog` | No inert action button found; fallback row links self-loop and selection has no consumer. |
| `/app/catalog/:catalogID` | No dead task buttons found in the current item-detail implementation. |
| `/app/catalog/new` | No dead form buttons found in the current item-creation implementation. |
| `/app/vendors` | Five dead demo-state buttons, three anchors without destinations, and misdirected fallback row actions. |
| `/app/vendors/:vendorID` | No dead task buttons found. |
| `/app/settings` | The Workspace Settings card is an inert action surface. |

## Decision Table Rules

- Every unresolved product or implementation choice must appear in a table with a stable decision-group ID.
- Each option row describes one atomic course of action and its approval ramifications.
- Approve no more than one option in a decision group.
- Use Defer to postpone an option and Discard to reject it.
- Leave all choices unchecked when the decision remains pending.
- Previously selected combined actions require reapproval after being split because the earlier selection does not identify the intended branch.
