"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties, type FormEvent } from "react";

type VendorOption = { id: string; name: string };

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", minWidth: 1120, width: "100%", background: "#f9f8f6", color: "#333", paddingBottom: 72 },
  content: { width: "100%", maxWidth: 980, padding: "32px 32px 0" },
  intro: { marginBottom: 30 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 10, margin: "0 0 8px", color: "#a8a29e", fontSize: 13, fontWeight: 700 },
  title: { margin: 0, color: "#1c1917", fontSize: 20, fontWeight: 900, letterSpacing: "-.03em", lineHeight: 1.15 },
  description: { maxWidth: 760, margin: "8px 0 0", color: "#78716c", fontSize: 13, lineHeight: 1.5 },
  demo: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14, border: "1px solid #e7e5e4", borderRadius: 8, background: "#f5f5f4", padding: "14px 18px", marginBottom: 34 },
  demoLabel: { color: "#78716c", fontSize: 11, fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase" },
  demoButton: { minHeight: 30, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 14px", fontSize: 12, fontWeight: 700 },
  workflow: { display: "grid", gridTemplateColumns: "345px minmax(0, 1fr)", gap: 26 },
  leftCol: { display: "grid", alignContent: "start", gap: 26 },
  card: { border: "1px solid #e7e5e4", borderRadius: 8, background: "#fff", boxShadow: "0 1px 2px rgb(0 0 0 / 4%)" },
  configCard: { padding: 28 },
  labelTitle: { display: "block", margin: "0 0 16px", color: "#666", fontSize: 14, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" },
  selectWrap: { position: "relative" },
  select: { height: 48, width: "100%", appearance: "none", border: "1px solid #d6d3d1", borderRadius: 5, background: "#fafaf9", color: "#57534e", padding: "0 44px 0 16px", fontSize: 16 },
  selectIcon: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#a8a29e", pointerEvents: "none", fontWeight: 900 },
  helper: { margin: "14px 0 0", color: "#a8a29e", fontSize: 13, fontStyle: "italic", lineHeight: 1.45 },
  checks: { display: "grid", gap: 14 },
  checkLabel: { display: "flex", alignItems: "center", gap: 12, color: "#57534e", fontSize: 15, cursor: "pointer" },
  checkbox: { width: 18, minHeight: 18, accentColor: "#a85e2a" },
  workspaceCard: { minHeight: 760, display: "flex", flexDirection: "column", overflow: "hidden" },
  workspaceHeader: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderBottom: "1px solid #f5f5f4", background: "rgb(250 250 249 / 55%)", padding: "0 26px" },
  workspaceTitle: { margin: 0, color: "#78716c", fontSize: 13, fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase" },
  pill: { borderRadius: 5, background: "#e7e5e4", color: "#57534e", padding: "5px 9px", fontSize: 11, fontWeight: 800 },
  workspaceBody: { flex: 1, display: "grid", alignContent: "center", justifyItems: "center", gap: 22, padding: 42, textAlign: "center" },
  uploadIcon: { width: 72, height: 72, display: "grid", placeItems: "center", border: "2px dashed #e7e5e4", borderRadius: 999, background: "#fafaf9", color: "#d6d3d1", fontSize: 34 },
  workspaceH: { margin: 0, color: "#292524", fontSize: 20, fontWeight: 800 },
  workspaceP: { margin: 0, color: "#78716c", fontSize: 16 },
  fileInput: { position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" },
  selectFileButton: { minHeight: 46, display: "inline-flex", alignItems: "center", justifyContent: "center", border: 0, borderRadius: 5, background: "#1c1917", color: "#fff", padding: "0 28px", fontSize: 15, fontWeight: 800, cursor: "pointer" },
  progressBox: { width: "100%", maxWidth: 420, marginTop: 34 },
  progressHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, marginBottom: 10, color: "#57534e", fontSize: 12, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase" },
  progressTrack: { display: "block", height: 7, overflow: "hidden", borderRadius: 999, background: "#f5f5f4" },
  errorIcon: { width: 72, height: 72, display: "grid", placeItems: "center", borderRadius: 999, background: "#fef2f2", color: "#dc2626", fontSize: 32 },
  successIcon: { width: 72, height: 72, display: "grid", placeItems: "center", borderRadius: 999, background: "#ecfdf5", color: "#16a34a", fontSize: 32 },
  secondaryButton: { minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 22px", fontSize: 15, fontWeight: 700, textDecoration: "none" },
  submitButton: { minHeight: 46, display: "inline-flex", alignItems: "center", justifyContent: "center", border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 24px", fontSize: 13, fontWeight: 900, letterSpacing: ".04em", textTransform: "uppercase" },
  footerStats: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 26, marginTop: 52 },
  stat: { border: "1px solid #e7e5e4", borderRadius: 5, background: "rgb(250 250 249 / 55%)", padding: 18 },
  statLabel: { margin: "0 0 8px", color: "#a8a29e", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" },
  statValue: { color: "#57534e", fontSize: 14, fontWeight: 800 },
  message: { minHeight: 20, margin: "10px 0 0", color: "#57534e", fontSize: 13 },
} satisfies Record<string, CSSProperties>;

async function responseData(response: Response) {
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message ?? "The request could not be completed.");
  return result.data;
}

function Glyph({ children }: { children: string }) {
  return <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.2em", lineHeight: 1, fontWeight: 900 }}>{children}</span>;
}

export function PdfImportClient({ vendors, initialVendorId }: { vendors: VendorOption[]; initialVendorId?: string }) {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("Uploading PDF catalog…");
    try {
      const job = await responseData(await fetch("/api/imports/pdf", { method: "POST", body: new FormData(event.currentTarget) }));
      setMessage("PDF import queued. Opening the job…");
      router.push(`/app/imports/jobs/${job.id}`);
    } catch (error) {
      setError(`Unable to create PDF import: ${error instanceof Error ? error.message : "unknown error"}`);
      setMessage("");
      setPending(false);
    }
  }

  return (
    <div className="pdf-import-prototype-page" style={styles.page}>
      <main style={styles.content}>
        <section style={styles.intro}>
          <nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><Glyph>›</Glyph><Link href="/app/imports" style={{ color: "inherit", textDecoration: "none" }}>Imports</Link><Glyph>›</Glyph><strong aria-current="page" style={{ color: "#292524" }}>PDF Import</strong></nav>
          <h1 style={styles.title}>Import PDF Catalog</h1>
          <p style={styles.description}>Upload digital catalogs for automated product extraction and schema mapping. Our AI identifies product names, SKU patterns, and pricing data from unformatted PDF tables.</p>
        </section>

        <form onSubmit={submit}>
          <div style={styles.workflow}>
            <div style={styles.leftCol}>
              <section style={{ ...styles.card, ...styles.configCard }}>
                <label style={styles.labelTitle} htmlFor="pdf-vendor">1. Vendor Assignment</label>
                <div style={styles.selectWrap}>
                  <select id="pdf-vendor" name="vendor_id" defaultValue={initialVendorId ?? ""} data-element="EL-PDF-001" style={styles.select}><option value="">Select an existing vendor...</option>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select>
                  <span style={styles.selectIcon}>⌄</span>
                </div>
                <p style={styles.helper}>Extracted data will be mapped to this vendor's catalog schema.</p>
              </section>

            </div>

            <section style={{ ...styles.card, ...styles.workspaceCard }}>
              <div style={styles.workspaceHeader}><h2 style={styles.workspaceTitle}>Document Workspace</h2><span style={styles.pill}>PDF/A-3 Compliant</span></div>
              <div style={styles.workspaceBody}>
                <span style={styles.uploadIcon}>{fileName ? "▣" : "⇧"}</span>
                <div><h3 style={styles.workspaceH}>{fileName || "Select a PDF catalog"}</h3><p style={{ ...styles.workspaceP, marginTop: 8 }}>{fileName ? "PDF selected and ready for extraction." : "Choose a PDF from your device (maximum 50MB)."}</p></div>
                <label style={styles.selectFileButton}>{fileName ? "Change File" : "Select File"}<input name="pdf_file" type="file" accept="application/pdf" required data-element="EL-PDF-002" style={styles.fileInput} onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  setError("");
                  if (file && (file.type !== "application/pdf" || file.size > 50 * 1024 * 1024)) {
                    setFileName("");
                    setError(file.type !== "application/pdf" ? "Select a PDF file." : "The PDF must be 50MB or smaller.");
                    event.currentTarget.value = "";
                    return;
                  }
                  setFileName(file?.name ?? "");
                }} /></label>
                {fileName ? <button disabled={pending} type="submit" data-element="EL-PDF-003" data-action="ACTION-START-PDF" style={styles.submitButton}>{pending ? "Uploading…" : "Start PDF Extraction"}</button> : null}
                {pending ? <div style={styles.progressBox}><div style={styles.progressHead}><span>Uploading catalog</span><span>In progress</span></div><span style={styles.progressTrack}><span style={{ display: "block", width: "100%", height: "100%", background: "#f59e0b" }} /></span></div> : null}
                <p role={error ? "alert" : undefined} aria-live="polite" style={{ ...styles.message, color: error ? "#dc2626" : styles.message.color }}>{error || message}</p>
              </div>
            </section>
          </div>
        </form>

        <footer style={styles.footerStats}>
          <article style={styles.stat}><p style={styles.statLabel}>Last Job</p><strong style={styles.statValue}>24 mins ago</strong></article>
          <article style={styles.stat}><p style={styles.statLabel}>Quota Used</p><strong style={styles.statValue}>1.2 GB / 5.0 GB</strong></article>
          <article style={styles.stat}><p style={styles.statLabel}>AI Accuracy</p><strong style={styles.statValue}>99.2% (Validated)</strong></article>
        </footer>
      </main>
    </div>
  );
}
