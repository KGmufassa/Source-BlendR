import Link from "next/link";
import type { CSSProperties } from "react";
import { getDatabase } from "@source-blendr/shared";
import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { toJobCandidate, type JobCandidate } from "@/lib/job-candidates";
import { blueprintActions } from "../../../../workspace-routes";
import { CategoryJobSelector } from "./category-job-selector";
import { CandidateReviewTable } from "./candidate-review-table";
import { JobActions } from "./job-actions";

export const dynamic = "force-dynamic";

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", width: "100%", minWidth: 1120, background: "#f9f8f6", color: "#333", padding: "32px 32px 48px" },
  content: { width: "100%", maxWidth: "none", margin: 0, padding: 0 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 24 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 10, margin: "0 0 8px", color: "#a8a29e", fontSize: 13, fontWeight: 700 },
  title: { margin: "0 0 8px", color: "#1c1917", fontSize: 20, fontWeight: 900, letterSpacing: "-.03em", lineHeight: 1.15 },
  description: { margin: 0, color: "#78716c", fontSize: 13, lineHeight: 1.45 },
  headerActions: { display: "flex", alignItems: "flex-start", justifyContent: "flex-end", gap: 12 },
  primaryAction: { minHeight: 34, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 16px", fontSize: 13, fontWeight: 900, textDecoration: "none", boxShadow: "0 1px 2px rgb(0 0 0 / 8%)" },
  detailGrid: { display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(300px, .65fr)", gap: 28, alignItems: "start", marginBottom: 28 },
  card: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", boxShadow: "0 1px 2px rgb(0 0 0 / 4%)" },
  cardHeader: { minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, borderBottom: "1px solid #e7e5e4", background: "#fafaf9", padding: "0 20px" },
  cardTitle: { margin: 0, color: "#333", fontSize: 12, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase" },
  muted: { margin: "4px 0 0", color: "#78716c", fontSize: 12 },
  cardBody: { padding: 20 },
  disclosure: { overflow: "hidden", marginBottom: 28 },
  disclosureSummary: { minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, borderBottom: "1px solid #e7e5e4", background: "#fafaf9", padding: "0 20px", cursor: "pointer", listStyle: "none" },
  disclosureLabel: { display: "flex", alignItems: "center", gap: 12 },
  timeline: { display: "grid", gap: 14, margin: 0, padding: 0, listStyle: "none" },
  timelineItem: { display: "grid", gridTemplateColumns: "28px minmax(0, 1fr)", gap: 12, alignItems: "start" },
  timelineMark: { width: 22, height: 22, display: "grid", placeItems: "center", border: "1px solid", borderRadius: 999, fontSize: 11, fontWeight: 900 },
  timelineTitle: { margin: 0, color: "#292524", fontSize: 14, fontWeight: 900 },
  timelineDetail: { margin: "4px 0 0", color: "#78716c", fontSize: 12, lineHeight: 1.45 },
  detailList: { display: "grid", gap: 0, margin: 0 },
  detailRow: { display: "grid", gap: 5, borderBottom: "1px solid #f5f5f4", padding: "13px 0" },
  detailTerm: { color: "#78716c", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" },
  detailValue: { margin: 0, overflowWrap: "anywhere", color: "#292524", fontSize: 13, fontWeight: 700 },
  tableScroll: { overflowX: "auto" },
  table: { width: "100%", minWidth: 900, tableLayout: "fixed", borderCollapse: "collapse", fontSize: 13 },
  th: { borderBottom: "1px solid #f5f5f4", background: "rgb(250 250 249 / 50%)", color: "#666", padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" },
  td: { borderBottom: "1px solid #f5f5f4", padding: "13px 20px", verticalAlign: "middle", color: "#666" },
  code: { display: "block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", border: "1px solid #f5f5f4", borderRadius: 5, background: "#fafaf9", color: "#57534e", padding: "8px 10px", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace", fontSize: 12 },
  badge: { display: "inline-flex", alignItems: "center", gap: 7, width: "fit-content", border: "1px solid", borderRadius: 999, padding: "5px 10px", fontSize: 11, fontWeight: 900, textTransform: "uppercase" },
  badgeDot: { width: 7, height: 7, borderRadius: 999, background: "currentColor" },
  empty: { display: "grid", placeItems: "center", minHeight: 220, color: "#78716c", fontSize: 13, textAlign: "center" },
} satisfies Record<string, CSSProperties>;

function Glyph({ children }: { children: string }) {
  return <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.2em", lineHeight: 1, fontWeight: 900 }}>{children}</span>;
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function badgeStyle(status: string): CSSProperties {
  if (status === "completed" || status === "complete") return { ...styles.badge, borderColor: "#a7f3d0", background: "#ecfdf5", color: "#047857" };
  if (status === "failed") return { ...styles.badge, borderColor: "#fecaca", background: "#fef2f2", color: "#dc2626" };
  if (status === "processing" || status === "current") return { ...styles.badge, borderColor: "#bfdbfe", background: "#eff6ff", color: "#2563eb" };
  return { ...styles.badge, borderColor: "#fde68a", background: "#fffbeb", color: "#b45309" };
}

function markStyle(state: "complete" | "current" | "upcoming"): CSSProperties {
  if (state === "complete") return { ...styles.timelineMark, borderColor: "#a7f3d0", background: "#ecfdf5", color: "#047857" };
  if (state === "current") return { ...styles.timelineMark, borderColor: "#bfdbfe", background: "#eff6ff", color: "#2563eb" };
  return { ...styles.timelineMark, borderColor: "#e7e5e4", background: "#fafaf9", color: "#a8a29e" };
}

export default async function ImportJobDetailPage({ params, searchParams }: Readonly<{ params: Promise<{ jobId: string }>; searchParams: Promise<{ entry?: string | string[] }> }>) {
  const { jobId } = await params;
  const { entry } = await searchParams;
  const enteredFromImports = entry === "imports";
  const enteredFromWebsiteImport = entry === "website-import";
  const enteredFromImportJobs = entry === "jobs";
  const context = await getWorkspaceContext();
  const job = await getDatabase().importJob.findFirst({
    where: { id: jobId, workspaceId: context.workspaceId },
    include: {
      vendor: { select: { name: true } },
      events: { orderBy: { createdAt: "asc" } },
      session: { include: { candidates: { orderBy: { updatedAt: "desc" }, take: 20 }, _count: { select: { candidates: true } } } },
    },
  });
  if (!job) notFound();

  const candidates: JobCandidate[] = (job.session?.candidates ?? []).map((candidate) => toJobCandidate(candidate, job.vendor?.name ?? "Unassigned", job.sourceUri));

  const steps: Array<{ label: string; detail: string; state: "complete" | "current" | "upcoming" }> = [
    { label: "Queued", detail: "Import request validated and added to the worker queue.", state: "complete" },
    { label: "Source accepted", detail: "The worker opened the source and began extraction.", state: "complete" },
    { label: "Review candidates", detail: `${job.events.length} processing events recorded.`, state: job.status === "completed" ? "complete" : "current" },
    { label: "Catalog promotion", detail: "Approved candidates will be added to the catalog.", state: job.status === "completed" ? "current" : "upcoming" },
  ];

  return (
    <div className="import-job-detail-prototype-page" style={styles.page}>
      <main style={styles.content}>
        <header style={styles.header}>
          <div>
            <nav aria-label="Breadcrumb" style={styles.breadcrumb}>
              <Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link>
              <Glyph>›</Glyph>
              <Link href="/app/imports" style={{ color: "inherit", textDecoration: "none" }}>Imports</Link>
              <Glyph>›</Glyph>
              {enteredFromWebsiteImport ? <><Link href="/app/imports/website" style={{ color: "inherit", textDecoration: "none" }}>Website Import</Link><Glyph>›</Glyph></> : null}
              {enteredFromImportJobs || (!enteredFromImports && !enteredFromWebsiteImport) ? <><Link href="/app/imports/jobs" style={{ color: "inherit", textDecoration: "none" }}>Jobs</Link><Glyph>›</Glyph></> : null}
              <strong aria-current="page" style={{ color: "#292524" }}>Job Details</strong>
            </nav>
            <h1 style={styles.title}>Import Job {job.id}</h1>
            <p style={styles.description}>Review job progress, retry failed work, or open the discovery session.</p>
          </div>
          <div style={styles.headerActions}>
            <JobActions jobId={job.id} status={job.status} />
            {job.session ? (
              <Link href={`/app/discovery/${job.session.id}`} data-element={blueprintActions.openDiscovery.elementId} style={styles.primaryAction}>
                {blueprintActions.openDiscovery.label}
              </Link>
            ) : null}
          </div>
        </header>

        <div style={styles.detailGrid}>
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>Import Progress</h2>
                <p style={styles.muted}>Every stage is recorded so failed work can be retried safely.</p>
              </div>
              <span style={badgeStyle(job.status)}><span style={styles.badgeDot} />{statusLabel(job.status)}</span>
            </div>
            <div style={styles.cardBody}>
              <ol style={styles.timeline}>
                {steps.map((step, index) => (
                  <li style={styles.timelineItem} key={step.label}>
                    <span style={markStyle(step.state)}>{step.state === "complete" ? "✓" : index + 1}</span>
                    <span>
                      <strong style={styles.timelineTitle}>{step.label}</strong>
                      <p style={styles.timelineDetail}>{step.detail}</p>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <aside style={styles.card}>
            <div style={styles.cardHeader}><h2 style={styles.cardTitle}>Job Details</h2></div>
            <div style={styles.cardBody}>
              <dl style={styles.detailList}>
                <div style={styles.detailRow}><dt style={styles.detailTerm}>Source type</dt><dd style={styles.detailValue}>{statusLabel(job.sourceType)}</dd></div>
                <div style={styles.detailRow}><dt style={styles.detailTerm}>Source URI</dt><dd style={styles.detailValue}>{job.sourceUri}</dd></div>
                <div style={styles.detailRow}><dt style={styles.detailTerm}>Events</dt><dd style={styles.detailValue}>{job.events.length}</dd></div>
              </dl>
            </div>
          </aside>
        </div>

        <details open={job.status === "failed" || Boolean(job.errorCode)} style={{ ...styles.card, ...styles.disclosure }}>
          <summary style={styles.disclosureSummary}>
            <span style={styles.disclosureLabel}><h2 style={styles.cardTitle}>Event Log</h2>{job.status === "failed" || job.errorCode ? <span style={{ color: "#dc2626", fontSize: 12, fontWeight: 800 }}>Failure details available</span> : null}</span>
            <span style={badgeStyle("queued")}><span style={styles.badgeDot} />{job.events.length} events</span>
          </summary>
          {job.events.length ? (
            <div style={styles.tableScroll}>
              <table aria-label="Import job event log" style={styles.table}>
                <colgroup>
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "55%" }} />
                  <col style={{ width: "25%" }} />
                </colgroup>
                <thead><tr><th style={styles.th}>Event</th><th style={styles.th}>Detail</th><th style={styles.th}>Created</th></tr></thead>
                <tbody>
                  {job.events.map((event) => (
                    <tr key={event.id}>
                      <td style={styles.td}><span style={badgeStyle(event.type)}><span style={styles.badgeDot} />{statusLabel(event.type)}</span></td>
                      <td style={styles.td}><code style={styles.code}>{JSON.stringify(event.detail).slice(0, 180)}</code></td>
                      <td style={styles.td}>{event.createdAt.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.empty}>
              <p>No events recorded yet.<br /><span style={{ color: "#a8a29e" }}>The worker will append recoverable job events as processing starts.</span></p>
            </div>
          )}
        </details>

        <CandidateReviewTable jobId={job.id} initialCandidates={candidates} initialTotal={job.session?._count.candidates ?? 0} jobStatus={job.status} />

        {job.sourceType === "website" ? job.status === "completed" ? <CategoryJobSelector jobId={job.id} /> : <section style={styles.card}><div style={styles.cardHeader}><div><h2 style={styles.cardTitle}>Discovered Categories</h2><p style={styles.muted}>{job.status === "failed" ? "Category discovery failed. Review the Event Log for the recorded error." : "Categories are being detected and will become selectable when analysis completes."}</p></div></div></section> : null}
      </main>
    </div>
  );
}
