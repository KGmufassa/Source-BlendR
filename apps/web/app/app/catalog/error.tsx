"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", minWidth: 1120, background: "#f9f8f6", color: "#292524", padding: 32 },
  breadcrumb: { display: "flex", gap: 8, marginBottom: 8, color: "#78716c", fontSize: 13 },
  title: { margin: 0, fontSize: 20, fontWeight: 900 },
  subtitle: { margin: "8px 0 24px", color: "#78716c", fontSize: 13 },
  card: { minHeight: 390, display: "grid", alignContent: "center", justifyItems: "center", gap: 14, border: "1px solid #fecaca", borderRadius: 8, background: "#fff", color: "#78716c", padding: 32, textAlign: "center", fontSize: 13 },
  retry: { minHeight: 40, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 16px", fontWeight: 900 },
} satisfies Record<string, CSSProperties>;

export default function CatalogError({ reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return <div className="catalog-prototype-page" style={styles.page}><nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span aria-hidden="true">›</span><strong aria-current="page">Catalog</strong></nav><h1 style={styles.title}>Catalogs</h1><p style={styles.subtitle}>Create and manage catalogs built from custom product and service selections.</p><section aria-label="Catalog list error" role="alert" style={styles.card}><span>Catalogs are unavailable. Check your workspace access or try again.</span><button type="button" style={styles.retry} onClick={reset}>Try Again</button></section></div>;
}
