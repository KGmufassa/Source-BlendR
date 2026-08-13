import { APP_ROUTES, DESIGN_TOKENS } from "./app-shell.js";

const STATE_LABELS = Object.freeze(["loading", "empty", "populated", "saving", "success", "error", "permission_denied"]);

function renderShell({ activePath, title, state = "populated", content }) {
  const nav = APP_ROUTES.map((route) => {
    const current = route.path === activePath ? ' aria-current="page"' : "";
    return `<a href="${route.path}"${current}>${route.label}</a>`;
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Source Blendr ${title}</title>
  <style>
    :root { --sb-canvas:${DESIGN_TOKENS.color.canvas}; --sb-surface:${DESIGN_TOKENS.color.surface}; --sb-text:${DESIGN_TOKENS.color.text}; --sb-muted:${DESIGN_TOKENS.color.textMuted}; --sb-border:${DESIGN_TOKENS.color.border}; --sb-action:${DESIGN_TOKENS.color.action}; --sb-focus:${DESIGN_TOKENS.color.focus}; --sb-danger:${DESIGN_TOKENS.color.danger}; }
    body { margin:0; background:var(--sb-canvas); color:var(--sb-text); font:14px/1.45 system-ui,sans-serif; }
    a { color:inherit; text-decoration:none; }
    a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible { outline:2px solid var(--sb-focus); outline-offset:2px; }
    .shell { min-height:100vh; display:grid; grid-template-columns:248px 1fr; }
    nav { border-right:1px solid var(--sb-border); background:var(--sb-surface); padding:16px; }
    nav a { display:block; padding:8px 10px; border-radius:6px; }
    nav a[aria-current="page"] { border-left:3px solid var(--sb-action); font-weight:600; }
    main { padding:24px; }
    .grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
    .card, table, aside { background:var(--sb-surface); border:1px solid var(--sb-border); border-radius:6px; padding:16px; }
    .toolbar, .actions { display:flex; flex-wrap:wrap; gap:8px; align-items:end; margin:12px 0; }
    label { display:grid; gap:4px; color:var(--sb-muted); }
    input, select { border:1px solid var(--sb-border); border-radius:6px; padding:8px; background:var(--sb-surface); color:var(--sb-text); }
    button, .button { border:1px solid var(--sb-border); border-radius:6px; padding:8px 10px; background:var(--sb-surface); color:var(--sb-text); }
    .primary { background:var(--sb-action); border-color:var(--sb-action); color:#fff; }
    .danger { color:var(--sb-danger); }
    .status { display:inline-flex; border:1px solid var(--sb-border); border-radius:999px; padding:4px 8px; color:var(--sb-muted); }
    table { width:100%; border-collapse:collapse; padding:0; }
    th, td { padding:10px; border-bottom:1px solid var(--sb-border); text-align:left; }
    @media (max-width:767px) { .shell, .grid { grid-template-columns:1fr; } nav { border-right:0; border-bottom:1px solid var(--sb-border); } table, thead, tbody, tr, td { display:block; } th { display:none; } td::before { content:attr(data-label) ': '; font-weight:600; } aside[data-component="AccessibleDrawer"] { position:fixed; inset:0; overflow:auto; border-radius:0; } }
  </style>
</head>
<body>
  <div class="shell">
    <nav aria-label="Primary workspace navigation">${nav}</nav>
    <main data-state="${state}">
      <p class="status">${STATE_LABELS.includes(state) ? state : "populated"}</p>
      <h1>${title}</h1>
      ${content}
    </main>
  </div>
</body>
</html>`;
}

function renderVendorOptions(vendors) {
  return vendors.map((vendor) => `<option value="${vendor.id}">${vendor.name}</option>`).join("");
}

function renderJobRows(jobs) {
  return jobs.map((job) => `<tr><td data-label="Source">${job.source}</td><td data-label="Status">${job.status}</td><td data-label="Action"><a href="/app/imports/jobs/${job.id}" data-element="EL-IM-003">Open job</a></td></tr>`).join("");
}

export function renderWorkspaceOverviewPage({ activeJobs = 2 } = {}) {
  return renderShell({
    activePath: "/app",
    title: "Workspace Overview",
    content: `<section data-route="/app" data-component="COMP-SCREEN-001-PRIMARY" class="grid">
      <a class="button primary" href="/app/imports" data-element="EL-OV-001">Start import</a>
      <a class="button" href="/app/catalog" data-element="EL-OV-002">Open catalog</a>
      <a class="button" href="/app/imports/jobs" data-element="EL-OV-003">View active jobs (${activeJobs})</a>
    </section>`,
  });
}

export function renderImportsWorkspacePage({ jobs = [] } = {}) {
  return renderShell({
    activePath: "/app/imports",
    title: "Imports Workspace",
    content: `<section data-route="/app/imports" data-component="COMP-SCREEN-002-PRIMARY">
      <div class="actions">
        <a class="button primary" href="/app/imports/website" data-element="EL-IM-001">Website import</a>
        <a class="button" href="/app/imports/pdf" data-element="EL-IM-002">PDF import</a>
      </div>
      <table data-component="DataTable" data-mobile-behavior="stacked_labeled_records">
        <thead><tr><th>Source</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${renderJobRows(jobs)}</tbody>
      </table>
    </section>`,
  });
}

export function renderWebsiteImportPage({ vendors = [], categories = [], jobId = "job-preview", state = "populated" } = {}) {
  const categoryInputs = categories.map((category) => `<label><input type="checkbox" data-element="EL-WEB-004" value="${category}"> ${category}</label>`).join("");

  return renderShell({
    activePath: "/app/imports/website",
    title: "Website Import",
    state,
    content: `<section data-route="/app/imports/website" data-component="COMP-SCREEN-003-PRIMARY">
      <form class="card" data-action="ACTION-START-WEBSITE">
        <label>Vendor <select data-element="EL-WEB-001" name="vendor_id">${renderVendorOptions(vendors)}</select></label>
        <label>Website URL <input data-element="EL-WEB-002" name="website_url" type="url" value="https://example.test/catalog"></label>
        <button class="primary" type="submit" data-element="EL-WEB-003" data-action="ACTION-START-WEBSITE">Analyze website</button>
      </form>
      <section class="card">
        <h2>Categories</h2>
        <fieldset class="category-tree" aria-label="Detected Category tree"><legend>Detected Category tree</legend><div class="category-branch"><h3>catalog</h3>${categoryInputs || "<p>No categories queued yet. Analyze a website to continue.</p>"}</div></fieldset>
        <button type="button" data-element="EL-WEB-005" data-action="ACTION-QUEUE-CATEGORIES">Start selected categories</button>
      </section>
      <a href="/app/imports/jobs/${jobId}" data-element="EL-WEB-006">Open job</a>
    </section>`,
  });
}

export function renderPdfImportPage({ vendors = [], jobId = "job-preview", state = "populated" } = {}) {
  return renderShell({
    activePath: "/app/imports/pdf",
    title: "PDF Import",
    state,
    content: `<section data-route="/app/imports/pdf" data-component="COMP-SCREEN-004-PRIMARY">
      <form class="card" data-action="ACTION-START-PDF">
        <label>Vendor <select data-element="EL-PDF-001" name="vendor_id">${renderVendorOptions(vendors)}</select></label>
        <label>PDF catalog <input data-element="EL-PDF-002" name="pdf_file" type="file" accept="application/pdf"></label>
        <button class="primary" type="submit" data-element="EL-PDF-003" data-action="ACTION-START-PDF">Start PDF extraction</button>
      </form>
      <p role="status">Recovery: retry upload or open the created job when available.</p>
      <a href="/app/imports/jobs/${jobId}" data-element="EL-PDF-004">Open job</a>
    </section>`,
  });
}

export function renderImportJobDetailPage({ jobId = "job-preview", sessionId = "session-preview", state = "populated" } = {}) {
  return renderShell({
    activePath: "/app/imports/jobs/:jobId",
    title: `Import Job ${jobId}`,
    state,
    content: `<section data-route="/app/imports/jobs/:jobId" data-component="COMP-SCREEN-005-PRIMARY">
      <div class="actions">
        <button type="button" data-element="EL-JOB-001" data-action="ACTION-RETRY-JOB">Retry failed work</button>
        <button type="button" class="danger" data-element="EL-JOB-002" data-action="ACTION-CANCEL-JOB">Cancel job</button>
        <a class="button primary" href="/app/discovery/${sessionId}" data-element="EL-JOB-003">Open Discovery Session</a>
      </div>
    </section>`,
  });
}

export function renderTicket017PreviewPage({ jobId = "job-1", sessionId = "session-1" } = {}) {
  return renderShell({
    activePath: "/app/imports",
    title: "Overview, Imports, and Job Detail",
    state: "permission_denied",
    content: `<section data-route="/app" data-component="COMP-SCREEN-001-PRIMARY" class="card">
      <h2>Workspace Overview</h2>
      <a class="button primary" href="/app/imports" data-element="EL-OV-001">Start import</a>
      <a class="button" href="/app/catalog" data-element="EL-OV-002">Open catalog</a>
      <a class="button" href="/app/imports/jobs" data-element="EL-OV-003">View active jobs</a>
    </section>
    <section data-route="/app/imports" data-component="COMP-SCREEN-002-PRIMARY" class="card">
      <h2>Imports Workspace</h2>
      <div class="actions">
        <a class="button primary" href="/app/imports/website" data-element="EL-IM-001">Website import</a>
        <a class="button" href="/app/imports/pdf" data-element="EL-IM-002">PDF import</a>
        <a class="button" href="/app/imports/jobs/${jobId}" data-element="EL-IM-003">Open job</a>
      </div>
    </section>
    <section data-route="/app/imports/jobs/:jobId" data-component="COMP-SCREEN-005-PRIMARY" class="card">
      <h2>Import Job Detail</h2>
      <button type="button" data-element="EL-JOB-001" data-action="ACTION-RETRY-JOB">Retry failed work</button>
      <button type="button" class="danger" data-element="EL-JOB-002" data-action="ACTION-CANCEL-JOB">Cancel job</button>
      <a class="button primary" href="/app/discovery/${sessionId}" data-element="EL-JOB-003">Open Discovery Session</a>
    </section>`,
  });
}

export function renderDiscoverySessionPage({ candidates = [], state = "populated" } = {}) {
  const rows = candidates.map((candidate) => `<tr><td data-label="Select"><input type="checkbox" data-element="EL-DIS-003" value="${candidate.id}"></td><td data-label="Name">${candidate.name}</td><td data-label="Status">${candidate.status}</td><td data-label="Action"><button type="button" data-element="EL-DIS-004" data-action="ACTION-PREVIEW-CANDIDATE">Preview candidate</button></td></tr>`).join("");

  return renderShell({
    activePath: "/app/discovery/:sessionId",
    title: "Discovery Session",
    state,
    content: `<section data-route="/app/discovery/:sessionId" data-component="COMP-SCREEN-006-PRIMARY">
      <form role="search" class="toolbar">
        <label>Search candidates <input type="search" data-element="EL-DIS-001" data-action="ACTION-SEARCH-CANDIDATES"></label>
        <label>Status filter <select data-element="EL-DIS-002" data-action="ACTION-FILTER-CANDIDATES"><option>ready</option><option>ignored</option></select></label>
      </form>
      <table data-component="DataTable" data-mobile-behavior="stacked_labeled_records">
        <thead><tr><th>Select</th><th>Name</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="actions">
        <button type="button" data-element="EL-DIS-005" data-action="ACTION-BULK-IMPORT">Import selected</button>
        <button type="button" data-element="EL-DIS-006" data-action="ACTION-BULK-IGNORE">Ignore selected</button>
        <button type="button" class="danger" data-element="EL-DIS-007" data-action="ACTION-BULK-ARCHIVE">Archive selected</button>
      </div>
      <aside data-component="AccessibleDrawer" data-mobile-behavior="full_screen_sheet" aria-label="Candidate preview"><h2>Candidate preview</h2><p>Use Escape or the close control to return focus to the table.</p><section aria-label="AI inference details"><h3>AI inference details</h3><p>Shown only when candidate payload includes model, confidence, or explanation metadata.</p></section><button type="button">Close preview</button></aside>
    </section>`,
  });
}
