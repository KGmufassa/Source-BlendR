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
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderBottom: "1px solid #e7e5e4", padding: 16 },
  input: { width: 320, minHeight: 38, border: "1px solid #d6d3d1", borderRadius: 5, padding: "0 12px" },
  select: { minHeight: 38, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", padding: "0 28px 0 10px" },
  scroll: { overflowX: "auto" },
  table: { width: "100%", minWidth: 850, borderCollapse: "collapse" },
  th: { borderBottom: "1px solid #e7e5e4", background: "#fafaf9", padding: "14px 18px", textAlign: "left", color: "#78716c", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em" },
  td: { borderBottom: "1px solid #f5f5f4", padding: "16px 18px", color: "#57534e", fontSize: 13 },
  name: { color: "#292524", fontWeight: 900 },
  status: { display: "inline-flex", border: "1px solid #e7e5e4", borderRadius: 999, background: "#f5f5f4", padding: "4px 10px", fontSize: 11, fontWeight: 800, textTransform: "capitalize" },
  action: { color: "#a85e2a", fontWeight: 900, textDecoration: "none" },
  footer: { minHeight: 56, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: "0 18px", color: "#78716c", fontSize: 12 },
  button: { minHeight: 32, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", padding: "0 12px" },
  empty: { padding: 48, textAlign: "center", color: "#78716c" },
} satisfies Record<string, CSSProperties>;

export function CatalogClient({ initialCatalogs }: { initialCatalogs: CatalogSummary[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const categories = [...new Set(initialCatalogs.map((catalog) => catalog.categoryType))].sort();
  const filtered = useMemo(() => initialCatalogs.filter((catalog) => (!query || `${catalog.name} ${catalog.categoryType}`.toLowerCase().includes(query.toLowerCase())) && (!category || catalog.categoryType === category)), [initialCatalogs, query, category]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return <div className="catalog-prototype-page" style={styles.page}>
    <header style={styles.header}><div><nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span>›</span><strong aria-current="page">Catalog</strong></nav><h1 style={styles.title}>Catalogs</h1><p style={styles.subtitle}>Create and manage catalogs built from custom product and service selections.</p></div><Link href="/app/catalog/new" style={styles.primary}>Create Catalog</Link></header>
    <section style={styles.card}>
      <div style={styles.toolbar}><label><span className="sr-only">Search catalogs</span><input value={query} type="search" placeholder="Search catalog name or category…" style={styles.input} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></label><select aria-label="Category type" value={category} style={styles.select} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="">All category types</option>{categories.map((value) => <option key={value}>{value}</option>)}</select></div>
      {visible.length ? <div style={styles.scroll}><table aria-label="Catalogs" style={styles.table}><thead><tr><th style={styles.th}>Catalog Name</th><th style={styles.th}>Category Type</th><th style={styles.th}>Items</th><th style={styles.th}>Status</th><th style={styles.th}>Last Updated</th><th style={{ ...styles.th, textAlign: "right" }}>Action</th></tr></thead><tbody>{visible.map((catalog) => <tr key={catalog.id}><td style={{ ...styles.td, ...styles.name }}>{catalog.name}</td><td style={styles.td}>{catalog.categoryType}</td><td style={styles.td}>{catalog.itemCount}</td><td style={styles.td}><span style={styles.status}>{catalog.status}</span></td><td style={styles.td}><time dateTime={catalog.updatedAt}>{new Date(catalog.updatedAt).toLocaleDateString()}</time></td><td style={{ ...styles.td, textAlign: "right" }}><Link href={`/app/catalog/${catalog.id}`} style={styles.action}>View Details</Link></td></tr>)}</tbody></table></div> : <div style={styles.empty}>{initialCatalogs.length ? "No catalogs match your search." : <><p>No catalogs have been created yet.</p><Link href="/app/catalog/new" style={styles.action}>Create your first catalog</Link></>}</div>}
      <footer style={styles.footer}><span>Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span><span><button type="button" style={styles.button} disabled={currentPage <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button> <span>Page {currentPage} of {pageCount}</span> <button type="button" style={styles.button} disabled={currentPage >= pageCount} onClick={() => setPage((value) => value + 1)}>Next</button></span></footer>
    </section>
  </div>;
}
