import Link from "next/link";
import type { CSSProperties } from "react";
import { getDatabase } from "@source-blendr/shared";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { blueprintActions } from "../../workspace-routes";

export const dynamic = "force-dynamic";

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", width: "100%", minWidth: 1120, background: "#f9f8f6", color: "#333", padding: "32px 32px 48px" },
  content: { width: "100%", maxWidth: "none", margin: "0", padding: 0 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, marginBottom: 24 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 10, margin: "0 0 8px", color: "#a8a29e", fontSize: 13, fontWeight: 700 },
  title: { margin: "0 0 8px", color: "#1c1917", fontSize: 20, fontWeight: 900, letterSpacing: "-.03em", lineHeight: 1.15 },
  status: { display: "flex", alignItems: "center", gap: 8, margin: "8px 0 0", color: "#78716c", fontSize: 13 },
  statusPill: { display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid #a7f3d0", background: "#ecfdf5", color: "#047857", padding: "4px 8px", fontSize: 13, fontWeight: 800 },
  statusDot: { width: 7, height: 7, borderRadius: 999, background: "#10b981" },
  methods: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 28, marginBottom: 32 },
  methodCard: { minHeight: 132, display: "block", border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", color: "inherit", padding: 24, textDecoration: "none", transition: "border-color 120ms ease, box-shadow 120ms ease" },
  methodTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 18 },
  methodIcon: { width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 5, background: "#fffbeb", color: "#a85e2a", fontSize: 22 },
  methodArrow: { color: "#d6d3d1", fontSize: 28 },
  methodTitle: { margin: "0 0 7px", color: "#292524", fontSize: 14, fontWeight: 900 },
  methodText: { maxWidth: 480, margin: 0, color: "#666", fontSize: 13, lineHeight: 1.5 },
  tableCard: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", boxShadow: "0 1px 2px rgb(0 0 0 / 4%)" },
  tableHeader: { minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, borderBottom: "1px solid #e7e5e4", background: "#fafaf9", padding: "0 20px" },
  tableTitle: { margin: 0, color: "#333", fontSize: 12, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase" },
  logsButton: { border: 0, background: "transparent", color: "#a85e2a", padding: 0, fontSize: 11, fontWeight: 900, letterSpacing: ".04em", textTransform: "uppercase" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { borderBottom: "1px solid #f5f5f4", background: "rgb(250 250 249 / 50%)", color: "#666", padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" },
  td: { borderBottom: "1px solid #f5f5f4", padding: "13px 20px", verticalAlign: "middle", color: "#666" },
  jobId: { color: "#292524", fontSize: 13, fontWeight: 900 },
  vendor: { color: "#78716c", fontSize: 11 },
  method: { display: "inline-flex", alignItems: "center", gap: 8, color: "#666", fontSize: 13 },
  badge: { display: "inline-flex", alignItems: "center", border: "1px solid", borderRadius: 999, padding: "5px 10px", fontSize: 11, fontWeight: 900 },
  progressBlock: { display: "grid", gap: 8, minWidth: 150 },
  progressMeta: { display: "flex", justifyContent: "space-between", gap: 12, color: "#666", fontSize: 12, fontWeight: 700 },
  progressTrack: { display: "block", height: 5, overflow: "hidden", borderRadius: 999, background: "#f5f5f4" },
  actionCell: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14 },
  retry: { minHeight: 30, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 12px", fontSize: 11, fontWeight: 900 },
  rowLink: { color: "#a85e2a", fontSize: 24, fontWeight: 900, textDecoration: "none" },
} satisfies Record<string, CSSProperties>;

function Glyph({ children }: { children: string }) {
  return <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.2em", lineHeight: 1, fontWeight: 900 }}>{children}</span>;
}

function badgeStyle(tone: string): CSSProperties {
  if (tone === "completed") return { ...styles.badge, borderColor: "#a7f3d0", background: "#ecfdf5", color: "#047857" };
  if (tone === "failed") return { ...styles.badge, borderColor: "#fecaca", background: "#fef2f2", color: "#dc2626" };
  return { ...styles.badge, borderColor: "#bfdbfe", background: "#eff6ff", color: "#2563eb" };
}

export default async function ImportsPage() {
  const context = await getWorkspaceContext();
  const importJobs = await getDatabase().importJob.findMany({
    where: { workspaceId: context.workspaceId },
    include: { vendor: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return (
    <div className="imports-prototype-page" style={styles.page}>
      <main style={styles.content}>
        <div style={styles.header}>
          <div>
            <nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><Glyph>›</Glyph><strong aria-current="page" style={{ color: "#292524" }}>Imports</strong></nav>
            <h1 style={styles.title}>Imports</h1>
          </div>
        </div>

        <section aria-label="Import methods" style={styles.methods}>
          <Link href={blueprintActions.websiteImport.href} data-element={blueprintActions.websiteImport.elementId} style={styles.methodCard}>
            <div style={styles.methodTop}><span style={styles.methodIcon}>◎</span><span style={styles.methodArrow}>›</span></div>
            <h2 style={styles.methodTitle}>Website Import</h2>
            <p style={styles.methodText}>Sync product data directly from a vendor URL. Automated scraping and mapping of inventory items.</p>
          </Link>
          <Link href={blueprintActions.pdfImport.href} data-element={blueprintActions.pdfImport.elementId} style={styles.methodCard}>
            <div style={styles.methodTop}><span style={styles.methodIcon}>▣</span><span style={styles.methodArrow}>›</span></div>
            <h2 style={styles.methodTitle}>PDF Catalog</h2>
            <p style={styles.methodText}>Extract structured inventory from digital catalogs. AI-powered table and spec detection.</p>
          </Link>
        </section>

        <section style={styles.tableCard}>
          <div style={styles.tableHeader}><h2 style={styles.tableTitle}>Recent Jobs</h2></div>
          <table aria-label="Recent import jobs" style={styles.table}>
            <thead>
              <tr><th style={styles.th}>Job ID / Vendor</th><th style={styles.th}>Method</th><th style={styles.th}>Status</th><th style={styles.th}>Progress</th><th style={styles.th}>Started</th><th style={{ ...styles.th, textAlign: "right" }}>Action</th></tr>
            </thead>
            <tbody>
              {importJobs.map((job) => {
                const tone = job.status === "completed" ? "completed" : job.status === "failed" ? "failed" : "processing";
                return <tr key={job.id}>
                  <td style={styles.td}><div style={styles.jobId}>{job.id}</div><div style={styles.vendor}>{job.vendor?.name ?? "Unassigned vendor"}</div></td>
                  <td style={styles.td}><span style={styles.method}><Glyph>{job.sourceType === "pdf" ? "▣" : "◎"}</Glyph>{job.sourceType === "pdf" ? "PDF" : "Website"}</span></td>
                  <td style={styles.td}>
                    <span style={badgeStyle(tone)}>{job.status.replaceAll("_", " ")}</span>
                    {job.errorCode ? <div style={{ marginTop: 6, color: "#ef4444", fontSize: 12 }}>{job.errorCode.replaceAll("_", " ")}</div> : null}
                  </td>
                  <td style={styles.td}>{job.status === "completed" ? "Complete" : job.status === "failed" ? "Stopped" : "In progress"}</td>
                  <td style={styles.td}><time dateTime={job.createdAt.toISOString()}>{job.createdAt.toLocaleString()}</time></td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <span style={styles.actionCell}>
                      <Link href={`/app/imports/jobs/${job.id}`} aria-label={`Job Details for ${job.id}`} style={{ ...styles.rowLink, color: "#d97706", fontSize: 12 }}>Job Details</Link>
                    </span>
                  </td>
                </tr>
              })}
              {!importJobs.length ? <tr><td colSpan={6} style={{ ...styles.td, padding: 32, textAlign: "center" }}>No import jobs yet. Start with Website Import or PDF Catalog.</td></tr> : null}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
