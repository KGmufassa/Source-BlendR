"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { blueprintActions } from "../../../workspace-routes";

type Candidate = {
  id: string;
  name: string;
  sku: string;
  status: string;
  priceCents: number;
  currency: string;
  payload?: unknown;
};

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", width: "100%", minWidth: 1120, background: "#f9f8f6", color: "#333", padding: "32px 32px 48px" },
  content: { width: "100%", maxWidth: "none", margin: 0, padding: 0 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 24 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 10, margin: "0 0 8px", color: "#a8a29e", fontSize: 13, fontWeight: 700 },
  title: { margin: "0 0 8px", color: "#1c1917", fontSize: 20, fontWeight: 900, letterSpacing: "-.03em", lineHeight: 1.15 },
  description: { margin: 0, color: "#78716c", fontSize: 13, lineHeight: 1.45 },
  card: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", boxShadow: "0 1px 2px rgb(0 0 0 / 4%)" },
  cardHeader: { minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, borderBottom: "1px solid #e7e5e4", background: "#fafaf9", padding: "0 20px" },
  cardTitle: { margin: 0, color: "#333", fontSize: 12, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase" },
  muted: { margin: "4px 0 0", color: "#78716c", fontSize: 12 },
  badge: { display: "inline-flex", alignItems: "center", gap: 7, width: "fit-content", border: "1px solid", borderRadius: 999, padding: "5px 10px", fontSize: 11, fontWeight: 900, textTransform: "uppercase" },
  badgeDot: { width: 7, height: 7, borderRadius: 999, background: "currentColor" },
  toolbar: { minHeight: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, borderBottom: "1px solid #f5f5f4", padding: "12px 20px", background: "#fff" },
  filters: { display: "flex", alignItems: "center", gap: 14 },
  label: { display: "grid", gap: 6, color: "#78716c", fontSize: 11, fontWeight: 900, letterSpacing: ".06em", textTransform: "uppercase" },
  input: { width: 280, minHeight: 34, border: "1px solid #e7e5e4", borderRadius: 5, background: "#fafaf9", color: "#292524", padding: "0 12px", fontSize: 13, fontWeight: 600 },
  select: { width: 280, minHeight: 34, border: "1px solid #e7e5e4", borderRadius: 5, background: "#fafaf9", color: "#292524", padding: "0 12px", fontSize: 13, fontWeight: 600 },
  bulk: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 },
  selection: { color: "#78716c", fontSize: 12, fontWeight: 900 },
  primary: { minHeight: 34, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 16px", fontSize: 13, fontWeight: 900 },
  secondary: { minHeight: 34, border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 14px", fontSize: 13, fontWeight: 900 },
  danger: { minHeight: 34, border: "1px solid #fecaca", borderRadius: 5, background: "#fef2f2", color: "#dc2626", padding: "0 14px", fontSize: 13, fontWeight: 900 },
  tableScroll: { overflowX: "auto" },
  table: { width: "100%", minWidth: 980, tableLayout: "fixed", borderCollapse: "collapse", fontSize: 13 },
  th: { borderBottom: "1px solid #f5f5f4", background: "rgb(250 250 249 / 50%)", color: "#666", padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" },
  td: { borderBottom: "1px solid #f5f5f4", padding: "13px 20px", verticalAlign: "middle", color: "#666" },
  checkbox: { width: 17, minHeight: 17, accentColor: "#a85e2a" },
  product: { display: "grid", gap: 3, minWidth: 0 },
  productName: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#292524", fontSize: 14, fontWeight: 900 },
  mono: { color: "#71717a", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace", fontSize: 12 },
  price: { color: "#292524", fontSize: 13, fontWeight: 900 },
  previewButton: { minHeight: 30, border: 0, background: "transparent", color: "#a85e2a", padding: 0, fontSize: 11, fontWeight: 900, letterSpacing: ".04em", textTransform: "uppercase" },
  empty: { display: "grid", placeItems: "center", minHeight: 220, color: "#78716c", fontSize: 13, textAlign: "center" },
  statusMessage: { minHeight: 18, margin: "12px 0 0", color: "#78716c", fontSize: 12 },
  backdrop: { position: "fixed", inset: 0, zIndex: 50, border: 0, background: "rgb(28 25 23 / 20%)", padding: 0 },
  drawer: { position: "fixed", top: 0, right: 0, zIndex: 60, width: 450, height: "100vh", display: "flex", flexDirection: "column", borderLeft: "1px solid #e7e5e4", background: "#fff", boxShadow: "-20px 0 50px rgb(0 0 0 / 16%)" },
  drawerHeader: { minHeight: 70, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, borderBottom: "1px solid #f5f5f4", padding: "0 24px" },
  drawerTitle: { margin: 0, color: "#1c1917", fontSize: 16, fontWeight: 900 },
  close: { minHeight: 34, border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 12px", fontSize: 12, fontWeight: 900 },
  drawerBody: { flex: 1, overflowY: "auto", display: "grid", alignContent: "start", gap: 18, padding: 24 },
  drawerCopy: { margin: 0, color: "#78716c", fontSize: 13, lineHeight: 1.45 },
  form: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  wide: { gridColumn: "1 / -1" },
  formLabel: { display: "grid", gap: 6, color: "#78716c", fontSize: 11, fontWeight: 900, letterSpacing: ".06em", textTransform: "uppercase" },
  formInput: { minHeight: 36, border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", color: "#292524", padding: "0 12px", fontSize: 13, fontWeight: 700 },
  notice: { gridColumn: "1 / -1", border: "1px solid #fecaca", borderRadius: 5, background: "#fef2f2", color: "#dc2626", padding: 12, fontSize: 12, fontWeight: 800 },
  inference: { gridColumn: "1 / -1", display: "grid", gap: 8, border: "1px solid #f5f5f4", borderRadius: 5, background: "#fafaf9", padding: 14, fontSize: 12 },
  drawerActions: { gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #f5f5f4", marginTop: 8, paddingTop: 16 },
} satisfies Record<string, CSSProperties>;

function Glyph({ children }: { children: string }) {
  return <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.2em", lineHeight: 1, fontWeight: 900 }}>{children}</span>;
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function badgeStyle(status: string): CSSProperties {
  if (["ready", "imported", "completed", "success"].includes(status)) return { ...styles.badge, borderColor: "#a7f3d0", background: "#ecfdf5", color: "#047857" };
  if (["conflict", "failed", "error"].includes(status)) return { ...styles.badge, borderColor: "#fecaca", background: "#fef2f2", color: "#dc2626" };
  if (["ignored", "archived", "duplicate"].includes(status)) return { ...styles.badge, borderColor: "#e7e5e4", background: "#f5f5f4", color: "#57534e" };
  return { ...styles.badge, borderColor: "#fde68a", background: "#fffbeb", color: "#b45309" };
}

export function DiscoveryClient({ sessionId, candidates }: Readonly<{ sessionId: string; candidates: readonly Candidate[] }>) {
  const [items, setItems] = useState([...candidates]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const preview = items.find((candidate) => candidate.id === previewId);
  const visibleCandidates = items.filter((candidate) => {
    const matchesQuery = [candidate.name, candidate.sku].some((value) => value.toLowerCase().includes(query.toLowerCase()));
    return matchesQuery && (status === "all" || candidate.status === status);
  });

  function closePreview() {
    setPreviewId(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  useEffect(() => {
    if (!previewId) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePreview();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [previewId]);

  function toggleCandidate(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((candidateId) => candidateId !== id) : [...current, id]);
  }

  async function updateCandidates(action: "ignore" | "archive") {
    setPending(true);
    setMessage(`${action === "ignore" ? "Ignoring" : "Archiving"} candidates…`);
    const response = await fetch(`/api/discovery-sessions/${sessionId}/candidates`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, candidateIds: selected }) });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error?.message ?? "Unable to update candidates.");
    } else {
      setItems(result.data.map(toCandidate));
      setSelected([]);
      setMessage(`Candidates ${action === "ignore" ? "ignored" : "archived"}.`);
    }
    setPending(false);
  }

  async function importSelected() {
    setPending(true);
    setMessage("Importing selected candidates…");
    const response = await fetch(`/api/discovery-sessions/${sessionId}/import`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ candidateIds: selected }) });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error?.message ?? "Unable to import candidates.");
    } else {
      setItems((current) => current.map((candidate) => selected.includes(candidate.id) ? { ...candidate, status: "imported" } : candidate));
      setSelected([]);
      setMessage(`${result.data.length} candidates imported to the catalog.`);
    }
    setPending(false);
  }

  async function saveCandidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preview) return;
    setPending(true);
    setMessage("Saving candidate…");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/discovery-sessions/${sessionId}/candidates`, {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "save", candidateIds: [preview.id], name: form.get("name"), sku: form.get("sku"), priceCents: Math.round(Number(form.get("price")) * 100), currency: form.get("currency") }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error?.message ?? "Unable to save candidate.");
      setPending(false);
      return;
    }
    setItems(result.data.map(toCandidate));
    setMessage("Candidate saved.");
    setPending(false);
    closePreview();
  }

  return (
    <div className="discovery-detail-prototype-page" style={styles.page}>
      <main style={styles.content}>
        <header style={styles.header}>
          <div>
            <nav aria-label="Breadcrumb" style={styles.breadcrumb}>
              <Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link>
              <Glyph>›</Glyph>
              <Link href="/app/discovery" style={{ color: "inherit", textDecoration: "none" }}>Discovery</Link>
              <Glyph>›</Glyph>
              <strong style={{ color: "#292524" }}>Session Detail</strong>
            </nav>
            <h1 style={styles.title}>Discovery Session {sessionId}</h1>
            <p style={styles.description}>Search, filter, preview, and safely bulk-process imported candidates.</p>
          </div>
        </header>

        <section style={styles.card} data-state={visibleCandidates.length ? "populated" : "empty"}>
          <div style={styles.cardHeader}>
            <div><h2 style={styles.cardTitle}>Candidate Review</h2><p style={styles.muted}>Review AI candidates before promotion into the catalog.</p></div>
            <span style={badgeStyle("ready")}><span style={styles.badgeDot} />{visibleCandidates.length} candidates</span>
          </div>
          <form style={styles.toolbar} role="search" onSubmit={(event) => event.preventDefault()}>
            <div style={styles.filters}>
              <label style={styles.label}>Search candidates
                <input style={styles.input} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or SKU" data-element={blueprintActions.searchCandidates.elementId} data-action={blueprintActions.searchCandidates.actionId} />
              </label>
              <label style={styles.label}>Status filter
                <select style={styles.select} value={status} onChange={(event) => setStatus(event.target.value)} data-element={blueprintActions.filterCandidates.elementId} data-action={blueprintActions.filterCandidates.actionId}>
                  <option value="all">All statuses</option>
                  <option value="ready">Ready</option>
                  <option value="conflict">Conflict</option>
                  <option value="ignored">Ignored</option>
                </select>
              </label>
            </div>
            {selected.length ? (
              <div style={styles.bulk}>
                <span style={styles.selection}>{selected.length} selected</span>
                <button style={styles.primary} disabled={pending} type="button" onClick={importSelected} data-element={blueprintActions.importSelected.elementId} data-action={blueprintActions.importSelected.actionId}>{blueprintActions.importSelected.label}</button>
                <button style={styles.secondary} disabled={pending} type="button" onClick={() => updateCandidates("ignore")} data-element={blueprintActions.ignoreSelected.elementId} data-action={blueprintActions.ignoreSelected.actionId}>{blueprintActions.ignoreSelected.label}</button>
                <button style={styles.danger} disabled={pending} type="button" onClick={() => updateCandidates("archive")} data-element={blueprintActions.archiveSelected.elementId} data-action={blueprintActions.archiveSelected.actionId}>{blueprintActions.archiveSelected.label}</button>
              </div>
            ) : null}
          </form>

          {visibleCandidates.length ? (
            <div style={styles.tableScroll}>
              <table aria-label="Candidate table" style={styles.table}>
                <colgroup>
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "34%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "12%" }} />
                </colgroup>
                <thead><tr><th style={styles.th}>Select</th><th style={styles.th}>Product Name</th><th style={styles.th}>SKU</th><th style={styles.th}>Price</th><th style={styles.th}>Status</th><th style={{ ...styles.th, textAlign: "right" }}>Action</th></tr></thead>
                <tbody>
                  {visibleCandidates.map((candidate) => (
                    <tr key={candidate.id} aria-selected={selected.includes(candidate.id)}>
                      <td style={styles.td}><input style={styles.checkbox} checked={selected.includes(candidate.id)} onChange={() => toggleCandidate(candidate.id)} type="checkbox" data-element={blueprintActions.selectCandidate.elementId} aria-label={`Select ${candidate.name}`} /></td>
                      <td style={styles.td}><span style={styles.product}><strong style={styles.productName}>{candidate.name}</strong><span style={styles.mono}>{candidate.id}</span></span></td>
                      <td style={styles.td}><span style={styles.mono}>{candidate.sku}</span></td>
                      <td style={styles.td}><span style={styles.price}>{new Intl.NumberFormat("en-US", { style: "currency", currency: candidate.currency || "USD" }).format(candidate.priceCents / 100)}</span></td>
                      <td style={styles.td}><span style={badgeStyle(candidate.status)}><span style={styles.badgeDot} />{statusLabel(candidate.status)}</span></td>
                      <td style={{ ...styles.td, textAlign: "right" }}><button ref={previewId === candidate.id ? triggerRef : undefined} style={styles.previewButton} type="button" onClick={(event) => { triggerRef.current = event.currentTarget; setPreviewId(candidate.id); }} data-element={blueprintActions.previewCandidate.elementId} data-action={blueprintActions.previewCandidate.actionId}>{blueprintActions.previewCandidate.label}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.empty}>
              <p>No candidates match the current search and status filter.<br /><button style={{ ...styles.secondary, marginTop: 12 }} type="button" onClick={() => { setQuery(""); setStatus("all"); }}>Clear filters</button></p>
            </div>
          )}
        </section>
        <p style={styles.statusMessage} aria-live="polite">{message}</p>

        {preview ? (
          <>
            <button style={styles.backdrop} type="button" onClick={closePreview} aria-label="Close candidate preview" />
            <aside style={styles.drawer} aria-label="Candidate preview" aria-modal="true" role="dialog">
              <header style={styles.drawerHeader}><h2 style={styles.drawerTitle}>Candidate Preview</h2><button type="button" style={styles.close} onClick={closePreview} aria-label="Close candidate preview">Close</button></header>
              <div style={styles.drawerBody}>
                <div>
                  <p style={{ ...styles.cardTitle, marginBottom: 8 }}>Imported Record</p>
                  <h3 style={{ margin: "0 0 8px", color: "#1c1917", fontSize: 18 }}>{preview.name}</h3>
                  <p style={styles.drawerCopy}>Review extracted fields before promotion. Validation conflicts remain visible until resolved.</p>
                </div>
                <form style={styles.form} onSubmit={saveCandidate}>
                  <label style={{ ...styles.formLabel, ...styles.wide }}>Name<input style={styles.formInput} name="name" defaultValue={preview.name} required /></label>
                  <label style={styles.formLabel}>SKU<input style={styles.formInput} name="sku" defaultValue={preview.sku} required /></label>
                  <label style={styles.formLabel}>Price<input style={styles.formInput} name="price" type="number" min="0" step="0.01" defaultValue={(preview.priceCents / 100).toFixed(2)} required /></label>
                  <label style={styles.formLabel}>Currency<input style={styles.formInput} name="currency" defaultValue={preview.currency} minLength={3} maxLength={3} required /></label>
                  <AiInferenceDetails payload={preview.payload} />
                  {preview.status === "conflict" ? <p style={styles.notice}>Resolve this candidate’s validation conflict before importing it.</p> : null}
                  <div style={styles.drawerActions}><button style={styles.secondary} type="button" onClick={closePreview}>Cancel</button><button style={styles.primary} disabled={pending} type="submit">Save candidate</button></div>
                </form>
              </div>
            </aside>
          </>
        ) : null}
      </main>
    </div>
  );
}

function AiInferenceDetails({ payload }: { payload?: unknown }) {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const confidence = typeof record.confidence === "number" ? `${Math.round(record.confidence * 100)}%` : null;
  const model = typeof record.model === "string" ? record.model : typeof record.provider === "string" ? record.provider : null;
  const reason = typeof record.reason === "string" ? record.reason : typeof record.explanation === "string" ? record.explanation : null;
  if (!confidence && !model && !reason) return null;
  return (
    <div style={styles.inference}>
      <p style={{ ...styles.cardTitle, margin: 0 }}>AI Inference Details</p>
      {model ? <p style={{ margin: 0 }}><strong>Provider/model:</strong> {model}</p> : null}
      {confidence ? <p style={{ margin: 0 }}><strong>Confidence:</strong> {confidence}</p> : null}
      {reason ? <p style={{ ...styles.drawerCopy, margin: 0 }}>{reason}</p> : null}
    </div>
  );
}

function toCandidate(value: { id: string; name: string; sku: string; state: string; priceCents: number; currency: string; payload?: unknown }): Candidate {
  return { id: value.id, name: value.name, sku: value.sku, status: value.state, priceCents: value.priceCents, currency: value.currency, payload: value.payload };
}
