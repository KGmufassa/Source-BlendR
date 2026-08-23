import Link from "next/link";
import type { CSSProperties } from "react";

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", minWidth: 1120, background: "#f9f8f6", color: "#292524", padding: 32 },
  breadcrumb: { display: "flex", gap: 8, marginBottom: 8, color: "#78716c", fontSize: 13 },
  title: { margin: 0, fontSize: 20, fontWeight: 900 },
  description: { margin: "8px 0 24px", color: "#78716c", fontSize: 13 },
  card: { minHeight: 210, maxWidth: 760, display: "grid", placeItems: "center", border: "1px solid #e7e5e4", borderRadius: 6, background: "#fff", color: "#78716c", fontSize: 13 },
} satisfies Record<string, CSSProperties>;

export default function NewCatalogLoading() {
  return <div className="new-catalog-prototype-page" aria-busy="true" aria-live="polite" style={styles.page}><nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span aria-hidden="true">›</span><Link href="/app/catalog" style={{ color: "inherit", textDecoration: "none" }}>Catalog</Link><span aria-hidden="true">›</span><strong aria-current="page">New Catalog</strong></nav><h1 style={styles.title}>Create Catalog</h1><p style={styles.description}>Name the catalog and define its category type. Add products and services after saving.</p><section aria-label="New catalog form loading" style={styles.card}>Loading catalog form…</section></div>;
}
