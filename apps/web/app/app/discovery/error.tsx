"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", minWidth: 1120, background: "#f9f8f6", color: "#333", padding: "32px 32px 48px" },
  breadcrumb: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "#78716c", fontSize: 13 },
  title: { margin: 0, color: "#1c1917", fontSize: 20, fontWeight: 900, letterSpacing: "-.03em" },
  description: { margin: "8px 0 20px", color: "#78716c", fontSize: 13 },
  card: { minHeight: 320, display: "grid", alignContent: "center", justifyItems: "center", gap: 14, border: "1px solid #fecaca", borderRadius: 8, background: "#fff", color: "#78716c", padding: 32, textAlign: "center", fontSize: 13 },
  retry: { minHeight: 36, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 16px", fontWeight: 900 },
} satisfies Record<string, CSSProperties>;

export default function DiscoveryError({ reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <div className="discovery-prototype-page" style={styles.page}>
      <nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span aria-hidden="true">›</span><strong aria-current="page">Discovery</strong></nav>
      <h1 style={styles.title}>Discovery</h1>
      <p style={styles.description}>Search and edit imported products and services across your workspace.</p>
      <section aria-label="Discovery results error" role="alert" style={styles.card}>
        <span>Discovery results are unavailable. Check your workspace access or try again.</span>
        <button type="button" style={styles.retry} onClick={reset}>Try Again</button>
      </section>
    </div>
  );
}
