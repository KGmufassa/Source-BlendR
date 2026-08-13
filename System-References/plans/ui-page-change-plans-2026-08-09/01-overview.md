# Overview Page Change Plan

## Route

- `/app`

## Goal

- Expand the overview into a more useful operational dashboard with additional Needs Analytics cards.

## Proposed Changes

- Apply all shared shell, sidebar icon, system-status removal, and linked-breadcrumb requirements in [`README.md`](README.md).
- Remove the `System status: Operational` line from the page header.
- Add a Needs Analytics section containing multiple summary cards.
- Keep or replace the current Active Jobs, Discovery Queue, Catalog Health, and Provider Settings areas according to the approved dashboard-composition decision.
- Make each analytics card route to the relevant filtered workspace when a meaningful destination exists.

## Needs Analytics Definition

- The exact card set and formulas require product confirmation before implementation.
- Recommended initial measures are items needing review, products missing required data, products missing images, vendor records needing attention, and failed or stalled imports.
- Every card must show a label, numeric value, concise explanation, and data freshness or scope when ambiguity is possible.
- Values must come from workspace-scoped data and must not be hard-coded prototype counts.
- Zero values must remain useful and provide a clear next action rather than looking unavailable.

## Analytics Card Suggestions

| Priority | Suggested card | Metric definition | Proposed action or destination | Benefit | Approval | Defer | Discard |
|---|---|---|---|---|---|---|---|
| High | Items Awaiting Review | Count of newly discovered or updated products and services that still require a review decision. | Open `/app/discovery` filtered to review-required items. | Surfaces the primary work queue and helps prevent imported records from remaining unprocessed. | [x] | [ ] | [ ] |
| High | Failed or Stalled Imports | Count of failed jobs plus queued or processing jobs that have exceeded the approved duration threshold. | Open `/app/imports/jobs` filtered to failed and stalled jobs. | Makes ingestion failures visible early and provides a direct recovery path. | [x] | [ ] | [ ] |
| High | Missing Required Data | Count of products and services missing one or more required fields, such as name, SKU/reference, category, vendor, or price when applicable. | Open `/app/discovery` filtered to incomplete records. | Helps users improve data quality before records are added to catalogs or price sheets. | [ ] | [x] | [ ] |
| High | Missing Images | Count of product records without a usable primary image or whose image failed validation. | Open `/app/discovery` filtered to records needing images. | Identifies records that are not presentation-ready for catalogs and customer-facing outputs. | [ ] | [x] | [ ] |
| Medium | Vendor Attention Needed | Count of vendors that are inactive, incomplete, have invalid website details, or have recent import failures. | Open `/app/vendors` filtered to vendors needing attention. | Groups supplier-related problems into one actionable operational signal. | [ ] | [x] | [ ] |
| Medium | Unassigned Vendor | Count of imported products and services that do not have an associated vendor. | Open `/app/discovery` filtered to unassigned-vendor records. | Improves source traceability and enables vendor-level filtering, reporting, and re-import workflows. | [ ] | [x] | [ ] |
| Medium | Potential Duplicates | Count of unresolved records flagged as possible duplicates by SKU/reference, vendor, normalized name, or source identity. | Open `/app/discovery` filtered to duplicate candidates. | Reduces duplicate catalog entries and conflicting product information. | [x] | [ ] | [ ] |
| Medium | Catalogs Needing Attention | Count of catalogs with no members, incomplete required metadata, missing images, or unresolved member validation issues. | Open `/app/catalog` filtered to catalogs needing attention. | Helps users identify catalogs that are not ready to publish, export, or use for price sheets. | [ ] | [x] | [ ] |
| Low | Import Activity | Count of completed imports during an approved period, with the change from the preceding equivalent period. | Open `/app/imports/jobs` filtered to the displayed date range. | Gives a concise throughput signal without duplicating the Active Jobs card. | [ ] | [x] | [ ] |
| Low | Recently Resolved | Count of records successfully reviewed, corrected, or promoted during an approved period. | Open `/app/discovery` filtered to recently resolved records when supported. | Shows progress and provides positive context alongside exception-focused cards. | [x] | [ ] | [ ] |

## Recommended Initial Set

- Approve no more than four to six cards for the first release to keep the overview scannable.
- Recommended first-release cards are Items Awaiting Review, Failed or Stalled Imports, Missing Required Data, Missing Images, Vendor Attention Needed, and Potential Duplicates.
- Treat Import Activity and Recently Resolved as optional trend cards after reliable event timestamps and comparison periods are available.
- Approval, Defer, and Discard are mutually exclusive; select no more than one decision per row.
- An approval checkbox applies to the complete card definition in its row, including its metric and destination. Record any requested definition change next to the table before implementation.
- A defer checkbox retains the suggestion for later consideration without including it in the current implementation scope.
- A discard checkbox rejects the suggestion and removes it from planned consideration.

## Acceptance Criteria

- No generic system-status label or Operational pill appears.
- At least the approved set of Needs Analytics cards is visible and populated from real workspace data.
- Card counts reconcile with their destination lists or documented query rules.
- Actionable cards are keyboard-accessible links with descriptive names.
- Loading, empty, and error behavior does not cause the dashboard grid to jump or conceal other cards.

## Open Decision Selection

- For each decision group, approve no more than one option.
- Use Defer to postpone a choice and Discard to reject an option.

| Decision group | Option | Clear action | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|---|
| `DEC-OV-001` | A | Implement the cards approved in Analytics Card Suggestions using the written definitions and destinations; define stalled as more than 30 minutes, use a rolling 30-day trend window, and order cards by priority then table order. | Finalizes calculation and ordering rules but requires later approval to change them. | [x] | [ ] | [ ] |
| `DEC-OV-002` | A | Keep all four existing dashboard sections and add approved analytics cards below them. | Preserves current information but creates a longer dashboard. | [x] | [ ] | [ ] |
| `DEC-OV-002` | B | Replace Discovery Queue and Catalog Health with approved analytics cards while retaining Active Jobs and Provider Settings. | Produces a shorter dashboard but removes two existing summaries. | [ ] | [x] | [ ] |

## Dead-Button Report

- `Request Access` is dead for users who cannot manage providers: it is a button with no handler, request submission, or destination.
- The primary `Open catalog`, `Start import`, `View active jobs`, and authorized `Open provider settings` controls have valid routes and are not dead.
- The `Workspace` breadcrumb ancestor is inert text and is covered by the shared linked-breadcrumb change.

## Proposed Dead-Button Fixes

- Wire `Request Access` to a real access-request workflow with recipient, confirmation, failure feedback, and duplicate-request handling.
- If no access-request workflow exists, remove the button and show administrator-contact guidance without button styling.
- When adding Needs Analytics cards, render a card as a link only when its destination and filter contract are implemented; otherwise use non-interactive summary-card styling.

## Proposed Fix Selection

- Select Approve, Defer, or Discard for each proposed fix; do not select more than one choice in the same row.
- Leave all choices unchecked when a decision is still pending.
- `FIX-OV-001` and `FIX-OV-002` are alternatives; approve no more than one.

| ID | Proposed fix | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `FIX-OV-001` | Implement a real `Request Access` workflow with recipient routing, confirmation, failure feedback, and duplicate-request handling. | Adds request storage, notifications, permissions, and ongoing workflow maintenance. | [x] | [ ] | [ ] |
| `FIX-OV-002` | Remove `Request Access` and show non-interactive administrator-contact guidance when no request workflow is available. | Reduces complexity, but users must contact an administrator outside the app. | [ ] | [x] | [ ] |
| `FIX-OV-003` | Make a Needs Analytics card clickable only when its destination and filter contract are implemented; otherwise render it as a non-interactive summary card. | Prevents dead navigation, but some cards remain informational until their filtered destinations exist. | [ ] | [x] | [ ] |

## Completion Scope

- Completion date: `2026-08-10`
- Status: `implemented_approved`
- Approval recorded: `2026-08-10`
- Scope was limited to `/app`, its approved Overview behavior, and shared shell elements required to render the page consistently. No other page-specific plan was implemented.

### Completed

| Planned change | Completion record |
|---|---|
| Shared sidebar icons | Replaced the route glyphs with accessible SVG outline icons matching the supplied navigation reference for Overview, Imports, Discovery, Catalog, Vendors, and Settings. |
| Remove system status | Removed the generic `System status: Operational` content from the Overview header. |
| Linked header routes | Changed the `Workspace` breadcrumb ancestor into a keyboard-accessible link to `/app` and marked Overview as the current location. |
| Needs Analytics | Added the four approved cards: Items Awaiting Review, Failed or Stalled Imports, Potential Duplicates, and Recently Resolved. Counts are calculated from workspace-scoped records rather than prototype values. |
| Analytics section label | Renamed the rendered section heading from `Needs Analytics` to `Analytics` following the post-implementation review. |
| Analytics definitions | Applied the approved 30-minute stalled-job threshold, rolling 30-day resolved window, priority ordering, zero states, scope labels, and filtered destination URLs. |
| Dashboard composition | Kept Active Jobs, Discovery Queue, Catalog Health, and Provider Settings, then added Needs Analytics below them as approved in `DEC-OV-002` option A. |
| `Request Access` | Replaced the dead button with a permission-checked request action that persists an administrator-targeted audit record and provides pending, success, duplicate, and error feedback. |
| Regression coverage | Added checks for the approved analytics, system-status removal, access-request persistence and duplicate handling, and SVG sidebar icons. |

### Deferred

| Deferred item | Reason and remaining work |
|---|---|
| Six unapproved analytics cards | Missing Required Data, Missing Images, Vendor Attention Needed, Unassigned Vendor, Catalogs Needing Attention, and Import Activity remain deferred according to their selected decisions. |
| Destination-side filter handling | The approved cards now publish explicit query contracts, but the Discovery and Import Jobs pages must consume those filters when their page plans are implemented. Until then, links reach the correct page without guaranteeing a pre-filtered list. |
| Administrator request inbox and external delivery | Access requests are durably stored with the administrator recipient role, but a dedicated administrator inbox, email delivery, approval action, and resolution lifecycle do not yet exist. |
| Non-interactive analytics fallback | `FIX-OV-003` remains deferred. All four approved cards are linked because their destination contracts were approved in `DEC-OV-001`; destination-page filter support remains the limitation described above. |

### Discarded

- None. No Overview option or proposed fix was marked Discard.

### Conflict Resolution

| Conflict | Resolution |
|---|---|
| Approved analytics destinations in `DEC-OV-001` versus deferred destination-readiness protection in `FIX-OV-003` | Preserved the approved card links and query parameters. Recorded destination-side filtering as deferred work instead of silently treating it as complete. |
| First-page-only implementation versus shared icon requirements | Updated the shared sidebar icon component because the Overview cannot use the approved navigation template in isolation. Other pages received only this shared shell asset change; their page-specific plans remain untouched. |

### Page Effects

| Area | Pros | Cons or possible effects |
|---|---|---|
| Operational visibility | Users can see four actionable, real workspace counts from the landing page. | The added section makes the dashboard longer and adds workspace-scoped database queries during page rendering. |
| Navigation | Breadcrumbs and analytics cards now provide clearer keyboard-accessible paths. | Filter parameters will not narrow destination lists until those page plans add query handling. |
| Provider access | Unauthorized users can submit once and receive clear status feedback instead of encountering a dead button. | Stored requests do not yet appear in a dedicated admin queue or send an external notification. |
| Sidebar | Recognizable SVG icons improve consistency with the reference and avoid font-dependent symbols. | The shared icon replacement is visible on every route even though the remaining page plans have not been implemented. |

### Suggestions

- Add query-parameter handling to Discovery and Import Jobs when those pages are updated so every analytics count reconciles with its destination list.
- Add an administrator request queue with approve, deny, resolution status, and optional email or in-app delivery for provider-access requests.
- Replace any remaining display-only dashboard fallbacks in Active Jobs and Catalog Health with documented workspace-scoped formulas.
- Consider a single aggregated dashboard query or short-lived cache if workspace volume makes the additional analytics queries noticeable.
- Add a last-refreshed indicator or manual refresh action if users need to compare dashboard counts during active imports.

### Verification Record

| Check | Result |
|---|---|
| Overview, app-shell, and Prisma schema tests | Passed: `6/6`. |
| Web TypeScript check | Passed. |
| Web production build | Passed, including the new `/api/access-requests` route. |
| Diff whitespace check | Passed. |
| Broader live-pages test | One unrelated existing assertion still expects the text `Category filter` on another planned page; no Overview assertion failed. |

### Runtime QA Update

- Migrated local runtime check: passed with HTTP `200` on `/app`.
- Interactive browser and visual QA: pending because no browser backend was connected to this session.
