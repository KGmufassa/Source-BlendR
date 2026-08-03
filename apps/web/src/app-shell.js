export const DESIGN_TOKENS = Object.freeze({
  color: {
    canvas: "#f7f9fb",
    surface: "#FFFFFF",
    surfaceSubtle: "#f2f4f6",
    text: "#191c1e",
    textMuted: "#64748b",
    border: "#e2e8f0",
    action: "#006c49",
    actionBright: "#10b981",
    actionText: "#FFFFFF",
    success: "#006c49",
    warning: "#8A651D",
    danger: "#ba1a1a",
    focus: "#10b981",
  },
  radius: {
    default: "6px",
    pill: "999px",
  },
  spacing: [4, 8, 12, 16, 24, 32],
});

export const APP_ROUTES = Object.freeze([
  { path: "/app", label: "Workspace Overview" },
  { path: "/app/imports", label: "Imports Workspace" },
  { path: "/app/imports/website", label: "Website Import Wizard" },
  { path: "/app/imports/pdf", label: "PDF Import" },
  { path: "/app/imports/jobs", label: "Import Jobs" },
  { path: "/app/imports/jobs/:jobId", label: "Job Detail" },
  { path: "/app/discovery", label: "Discovery Sessions" },
  { path: "/app/discovery/:sessionId", label: "Discovery" },
  { path: "/app/catalog", label: "Catalog" },
  { path: "/app/catalog/:itemId", label: "Catalog Item" },
  { path: "/app/catalog/new", label: "New Item" },
  { path: "/app/vendors", label: "Vendors" },
  { path: "/app/vendors/:vendorId", label: "Vendor Detail" },
  { path: "/app/vendors/new", label: "New Vendor" },
  { path: "/app/settings", label: "Settings" },
  { path: "/app/settings/ai", label: "AI Settings" },
]);

export const sharedComponents = Object.freeze({
  AppShell: { landmarkRoles: ["banner", "navigation", "main"] },
  Sidebar: { collapseBelow: "768px" },
  Breadcrumbs: { required: true },
  StatusBadge: {
    states: ["loading", "empty", "populated", "saving", "success", "error", "permission_denied"],
  },
  DataTable: { mobileBehavior: "stacked_labeled_records" },
  FormField: { labelRequired: true },
  ConfirmDialog: { cancelRequired: true },
  Toast: { colorOnlyStatus: false },
  EmptyState: { nextActionRequired: true },
  ErrorState: { recoveryActionRequired: true },
  AccessibleDrawer: { mobileBehavior: "full_screen_sheet" },
});

export function renderAppShell({ activePath = "/app", workspaceName = "Workspace" } = {}) {
  const routeItems = APP_ROUTES.map((route) => {
    const current = route.path === activePath ? ' aria-current="page"' : "";
    return `<a href="${route.path}"${current}>${route.label}</a>`;
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Source Blendr</title>
  <style>
    :root {
      --sb-canvas: ${DESIGN_TOKENS.color.canvas};
      --sb-surface: ${DESIGN_TOKENS.color.surface};
      --sb-text: ${DESIGN_TOKENS.color.text};
      --sb-muted: ${DESIGN_TOKENS.color.textMuted};
      --sb-border: ${DESIGN_TOKENS.color.border};
      --sb-action: ${DESIGN_TOKENS.color.action};
      --sb-focus: ${DESIGN_TOKENS.color.focus};
    }
    body { margin: 0; background: var(--sb-canvas); color: var(--sb-text); font: 14px/1.45 system-ui, sans-serif; }
    a { color: inherit; text-decoration: none; }
    a[aria-current="page"] { border-left: 3px solid var(--sb-action); font-weight: 600; }
    a:focus-visible, button:focus-visible { outline: 2px solid var(--sb-focus); outline-offset: 2px; }
    .shell { min-height: 100vh; display: grid; grid-template-columns: 248px 1fr; }
    nav { border-right: 1px solid var(--sb-border); background: var(--sb-surface); padding: 16px; }
    nav a { display: block; padding: 8px 10px; border-radius: 6px; }
    main { padding: 24px; }
    .status { display: inline-flex; border: 1px solid var(--sb-border); border-radius: 999px; padding: 4px 8px; color: var(--sb-muted); }
    @media (max-width: 767px) { .shell { grid-template-columns: 1fr; } nav { border-right: 0; border-bottom: 1px solid var(--sb-border); } }
  </style>
</head>
<body>
  <div class="shell">
    <nav aria-label="Primary workspace navigation">${routeItems}</nav>
    <main>
      <p class="status">populated</p>
      <h1>${workspaceName}</h1>
      <button type="button">Start import</button>
    </main>
  </div>
</body>
</html>`;
}
