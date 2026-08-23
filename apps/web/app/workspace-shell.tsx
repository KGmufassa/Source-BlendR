"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routeMatches, sidebarRoutes, workspaceRoutes } from "./workspace-routes";

type SidebarIconName = "overview" | "imports" | "discovery" | "catalog" | "vendors" | "settings";

const routeIcons: Record<string, SidebarIconName> = {
  "/app": "overview",
  "/app/imports": "imports",
  "/app/discovery": "discovery",
  "/app/catalog": "catalog",
  "/app/vendors": "vendors",
  "/app/settings": "settings",
};

const routeVisualLabels: Record<string, string> = {
  "/app": "Overview",
  "/app/imports": "Imports",
  "/app/discovery": "Discovery",
  "/app/catalog": "Catalog",
  "/app/vendors": "Vendors",
  "/app/settings": "Settings",
};

function findRouteLabel(pathname: string): string {
  const exact = workspaceRoutes.find((route) => route.path === pathname);
  if (exact) return exact.label;
  const dynamic = workspaceRoutes.find((route) => {
    if (!route.path.includes(":")) return false;
    const basePath = route.path.split("/:")[0] ?? route.path;
    return routeMatches(pathname, basePath);
  });
  return dynamic?.label ?? "Workspace";
}

function SidebarIcon({ name }: Readonly<{ name: SidebarIconName }>) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false" {...common}>
    {name === "overview" ? <><rect x="3.5" y="3.5" width="6.5" height="6.5" /><rect x="14" y="3.5" width="6.5" height="6.5" /><rect x="3.5" y="14" width="6.5" height="6.5" /><rect x="14" y="14" width="6.5" height="6.5" /></> : null}
    {name === "imports" ? <><path d="M6 2.75h7.5L18.5 8v13.25H6z" /><path d="M13.5 2.75V8h5" /><path d="M9 13h6M9 17h6" /></> : null}
    {name === "discovery" ? <><circle cx="12" cy="12" r="9" /><path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1z" /><circle cx="12" cy="12" r="1" /></> : null}
    {name === "catalog" ? <><path d="M4 7.5h16v12.25H4z" /><path d="M3 4.25h18V7.5H3zM9.5 12h5" /></> : null}
    {name === "vendors" ? <><path d="M4 9.25h16v11H4z" /><path d="m3 9.25 1.75-5.5h14.5L21 9.25M8 3.75v5.5m4-5.5v5.5m4-5.5v5.5M8 13h3v7.25" /></> : null}
    {name === "settings" ? <><circle cx="12" cy="12" r="3.25" /><path d="M12 2.5v2.25M12 19.25v2.25M2.5 12h2.25M19.25 12h2.25M5.28 5.28l1.6 1.6M17.12 17.12l1.6 1.6M18.72 5.28l-1.6 1.6M6.88 17.12l-1.6 1.6" /></> : null}
  </svg>;
}

export function WorkspaceShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const pageLabel = findRouteLabel(pathname);
  const isOverviewPrototypePage = pathname === "/app";
  const isImportsPrototypePage = pathname === "/app/imports";
  const isImportJobsPrototypePage = pathname === "/app/imports/jobs";
  const isImportJobDetailPrototypePage = pathname.startsWith("/app/imports/jobs/");
  const isPdfImportPrototypePage = pathname === "/app/imports/pdf";
  const isWebsiteImportPrototypePage = pathname === "/app/imports/website";
  const isDiscoveryPrototypePage = pathname === "/app/discovery";
  const isSettingsPrototypePage = routeMatches(pathname, "/app/settings");
  const isAiSettingsPrototypePage = pathname === "/app/settings/ai";
  const isVendorsPrototypePage = routeMatches(pathname, "/app/vendors");
  const isNewVendorPrototypePage = pathname === "/app/vendors/new";
  const isCatalogPrototypePage = routeMatches(pathname, "/app/catalog");
  const isNewCatalogItemPage = pathname === "/app/catalog/new";
  const useStitchPageCanvas = isSettingsPrototypePage || isAiSettingsPrototypePage || isCatalogPrototypePage || isOverviewPrototypePage || isImportsPrototypePage || isImportJobsPrototypePage || isImportJobDetailPrototypePage || isPdfImportPrototypePage || isWebsiteImportPrototypePage || isDiscoveryPrototypePage || isVendorsPrototypePage || isNewVendorPrototypePage;

  return (
    <div className={`workspace-shell${useStitchPageCanvas ? " stitch-ai-shell" : ""}${isOverviewPrototypePage ? " stitch-overview-shell" : ""}${isImportsPrototypePage || isImportJobsPrototypePage || isImportJobDetailPrototypePage ? " stitch-imports-shell" : ""}${isPdfImportPrototypePage ? " stitch-pdf-import-shell" : ""}${isWebsiteImportPrototypePage ? " stitch-website-import-shell" : ""}${isDiscoveryPrototypePage ? " stitch-discovery-shell" : ""}${isSettingsPrototypePage ? " stitch-settings-shell" : ""}${isAiSettingsPrototypePage ? " stitch-ai-settings-shell" : ""}${isVendorsPrototypePage ? " stitch-vendors-shell" : ""}${isCatalogPrototypePage ? " stitch-catalog-shell" : ""}`}>
      <a className="skip-link" href="#workspace-content">Skip to workspace content</a>
      <aside className="workspace-sidebar">
        <div className="brand-block">
          <strong>Source BlendR</strong>
          <span>Inventory Ops</span>
        </div>
        <nav aria-label="Primary workspace navigation">
          {sidebarRoutes.map((route) => {
            const active = routeMatches(pathname, route.path);
            return (
              <Link key={route.path} href={route.path} aria-current={active ? "page" : undefined}>
                <span className="nav-mark" aria-hidden="true" />
                <span className="nav-icon nav-glyph" aria-hidden="true"><SidebarIcon name={routeIcons[route.path] ?? "overview"} /></span>
                <span>{routeVisualLabels[route.path] ?? route.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <span className="avatar" aria-hidden="true">{isNewCatalogItemPage ? "AR" : isCatalogPrototypePage ? "JD" : "SB"}</span>
          <span><strong>{isNewCatalogItemPage ? "Alex Rivera" : isCatalogPrototypePage ? "Jane Doe" : "Workspace Owner"}</strong><br />{isNewCatalogItemPage ? "Inventory Lead" : isCatalogPrototypePage ? "Workspace Owner" : "Stage 4 Access"}</span>
        </div>
      </aside>
      <div className={`workspace-main${useStitchPageCanvas ? " stitch-prototype-main" : ""}${isVendorsPrototypePage ? " stitch-vendors-main" : ""}${isCatalogPrototypePage ? " stitch-catalog-main" : ""}`}>
        {useStitchPageCanvas ? null : <header className="workspace-topbar">
          <div className="breadcrumb" aria-label="Breadcrumbs">
            <Link href="/app">Workspace</Link>
            <span aria-hidden="true">/</span>
            <span>{pageLabel}</span>
          </div>
          <label className="global-search">
            <span>Search</span>
            <input type="search" placeholder="Search catalog, vendors, or imports" />
          </label>
        </header>}
        <main className={`content${useStitchPageCanvas ? " stitch-prototype-content" : ""}${isVendorsPrototypePage ? " stitch-vendors-content" : ""}${isCatalogPrototypePage ? " stitch-catalog-content" : ""}`} id="workspace-content" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}
