"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", minWidth: 1120, background: "#f9f8f6", color: "#333", padding: "32px 32px 48px" },
  breadcrumb: { display: "flex", gap: 10, margin: "0 0 8px", color: "#a8a29e", fontSize: 13, fontWeight: 700 },
  title: { margin: "0 0 8px", color: "#1c1917", fontSize: 20, fontWeight: 900 },
  description: { margin: "0 0 28px", color: "#78716c", fontSize: 13 },
  card: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff" },
  cardHeader: { minHeight: 56, display: "flex", alignItems: "center", borderBottom: "1px solid #e7e5e4", background: "#fafaf9", padding: "0 20px" },
  cardTitle: { margin: 0, fontSize: 12, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase" },
  state: { display: "grid", justifyItems: "center", gap: 14, minHeight: 260, alignContent: "center", color: "#78716c", padding: 32, textAlign: "center", fontSize: 13 },
  retry: { minHeight: 36, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 16px", fontWeight: 900 },
} satisfies Record<string, CSSProperties>;

function JobDetailBreadcrumb() {
  const entry = useSearchParams().get("entry");
  const fromImports = entry === "imports";
  const fromWebsite = entry === "website-import";
  return <nav aria-label="Breadcrumb" style={styles.breadcrumb}>
    <Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span aria-hidden="true">›</span>
    <Link href="/app/imports" style={{ color: "inherit", textDecoration: "none" }}>Imports</Link><span aria-hidden="true">›</span>
    {fromWebsite ? <><Link href="/app/imports/website" style={{ color: "inherit", textDecoration: "none" }}>Website Import</Link><span aria-hidden="true">›</span></> : null}
    {!fromImports && !fromWebsite ? <><Link href="/app/imports/jobs" style={{ color: "inherit", textDecoration: "none" }}>Jobs</Link><span aria-hidden="true">›</span></> : null}
    <strong aria-current="page">Job Details</strong>
  </nav>;
}

export function JobDetailState({ kind, reset }: Readonly<{ kind: "loading" | "error"; reset?: () => void }>) {
  const loading = kind === "loading";
  return <div className="import-job-detail-prototype-page" aria-busy={loading || undefined} aria-live={loading ? "polite" : undefined} style={styles.page}>
    <JobDetailBreadcrumb />
    <h1 style={styles.title}>Job Details</h1>
    <p style={styles.description}>Review analysis results and choose what should be scraped next.</p>
    <section aria-label={loading ? "Job details loading" : "Job details error"} role={loading ? "status" : "alert"} style={styles.card}>
      <div style={styles.cardHeader}><h2 style={styles.cardTitle}>Job Details</h2></div>
      <div style={styles.state}>{loading ? "Loading job analysis…" : <><span>Job details are unavailable. Check your workspace access or try again.</span><button type="button" style={styles.retry} onClick={reset}>Try Again</button></>}</div>
    </section>
  </div>;
}
