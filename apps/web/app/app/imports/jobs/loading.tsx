import Link from "next/link";
import type { CSSProperties } from "react";

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", minWidth: 1120, background: "#f9f8f6", color: "#333", padding: "32px 32px 48px" },
  breadcrumb: { display: "flex", gap: 10, margin: "0 0 8px", color: "#a8a29e", fontSize: 13, fontWeight: 700 },
  title: { margin: "0 0 8px", color: "#1c1917", fontSize: 20, fontWeight: 900 },
  description: { margin: "0 0 28px", color: "#78716c", fontSize: 13 },
  card: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff" },
  cardHeader: { minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e7e5e4", background: "#fafaf9", padding: "0 20px" },
  cardTitle: { margin: 0, fontSize: 12, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase" },
  state: { display: "grid", placeItems: "center", minHeight: 260, color: "#78716c", fontSize: 13 },
} satisfies Record<string, CSSProperties>;

export default function ImportJobsLoading() {
  return (
    <div className="import-jobs-prototype-page" aria-busy="true" aria-live="polite" style={styles.page}>
      <nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span aria-hidden="true">›</span><Link href="/app/imports" style={{ color: "inherit", textDecoration: "none" }}>Imports</Link><span aria-hidden="true">›</span><strong aria-current="page">Jobs</strong></nav>
      <h1 style={styles.title}>Import Jobs</h1>
      <p style={styles.description}>Review the complete import history and open any job for details.</p>
      <section aria-label="Import job history loading" style={styles.card}>
        <div style={styles.cardHeader}><h2 style={styles.cardTitle}>Import Jobs</h2><span>Loading…</span></div>
        <div style={styles.state}>Loading import job history…</div>
      </section>
    </div>
  );
}
