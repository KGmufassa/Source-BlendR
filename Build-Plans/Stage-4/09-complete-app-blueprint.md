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

## Frontend build package summary

- Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui-compatible primitives.
- Implement shared job status, searchable data tables, bulk actions, accessible drawers, forms, and state components before page-specific composition.
- Every interactive element is mapped in `07-ui-blueprint-specification.json` action inventory.
