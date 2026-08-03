export type WorkspaceRoute = {
  path: string;
  label: string;
  screenId?: string;
  nav: boolean;
  parent?: string;
};

export const workspaceRoutes = [
  { path: "/app", label: "Workspace Overview", screenId: "UI-BLUEPRINT-SCREEN-001", nav: true },
  { path: "/app/imports", label: "Imports Workspace", screenId: "UI-BLUEPRINT-SCREEN-002", nav: true },
  { path: "/app/imports/website", label: "Website Import Wizard", screenId: "UI-BLUEPRINT-SCREEN-003", nav: false, parent: "/app/imports" },
  { path: "/app/imports/pdf", label: "PDF Import", screenId: "UI-BLUEPRINT-SCREEN-004", nav: false, parent: "/app/imports" },
  { path: "/app/imports/jobs", label: "Import Jobs", nav: false, parent: "/app/imports" },
  { path: "/app/imports/jobs/:jobId", label: "Import Job Detail", screenId: "UI-BLUEPRINT-SCREEN-005", nav: false, parent: "/app/imports/jobs" },
  { path: "/app/discovery", label: "Discovery Sessions", nav: true },
  { path: "/app/discovery/:sessionId", label: "Discovery Session", screenId: "UI-BLUEPRINT-SCREEN-006", nav: false, parent: "/app/discovery" },
  { path: "/app/catalog", label: "Catalog", screenId: "UI-BLUEPRINT-SCREEN-007", nav: true },
  { path: "/app/catalog/:itemId", label: "Catalog Item", nav: false, parent: "/app/catalog" },
  { path: "/app/catalog/new", label: "Catalog Item Form", screenId: "UI-BLUEPRINT-SCREEN-008", nav: false, parent: "/app/catalog" },
  { path: "/app/vendors", label: "Vendors", screenId: "UI-BLUEPRINT-SCREEN-009", nav: true },
  { path: "/app/vendors/:vendorId", label: "Vendor Detail", nav: false, parent: "/app/vendors" },
  { path: "/app/vendors/new", label: "New Vendor", nav: false, parent: "/app/vendors" },
  { path: "/app/settings", label: "Settings", nav: true },
  { path: "/app/settings/ai", label: "AI Provider Settings", screenId: "UI-BLUEPRINT-SCREEN-010", nav: false, parent: "/app/settings" },
] as const satisfies readonly WorkspaceRoute[];

export const sidebarRoutes = workspaceRoutes.filter((route) => route.nav);

export const blueprintActions = {
  startImport: { elementId: "EL-OV-001", label: "Start import", href: "/app/imports" },
  openCatalog: { elementId: "EL-OV-002", label: "Open catalog", href: "/app/catalog" },
  viewActiveJobs: { elementId: "EL-OV-003", label: "View active jobs", href: "/app/imports/jobs" },
  websiteImport: { elementId: "EL-IM-001", label: "Website import", href: "/app/imports/website" },
  pdfImport: { elementId: "EL-IM-002", label: "PDF Import", href: "/app/imports/pdf" },
  openJob: { elementId: "EL-IM-003", label: "Open job" },
  analyzeWebsite: { elementId: "EL-WEB-003", actionId: "ACTION-START-WEBSITE", label: "Analyze website" },
  queueCategories: { elementId: "EL-WEB-005", actionId: "ACTION-QUEUE-CATEGORIES", label: "Start selected categories" },
  startPdf: { elementId: "EL-PDF-003", actionId: "ACTION-START-PDF", label: "Start PDF extraction" },
  retryJob: { elementId: "EL-JOB-001", actionId: "ACTION-RETRY-JOB", label: "Retry failed work" },
  cancelJob: { elementId: "EL-JOB-002", actionId: "ACTION-CANCEL-JOB", label: "Cancel job" },
  openDiscovery: { elementId: "EL-JOB-003", label: "Open Discovery Session" },
  searchCandidates: { elementId: "EL-DIS-001", actionId: "ACTION-SEARCH-CANDIDATES", label: "Search candidates" },
  filterCandidates: { elementId: "EL-DIS-002", actionId: "ACTION-FILTER-CANDIDATES", label: "Status filter" },
  selectCandidate: { elementId: "EL-DIS-003", label: "Select candidate" },
  previewCandidate: { elementId: "EL-DIS-004", actionId: "ACTION-PREVIEW-CANDIDATE", label: "Preview candidate" },
  importSelected: { elementId: "EL-DIS-005", actionId: "ACTION-BULK-IMPORT", label: "Import selected" },
  ignoreSelected: { elementId: "EL-DIS-006", actionId: "ACTION-BULK-IGNORE", label: "Ignore selected" },
  archiveSelected: { elementId: "EL-DIS-007", actionId: "ACTION-BULK-ARCHIVE", label: "Archive selected" },
  searchCatalog: { elementId: "EL-CAT-001", actionId: "ACTION-SEARCH-CATALOG", label: "Search catalog" },
  filterCatalog: { elementId: "EL-CAT-002", actionId: "ACTION-FILTER-CATALOG", label: "Type filter" },
  newCatalogItem: { elementId: "EL-CAT-003", label: "New catalog item", href: "/app/catalog/new" },
  openItem: { elementId: "EL-CAT-004", label: "Open item" },
  saveItem: { elementId: "EL-FORM-005", actionId: "ACTION-SAVE-ITEM", label: "Save item" },
  cancelItem: { elementId: "EL-FORM-006", label: "Cancel", href: "/app/catalog" },
  newVendor: { elementId: "EL-VEN-001", label: "New vendor", href: "/app/vendors/new" },
  openVendor: { elementId: "EL-VEN-002", label: "Open vendor" },
  addProvider: { elementId: "EL-AI-001", label: "Add provider" },
  healthCheck: { elementId: "EL-AI-002", actionId: "ACTION-HEALTH-CHECK", label: "Run health check" },
  saveAi: { elementId: "EL-AI-004", actionId: "ACTION-SAVE-AI", label: "Save routing" },
} as const;

export function routeMatches(pathname: string, routePath: string): boolean {
  if (routePath === "/app") return pathname === "/app";
  return pathname === routePath || pathname.startsWith(`${routePath}/`);
}
