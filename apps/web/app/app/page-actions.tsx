import Link from "next/link";

export function PageActions({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="actions">{children}</div>;
}

export function ButtonLink({ href, children, primary = false, elementId, actionId }: Readonly<{ href: string; children: React.ReactNode; primary?: boolean; elementId?: string; actionId?: string }>) {
  return (
    <Link className={primary ? "button primary" : "button"} href={href} data-element={elementId} data-action={actionId}>
      {children}
    </Link>
  );
}

export function StatusBadge({ children }: Readonly<{ children: React.ReactNode }>) {
  return <span className="status-badge">{children}</span>;
}

export function PageHeader({ title, eyebrow, description, children }: Readonly<{ title: string; eyebrow?: string; description?: string; children?: React.ReactNode }>) {
  return (
    <div className="page-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p className="muted">{description}</p> : null}
      </div>
      {children ? <PageActions>{children}</PageActions> : null}
    </div>
  );
}

export function DataTable({ children, label }: Readonly<{ children: React.ReactNode; label: string }>) {
  return (
    <div className="table-wrap" data-component="DataTable" data-mobile-behavior="stacked_labeled_records">
      <table aria-label={label}>{children}</table>
    </div>
  );
}

export function SearchFilterBar({ children, onSubmit }: Readonly<{ children: React.ReactNode; onSubmit?: React.FormEventHandler<HTMLFormElement> }>) {
  return <form className="toolbar search-filter-bar" role="search" onSubmit={onSubmit}>{children}</form>;
}

export function BulkActionToolbar({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="actions bulk-action-toolbar" data-component="BulkActionToolbar">{children}</div>;
}

export function FormField({ label, children, wide = false }: Readonly<{ label: string; children: React.ReactNode; wide?: boolean }>) {
  return <label className={wide ? "wide" : undefined}>{label}{children}</label>;
}

export function EmptyState({ title, action }: Readonly<{ title: string; action: React.ReactNode }>) {
  return <div className="state-card" data-component="EmptyState"><p>{title}</p>{action}</div>;
}

export function ErrorState({ title, recovery }: Readonly<{ title: string; recovery: React.ReactNode }>) {
  return <div className="state-card error-state" data-component="ErrorState"><p>{title}</p>{recovery}</div>;
}

export function AccessibleDrawer({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <aside className="drawer" data-component="AccessibleDrawer" data-mobile-behavior="full_screen_sheet" aria-label={title}>
      <h2>{title}</h2>
      {children}
    </aside>
  );
}
