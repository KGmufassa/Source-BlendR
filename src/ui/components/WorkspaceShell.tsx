import Link from "next/link";
import { workspaceNavigation } from "@/ui/data/navigation";

export function WorkspaceShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="workspace-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            SB
          </span>
          <span>Source-Blendr</span>
        </div>
        <nav className="nav-list" aria-label="Workspace navigation">
          {workspaceNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link className="nav-link" href={item.href} key={item.href}>
                <Icon aria-hidden="true" size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="main">
        <div className="topbar">
          <input className="search" aria-label="Universal search" placeholder="Search suppliers, assets, quotes..." />
          <button className="button button-primary" type="button">
            Start import
          </button>
        </div>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
