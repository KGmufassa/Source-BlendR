"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { JobCandidate } from "@/lib/job-candidates";

const styles = {
  section: { marginBottom: 28 },
  toolbar: { display: "grid", gap: 12, border: "1px solid #e7e5e4", borderBottom: 0, borderRadius: "5px 5px 0 0", background: "#fff", padding: 16 },
  toolbarRow: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  title: { margin: 0, color: "#292524", fontSize: 14, fontWeight: 900 },
  controls: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 },
  input: { minHeight: 36, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#292524", padding: "0 12px", fontSize: 12 },
  search: { width: 300 },
  categoryInput: { width: 220 },
  primary: { minHeight: 34, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 14px", fontSize: 12, fontWeight: 900 },
  secondary: { minHeight: 34, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 14px", fontSize: 12, fontWeight: 800 },
  meta: { color: "#78716c", fontSize: 12 },
  message: { minHeight: 18, margin: 0, color: "#57534e", fontSize: 12 },
  card: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: "0 0 5px 5px", background: "#fff", boxShadow: "0 1px 2px rgb(0 0 0 / 4%)" },
  scroll: { overflowX: "auto" },
  table: { width: "100%", minWidth: 1000, borderCollapse: "collapse", fontSize: 13 },
  th: { borderBottom: "1px solid #e7e5e4", background: "#fafaf9", color: "#71717a", padding: "14px", textAlign: "left", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" },
  td: { borderBottom: "1px solid #f5f5f4", padding: "13px 14px", verticalAlign: "middle", color: "#57534e" },
  checkbox: { width: 17, minHeight: 17, accentColor: "#a85e2a" },
  thumb: { width: 44, height: 44, display: "grid", placeItems: "center", overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: 5, background: "#f5f5f4", color: "#78716c", fontSize: 10, textAlign: "center" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  name: { color: "#292524", fontWeight: 900 },
  action: { border: 0, background: "transparent", color: "#a85e2a", padding: 0, fontSize: 12, fontWeight: 900 },
  empty: { padding: 44, textAlign: "center", color: "#78716c" },
  footer: { minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "0 18px", color: "#78716c", fontSize: 12 },
  pager: { display: "flex", alignItems: "center", gap: 10 },
} satisfies Record<string, CSSProperties>;

const pageSize = 20;

function ImageThumbnail({ candidate }: Readonly<{ candidate: JobCandidate }>) {
  const [failed, setFailed] = useState(false);
  return <span style={styles.thumb}>{candidate.imageUrl && !failed ? <img src={candidate.imageUrl} alt={`${candidate.name} thumbnail`} style={styles.image} onError={() => setFailed(true)} /> : <span aria-label="No image available">No image</span>}</span>;
}

export function CandidateReviewTable({ jobId, initialCandidates, initialTotal, jobStatus }: Readonly<{ jobId: string; initialCandidates: JobCandidate[]; initialTotal: number; jobStatus: string }>) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [total, setTotal] = useState(initialTotal);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const initialRender = useRef(true);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = candidates;
  const allVisibleSelected = visible.length > 0 && visible.every((candidate) => selected.includes(candidate.id));

  useEffect(() => {
    if (initialRender.current && page === 1 && !query) {
      initialRender.current = false;
      return;
    }
    initialRender.current = false;
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setSelected([]);
    const params = new URLSearchParams({ page: String(page) });
    if (query.trim()) params.set("query", query.trim());
    void fetch(`/api/imports/jobs/${jobId}/candidates?${params.toString()}`, { signal: controller.signal }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Unable to load analyzed items.");
      if (!active) return;
      setCandidates(result.data.candidates);
      setTotal(result.data.total);
      setPage(result.data.page);
      setMessage("");
    }).catch((error) => {
      if (!active || error instanceof DOMException && error.name === "AbortError") return;
      setMessage(error instanceof Error ? error.message : "Unable to load analyzed items.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [jobId, page, query]);

  function beginBulkEdit(candidateId?: string) {
    setBulkMode(true);
    setSelected(candidateId ? [candidateId] : []);
    setCategory(candidateId ? candidates.find((candidate) => candidate.id === candidateId)?.category ?? "" : "");
    setMessage("");
  }

  function closeBulkEdit() {
    setBulkMode(false);
    setSelected([]);
    setCategory("");
    setMessage("");
  }

  async function applyCategory() {
    const nextCategory = category.trim();
    if (!selected.length || !nextCategory) return;
    setPending(true);
    setMessage("Updating category…");
    try {
      const response = await fetch(`/api/imports/jobs/${jobId}/candidates`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ candidateIds: selected, category: nextCategory }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Unable to update category.");
      setCandidates((current) => current.map((candidate) => selected.includes(candidate.id) ? { ...candidate, category: nextCategory } : candidate));
      setMessage(`${result.data.updated} item(s) updated.`);
      setSelected([]);
      setCategory("");
    } catch (error) {
      setMessage(`No categories were changed: ${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      setPending(false);
    }
  }

  const emptyMessage = jobStatus === "failed"
    ? "Analysis failed before products or services became available. Review the Event Log for details."
    : ["queued", "processing"].includes(jobStatus)
      ? "Products and services are still being analyzed."
      : "No analyzed products or services are available for this job.";

  return <section aria-labelledby="candidate-review-title" style={styles.section}>
    <div style={styles.toolbar}>
      <div style={styles.toolbarRow}>
        <div><h2 id="candidate-review-title" style={styles.title}>Analyzed Products and Services</h2><span style={styles.meta}>{total} result(s)</span></div>
        <div style={styles.controls}>
          <label><span className="sr-only">Search analyzed products and services</span><input type="search" value={query} placeholder="Search products or SKU…" style={{ ...styles.input, ...styles.search }} onChange={(event) => { setQuery(event.target.value); setPage(1); setSelected([]); }} /></label>
          {!bulkMode ? <button type="button" style={styles.secondary} onClick={() => beginBulkEdit()}>Bulk Edit Category</button> : null}
        </div>
      </div>
      {bulkMode ? <div style={styles.toolbarRow}>
        <span style={styles.meta}>{selected.length} selected</span>
        <div style={styles.controls}>
          <label><span className="sr-only">Category for selected items</span><input value={category} placeholder="Enter category" style={{ ...styles.input, ...styles.categoryInput }} onChange={(event) => setCategory(event.target.value)} /></label>
          <button type="button" disabled={pending || !selected.length || !category.trim()} style={styles.primary} onClick={() => void applyCategory()}>{pending ? "Applying…" : "Apply Category"}</button>
          <button type="button" disabled={pending} style={styles.secondary} onClick={closeBulkEdit}>Exit Bulk Edit</button>
        </div>
      </div> : null}
      <p aria-live="polite" style={styles.message}>{message}</p>
    </div>
    <div style={styles.card}>
      {loading ? <div style={styles.empty}>Loading analyzed products and services…</div> : visible.length ? <div style={styles.scroll}><table aria-label="Analyzed products and services" style={styles.table}>
        <thead><tr>{bulkMode ? <th style={styles.th}><input type="checkbox" aria-label="Select visible results" checked={allVisibleSelected} style={styles.checkbox} onChange={(event) => setSelected(event.target.checked ? [...new Set([...selected, ...visible.map((candidate) => candidate.id)])] : selected.filter((id) => !visible.some((candidate) => candidate.id === id)))} /></th> : null}<th style={styles.th}>Image</th><th style={styles.th}>Product or Service</th><th style={styles.th}>SKU / Reference</th><th style={styles.th}>Vendor</th><th style={styles.th}>Category</th><th style={styles.th}>Price</th><th style={{ ...styles.th, textAlign: "right" }}>Action</th></tr></thead>
        <tbody>{visible.map((candidate) => <tr key={candidate.id}>
          {bulkMode ? <td style={styles.td}><input type="checkbox" aria-label={`Select ${candidate.name}`} checked={selected.includes(candidate.id)} style={styles.checkbox} onChange={(event) => setSelected((current) => event.target.checked ? [...new Set([...current, candidate.id])] : current.filter((id) => id !== candidate.id))} /></td> : null}
          <td style={styles.td}><ImageThumbnail candidate={candidate} /></td>
          <td style={styles.td}><strong style={styles.name}>{candidate.name}</strong></td>
          <td style={styles.td}>{candidate.sku}</td>
          <td style={styles.td}>{candidate.vendorName}</td>
          <td style={styles.td}>{candidate.category}</td>
          <td style={styles.td}>{new Intl.NumberFormat("en-US", { style: "currency", currency: candidate.currency }).format(candidate.priceCents / 100)}</td>
          <td style={{ ...styles.td, textAlign: "right" }}><button type="button" style={styles.action} onClick={() => beginBulkEdit(candidate.id)}>Edit Category</button></td>
        </tr>)}</tbody>
      </table></div> : <div style={styles.empty}>{query ? "No analyzed products or services match the search." : emptyMessage}</div>}
      <footer style={styles.footer}><span>Showing {total ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, total)} of {total}</span><span style={styles.pager}><button type="button" disabled={loading || currentPage <= 1} style={styles.secondary} onClick={() => { setPage((value) => value - 1); setSelected([]); }}>Previous</button><span>Page {currentPage} of {pageCount}</span><button type="button" disabled={loading || currentPage >= pageCount} style={styles.secondary} onClick={() => { setPage((value) => value + 1); setSelected([]); }}>Next</button></span></footer>
    </div>
  </section>;
}
