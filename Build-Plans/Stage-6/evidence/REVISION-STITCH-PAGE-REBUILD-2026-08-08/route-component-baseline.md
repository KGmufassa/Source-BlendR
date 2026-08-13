# Stitch Page Rebuild Route / Component Baseline

Revision: `REVISION-STITCH-PAGE-REBUILD-2026-08-08`

Source plan: `Build-Plans/Stage-5/15-stitch-page-rebuild-ticket-plan.json`

Visual source of truth: `System-References/stitch_source_blendr_stage_4_prototype/**/screen.png`

Functional source of truth: current Next routes, current API routes, current workspace/auth/data behavior.

## Executed Mapping

| Ticket | Route Scope | Prototype Source | Current Behavior Owner | Execution Result |
| --- | --- | --- | --- | --- |
| `TICKET-060` | all rebuild routes | all Stitch screenshots/code | Stage 5 plan + this evidence file | Completed baseline/evidence contract. |
| `TICKET-061` | shared app shell | `workspace_overview_source_blendr`, design system | `apps/web/app/workspace-shell.tsx`, `apps/web/app/globals.css`, `apps/web/app/app/page-actions.tsx` | Rebuilt shell rhythm toward Stitch desktop canvas, removed visible desktop generic search/status topbar, preserved current routes. |
| `TICKET-062` | `/app` | `workspace_overview_source_blendr` | `apps/web/app/app/page.tsx` | Rebuilt overview as Active Jobs, Discovery Queue, Catalog Health, Provider Settings Summary. |
| `TICKET-063` | `/app/imports`, `/app/imports/jobs` | `imports_workspace_source_blendr` | imports page/job-list page | Preserved current job data and added approved last-sync/operational visual treatment. |
| `TICKET-064` | `/app/imports/website` | `website_import_wizard_source_blendr` | website page + runtime forms + category selector/API | Preserved form/API behavior; retained approved detected-category-tree placeholder backed by current category flow. |
| `TICKET-065` | `/app/imports/pdf` | `pdf_import_source_blendr` | PDF page + runtime forms + PDF API | Preserved upload/API/job handoff; discarded demo state controls. |
| `TICKET-066` | `/app/imports/jobs/:jobId` | `import_job_detail_source_blendr` | job detail page/actions/category selector/API | Added real event/log table from existing job events; preserved retry/cancel/discovery behavior. |
| `TICKET-067` | `/app/discovery`, `/app/discovery/:sessionId` | `discovery_session_source_blendr` | discovery pages/client/APIs | Preserved candidate search/filter/preview/edit/resolve/import actions and local toast feedback. |
| `TICKET-068` | `/app/catalog`, `/app/catalog/:itemId` | `catalog_source_blendr`, `new_catalog_item_source_blendr` | catalog page/client/detail/API | Added local pagination and row quick-action icon; rebuilt detail layout from Stitch card/detail language. |
| `TICKET-069` | `/app/catalog/new` | `new_catalog_item_source_blendr` | new catalog page + runtime form/API | Existing segmented product/service form preserved; no taxonomy/schema expansion added. |
| `TICKET-070` | `/app/vendors`, `/app/vendors/new`, `/app/vendors/:vendorId` | `vendors_source_blendr` | vendors pages + vendor APIs | Rebuilt vendor detail visual structure; excluded denied/request-access/footer/demo switcher scope. |
| `TICKET-071` | `/app/settings`, `/app/settings/ai` | `ai_provider_settings_source_blendr` | settings pages + AI client/APIs | Added approved Edit/Fix credentials affordance mapped to current provider upsert form. |
| `TICKET-072` | all rebuilt routes | all Stitch screenshots | local app runtime | Route smoke validation completed. Screenshot capture blocked because browser connector and local screenshot packages were unavailable. |
| `TICKET-073` | final gate | all sources | web app build/runtime | Typecheck, production build, route smoke, and exclusion scan passed. |

## Explicitly Excluded Scope

- Dedicated `/app/overview` route alias.
- Unbacked notification/help controls.
- Website analysis report PDF download.
- Import job notification/help icons.
- Discovery conflict/duplicate filter pills that require unavailable backend states.
- Catalog mobile floating create button.
- New catalog taxonomy/schema field.
- Vendor request-access/denied workflow.
- Vendor footer links.
- AI documentation/support links.
- All demo state toggles and hard-coded prototype IDs.

