"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";

export type VendorRow = { id: string; name: string; websiteUrl: string | null; status: string; sources: string[]; lastImport: string | null; placeholder: boolean };

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", minWidth: 1120, background: "#f9f8f6", color: "#292524" },
  header: { padding: "32px 32px 20px" },
  breadcrumb: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "#78716c", fontSize: 13 },
  title: { margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: "-.03em" },
  subtitle: { margin: "8px 0 0", color: "#78716c", fontSize: 13 },
  content: { padding: "0 32px 48px" },
  toolbar: { display: "grid", gap: 18, border: "1px solid #e7e5e4", borderBottom: 0, borderRadius: "8px 8px 0 0", background: "#fff", padding: 20 },
  toolbarRow: { display: "flex", alignItems: "end", flexWrap: "wrap", gap: 16 },
  searchControl: { display: "grid", flex: "1 1 420px", gap: 7, maxWidth: 560 },
  controls: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 },
  controlLabel: { color: "#57534e", fontSize: 11, fontWeight: 900, letterSpacing: ".06em", textTransform: "uppercase" },
  input: { boxSizing: "border-box", width: "100%", minHeight: 40, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#292524", padding: "0 12px", fontSize: 12 },
  select: { minHeight: 36, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 30px 0 10px", fontSize: 12 },
  primary: { minHeight: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 16px", textDecoration: "none", fontSize: 12, fontWeight: 900 },
  bulkSection: { minHeight: 70, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, border: "1px solid #e7e5e4", borderBottom: 0, background: "#fafaf9", padding: "12px 20px" },
  bulkSummary: { display: "grid", gap: 2 },
  bulkTitle: { color: "#1c1917", fontSize: 12, fontWeight: 900 },
  bulkControls: { display: "flex", alignItems: "end", flexWrap: "wrap", gap: 10 },
  destructive: { minHeight: 40, border: "1px solid #b91c1c", borderRadius: 5, background: "#fff", color: "#b91c1c", padding: "0 16px", fontSize: 12, fontWeight: 900 },
  message: { margin: 0, color: "#57534e", fontSize: 12 },
  tableCard: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: "0 0 8px 8px", background: "#fff", boxShadow: "0 1px 3px rgb(0 0 0 / 6%)" },
  scroll: { overflowX: "auto" },
  table: { width: "100%", minWidth: 900, borderCollapse: "collapse", fontSize: 13 },
  th: { borderBottom: "1px solid #e7e5e4", background: "#fafaf9", padding: 14, color: "#71717a", textAlign: "left", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" },
  td: { borderBottom: "1px solid #f5f5f4", padding: "13px 14px", verticalAlign: "middle", color: "#57534e" },
  checkbox: { width: 17, minHeight: 17, accentColor: "#a85e2a" },
  name: { color: "#1c1917", fontWeight: 900 },
  chip: { display: "inline-flex", border: "1px solid #e7e5e4", borderRadius: 5, background: "#f5f5f4", marginRight: 6, padding: "4px 8px", fontSize: 11 },
  status: { textTransform: "capitalize" },
  action: { color: "#a85e2a", fontSize: 12, fontWeight: 900, textDecoration: "none" },
  muted: { color: "#78716c", fontSize: 11 },
  footer: { minHeight: 56, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "0 18px", color: "#78716c", fontSize: 12 },
  footerSummary: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16 },
  pager: { display: "flex", alignItems: "center", gap: 10 },
  button: { minHeight: 34, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 14px", fontSize: 12, fontWeight: 800 },
  empty: { padding: 44, textAlign: "center", color: "#78716c" },
} satisfies Record<string, CSSProperties>;

export function VendorsClient({ initialVendors }: { initialVendors: VendorRow[] }) {
  const [vendors, setVendors] = useState(initialVendors);
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkPending, setBulkPending] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => vendors.filter((vendor) => {
    const matchesQuery = !query || `${vendor.name} ${vendor.websiteUrl ?? ""} ${vendor.sources.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery;
  }), [vendors, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleVendorIds = visible.filter((vendor) => !vendor.placeholder).map((vendor) => vendor.id);
  const allVisibleSelected = visibleVendorIds.length > 0 && visibleVendorIds.every((id) => selected.includes(id));

  function clearSelection() {
    setSelected([]);
  }

  async function deleteSelected() {
    if (!selected.length || !window.confirm(`Delete ${selected.length} selected vendor${selected.length === 1 ? "" : "s"}? Import-job history will remain, but its vendor link will be cleared. This action cannot be undone.`)) return;
    setBulkPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/vendors", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ vendorIds: selected }) });
      const result = await response.json();
      if (response.ok) {
        const deletedIds = new Set(selected);
        setVendors((current) => current.filter((vendor) => !deletedIds.has(vendor.id)));
        setMessage(`${result.data.deleted} vendor${result.data.deleted === 1 ? "" : "s"} deleted.`);
        clearSelection();
      } else {
        setMessage(result.error?.code === "vendor_selection_invalid" ? "One or more selected vendors are unavailable. Nothing was deleted; refresh the list and try again." : result.error?.message ?? "Unable to delete the selected vendors.");
      }
    } catch {
      setMessage("Unable to delete the selected vendors. Check your connection and try again.");
    } finally {
      setBulkPending(false);
    }
  }

  return <div className="vendors-prototype-page" style={styles.page}>
    <header style={styles.header}><nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span aria-hidden="true">›</span><strong aria-current="page">Vendors</strong></nav><h1 style={styles.title}>Vendors</h1><p style={styles.subtitle}>Manage supplier details and source ingestion methods.</p></header>
    <main style={styles.content}>
      <section aria-label="Vendor search and filters" style={styles.toolbar}>
        <div style={styles.toolbarRow}><label style={styles.searchControl}><span style={styles.controlLabel}>Search</span><input type="search" aria-label="Search vendors" placeholder="Search vendors, websites, or sources" value={query} style={styles.input} onChange={(event) => { setQuery(event.target.value); setPage(1); clearSelection(); }} /></label><Link href="/app/vendors/new" style={styles.primary}>New Vendor</Link></div>
        {message ? <p aria-live="polite" style={styles.message}>{message}</p> : null}
      </section>
      <section aria-label="Bulk actions" style={styles.bulkSection}><span style={styles.bulkSummary}><strong style={styles.bulkTitle}>Bulk actions</strong><span style={styles.muted}>{selected.length} selected</span></span><span style={styles.bulkControls}><button type="button" disabled={bulkPending || !selected.length} style={styles.destructive} onClick={() => void deleteSelected()}>{bulkPending ? "Deleting…" : "Delete selected"}</button></span></section>
      <section style={styles.tableCard}>
        {visible.length ? <div style={styles.scroll}><table aria-label="Vendors" style={styles.table}><thead><tr><th style={styles.th}><input type="checkbox" aria-label="Select visible vendors" disabled={bulkPending || !visibleVendorIds.length} checked={allVisibleSelected} style={styles.checkbox} onChange={(event) => setSelected(event.target.checked ? visibleVendorIds : [])} /></th><th style={styles.th}>Vendor Name</th><th style={styles.th}>Status</th><th style={styles.th}>Source Coverage</th><th style={styles.th}>Website</th><th style={styles.th}>Last Import</th><th style={{ ...styles.th, textAlign: "right" }}>Action</th></tr></thead><tbody>{visible.map((vendor) => <tr key={vendor.id}><td style={styles.td}><input type="checkbox" aria-label={`Select ${vendor.name}`} disabled={vendor.placeholder || bulkPending} checked={selected.includes(vendor.id)} style={styles.checkbox} onChange={(event) => setSelected((current) => event.target.checked ? [...new Set([...current, vendor.id])] : current.filter((id) => id !== vendor.id))} /></td><td style={{ ...styles.td, ...styles.name }}>{vendor.name}{vendor.placeholder ? <div style={styles.muted}>Sample vendor</div> : null}</td><td style={{ ...styles.td, ...styles.status }}>{vendor.status}</td><td style={styles.td}>{vendor.sources.length ? vendor.sources.map((value) => <span key={value} style={styles.chip}>{value}</span>) : "Manual"}</td><td style={styles.td}>{vendor.websiteUrl ? new URL(vendor.websiteUrl).hostname : "Not provided"}</td><td style={styles.td}>{vendor.lastImport ? new Date(vendor.lastImport).toLocaleString() : "No imports"}</td><td style={{ ...styles.td, textAlign: "right" }}>{vendor.placeholder ? <span style={styles.muted}>Details unavailable</span> : <Link href={`/app/vendors/${vendor.id}`} style={styles.action}>View Details</Link>}</td></tr>)}</tbody></table></div> : <div style={styles.empty}>No vendors match the current search.</div>}
        <footer style={styles.footer}><span style={styles.footerSummary}><label><span className="sr-only">Vendors per page</span><select aria-label="Vendors per page" value={pageSize} style={styles.select} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); clearSelection(); }}><option>20</option><option>50</option><option>100</option></select></label><span>Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span></span><span style={styles.pager}><button type="button" style={styles.button} disabled={currentPage <= 1} onClick={() => { setPage((value) => value - 1); clearSelection(); }}>Previous</button><span>Page {currentPage} of {pageCount}</span><button type="button" style={styles.button} disabled={currentPage >= pageCount} onClick={() => { setPage((value) => value + 1); clearSelection(); }}>Next</button></span></footer>
      </section>
    </main>
  </div>;
}
