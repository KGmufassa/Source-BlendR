import Link from "next/link";
import type { CSSProperties } from "react";
import { getDatabase } from "@source-blendr/shared";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { blueprintActions } from "../../../workspace-routes";

export const dynamic = "force-dynamic";

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", width: "100%", minWidth: 1120, background: "#f9f8f6", color: "#333", padding: "32px 32px 48px" },
  content: { width: "100%", maxWidth: "none", margin: 0, padding: 0 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, marginBottom: 24 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 10, margin: "0 0 8px", color: "#a8a29e", fontSize: 13, fontWeight: 700 },
  title: { margin: "0 0 8px", color: "#1c1917", fontSize: 20, fontWeight: 900, letterSpacing: "-.03em", lineHeight: 1.15 },
  description: { margin: 0, color: "#78716c", fontSize: 13, lineHeight: 1.45 },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 18, marginBottom: 28 },
  summaryCard: { border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", padding: 18, boxShadow: "0 1px 2px rgb(0 0 0 / 4%)" },
  metricLabel: { display: "block", marginBottom: 10, color: "#78716c", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" },
  metricValue: { display: "block", marginBottom: 10, color: "#292524", fontSize: 24, fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1 },
  tableCard: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", boxShadow: "0 1px 2px rgb(0 0 0 / 4%)" },
  tableHeader: { minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, borderBottom: "1px solid #e7e5e4", background: "#fafaf9", padding: "0 20px" },
  tableTitle: { margin: 0, color: "#333", fontSize: 12, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase" },
  tableMeta: { color: "#78716c", fontSize: 12, fontWeight: 700 },
  tableScroll: { overflowX: "auto" },
  table: { width: "100%", minWidth: 1080, tableLayout: "fixed", borderCollapse: "collapse", fontSize: 13 },
  th: { borderBottom: "1px solid #f5f5f4", background: "rgb(250 250 249 / 50%)", color: "#666", padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" },
  td: { borderBottom: "1px solid #f5f5f4", padding: "13px 20px", verticalAlign: "middle", color: "#666" },
  source: { display: "inline-flex", alignItems: "center", gap: 10, color: "#292524", fontSize: 14, fontWeight: 900 },
  sourceIcon: { width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: 5, background: "#fffbeb", color: "#a85e2a", fontSize: 17 },
  mono: { color: "#71717a", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace", fontSize: 12 },
  badge: { display: "inline-flex", alignItems: "center", gap: 7, width: "fit-content", border: "1px solid", borderRadius: 999, padding: "5px 10px", fontSize: 11, fontWeight: 900, textTransform: "uppercase" },
  badgeDot: { width: 7, height: 7, borderRadius: 999, background: "currentColor" },
  actionLink: { display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: 8, color: "#a85e2a", fontSize: 13, fontWeight: 900, textDecoration: "none" },
  empty: { display: "grid", placeItems: "center", minHeight: 220, color: "#78716c", fontSize: 13, textAlign: "center" },
  pagination: { minHeight: 58, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, borderTop: "1px solid #e7e5e4", background: "#fafaf9", padding: "0 20px", color: "#78716c", fontSize: 12 },
  paginationControls: { display: "flex", alignItems: "center", gap: 12 },
  paginationLink: { minHeight: 32, display: "inline-flex", alignItems: "center", border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 12px", fontWeight: 800, textDecoration: "none" },
  paginationDisabled: { minHeight: 32, display: "inline-flex", alignItems: "center", border: "1px solid #e7e5e4", borderRadius: 5, background: "#f5f5f4", color: "#a8a29e", padding: "0 12px", fontWeight: 800 },
} satisfies Record<string, CSSProperties>;

const statusOrder = ["queued", "processing", "completed", "failed"] as const;
const pageSize = 10;

function Glyph({ children }: { children: string }) {
  return <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.2em", lineHeight: 1, fontWeight: 900 }}>{children}</span>;
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function badgeStyle(status: string): CSSProperties {
  if (status === "completed") return { ...styles.badge, borderColor: "#a7f3d0", background: "#ecfdf5", color: "#047857" };
  if (status === "failed") return { ...styles.badge, borderColor: "#fecaca", background: "#fef2f2", color: "#dc2626" };
  if (status === "processing") return { ...styles.badge, borderColor: "#bfdbfe", background: "#eff6ff", color: "#2563eb" };
  return { ...styles.badge, borderColor: "#fde68a", background: "#fffbeb", color: "#b45309" };
}

export default async function ImportJobsPage({ searchParams }: Readonly<{ searchParams: Promise<{ page?: string | string[] }> }>) {
  const context = await getWorkspaceContext();
  const { page } = await searchParams;
  const requestedPage = typeof page === "string" && /^\d+$/.test(page) ? Number(page) : 1;
  const where = { workspaceId: context.workspaceId };
  const [totalJobs, statusGroups] = await Promise.all([
    getDatabase().importJob.count({ where }),
    getDatabase().importJob.groupBy({ by: ["status"], where, _count: { _all: true } }),
  ]);
  const pageCount = Math.max(1, Math.ceil(totalJobs / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), pageCount);
  const skip = (currentPage - 1) * pageSize;
  const importJobs = await getDatabase().importJob.findMany({
    where,
    include: { vendor: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    skip,
    take: pageSize,
  });
  const statusCounts = Object.fromEntries(statusGroups.map((group) => [group.status, group._count._all]));
  const rangeStart = totalJobs ? skip + 1 : 0;
  const rangeEnd = Math.min(skip + importJobs.length, totalJobs);

  return (
    <div className="import-jobs-prototype-page" style={styles.page}>
      <main style={styles.content}>
        <header style={styles.header}>
          <div>
            <nav aria-label="Breadcrumb" style={styles.breadcrumb}>
              <Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link>
              <Glyph>›</Glyph>
              <Link href="/app/imports" style={{ color: "inherit", textDecoration: "none" }}>Imports</Link>
              <Glyph>›</Glyph>
              <strong aria-current="page" style={{ color: "#292524" }}>Jobs</strong>
            </nav>
            <h1 style={styles.title}>Import Jobs</h1>
            <p style={styles.description}>Review the complete import history and open any job for details.</p>
          </div>
        </header>

        <section style={styles.summaryGrid} aria-label="Import job status summary">
          {statusOrder.map((status) => (
            <article style={styles.summaryCard} key={status}>
              <span style={styles.metricLabel}>{status}</span>
              <strong style={styles.metricValue}>{statusCounts[status] ?? 0}</strong>
              <span style={badgeStyle(status)}><span style={styles.badgeDot} />{statusCounts[status] ? "Has jobs" : "None"}</span>
            </article>
          ))}
        </section>

        <section style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.tableTitle}>Import Jobs</h2>
            <span style={styles.tableMeta}>{totalJobs} total</span>
          </div>
          {importJobs.length ? (
            <div style={styles.tableScroll}>
              <table aria-label="Import job history" style={styles.table}>
                <colgroup>
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "8%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={styles.th}>Job ID</th>
                    <th style={styles.th}>Vendor</th>
                    <th style={styles.th}>Source</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Started</th>
                    <th style={styles.th}>Updated</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {importJobs.map((job) => (
                    <tr key={job.id}>
                      <td style={styles.td}><span style={styles.mono}>{job.id}</span></td>
                      <td style={styles.td}>{job.vendor?.name ?? "Unassigned"}</td>
                      <td style={styles.td}><span style={styles.source}><span style={styles.sourceIcon}>{job.sourceType === "pdf" ? "▣" : "◎"}</span>{statusLabel(job.sourceType)}</span></td>
                      <td style={styles.td}><span style={badgeStyle(job.status)}><span style={styles.badgeDot} />{statusLabel(job.status)}</span></td>
                      <td style={styles.td}><time dateTime={job.createdAt.toISOString()}>{job.createdAt.toLocaleString()}</time></td>
                      <td style={styles.td}><time dateTime={job.updatedAt.toISOString()}>{job.updatedAt.toLocaleString()}</time></td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <Link href={`/app/imports/jobs/${job.id}?entry=jobs`} aria-label={`Job Details for ${job.id}`} data-element={blueprintActions.openJob.elementId} style={styles.actionLink}>
                          Job Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.empty}>
              <p>No import jobs are available.</p>
            </div>
          )}
          <footer style={styles.pagination}>
            <span>Showing {rangeStart}–{rangeEnd} of {totalJobs} jobs</span>
            <nav aria-label="Import jobs pagination" style={styles.paginationControls}>
              {currentPage > 1 ? <Link href={`/app/imports/jobs?page=${currentPage - 1}`} style={styles.paginationLink}>Previous</Link> : <span aria-disabled="true" style={styles.paginationDisabled}>Previous</span>}
              <span>Page {currentPage} of {pageCount}</span>
              {currentPage < pageCount ? <Link href={`/app/imports/jobs?page=${currentPage + 1}`} style={styles.paginationLink}>Next</Link> : <span aria-disabled="true" style={styles.paginationDisabled}>Next</span>}
            </nav>
          </footer>
        </section>
      </main>
    </div>
  );
}
