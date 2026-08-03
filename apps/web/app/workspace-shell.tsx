"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routeMatches, sidebarRoutes, workspaceRoutes } from "./workspace-routes";

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

export function WorkspaceShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const pageLabel = findRouteLabel(pathname);

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="brand-block">
          <strong>Source BlendR</strong>
          <span>Inventory Automation</span>
        </div>
        <nav aria-label="Primary workspace navigation">
          {sidebarRoutes.map((route) => {
            const active = routeMatches(pathname, route.path);
            return (
              <Link key={route.path} href={route.path} aria-current={active ? "page" : undefined}>
                <span className="nav-mark" aria-hidden="true" />
                <span>{route.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="workspace-main">
        <header className="workspace-topbar">
          <div className="breadcrumb" aria-label="Breadcrumbs">
            <Link href="/app">Workspace</Link>
            <span aria-hidden="true">/</span>
            <span>{pageLabel}</span>
          </div>
          <label className="global-search">
            <span>Search</span>
            <input type="search" placeholder="Search catalog, vendors, imports… (⌘K)" />
          </label>
          <div className="topbar-status" aria-label="Workspace status">
            <span className="status-dot" aria-hidden="true" />
            Runtime active
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
