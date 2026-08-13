# Stitch Source BlendR Stage 4 Prototype Revision Summary

Revision ID: `REVISION-STITCH-PROTOTYPE-UI-2026-08-06`

Status: `awaiting_user_review`

Scope: Planning-only revision summary for using the extracted `Source BlendR Stage 4 Prototype` files as the visual source of truth for the current app while preserving existing application code, routes, APIs, scraper behavior, PDF import behavior, AI settings behavior, and runtime data flow.

---

## Purpose

This revision defines how the current Source BlendR app should absorb the Stage 4 Stitch prototype safely.

The working rule is:

- The extracted Stage 4 Stitch files are the visual reference.
- Stage 4 blueprint files remain the canonical product, route, and interaction contract.
- The current Next.js app remains the functional implementation contract.
- Stage 5 revised tickets should be created only after this summary is approved.

The prototype should not be pasted directly into the app. The correct implementation approach is to translate the extracted `code.html` and `screen.png` references into app-owned CSS tokens, shared React components, and route-level UI updates that preserve existing behavior.

---

## Local Prototype Source Package

Use this folder as the local visual reference package:

- `System-References/stitch_source_blendr_stage_4_prototype/`

It contains the extracted Stage 4 Stitch pages:

| Stage 4 Screen | Prototype Folder | Visual Reference | Code Reference |
| --- | --- | --- | --- |
| Workspace Overview | `workspace_overview_source_blendr` | `screen.png` | `code.html` |
| Imports Workspace | `imports_workspace_source_blendr` | `screen.png` | `code.html` |
| Website Import Wizard | `website_import_wizard_source_blendr` | `screen.png` | `code.html` |
| PDF Import | `pdf_import_source_blendr` | `screen.png` | `code.html` |
| Import Job Detail | `import_job_detail_source_blendr` | `screen.png` | `code.html` |
| Discovery Session | `discovery_session_source_blendr` | `screen.png` | `code.html` |
| Catalog | `catalog_source_blendr` | `screen.png` | `code.html` |
| Catalog Item Form | `new_catalog_item_source_blendr` | `screen.png` | `code.html` |
| Vendors | `vendors_source_blendr` | `screen.png` | `code.html` |
| AI Provider Settings | `ai_provider_settings_source_blendr` | `screen.png` | `code.html` |

Design system reference:

- `System-References/stitch_source_blendr_stage_4_prototype/source_blendr_stage_4_design_system/DESIGN.md`

The screenshot files are full page visual references. They should be used for visual matching, layout review, and future visual QA baselines.

---

## Stage 4 Source Of Truth

Canonical Stage 4 references:

- `Build-Plans/Stage-4/03-screen-system.json`
- `Build-Plans/Stage-4/04-feature-behaviors.json`
- `Build-Plans/Stage-4/05-state-transition-map.json`
- `Build-Plans/Stage-4/07-ui-blueprint-specification.json`
- `Build-Plans/Stage-4/08-design-system-foundation.json`
- `Build-Plans/Stage-4/09-complete-app-blueprint.md`

Stage 4 Stitch project references:

- Stitch project: `9248820866477955856`
- Stitch design system asset: `9645362222514515324`
- Stage 4 status: prototype mapping complete, Stitch-added component approval still pending
- Stage 4 recorded pending Stitch-added components: `108`

Current app implementation references:

- `apps/web/app/workspace-routes.ts`
- `apps/web/app/workspace-shell.tsx`
- `apps/web/app/globals.css`
- `apps/web/app/app/page-actions.tsx`
- `apps/web/app/app/imports/website/page.tsx`
- `apps/web/app/app/imports/jobs/[jobId]/category-job-selector.tsx`
- `apps/web/app/api/imports/jobs/[jobId]/categories/route.ts`

---

## Current Finding

The current app already has real routes, API handlers, worker-backed website imports, PDF imports, AI provider settings, workspace scoping, import job recovery, database models, and validation tests.

The extracted Stage 4 Stitch prototype provides high-value visual direction and proposed interaction details, but it is still a static prototype. Its `code.html` files include static HTML, Tailwind CDN usage, placeholder links, inline demo JavaScript, demo state toggles, and sample data. Those details are useful for visual translation, but they are not production implementation contracts.

Stage 4 explicitly says Stitch MCP prototype evidence is Stage-4-local and does not change the Stage 5 handoff contract. That means the revised implementation plan must treat Stitch additions as approval candidates, not automatic requirements.

---

## Non-Negotiable Preservation Rules

Any approved implementation must preserve:

- Existing route paths from the Stage 4 route inventory.
- Existing `workspace-routes.ts` route registry behavior.
- Existing scraper repair work and worker contracts.
- Existing website import API contract.
- Existing PDF import API contract.
- Existing AI provider settings and provider health behavior.
- Existing import job retry/cancel behavior.
- Existing discovery session candidate review behavior.
- Existing workspace scoping and security boundaries.
- Existing database schema unless a separately approved feature requires a schema change.

Route labels may change for visual/product clarity, but route paths should remain stable unless a specific route migration ticket is approved.

---

## Stage 4 Canonical Route Inventory

These are the route paths the revision should preserve as the primary implementation surface:

| Stage 4 Screen | Canonical Route | Prototype Folder | Implementation Recommendation |
| --- | --- | --- | --- |
| Workspace Overview | `/app` | `workspace_overview_source_blendr` | Restyle using the extracted overview screen. |
| Imports Workspace | `/app/imports` | `imports_workspace_source_blendr` | Restyle using the extracted imports workspace. |
| Website Import Wizard | `/app/imports/website` | `website_import_wizard_source_blendr` | Upgrade flow to show detected category tree. |
| PDF Import | `/app/imports/pdf` | `pdf_import_source_blendr` | Restyle inside the same import system. |
| Import Jobs | `/app/imports/jobs` | n/a | Preserve as job list route; visual style should align with Imports Workspace. |
| Import Job Detail | `/app/imports/jobs/:jobId` | `import_job_detail_source_blendr` | Preserve recovery, status, and discovery handoff. |
| Discovery Session | `/app/discovery/:sessionId` | `discovery_session_source_blendr` | Restyle as the extracted discovery review workspace. |
| Catalog | `/app/catalog` | `catalog_source_blendr` | Restyle using extracted catalog screen. |
| Catalog Item Detail | `/app/catalog/:itemId` | n/a | Preserve route and item detail behavior. |
| Catalog Item Form | `/app/catalog/new` | `new_catalog_item_source_blendr` | Restyle using extracted new catalog item screen. |
| Vendors | `/app/vendors` | `vendors_source_blendr` | Restyle using extracted vendors screen. |
| Vendor Detail | `/app/vendors/:vendorId` | n/a | Preserve route and vendor detail behavior. |
| New Vendor | `/app/vendors/new` | n/a | Preserve route and create behavior; visual style should align with Vendors. |
| Settings | `/app/settings` | n/a | Preserve route. |
| AI Provider Settings | `/app/settings/ai` | `ai_provider_settings_source_blendr` | Restyle while preserving AI settings behavior. |

---

## Extracted Prototype Route And Component Mapping

This section maps the extracted Stitch prototype folders to current app routes and current behavior-owning components.

The rebuild rule is:

- Stitch `screen.png` and `code.html` define the visual layout target.
- Current app routes and components define the functional behavior target.
- If a Stitch component has no current route or current behavior owner, it must be approved, deferred, or discarded before it becomes implementation scope.

| Prototype Folder | Current Route Match | Current Behavior Owner | Prototype Layout/Component Regions | Rebuild Handling |
| --- | --- | --- | --- | --- |
| `workspace_overview_source_blendr` | `/app` | `apps/web/app/app/page.tsx`, `workspace-shell.tsx`, `page-actions.tsx` | Fixed sidebar, mobile header, breadcrumb/header, quick actions, active jobs table, catalog health, provider/status summary, discovery/import status panels | Rebuild `/app` layout from Stitch regions while keeping real workspace counts/jobs/provider checks. |
| `imports_workspace_source_blendr` | `/app/imports` and style reference for `/app/imports/jobs` | `apps/web/app/app/imports/page.tsx`, `apps/web/app/app/imports/jobs/page.tsx` | Fixed sidebar, topbar, method chooser cards, operational header, recent jobs table, status badges, last sync text | Rebuild imports layout and job-list route around current real import job query and existing route links. |
| `website_import_wizard_source_blendr` | `/app/imports/website` | `apps/web/app/app/imports/website/page.tsx`, `apps/web/app/app/runtime-forms.tsx`, `apps/web/app/app/imports/jobs/[jobId]/category-job-selector.tsx`, `apps/web/app/api/imports/jobs/[jobId]/categories/route.ts` | Wizard step 1 source setup, step 2 detected category tree, selected categories, processing/success handoff, report download link | Rebuild visual wizard around existing `WebsiteImportForm` and category API; report download remains decision-gated. |
| `pdf_import_source_blendr` | `/app/imports/pdf` | `apps/web/app/app/imports/pdf/page.tsx`, `apps/web/app/app/runtime-forms.tsx`, `apps/web/app/api/imports/pdf/route.ts` | Upload drop zone, selected/loading/error/success states, OCR/AI context, job result handoff | Rebuild visual state shell around existing `PdfImportForm`; prototype state toggles remain non-production. |
| `import_job_detail_source_blendr` | `/app/imports/jobs/:jobId` | `apps/web/app/app/imports/jobs/[jobId]/page.tsx`, `job-actions.tsx`, `category-job-selector.tsx`, `apps/web/app/api/imports/jobs/[jobId]/route.ts` | Job status card, progress/timeline, source/job metadata, retry/cancel actions, discovery handoff, logs/events | Rebuild job detail layout while preserving current retry/cancel/category/discovery behavior. |
| `discovery_session_source_blendr` | `/app/discovery/:sessionId` and style reference for `/app/discovery` | `apps/web/app/app/discovery/[sessionId]/page.tsx`, `discovery-client.tsx`, `apps/web/app/api/discovery-sessions/[sessionId]/*` | Candidate table, filter pills, bulk action toolbar, preview drawer, candidate edit/resolve form, AI inference details, toast | Rebuild discovery workspace around current candidate actions; drawer and AI details remain backed by candidate payload/action APIs. |
| `catalog_source_blendr` | `/app/catalog` and style reference for `/app/catalog/:itemId` | `apps/web/app/app/catalog/page.tsx`, `catalog-client.tsx`, `apps/web/app/api/catalog-items/route.ts` | Search toolbar, category/type filters, table rows, row navigation, pagination, loading/empty/error states, mobile floating create button | Rebuild catalog layout around current query/filter/navigation; pagination and mobile FAB remain decision-gated unless backed. |
| `new_catalog_item_source_blendr` | `/app/catalog/new` | `apps/web/app/app/catalog/new/page.tsx`, `apps/web/app/app/runtime-forms.tsx`, `apps/web/app/api/catalog-items/route.ts` | Product/service segmented control, grouped form sections, save/cancel action bar | Rebuild form layout around current `CatalogItemForm`; avoid unapproved taxonomy/schema expansion. |
| `vendors_source_blendr` | `/app/vendors` and style reference for `/app/vendors/new`, `/app/vendors/:vendorId` | `apps/web/app/app/vendors/page.tsx`, `vendors/new/page.tsx`, `vendors/[vendorId]/page.tsx`, `apps/web/app/api/vendors/*` | Vendor table, live/loading/empty/error/denied sections, new vendor CTA, vendor row navigation, footer links | Rebuild vendor page layout while preserving current vendor routes; state toggles/footer links remain decision-gated. |
| `ai_provider_settings_source_blendr` | `/app/settings/ai` and style reference for `/app/settings` | `apps/web/app/app/settings/ai/page.tsx`, `ai-settings-client.tsx`, `apps/web/app/api/ai-settings/providers/*` | Provider cards/list, capability routing table, save routing, health check, credential error state, documentation/support links | Rebuild AI settings layout around current provider APIs; support/docs links remain decision-gated. |

---

## Existing Routes Without Direct Prototype Screens

These current routes exist in the app but do not have a dedicated extracted Stitch screen. They should either inherit visual patterns from a related prototype screen or be explicitly approved for a new Stitch-derived layout.

| Current Route | Existing App File | Related Prototype Visual Source | Proposed Handling | Recommendation Status |
| --- | --- | --- | --- | --- |
| `/app/imports/jobs` | `apps/web/app/app/imports/jobs/page.tsx` | `imports_workspace_source_blendr`, `import_job_detail_source_blendr` | Keep route; rebuild as job-list variant of Imports Workspace with Stitch table/status cards. | `recommended_keep` |
| `/app/discovery` | `apps/web/app/app/discovery/page.tsx` | `discovery_session_source_blendr` | Keep route; rebuild as discovery-session list using same review workspace visual language. | `recommended_keep` |
| `/app/catalog/:itemId` | `apps/web/app/app/catalog/[itemId]/page.tsx` | `catalog_source_blendr`, `new_catalog_item_source_blendr` | Keep route; derive detail layout from catalog table/form visuals. | `recommended_keep` |
| `/app/vendors/:vendorId` | `apps/web/app/app/vendors/[vendorId]/page.tsx` | `vendors_source_blendr` | Keep route; derive detail layout from vendors table/card visuals. | `recommended_keep` |
| `/app/vendors/new` | `apps/web/app/app/vendors/new/page.tsx` | `vendors_source_blendr`, `new_catalog_item_source_blendr` | Keep route; derive create form from vendors page and catalog form visual grammar. | `recommended_keep` |
| `/app/settings` | `apps/web/app/app/settings/page.tsx` | `ai_provider_settings_source_blendr` | Keep route; either simple settings hub or redirect/CTA to AI Provider Settings. | `recommended_keep` |

---

## Prototype Components And Routes Awaiting Role Decision

Decision update: visual-layout-only items are approved. Items requiring new backend state, new APIs, new routes, or unbacked external/internal destinations are deferred. Demo-only prototype state switchers are discarded and should not ship as production controls.

These are Stitch prototype elements, routes, or components that do not have a clearly approved production role yet. Mark exactly one decision column with `x` before they are added to implementation tickets.

| Prototype Item | Prototype Source | Current Route/Component Match | Proposed Role If Approved | Recommendation Status | Approved | Defer | Discard |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Dedicated `/app/overview` link | `catalog_source_blendr`, `vendors_source_blendr`, `import_job_detail_source_blendr` | Current route is `/app`; no `/app/overview` route exists | Add redirect/alias only if a route alias is desired | `discard_recommended` | [ ] | [x] | [ ] |
| Topbar notification button | Multiple prototype screens | No current notification data source or route | Add only after notification model/source exists | `defer_recommended` | [ ] | [x] | [ ] |
| Topbar help button | Multiple prototype screens | No current help/docs route | Add only after help destination is approved | `defer_recommended` | [ ] | [x] | [ ] |
| User/workspace profile block with avatar/persona | Multiple prototype sidebars | Current shell has generic workspace footer | Use as visual-only workspace footer if no user settings route is added | `awaiting_approval` | [x] | [ ] | [ ] |
| Last sync text | `imports_workspace_source_blendr` | Import job timestamps exist; no global sync model | Derive from latest import job timestamp if useful | `awaiting_approval` | [x] | [ ] | [ ] |
| Import workspace operational status header | `imports_workspace_source_blendr` | Worker/queue health exists partially through runtime health | Use current job/worker status only where backed | `recommended_keep` | [x] | [ ] | [ ] |
| Website wizard processing step simulation | `website_import_wizard_source_blendr` | Current form redirects to job after queueing | Replace simulated step with real queued/running/completed job states | `recommended_keep_with_real_state` | [x] | [ ] | [ ] |
| Website selected categories summary | `website_import_wizard_source_blendr` | Category selector exists on completed job detail | Keep if using existing category API and no schema expansion | `recommended_keep` | [x] | [ ] | [ ] |
| Website Download Analysis Report PDF | `website_import_wizard_source_blendr` | No report generation route/API | Requires new report-generation feature and storage decision | `defer_recommended` | [ ] | [x] | [ ] |
| PDF demo state buttons: Empty/File Selected/Loading/Error/Success | `pdf_import_source_blendr` | Current upload form has pending/message states | Do not ship buttons; use states as visual QA examples only | `discard_recommended` | [ ] | [ ] | [x] |
| PDF success “View Job Results” placeholder link | `pdf_import_source_blendr` | Current upload redirects to real job detail | Keep only as real `/app/imports/jobs/:jobId` handoff | `recommended_keep_with_real_route` | [x] | [ ] | [ ] |
| Import job notifications/help topbar icons | `import_job_detail_source_blendr` | No backed notification/help routes | Same decision as global topbar buttons | `defer_recommended` | [ ] | [x] | [ ] |
| Import job event/log details | `import_job_detail_source_blendr` | Current `ImportJobEvent` records exist | Keep and render from real `events` only | `recommended_keep` | [x] | [ ] | [ ] |
| Discovery filter pills: All/New/Conflicts/Duplicates | `discovery_session_source_blendr` | Current status filter exists; duplicate state may not exist | Map only to current candidate states or add backend state later | `awaiting_approval` | [ ] | [x] | [ ] |
| Discovery candidate edit/resolve fields | `discovery_session_source_blendr` | Current preview drawer can save candidate fields | Keep if mapped to current candidate PATCH behavior | `recommended_keep` | [x] | [ ] | [ ] |
| Discovery toast notification | `discovery_session_source_blendr` | Current client status message exists | Keep as local component feedback, not global notification system | `recommended_keep` | [x] | [ ] | [ ] |
| Catalog pagination controls | `catalog_source_blendr` | Current catalog client filters in-memory list | Add only if backed by query pagination or local pagination state | `awaiting_approval` | [x] | [ ] | [ ] |
| Catalog loading/empty/error demo toggles | `catalog_source_blendr` | Current route has real empty state | Do not ship toggles; implement real states only | `discard_recommended` | [ ] | [ ] | [x] |
| Catalog mobile floating create button | `catalog_source_blendr` | Current primary New catalog item button exists | Optional mobile-only CTA; previously deferred | `defer_recommended` | [ ] | [x] | [ ] |
| Catalog row quick action icon | `catalog_source_blendr` | Current row has Open item link | Use accessible real link/button only | `awaiting_approval` | [x] | [ ] | [ ] |
| New Catalog Item category/taxonomy field | `new_catalog_item_source_blendr` | Current model has `type`, `tags`, `attributes`; form currently uses item type | Requires decision whether category is client-only, tags-based, or schema-backed | `awaiting_approval` | [ ] | [x] | [ ] |
| Vendor live/loading/empty/error/denied state switcher | `vendors_source_blendr` | Current real table/empty state exists | Do not ship demo switcher; implement real states only | `discard_recommended` | [ ] | [ ] | [x] |
| Vendor denied/request access state | `vendors_source_blendr` | Auth/workspace checks exist; no request-access flow | Add only if access request workflow is approved | `defer_recommended` | [ ] | [x] | [ ] |
| Vendor footer links: Privacy Policy, Operations Log, System Status | `vendors_source_blendr` | No matching routes in current app | Add only after real destinations exist | `defer_recommended` | [ ] | [x] | [ ] |
| AI provider credential error “Fix credentials” link | `ai_provider_settings_source_blendr` | Provider health can return credential/config errors; no dedicated fix route | Map to existing provider form/edit affordance if implemented | `awaiting_approval` | [x] | [ ] | [ ] |
| AI provider Edit buttons | `ai_provider_settings_source_blendr` | Current provider form can add/upsert provider by name | Add edit affordance only if backed by provider update flow | `awaiting_approval` | [x] | [ ] | [ ] |
| AI capability routing table | `ai_provider_settings_source_blendr` | Current default route select exists | Keep if mapped to current save-routing API | `recommended_keep` | [x] | [ ] | [ ] |
| AI documentation/support footer links | `ai_provider_settings_source_blendr` | No approved docs/support destination | Previously deferred; keep out unless approved | `defer_recommended` | [ ] | [x] | [ ] |

---

## Proposed Visual Direction From Extracted Stage 4 Prototype

Adopt the extracted Stage 4 Source BlendR design system globally:

- Warm off-white canvas.
- White/bordered surfaces.
- Graphite primary text.
- Muted secondary stone text.
- Restrained amber primary actions and active route markers.
- Explicit status badges.
- Visible focus rings.
- Compact data tables.
- Accessible drawers.
- Labeled forms.
- Persistent left sidebar.
- Compact topbar with breadcrumbs, search, notifications/help placeholders where approved.
- No decorative hero, marketing treatment, billing, analytics dashboards, chat assistants, roles, onboarding, or invented admin/team management.

The implementation should not import the prototype Tailwind CDN setup. Convert the design direction into the existing app CSS and component architecture.

---

## Proposed Core Changes Awaiting Summary Approval

### 1. Stage 4 Design System Translation

Translate `source_blendr_stage_4_design_system/DESIGN.md` into app-owned CSS variables and reusable components.

Expected implementation areas after ticket approval:

- `apps/web/app/globals.css`
- `apps/web/app/workspace-shell.tsx`
- `apps/web/app/app/page-actions.tsx`

Approval status: `recommended`

### 2. Shell And Navigation Restyle

Restyle the existing workspace shell using the extracted sidebar/topbar visuals while preserving route links from `workspace-routes.ts`.

Reference screens:

- `workspace_overview_source_blendr/screen.png`
- `imports_workspace_source_blendr/screen.png`
- `catalog_source_blendr/screen.png`
- `vendors_source_blendr/screen.png`
- `ai_provider_settings_source_blendr/screen.png`

Required decisions:

- Keep route paths stable.
- Keep visible labels as `Overview`, `Imports`, `Discovery`, `Catalog`, `Vendors`, and `Settings` unless explicitly changed.
- Do not add new nav items from older prototypes unless approved.

Approval status: `recommended`

### 3. Workspace Overview Restyle

Restyle `/app` using `workspace_overview_source_blendr`.

Recommended inclusions:

- Active jobs panel.
- Discovery queue panel.
- Catalog health panel.
- Provider settings summary panel.
- Primary actions for Open catalog and Start import.

Implementation guardrails:

- Use real workspace counts and job records.
- Preserve `/app/imports`, `/app/catalog`, and `/app/imports/jobs` links.
- Treat provider settings summary as permission-aware if the current app supports that state.

Approval status: `recommended`

### 4. Imports Workspace Restyle

Restyle `/app/imports` using `imports_workspace_source_blendr`.

Recommended inclusions:

- Website import entry point.
- PDF catalog entry point.
- Recent import jobs.
- Job status badges.
- Retry/open job affordances where backed by current APIs.

Implementation guardrails:

- Preserve Website Import and PDF Import routes.
- Preserve job detail links.
- Do not implement demo-only logs or placeholder actions unless backed by current functionality.

Approval status: `recommended`

### 5. Website Import Wizard Upgrade

Upgrade `/app/imports/website` using `website_import_wizard_source_blendr`.

Stage 4 already identifies the `detected category tree and selected categories` as a Website Import Wizard data source. The current backend already exposes discovered categories through the job category API.

Recommended wizard flow:

- Source setup: vendor and website URL.
- Analyze: create or attach to a website import job.
- Processing state: show queued/running/completed/error status.
- Detected Category Tree: render discovered categories once available.
- Category selection: queue selected categories as independent jobs.
- Handoff: link to import job detail and discovery session when available.

Existing API to reuse:

- `GET /api/imports/jobs/[jobId]/categories`
- `POST /api/imports/jobs/[jobId]/categories`

Implementation guardrails:

- Do not implement `Download Analysis Report (PDF)` unless separately approved.
- Do not create a second website import API.
- Preserve current idempotency and worker queue behavior.

Approval status: `recommended`

### 6. PDF Import Restyle

Restyle `/app/imports/pdf` using `pdf_import_source_blendr`.

Recommended inclusions:

- Empty/select file state.
- File selected state.
- Loading/OCR state.
- Error state.
- Success handoff to job results.
- Small AI/OCR context panel if backed by current metadata.

Implementation guardrails:

- Preserve current PDF upload route and API contract.
- Treat prototype state toggles as visual references only.
- Keep upload recovery accessible.

Approval status: `recommended`

### 7. Import Job Detail Restyle

Restyle `/app/imports/jobs/:jobId` using `import_job_detail_source_blendr`.

Recommended inclusions:

- Job status summary.
- Timeline/progress detail.
- Retry failed work.
- Cancel job.
- Open Discovery Session when session exists.

Implementation guardrails:

- Preserve retry/cancel behavior.
- Preserve workspace scoping.
- Do not hard-code demo job IDs such as `IMP-8922`.

Approval status: `recommended`

### 8. Discovery Session Restyle

Restyle `/app/discovery/:sessionId` using `discovery_session_source_blendr`.

Recommended inclusions:

- Candidate table.
- Status filters: all, new, conflicts, duplicates.
- Bulk actions: import selected, ignore, archive.
- Preview drawer.
- Candidate edit/resolve workflow.
- AI inference details if backed by current candidate payload.

Implementation guardrails:

- Preserve current candidate import/ignore/archive actions.
- Keep all AI output review-gated.
- Do not bypass deterministic validation.

Approval status: `recommended`

### 9. Catalog Restyle

Restyle `/app/catalog` using `catalog_source_blendr`.

Recommended inclusions:

- Search by SKU/name/category.
- Category filter.
- Type/status badges.
- Catalog table with row navigation.
- New catalog item action.
- Loading/empty/error visual states.

Implementation guardrails:

- Preserve `/app/catalog` label unless relabeling is separately approved.
- Preserve `/app/catalog/new`.
- Preserve `/app/catalog/:itemId`.
- Treat floating mobile create button as approval-required.

Approval status: `recommended_with_feature_decisions_needed`

### 10. Catalog Item Form Restyle

Restyle `/app/catalog/new` using `new_catalog_item_source_blendr`.

Recommended inclusions:

- Product/service segmented control where compatible with current item type model.
- Name, SKU, category/type, price/currency fields.
- Save and cancel actions.

Implementation guardrails:

- Preserve current catalog item create API contract.
- Do not add unbacked category taxonomy unless approved.
- Keep field-level validation.

Approval status: `recommended`

### 11. Vendors Restyle

Restyle `/app/vendors` using `vendors_source_blendr`.

Recommended inclusions:

- Vendor table.
- Last import status.
- Live/loading/empty/error/denied states.
- New vendor action.
- Open vendor detail action.

Implementation guardrails:

- Preserve `/app/vendors`, `/app/vendors/new`, and `/app/vendors/:vendorId`.
- Do not create a new `/app/sources` route from older prototype work unless separately approved.
- Treat operations log, privacy policy, system status, and help docs links as prototype-only unless approved.

Approval status: `recommended`

### 12. AI Provider Settings Restyle

Restyle `/app/settings/ai` using `ai_provider_settings_source_blendr`.

Recommended inclusions:

- Active AI providers list.
- Healthy/rate-limited/credential-error states.
- Capability routing table.
- Save routing action.
- Health check action.

Implementation guardrails:

- Preserve provider health behavior.
- Preserve manual fallback behavior.
- Do not add documentation/support links unless approved.

Approval status: `recommended`

---

## Selective Stitch Features Awaiting Approval

These are prototype-added or prototype-expanded features that should not become tickets until you decide whether to approve, defer, or discard them.

Use the decision columns to mark exactly one choice per feature with `x`.

| Feature | Prototype Source | Proposed Handling | Recommendation Status | Approved | Defer | Discard |
| --- | --- | --- | --- | --- | --- | --- |
| Detected Category Tree in wizard | `website_import_wizard_source_blendr` | Recommended; reuse current category API | `recommended_keep` | [x] | [ ] | [ ] |
| Hierarchical category tree rendering | `website_import_wizard_source_blendr` | Current data may be flat; hierarchy requires grouping or backend enrichment | `awaiting_approval` | [x] | [ ] | [ ] |
| Download Analysis Report PDF | `website_import_wizard_source_blendr` | Defer unless a report-generation requirement is approved | `awaiting_approval` | [ ] | [x] | [ ] |
| Import job status cards/details | `imports_workspace_source_blendr`, `import_job_detail_source_blendr` | Keep if backed by real import job data | `awaiting_approval` | [x] | [ ] | [ ] |
| Discovery candidate preview drawer | `discovery_session_source_blendr` | Recommended if it preserves candidate actions | `awaiting_approval` | [x] | [ ] | [ ] |
| Discovery AI inference details | `discovery_session_source_blendr` | Keep only if backed by candidate/source payload | `awaiting_approval` | [x] | [ ] | [ ] |
| Catalog category filter | `catalog_source_blendr` | Requires query params and backend/client filtering | `awaiting_approval` | [x] | [ ] | [ ] |
| Catalog mobile floating create button | `catalog_source_blendr` | Potentially useful, but conflicts with route-specific CTAs | `awaiting_approval` | [ ] | [ ] | [x] | [ ] 
| Catalog product/service segmented control | `new_catalog_item_source_blendr` | Keep only if mapped to current item type model | `awaiting_approval` | [x] | [ ] | [ ] |
| Vendor state toggles | `vendors_source_blendr` | Visual states only; do not ship demo toggles | `discard_recommended` | [ ] |[x]  |  [ ] |
| Vendor footer links | `vendors_source_blendr` | Prototype-only unless real destinations exist | `awaiting_approval` | [ ] | [x] | [ ] |
| Topbar notification/help buttons | Multiple screens | Requires real destinations or should remain inert/omitted | `awaiting_approval` | [ ] | [x] | [ ] |
| Provider documentation/support links | `ai_provider_settings_source_blendr` | Add only if routes or external docs are approved | `awaiting_approval` | [ ] | [x] | [ ] |
| Permission denied/provider summary cards | `workspace_overview_source_blendr` | Keep only if current auth/permission model supports it | `awaiting_approval` | [x] | [ ] | [ ] |
---

## Discard Or Defer Candidates

These should be deferred unless explicitly approved:

- Any demo-only `showState(...)` buttons from prototype HTML.
- Any hard-coded demo IDs such as `IMP-8922`, `SES-8812`, or static catalog item IDs.
- `Download Analysis Report (PDF)`.
- Topbar notification center without a real notification source.
- Help/documentation/support links without real destinations.
- Footer links such as Privacy Policy, Operations Log, and System Status unless those routes exist.
- Floating mobile create button unless accepted as a shared shell pattern.
- Any prototype link that uses `href="#"`.
- Any inline prototype JavaScript behavior that only simulates state.

Reason: these expand or fake functionality beyond the current scraper, PDF OCR, AI settings, import, catalog, vendor, and discovery workflows.

---

## Approval Checklist

Before revised repair/implementation tickets are created, mark each item:

- `keep`
- `defer`
- `discard`

Required decisions:

1. Use extracted Stage 4 design system globally: `keep / defer / discard`
2. Restyle workspace shell/sidebar/topbar: `keep / defer / discard`
3. Restyle Workspace Overview: `keep / defer / discard`
4. Restyle Imports Workspace: `keep / defer / discard`
5. Add Detected Category Tree to Website Import Wizard: `keep / defer / discard`
6. Add true hierarchical category rendering: `keep / defer / discard`
7. Restyle PDF Import states: `keep / defer / discard`
8. Restyle Import Job Detail: `keep / defer / discard`
9. Restyle Discovery Session with preview drawer: `keep / defer / discard`
10. Restyle Catalog with search/filter/table states: `keep / defer / discard`
11. Restyle New Catalog Item form: `keep / defer / discard`
12. Restyle Vendors: `keep / defer / discard`
13. Restyle AI Provider Settings: `keep / defer / discard`
14. Add report download, notification/help links, footer links, or mobile floating create: `keep / defer / discard`

---

## Suggested Ticketing Sequence After Approval

Create revised tickets only after this summary is approved.

Recommended dependency order:

1. Design system token and shared component translation.
2. Shell/sidebar/topbar visual migration.
3. Route registry audit against extracted prototype links.
4. Workspace Overview and Imports Workspace visual migration.
5. Website Import Wizard with Detected Category Tree.
6. PDF Import visual state migration.
7. Import Job Detail visual alignment.
8. Discovery Session visual alignment and preview drawer.
9. Catalog and Catalog Item Form visual alignment.
10. Vendors visual alignment.
11. AI Provider Settings visual alignment.
12. Selective features approved from this summary.
13. Visual QA and route regression ticket.

This order protects existing functionality because shared visual foundations are built first, current routes are migrated next, and new scope is introduced only after stable surfaces pass regression.

---

## Validation Requirements For Future Tickets

Each future implementation ticket should include:

- Route/action regression tests.
- Existing API contract tests.
- Keyboard and accessibility checks for new interactive controls.
- Responsive layout checks.
- Screenshot comparison against the matching `screen.png` reference.
- Confirmation that no approved route has become orphaned.
- Confirmation that Stitch-added controls are either approved, implemented, deferred, or discarded.
- Confirmation that no prototype-only `href="#"`, demo state toggle, or hard-coded sample ID shipped as production behavior.

---

## Recommended Next Step

Review the new `Prototype Components And Routes Awaiting Role Decision` table and mark each unfilled item as approved, defer, or discard.

Once this Markdown summary is approved, the next step is to generate a rebuild ticket set that uses the Stitch screen layouts as templates, wires current behavior components into those layout slots, and adds only the approved unmatched prototype routes/components.
