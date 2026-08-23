"use client";

import type { CSSProperties } from "react";
import Link from "next/link";

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", minWidth: 1120, background: "#f9f8f6", color: "#333", padding: "32px 32px 48px" },
  breadcrumb: { display: "flex", gap: 10, margin: "0 0 8px", color: "#a8a29e", fontSize: 13, fontWeight: 700 },
  title: { margin: "0 0 8px", color: "#1c1917", fontSize: 20, fontWeight: 900 },
  description: { margin: "0 0 28px", color: "#78716c", fontSize: 13 },
  card: { overflow: "hidden", border: "1px solid #fecaca", borderRadius: 5, background: "#fff" },
  cardHeader: { minHeight: 56, display: "flex", alignItems: "center", borderBottom: "1px solid #fecaca", background: "#fff7f7", padding: "0 20px" },
  cardTitle: { margin: 0, fontSize: 12, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase" },
  state: { display: "grid", justifyItems: "center", gap: 14, minHeight: 260, alignContent: "center", color: "#78716c", padding: 32, textAlign: "center", fontSize: 13 },
  retry: { minHeight: 36, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 16px", fontWeight: 900 },
} satisfies Record<string, CSSProperties>;

export default function ImportJobsError({ reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <div className="import-jobs-prototype-page" style={styles.page}>
      <nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span aria-hidden="true">›</span><Link href="/app/imports" style={{ color: "inherit", textDecoration: "none" }}>Imports</Link><span aria-hidden="true">›</span><strong aria-current="page">Jobs</strong></nav>
      <h1 style={styles.title}>Import Jobs</h1>
      <p style={styles.description}>Review the complete import history and open any job for details.</p>
      <section aria-label="Import job history error" role="alert" style={styles.card}>
        <div style={styles.cardHeader}><h2 style={styles.cardTitle}>Import Jobs</h2></div>
        <div style={styles.state}>
          <span>Import job history is unavailable. Check your workspace access or try again.</span>
          <button type="button" style={styles.retry} onClick={reset}>Try Again</button>
        </div>
      </section>
    </div>
  );
}
