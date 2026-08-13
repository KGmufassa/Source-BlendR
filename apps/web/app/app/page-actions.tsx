import Link from "next/link";

export function Icon({ name }: Readonly<{ name: string }>) {
  return <span className="material-symbols-outlined app-icon" aria-hidden="true">{name}</span>;
}

export function PageActions({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="actions">{children}</div>;
}

export function ButtonLink({ href, children, primary = false, elementId, actionId, className = "" }: Readonly<{ href: string; children: React.ReactNode; primary?: boolean; elementId?: string; actionId?: string; className?: string }>) {
  return (
    <Link className={`button${primary ? " primary" : ""}${className ? ` ${className}` : ""}`} href={href} data-element={elementId} data-action={actionId}>
      {children}
    </Link>
  );
}

type StatusTone = "neutral" | "active" | "success" | "warning" | "danger";

function inferStatusTone(value: React.ReactNode): StatusTone {
  const label = typeof value === "string" ? value.toLowerCase() : "";
  if (["complete", "completed", "healthy", "available", "success", "ready"].some((term) => label.includes(term))) return "success";
  if (["failed", "error", "blocked", "denied", "conflict"].some((term) => label.includes(term))) return "danger";
  if (["queued", "pending", "warning", "stale"].some((term) => label.includes(term))) return "warning";
  if (["running", "active", "processing", "saving"].some((term) => label.includes(term))) return "active";
  return "neutral";
}

export function StatusBadge({ children, tone }: Readonly<{ children: React.ReactNode; tone?: StatusTone }>) {
  return <span className="status-badge" data-tone={tone ?? inferStatusTone(children)}>{children}</span>;
}

export function PageHeader({ title, eyebrow, description, children }: Readonly<{ title: string; eyebrow?: string; description?: React.ReactNode; children?: React.ReactNode }>) {
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
  return <div className="state-card stitch-empty" data-component="EmptyState"><p>{title}</p>{action}</div>;
}

export function ErrorState({ title, recovery }: Readonly<{ title: string; recovery: React.ReactNode }>) {
  return <div className="state-card error-state" data-component="ErrorState"><p>{title}</p>{recovery}</div>;
}

export function JobProgressTimeline({ steps }: Readonly<{ steps: readonly { label: string; detail: string; state: "complete" | "current" | "upcoming" }[] }>) {
  return (
    <ol className="progress-timeline" data-component="JobProgressTimeline">
      {steps.map((step) => (
        <li className="progress-step" data-state={step.state} key={step.label}>
          <span className="progress-marker" aria-hidden="true">✓</span>
          <span><strong>{step.label}</strong><span className="muted">{step.detail}</span></span>
          <StatusBadge tone={step.state === "complete" ? "success" : step.state === "current" ? "active" : "neutral"}>{step.state}</StatusBadge>
        </li>
      ))}
    </ol>
  );
}

export function Toast({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="toast" role="status" data-component="Toast">{children}</div>;
}

export function AccessibleDrawer({ title, children, onClose }: Readonly<{ title: string; children: React.ReactNode; onClose?: () => void }>) {
  return (
    <aside className="drawer" data-component="AccessibleDrawer" data-mobile-behavior="full_screen_sheet" aria-label={title} aria-modal="true" role="dialog">
      <div className="drawer-header"><h2>{title}</h2>{onClose ? <button type="button" onClick={onClose} aria-label={`Close ${title}`}>Close</button> : null}</div>
      {children}
    </aside>
  );
}
