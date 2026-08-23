import Link from "next/link";
import type { CSSProperties } from "react";

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", minWidth: 1120, background: "#f9f8f6", color: "#333", padding: "32px 32px 48px" },
  breadcrumb: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "#78716c", fontSize: 13 },
  title: { margin: 0, color: "#1c1917", fontSize: 20, fontWeight: 900, letterSpacing: "-.03em" },
  description: { margin: "8px 0 20px", color: "#78716c", fontSize: 13 },
  toolbar: { minHeight: 132, border: "1px solid #e7e5e4", borderBottom: 0, borderRadius: "8px 8px 0 0", background: "#fff" },
  card: { minHeight: 320, display: "grid", placeItems: "center", border: "1px solid #e7e5e4", borderRadius: "0 0 8px 8px", background: "#fff", color: "#78716c", fontSize: 13 },
} satisfies Record<string, CSSProperties>;

export default function DiscoveryLoading() {
  return (
    <div className="discovery-prototype-page" aria-busy="true" aria-live="polite" style={styles.page}>
      <nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span aria-hidden="true">›</span><strong aria-current="page">Discovery</strong></nav>
      <h1 style={styles.title}>Discovery</h1>
      <p style={styles.description}>Search and edit imported products and services across your workspace.</p>
      <div aria-hidden="true" style={styles.toolbar} />
      <section aria-label="Discovery results loading" style={styles.card}>Loading imported products and services…</section>
    </div>
  );
}
