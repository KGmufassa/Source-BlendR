import Link from "next/link";
import type { CSSProperties } from "react";

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", minWidth: 1120, background: "#f9f8f6", color: "#292524", padding: 32 },
  breadcrumb: { display: "flex", gap: 8, marginBottom: 10, color: "#78716c", fontSize: 13 },
  title: { margin: 0, fontSize: 20, fontWeight: 900 },
  subtitle: { margin: "8px 0 24px", color: "#78716c", fontSize: 13 },
  card: { minHeight: 390, display: "grid", placeItems: "center", border: "1px solid #e7e5e4", borderRadius: 8, background: "#fff", color: "#78716c", fontSize: 13 },
} satisfies Record<string, CSSProperties>;

export default function VendorsLoading() {
  return <div className="vendors-prototype-page" aria-busy="true" aria-live="polite" style={styles.page}><nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span aria-hidden="true">›</span><strong aria-current="page">Vendors</strong></nav><h1 style={styles.title}>Vendors</h1><p style={styles.subtitle}>Manage supplier details and source ingestion methods.</p><section aria-label="Vendor list loading" style={styles.card}>Loading vendors…</section></div>;
}
