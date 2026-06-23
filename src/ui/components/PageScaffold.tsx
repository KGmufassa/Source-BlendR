export function PageScaffold({
  title,
  description,
  actionLabel,
  children
}: Readonly<{
  title: string;
  description: string;
  actionLabel?: string;
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-description">{description}</p>
        </div>
        {actionLabel ? (
          <button className="button button-primary" type="button">
            {actionLabel}
          </button>
        ) : null}
      </header>
      {children}
    </>
  );
}
