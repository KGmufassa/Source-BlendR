# Complete App Blueprint

## Pages

- **Workspace Overview** (`UI-BLUEPRINT-SCREEN-001`)
  - Route: `/app`
  - Sections: Primary work area
  - Components: Primary task component; shared AppShell patterns
  - Actions: EL-OV-001, EL-OV-002, EL-OV-003
  - States: loading, empty, populated, saving, success, error, permission_denied
  - Data: workspace-scoped records and status where applicable
- **Imports Workspace** (`UI-BLUEPRINT-SCREEN-002`)
  - Route: `/app/imports`
  - Sections: Primary work area
  - Components: Primary task component; shared AppShell patterns
  - Actions: EL-IM-001, EL-IM-002, EL-IM-003
  - States: loading, empty, populated, saving, success, error, permission_denied
  - Data: workspace-scoped records and status where applicable
- **Website Import Wizard** (`UI-BLUEPRINT-SCREEN-003`)
  - Route: `/app/imports/website`
  - Sections: Primary work area
  - Components: Primary task component; shared AppShell patterns
  - Actions: EL-WEB-001, EL-WEB-002, ACTION-START-WEBSITE, EL-WEB-004, ACTION-QUEUE-CATEGORIES, EL-WEB-006
  - States: loading, empty, populated, saving, success, error, permission_denied
  - Data: workspace-scoped records and status where applicable
- **PDF Import** (`UI-BLUEPRINT-SCREEN-004`)
  - Route: `/app/imports/pdf`
  - Sections: Primary work area
  - Components: Primary task component; shared AppShell patterns
  - Actions: EL-PDF-001, EL-PDF-002, ACTION-START-PDF, EL-PDF-004
  - States: loading, empty, populated, saving, success, error, permission_denied
  - Data: workspace-scoped records and status where applicable
- **Import Job Detail** (`UI-BLUEPRINT-SCREEN-005`)
  - Route: `/app/imports/jobs/:jobId`
  - Sections: Primary work area
  - Components: Primary task component; shared AppShell patterns
  - Actions: ACTION-RETRY-JOB, ACTION-CANCEL-JOB, EL-JOB-003
  - States: loading, empty, populated, saving, success, error, permission_denied
  - Data: workspace-scoped records and status where applicable
- **Discovery Session** (`UI-BLUEPRINT-SCREEN-006`)
  - Route: `/app/discovery/:sessionId`
  - Sections: Primary work area
  - Components: Primary task component; shared AppShell patterns
  - Actions: ACTION-SEARCH-CANDIDATES, ACTION-FILTER-CANDIDATES, EL-DIS-003, ACTION-PREVIEW-CANDIDATE, ACTION-BULK-IMPORT, ACTION-BULK-IGNORE, ACTION-BULK-ARCHIVE
  - States: loading, empty, populated, saving, success, error, permission_denied
  - Data: workspace-scoped records and status where applicable
- **Catalog** (`UI-BLUEPRINT-SCREEN-007`)
  - Route: `/app/catalog`
  - Sections: Primary work area
  - Components: Primary task component; shared AppShell patterns
  - Actions: ACTION-SEARCH-CATALOG, ACTION-FILTER-CATALOG, EL-CAT-003, EL-CAT-004
  - States: loading, empty, populated, saving, success, error, permission_denied
  - Data: workspace-scoped records and status where applicable
- **Catalog Item Form** (`UI-BLUEPRINT-SCREEN-008`)
  - Route: `/app/catalog/new`
  - Sections: Primary work area
  - Components: Primary task component; shared AppShell patterns
  - Actions: EL-FORM-001, EL-FORM-002, EL-FORM-003, EL-FORM-004, ACTION-SAVE-ITEM, EL-FORM-006
  - States: loading, empty, populated, saving, success, error, permission_denied
  - Data: workspace-scoped records and status where applicable
- **Vendors** (`UI-BLUEPRINT-SCREEN-009`)
  - Route: `/app/vendors`
  - Sections: Primary work area
  - Components: Primary task component; shared AppShell patterns
  - Actions: EL-VEN-001, EL-VEN-002
  - States: loading, empty, populated, saving, success, error, permission_denied
  - Data: workspace-scoped records and status where applicable
- **AI Provider Settings** (`UI-BLUEPRINT-SCREEN-010`)
  - Route: `/app/settings/ai`
  - Sections: Primary work area
  - Components: Primary task component; shared AppShell patterns
  - Actions: EL-AI-001, ACTION-HEALTH-CHECK, EL-AI-003, ACTION-SAVE-AI
  - States: loading, empty, populated, saving, success, error, permission_denied
  - Data: workspace-scoped records and status where applicable

## Shared Components

- AppShell
- Sidebar
- Breadcrumbs
- StatusBadge
- JobProgressTimeline
- SearchFilterBar
- BulkActionToolbar
- DataTable
- FormField
- ConfirmDialog
- Toast
- EmptyState
- ErrorState
- AccessibleDrawer

## Routes

- `/app`
- `/app/catalog`
- `/app/catalog/:itemId`
- `/app/catalog/new`
- `/app/discovery`
- `/app/discovery/:sessionId`
- `/app/imports`
- `/app/imports/jobs`
- `/app/imports/jobs/:jobId`
- `/app/imports/pdf`
- `/app/imports/website`
- `/app/settings`
- `/app/settings/ai`
- `/app/vendors`
- `/app/vendors/:vendorId`
- `/app/vendors/new`

## Mapped Page and Route Visual Hierarchy

```text
Workspace Overview — /app — UI-BLUEPRINT-SCREEN-001
├─ Section: Primary work area
│  ├─ Component: QuickActions
│  │  ├─ Action: Start import -> route /app/imports
│  │  ├─ Action: Open catalog -> route /app/catalog
│  │  ├─ Data Source: workspace summary, catalog status, active job summary
│  │  ├─ Validation: workspace context and permission visibility
│  │  └─ States: loading, empty, populated, saving, success, error, permission_denied
│  └─ Component: JobStatus
│     ├─ Action: View active jobs -> route /app/imports/jobs
│     ├─ Data Source: active import jobs and recent job outcomes
│     ├─ Validation: no color-only job state; visible recovery affordance
│     └─ States: loading, populated, success, error, permission_denied

Imports Workspace — /app/imports — UI-BLUEPRINT-SCREEN-002
├─ Section: Start Import
│  ├─ Component: ImportMethods
│  │  ├─ Action: Website import -> route /app/imports/website
│  │  ├─ Action: PDF import -> route /app/imports/pdf
│  │  ├─ Data Source: available import methods and workspace permissions
│  │  ├─ Validation: only approved import methods are shown
│  │  └─ States: loading, populated, error, permission_denied
├─ Section: Recent Jobs
│  └─ Component: JobTable
│     ├─ Action: Open job -> route /app/imports/jobs/:jobId
│     ├─ Data Source: recent import jobs, method, status, progress, timestamps
│     ├─ Validation: failed jobs expose reason and recovery without silent mutation
│     └─ States: loading, empty, populated, success, error

Website Import Wizard — /app/imports/website — UI-BLUEPRINT-SCREEN-003
├─ Section: Source
│  ├─ Component: SourceForm
│  │  ├─ Action: Vendor -> action vendor_id
│  │  ├─ Action: Website URL -> action website_url
│  │  ├─ Action: Analyze website -> action ACTION-START-WEBSITE
│  │  ├─ Data Source: vendors, submitted URL, discovery request status
│  │  ├─ Validation: required vendor, valid URL, request-pending disabled state
│  │  └─ States: loading, populated, saving, success, error, permission_denied
├─ Section: Categories
│  └─ Component: CategoryTree
│     ├─ Action: Category -> action category_selection
│     ├─ Action: Start selected categories -> action ACTION-QUEUE-CATEGORIES
│     ├─ Data Source: detected category tree and selected categories
│     ├─ Validation: at least one category required before enqueue
│     └─ States: loading, empty, populated, saving, success, error
└─ Section: Result
   └─ Component: JobResult
      ├─ Action: Open job -> route /app/imports/jobs/:jobId
      ├─ Data Source: queued job ID and discovery session linkage
      ├─ Validation: job route exists before link is enabled
      └─ States: loading, success, error

PDF Import — /app/imports/pdf — UI-BLUEPRINT-SCREEN-004
├─ Section: Upload
│  ├─ Component: PdfForm
│  │  ├─ Action: Vendor -> action vendor_id
│  │  ├─ Action: PDF catalog -> action pdf_file
│  │  ├─ Action: Start PDF extraction -> action ACTION-START-PDF
│  │  ├─ Data Source: vendors, uploaded PDF, extraction job request
│  │  ├─ Validation: required vendor, accepted file type, readable PDF, request-pending disabled state
│  │  └─ States: loading, empty, populated, saving, success, error, permission_denied
└─ Section: Result
   └─ Component: JobResult
      ├─ Action: Open job -> route /app/imports/jobs/:jobId
      ├─ Data Source: queued job ID and OCR/extraction status
      ├─ Validation: failed upload/extraction shows recovery path
      └─ States: loading, success, error

Import Job Detail — /app/imports/jobs/:jobId — UI-BLUEPRINT-SCREEN-005
├─ Section: Actions
│  └─ Component: JobActions
│     ├─ Action: Retry failed work -> action ACTION-RETRY-JOB
│     ├─ Action: Cancel job -> action ACTION-CANCEL-JOB
│     ├─ Action: Open Discovery Session -> route /app/discovery/:sessionId
│     ├─ Data Source: job detail, step timeline, event log, partial-result summary
│     ├─ Validation: retry only for failed/retryable work; cancel requires confirmation
│     └─ States: loading, populated, saving, success, error, permission_denied

Discovery Session — /app/discovery/:sessionId — UI-BLUEPRINT-SCREEN-006
├─ Section: Candidates
│  ├─ Component: CandidateTable
│  │  ├─ Action: Search candidates -> action ACTION-SEARCH-CANDIDATES
│  │  ├─ Action: Status filter -> action ACTION-FILTER-CANDIDATES
│  │  ├─ Action: Select candidate -> action candidate_selection
│  │  ├─ Action: Preview candidate -> action ACTION-PREVIEW-CANDIDATE
│  │  ├─ Data Source: discovery candidates, validation status, duplicate/conflict metadata
│  │  ├─ Validation: AI output remains candidate-scoped until explicit import
│  │  └─ States: loading, empty, populated, saving, success, error, permission_denied
├─ Section: Bulk Actions
│  └─ Component: BulkToolbar
│     ├─ Action: Import selected -> action ACTION-BULK-IMPORT
│     ├─ Action: Ignore selected -> action ACTION-BULK-IGNORE
│     ├─ Action: Archive selected -> action ACTION-BULK-ARCHIVE
│     ├─ Data Source: selected candidates and per-record validation results
│     ├─ Validation: selected count required; destructive actions confirm consequence
│     └─ States: populated, saving, success, error

Catalog — /app/catalog — UI-BLUEPRINT-SCREEN-007
├─ Section: Catalog
│  ├─ Component: CatalogHeader
│  │  ├─ Action: New catalog item -> route /app/catalog/new
│  │  ├─ Data Source: workspace catalog permissions
│  │  ├─ Validation: workspace_owner permission required
│  │  └─ States: loading, populated, permission_denied
│  └─ Component: CatalogTable
│     ├─ Action: Search catalog -> action ACTION-SEARCH-CATALOG
│     ├─ Action: Type filter -> action ACTION-FILTER-CATALOG
│     ├─ Action: Open item -> route /app/catalog/:itemId
│     ├─ Data Source: catalog items, SKU, pricing, status, type/category filters
│     ├─ Validation: search/filter state resolves to catalog query
│     └─ States: loading, empty, populated, success, error

Catalog Item Form — /app/catalog/new — UI-BLUEPRINT-SCREEN-008
├─ Section: Item Details
│  └─ Component: CatalogForm
│     ├─ Action: Item type -> action item_type
│     ├─ Action: Name -> action name
│     ├─ Action: SKU -> action sku
│     ├─ Action: Price -> action price
│     ├─ Action: Save item -> action ACTION-SAVE-ITEM
│     ├─ Action: Cancel -> route /app/catalog
│     ├─ Data Source: catalog form draft and workspace catalog constraints
│     ├─ Validation: required fields, numeric non-negative price, duplicate SKU check
│     └─ States: loading, populated, saving, success, error, permission_denied

Vendors — /app/vendors — UI-BLUEPRINT-SCREEN-009
├─ Section: Actions
│  ├─ Component: VendorHeader
│  │  ├─ Action: New vendor -> route /app/vendors/new
│  │  ├─ Data Source: workspace vendor permissions
│  │  ├─ Validation: workspace_owner permission required
│  │  └─ States: loading, populated, permission_denied
├─ Section: Vendors
│  └─ Component: VendorTable
│     ├─ Action: Open vendor -> route /app/vendors/:vendorId
│     ├─ Data Source: vendors, status, source coverage, last import
│     ├─ Validation: row route requires vendor ID
│     └─ States: loading, empty, populated, success, error

AI Provider Settings — /app/settings/ai — UI-BLUEPRINT-SCREEN-010
├─ Section: Providers
│  └─ Component: ProviderList
│     ├─ Action: Add provider -> action provider_form
│     ├─ Action: Run health check -> action ACTION-HEALTH-CHECK
│     ├─ Data Source: configured providers, health status, credential errors, rate limits
│     ├─ Validation: credentials stay server-side; failed health checks show recovery
│     └─ States: loading, empty, populated, saving, success, error, permission_denied
└─ Section: Capability Routing
   └─ Component: RoutingTable
      ├─ Action: Capability route -> action capability_route
      ├─ Action: Save routing -> action ACTION-SAVE-AI
      ├─ Data Source: capability-to-provider routing configuration
      ├─ Validation: capabilities route only to healthy configured providers or manual fallback
      └─ States: loading, populated, saving, success, error, permission_denied
```

## Frontend build package summary

- Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui-compatible primitives.
- Implement shared job status, searchable data tables, bulk actions, accessible drawers, forms, and state components before page-specific composition.
- Every interactive element is mapped in `07-ui-blueprint-specification.json` action inventory.

## Stage 4 Stitch prototype gate

Stitch MCP prototype evidence is Stage-4-local and does not change the Stage 5 handoff contract.

- Stitch project: `9248820866477955856`
- Stitch design system asset: `9645362222514515324`
- Generated screens: all 10 launch-critical Stage 4 screens
- Page approval ledger: recorded in `07-ui-blueprint-specification.json` and `Build-Plans/Build-status/UX-state.json`
- Component extraction checklist: pending page approval
- No orphan interaction gate: pending Stitch-added component approval

Every approved Stitch page must pass:

- component extraction for navigation, content/data, forms/inputs, buttons/links, menus/dropdowns, tabs, modals/drawers, clickable cards/rows, filters/search/sort controls, status indicators, and required states
- interaction resolution to `route`, `action`, or `no_navigation`
- responsive review expectations
- post-inventory accessibility pass

Stage 4 may not return to `ready_for_stage_5` until each Stitch-added clickable/input/add component is approved, revised, or rejected.

## Stitch component mapping summary

- Parsed Stitch HTML exports for all 10 prototype screens.
- Mapped interactive components: `192`
- Initial-spec/shared navigation components: `84`
- Stitch-added components pending approval: `108`
- Orphan interactions: `0`
- No-orphan interaction gate: `passed`

The detailed component inventory is stored in `07-ui-blueprint-specification.json` and `Build-Plans/Build-status/UX-state.json`.
