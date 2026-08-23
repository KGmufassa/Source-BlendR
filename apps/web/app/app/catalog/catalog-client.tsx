"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";

export type CatalogSummary = { id: string; name: string; categoryType: string; status: string; itemCount: number; updatedAt: string };

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", minWidth: 1120, background: "#f9f8f6", padding: "32px", color: "#292524" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 24 },
  breadcrumb: { display: "flex", gap: 8, marginBottom: 8, color: "#78716c", fontSize: 13 },
  title: { margin: 0, fontSize: 20, fontWeight: 900 },
  subtitle: { margin: "8px 0 0", color: "#78716c", fontSize: 13 },
  primary: { minHeight: 36, display: "inline-flex", alignItems: "center", borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 16px", textDecoration: "none", fontSize: 13, fontWeight: 900 },
  card: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: 8, background: "#fff" },
  toolbar: { display: "grid", gap: 18, borderBottom: "1px solid #e7e5e4", background: "#fff", padding: 20 },
  toolbarRow: { display: "flex", alignItems: "end", flexWrap: "wrap", gap: 16 },
  filters: { display: "grid", gap: 8 },
  controls: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 },
  searchField: { display: "grid", flex: "1 1 420px", gap: 7, maxWidth: 560 },
  filterField: { display: "grid", gap: 7, width: 220 },
  controlLabel: { color: "#57534e", fontSize: 11, fontWeight: 900, letterSpacing: ".06em", textTransform: "uppercase" },
  input: { boxSizing: "border-box", width: "100%", minHeight: 40, border: "1px solid #d6d3d1", borderRadius: 5, padding: "0 12px" },
  select: { width: "100%", minHeight: 40, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", padding: "0 28px 0 10px" },
  reset: { minHeight: 40, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 18px", fontSize: 12, fontWeight: 800 },
  bulkSection: { minHeight: 70, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, borderBottom: "1px solid #e7e5e4", background: "#fafaf9", padding: "12px 20px" },
  bulkSummary: { display: "grid", gap: 2 },
  bulkTitle: { color: "#1c1917", fontSize: 12, fontWeight: 900 },
  bulkControls: { display: "flex", alignItems: "end", flexWrap: "wrap", gap: 10 },
  bulkField: { display: "grid", gap: 6 },
  bulkInput: { width: 220 },
  secondary: { minHeight: 40, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 16px", fontSize: 12, fontWeight: 800 },
  destructive: { minHeight: 40, border: "1px solid #b91c1c", borderRadius: 5, background: "#fff", color: "#b91c1c", padding: "0 16px", fontSize: 12, fontWeight: 900 },
  scroll: { overflowX: "auto" },
  table: { width: "100%", minWidth: 850, borderCollapse: "collapse" },
  th: { borderBottom: "1px solid #e7e5e4", background: "#fafaf9", padding: "14px 18px", textAlign: "left", color: "#78716c", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em" },
  td: { borderBottom: "1px solid #f5f5f4", padding: "16px 18px", color: "#57534e", fontSize: 13 },
  checkbox: { width: 17, minHeight: 17, accentColor: "#a85e2a" },
  name: { color: "#292524", fontWeight: 900 },
  status: { display: "inline-flex", border: "1px solid #e7e5e4", borderRadius: 999, background: "#f5f5f4", padding: "4px 10px", fontSize: 11, fontWeight: 800, textTransform: "capitalize" },
  action: { color: "#a85e2a", fontWeight: 900, textDecoration: "none" },
  footer: { minHeight: 56, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: "0 18px", color: "#78716c", fontSize: 12 },
  button: { minHeight: 32, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", padding: "0 12px" },
  empty: { padding: 48, textAlign: "center", color: "#78716c" },
  message: { margin: 0, color: "#57534e", fontSize: 12 },
} satisfies Record<string, CSSProperties>;

export function CatalogClient({ initialCatalogs }: { initialCatalogs: CatalogSummary[] }) {
  const [catalogs, setCatalogs] = useState(initialCatalogs);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkCategoryType, setBulkCategoryType] = useState("");
  const [bulkAction, setBulkAction] = useState<"edit" | "delete" | null>(null);
  const [message, setMessage] = useState("");
  const pageSize = 20;
  const categories = [...new Set(catalogs.map((catalog) => catalog.categoryType))].sort();
  const filtered = useMemo(() => catalogs.filter((catalog) => (!query || `${catalog.name} ${catalog.categoryType}`.toLowerCase().includes(query.toLowerCase())) && (!category || catalog.categoryType === category)), [catalogs, query, category]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleIds = visible.map((catalog) => catalog.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
  const bulkPending = bulkAction !== null;

  function clearViewSelection() {
    setSelected([]);
    setBulkCategoryType("");
  }

  async function applyBulkChanges() {
    const categoryType = bulkCategoryType.trim();
    if (!selected.length || !categoryType) return;
    setBulkAction("edit");
    setMessage("");
    const response = await fetch("/api/catalogs", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ catalogIds: selected, categoryType }) });
    const result = await response.json();
    if (response.ok) {
      const changedIds = new Set(selected);
      setCatalogs((current) => current.map((catalog) => changedIds.has(catalog.id) ? { ...catalog, categoryType, updatedAt: new Date().toISOString() } : catalog));
      setSelected([]);
      setBulkCategoryType("");
      setMessage(`${result.data.updated} catalog${result.data.updated === 1 ? "" : "s"} updated.`);
    } else setMessage(result.error?.code === "catalog_selection_invalid" ? "One or more selected catalogs are unavailable. Nothing was changed; refresh the list and try again." : result.error?.message ?? "Unable to update the selected catalogs.");
    setBulkAction(null);
  }

  async function deleteSelected() {
    if (!selected.length || !window.confirm(`Delete ${selected.length} selected catalog${selected.length === 1 ? "" : "s"}? Products and services will remain available in Discovery.`)) return;
    setBulkAction("delete");
    setMessage("");
    const response = await fetch("/api/catalogs", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ catalogIds: selected }) });
    const result = await response.json();
    if (response.ok) {
      const deletedIds = new Set(selected);
      setCatalogs((current) => current.filter((catalog) => !deletedIds.has(catalog.id)));
      setSelected([]);
      setBulkCategoryType("");
      setPage(1);
      setMessage(`${result.data.deleted} catalog${result.data.deleted === 1 ? "" : "s"} deleted.`);
    } else setMessage(result.error?.code === "catalog_selection_invalid" ? "One or more selected catalogs are unavailable. Nothing was deleted; refresh the list and try again." : result.error?.message ?? "Unable to delete the selected catalogs.");
    setBulkAction(null);
  }

  return <div className="catalog-prototype-page" style={styles.page}>
    <header style={styles.header}><div><nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span>›</span><strong aria-current="page">Catalog</strong></nav><h1 style={styles.title}>Catalogs</h1><p style={styles.subtitle}>Create and manage catalogs built from custom product and service selections.</p></div><Link href="/app/catalog/new" style={styles.primary}>Create Catalog</Link></header>
    <section style={styles.card}>
      <div aria-label="Catalog search and filters" style={styles.toolbar}><div style={styles.toolbarRow}><label style={styles.searchField}><span style={styles.controlLabel}>Search</span><input aria-label="Search catalogs" value={query} type="search" placeholder="Search catalog name or category type" style={styles.input} onChange={(event) => { setQuery(event.target.value); setPage(1); clearViewSelection(); }} /></label><button disabled={!query && !category} type="button" style={styles.reset} onClick={() => { setQuery(""); setCategory(""); setPage(1); clearViewSelection(); }}>Reset filters</button></div><div style={styles.filters}><span style={styles.controlLabel}>Filters</span><div style={styles.controls}><label style={styles.filterField}><span className="sr-only">Category Type</span><select aria-label="Category type" value={category} style={styles.select} onChange={(event) => { setCategory(event.target.value); setPage(1); clearViewSelection(); }}><option value="">All category types</option>{categories.map((value) => <option key={value}>{value}</option>)}</select></label></div></div>{message ? <p aria-live="polite" style={styles.message}>{message}</p> : null}</div>
      <section aria-label="Bulk actions" style={styles.bulkSection}><span style={styles.bulkSummary}><strong style={styles.bulkTitle}>Bulk actions</strong><span>{selected.length} selected</span></span><span style={styles.bulkControls}><label style={styles.bulkField}><span style={styles.controlLabel}>Category Type</span><input aria-label="Bulk category type" disabled={bulkPending} list="catalog-category-options" value={bulkCategoryType} placeholder="Enter category type" style={{ ...styles.input, ...styles.bulkInput }} onChange={(event) => setBulkCategoryType(event.target.value)} /></label><datalist id="catalog-category-options">{categories.map((value) => <option key={value} value={value} />)}</datalist><button disabled={bulkPending || !selected.length || !bulkCategoryType.trim()} type="button" style={styles.secondary} onClick={() => void applyBulkChanges()}>{bulkAction === "edit" ? "Applying…" : "Apply changes"}</button><button disabled={bulkPending || !selected.length} type="button" style={styles.destructive} onClick={() => void deleteSelected()}>{bulkAction === "delete" ? "Deleting…" : "Delete selected"}</button></span></section>
      {visible.length ? <div style={styles.scroll}><table aria-label="Catalogs" style={styles.table}><thead><tr><th style={styles.th}><input disabled={bulkPending} type="checkbox" aria-label="Select visible catalogs" checked={allVisibleSelected} style={styles.checkbox} onChange={(event) => setSelected(event.target.checked ? visibleIds : [])} /></th><th style={styles.th}>Catalog Name</th><th style={styles.th}>Category Type</th><th style={styles.th}>Items</th><th style={styles.th}>Status</th><th style={styles.th}>Last Updated</th><th style={{ ...styles.th, textAlign: "right" }}>Action</th></tr></thead><tbody>{visible.map((catalog) => <tr key={catalog.id}><td style={styles.td}><input disabled={bulkPending} type="checkbox" aria-label={`Select ${catalog.name}`} checked={selected.includes(catalog.id)} style={styles.checkbox} onChange={(event) => setSelected((current) => event.target.checked ? [...new Set([...current, catalog.id])] : current.filter((id) => id !== catalog.id))} /></td><td style={{ ...styles.td, ...styles.name }}>{catalog.name}</td><td style={styles.td}>{catalog.categoryType}</td><td style={styles.td}>{catalog.itemCount}</td><td style={styles.td}><span style={styles.status}>{catalog.status}</span></td><td style={styles.td}><time dateTime={catalog.updatedAt}>{new Date(catalog.updatedAt).toLocaleDateString()}</time></td><td style={{ ...styles.td, textAlign: "right" }}><Link href={`/app/catalog/${catalog.id}`} style={styles.action}>View Details</Link></td></tr>)}</tbody></table></div> : <div style={styles.empty}>{catalogs.length ? "No catalogs match your search." : <><p>No catalogs have been created yet.</p><Link href="/app/catalog/new" style={styles.action}>Create your first catalog</Link></>}</div>}
      <footer style={styles.footer}><span>Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span><span><button type="button" style={styles.button} disabled={currentPage <= 1} onClick={() => { setPage((value) => value - 1); clearViewSelection(); }}>Previous</button> <span>Page {currentPage} of {pageCount}</span> <button type="button" style={styles.button} disabled={currentPage >= pageCount} onClick={() => { setPage((value) => value + 1); clearViewSelection(); }}>Next</button></span></footer>
    </section>
  </div>;
}
