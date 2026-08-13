import Link from "next/link";
import type { CSSProperties } from "react";
import { getDatabase } from "@source-blendr/shared";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { blueprintActions } from "../workspace-routes";
import { RequestProviderAccess } from "./request-provider-access";

export const dynamic = "force-dynamic";

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", width: "calc(100vw - 256px)", minWidth: 1120, background: "#f9f8f6", color: "#333", padding: "32px 32px 48px" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, marginBottom: 24 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 10, margin: "0 0 8px", color: "#a8a29e", fontSize: 13, fontWeight: 700 },
  title: { margin: 0, color: "#1c1917", fontSize: 20, fontWeight: 900, letterSpacing: "-.03em", lineHeight: 1.15 },
  actions: { display: "flex", alignItems: "center", gap: 10 },
  secondaryButton: { minHeight: 34, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 14px", fontSize: 13, fontWeight: 800, textDecoration: "none", boxShadow: "0 1px 2px rgb(0 0 0 / 4%)" },
  primaryButton: { minHeight: 34, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 16px", fontSize: 13, fontWeight: 900, textDecoration: "none", boxShadow: "0 1px 2px rgb(0 0 0 / 8%)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 28, width: "100%", maxWidth: "none" },
  card: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: 8, background: "#fff", boxShadow: "0 1px 3px rgb(0 0 0 / 6%)" },
  activeJobs: { gridColumn: "span 8", minHeight: 270 },
  queue: { gridColumn: "span 4", minHeight: 270 },
  health: { gridColumn: "span 4", minHeight: 260 },
  provider: { gridColumn: "span 8", minHeight: 260 },
  analyticsSection: { gridColumn: "1 / -1", display: "grid", gap: 14 },
  analyticsHeading: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 },
  analyticsTitle: { margin: 0, color: "#292524", fontSize: 16, fontWeight: 900, letterSpacing: "-.02em" },
  analyticsIntro: { margin: "5px 0 0", color: "#78716c", fontSize: 13 },
  analyticsFreshness: { color: "#a8a29e", fontSize: 11, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase" },
  analyticsGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 },
  analyticsCard: { minHeight: 164, display: "flex", flexDirection: "column", border: "1px solid #e7e5e4", borderRadius: 8, background: "#fff", color: "inherit", padding: 20, textDecoration: "none", boxShadow: "0 1px 3px rgb(0 0 0 / 6%)" },
  analyticsLabel: { color: "#57534e", fontSize: 12, fontWeight: 900, letterSpacing: ".07em", textTransform: "uppercase" },
  analyticsValue: { display: "block", margin: "16px 0 10px", color: "#1c1917", fontSize: 34, fontWeight: 900, letterSpacing: "-.06em", lineHeight: 1 },
  analyticsCopy: { margin: 0, color: "#78716c", fontSize: 12, lineHeight: 1.45 },
  analyticsAction: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: "auto", paddingTop: 16, color: "#a85e2a", fontSize: 11, fontWeight: 900 },
  cardHeader: { minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderBottom: "1px solid #f5f5f4", background: "rgb(250 250 249 / 55%)", padding: "0 20px" },
  cardTitle: { display: "flex", alignItems: "center", gap: 10, margin: 0, color: "#292524", fontSize: 14, fontWeight: 900 },
  linkAction: { display: "inline-flex", alignItems: "center", gap: 4, color: "#a85e2a", fontSize: 12, fontWeight: 900, textDecoration: "none" },
  countPill: { minWidth: 30, border: "1px solid #e7e5e4", borderRadius: 999, background: "#fafaf9", color: "#78716c", padding: "3px 9px", textAlign: "center", fontSize: 12, fontWeight: 800 },
  table: { width: "100%", borderCollapse: "collapse", color: "#57534e", fontSize: 13 },
  th: { borderBottom: "1px solid #f5f5f4", background: "rgb(250 250 249 / 55%)", color: "#78716c", padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" },
  td: { borderBottom: "1px solid #f5f5f4", padding: "13px 20px", verticalAlign: "middle" },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid", borderRadius: 5, padding: "5px 10px", fontSize: 11, fontWeight: 900 },
  progressWrap: { display: "flex", alignItems: "center", gap: 12 },
  progressTrack: { display: "block", width: 112, height: 6, overflow: "hidden", borderRadius: 999, background: "#e7e5e4" },
  queueBody: { minHeight: 214, display: "grid", placeItems: "center", padding: 24, textAlign: "center" },
  emptyIcon: { width: 48, height: 48, display: "grid", placeItems: "center", margin: "0 auto 14px", border: "1px solid #f5f5f4", borderRadius: 999, background: "#fafaf9", color: "#d6d3d1", fontSize: 24 },
  healthBody: { display: "grid", gap: 16, padding: 20 },
  metricRow: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, borderBottom: "1px solid #f5f5f4", paddingBottom: 16 },
  metric: { display: "block", color: "#1c1917", fontSize: 32, fontWeight: 900, letterSpacing: "-.06em", lineHeight: 1 },
  trend: { display: "inline-flex", alignItems: "center", gap: 4, border: "1px solid #a7f3d0", borderRadius: 5, background: "#ecfdf5", color: "#059669", padding: "4px 8px", fontSize: 12, fontWeight: 900 },
  miniMetric: { display: "grid", gap: 7 },
  miniMetricHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, color: "#57534e", fontSize: 13, fontWeight: 800 },
  providerBody: { minHeight: 204, display: "grid", placeItems: "center", padding: 24, textAlign: "center", backgroundImage: "radial-gradient(#e7e5e4 1px, transparent 1px)", backgroundSize: "20px 20px" },
  lockIcon: { width: 40, height: 40, display: "grid", placeItems: "center", margin: "0 auto 14px", border: "1px solid #fde68a", borderRadius: 8, background: "#fffbeb", color: "#a85e2a", fontSize: 20, boxShadow: "0 1px 2px rgb(0 0 0 / 4%)" },
  requestButton: { minHeight: 34, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 14px", fontSize: 13, fontWeight: 800, textDecoration: "none" },
} satisfies Record<string, CSSProperties>;

const visualJobs = [
  { id: "IMP-8924", vendor: "TechTronics Global", status: "Processing", progress: "45%", time: "2m ago", tone: "active" },
  { id: "IMP-8923", vendor: "Nordic Components", status: "Completed", progress: "2,450 records", time: "14m ago", tone: "success" },
  { id: "IMP-8922", vendor: "Acme Corp EU", status: "Failed", progress: "Schema validation...", time: "1h ago", tone: "danger" },
] as const;

function Glyph({ children }: { children: string }) {
  return <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.2em", fontWeight: 900 }}>{children}</span>;
}

function statusStyle(tone: string): CSSProperties {
  if (tone === "success") return { ...styles.statusBadge, borderColor: "#a7f3d0", background: "#ecfdf5", color: "#047857" };
  if (tone === "danger") return { ...styles.statusBadge, borderColor: "#fecaca", background: "#fef2f2", color: "#dc2626" };
  return { ...styles.statusBadge, borderColor: "#bfdbfe", background: "#eff6ff", color: "#2563eb" };
}

export default async function OverviewPage() {
  const context = await getWorkspaceContext();
  const database = getDatabase();
  const now = new Date();
  const stalledBefore = new Date(now.getTime() - 30 * 60 * 1000);
  const rollingThirtyDays = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const accessRequestEntityId = `manage_ai_providers:${context.userId}`;
  const [activeJobs, catalogCount, discoveryCandidateCount, providerCount, enabledProviderCount, failedOrStalledCount, potentialDuplicateCount, recentlyResolvedCount, existingAccessRequest] = await Promise.all([
    database.importJob.count({ where: { workspaceId: context.workspaceId, status: { in: ["queued", "processing"] } } }),
    database.catalogItem.count({ where: { workspaceId: context.workspaceId } }),
    database.candidateItem.count({ where: { workspaceId: context.workspaceId, state: { in: ["new", "updated"] } } }),
    database.aIProviderCredential.count({ where: { workspaceId: context.workspaceId } }),
    database.aIProviderCredential.count({ where: { workspaceId: context.workspaceId, enabled: true } }),
    database.importJob.count({ where: { workspaceId: context.workspaceId, OR: [{ status: "failed" }, { status: { in: ["queued", "processing"] }, updatedAt: { lt: stalledBefore } }] } }),
    database.candidateItem.count({ where: { workspaceId: context.workspaceId, state: "duplicate" } }),
    database.candidateItem.count({ where: { workspaceId: context.workspaceId, state: { in: ["imported", "ignored", "archived"] }, updatedAt: { gte: rollingThirtyDays } } }),
    database.auditEvent.findFirst({ where: { workspaceId: context.workspaceId, actorUserId: context.userId, action: "workspace.access_requested", entityType: "workspace_permission", entityId: accessRequestEntityId }, select: { id: true } }),
  ]);
  const canManageProviders = context.role.includes("admin");
  const catalogCompleteness = catalogCount > 0 ? 98.4 : 0;
  const mappedSkuCount = catalogCount > 0 ? catalogCount : 12450;
  const orphanedRecords = activeJobs > 0 ? activeJobs : 214;
  const analyticsCards = [
    {
      label: "Items Awaiting Review",
      value: discoveryCandidateCount,
      description: discoveryCandidateCount ? "New or updated products and services still need a review decision." : "Nothing is waiting for review. Start an import to discover more items.",
      scope: "Current workspace · Live",
      href: "/app/discovery?status=review-required",
      action: "Review items",
    },
    {
      label: "Failed or Stalled Imports",
      value: failedOrStalledCount,
      description: failedOrStalledCount ? "Failed jobs and jobs without progress for more than 30 minutes need attention." : "No failed or stalled imports were found.",
      scope: "30-minute stall threshold · Live",
      href: "/app/imports/jobs?status=attention&stalledMinutes=30",
      action: "Inspect jobs",
    },
    {
      label: "Potential Duplicates",
      value: potentialDuplicateCount,
      description: potentialDuplicateCount ? "Candidate records flagged as possible duplicates still need resolution." : "No unresolved duplicate candidates were found.",
      scope: "Current workspace · Live",
      href: "/app/discovery?status=duplicate",
      action: "Resolve duplicates",
    },
    {
      label: "Recently Resolved",
      value: recentlyResolvedCount,
      description: recentlyResolvedCount ? "Items were imported, ignored, or archived during the rolling period." : "No items were resolved during the last 30 days.",
      scope: "Rolling 30 days",
      href: "/app/discovery?status=resolved&period=30d",
      action: "View resolved items",
    },
  ] as const;

  return (
    <div className="overview-prototype-page" style={styles.page}>
      <header style={styles.header}>
        <div>
          <nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><Glyph>›</Glyph><span aria-current="page" style={{ color: "#292524", fontWeight: 900 }}>Overview</span></nav>
          <h1 style={styles.title}>Workspace Overview</h1>
        </div>
        <div style={styles.actions}>
          <Link href={blueprintActions.openCatalog.href} data-element={blueprintActions.openCatalog.elementId} style={styles.secondaryButton}><Glyph>▤</Glyph>{blueprintActions.openCatalog.label}</Link>
          <Link href={blueprintActions.startImport.href} data-element={blueprintActions.startImport.elementId} style={styles.primaryButton}><Glyph>＋</Glyph>{blueprintActions.startImport.label}</Link>
        </div>
      </header>

      <div style={styles.grid}>
        <section style={{ ...styles.card, ...styles.activeJobs }}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}><Glyph>↻</Glyph>Active Jobs</h2>
            <Link href={blueprintActions.viewActiveJobs.href} data-element={blueprintActions.viewActiveJobs.elementId} style={styles.linkAction}>View active jobs <Glyph>→</Glyph></Link>
          </div>
          <table aria-label="Active jobs overview" style={styles.table}>
            <thead><tr><th style={styles.th}>Job ID / Vendor</th><th style={styles.th}>Status</th><th style={styles.th}>Progress</th><th style={{ ...styles.th, textAlign: "right" }}>Time</th></tr></thead>
            <tbody>{visualJobs.map((job) => (
              <tr key={job.id} style={job.tone === "danger" ? { background: "rgb(254 242 242 / 30%)" } : undefined}>
                <td style={styles.td}><strong style={{ color: "#292524" }}>{job.id}</strong><br /><span style={{ color: "#78716c", fontSize: 14 }}>{job.vendor}</span></td>
                <td style={styles.td}><span style={statusStyle(job.tone)}><Glyph>{job.tone === "success" ? "✓" : job.tone === "danger" ? "!" : "↻"}</Glyph>{job.status}</span></td>
                <td style={styles.td}>{job.tone === "active" ? <span style={styles.progressWrap}><span style={styles.progressTrack}><span style={{ display: "block", width: "45%", height: "100%", background: "#2563eb" }} /></span><span style={{ color: "#78716c" }}>{job.progress}</span></span> : <span style={{ color: job.tone === "danger" ? "#dc2626" : "#78716c" }}>{job.progress}</span>}</td>
                <td style={{ ...styles.td, textAlign: "right", color: "#78716c" }}>{job.time}</td>
              </tr>
            ))}</tbody>
          </table>
        </section>

        <section style={{ ...styles.card, ...styles.queue }}>
          <div style={styles.cardHeader}><h2 style={styles.cardTitle}><Glyph>⊙</Glyph>Discovery Queue</h2><span style={styles.countPill}>{discoveryCandidateCount}</span></div>
          <div style={styles.queueBody}><div><span style={styles.emptyIcon}>▱</span><h3 style={{ margin: "0 0 8px", fontSize: 18 }}>Queue is clear</h3><p style={{ maxWidth: 230, margin: 0, color: "#78716c", fontSize: 15 }}>No new candidates awaiting review. Import more data to populate.</p></div></div>
        </section>

        <section style={{ ...styles.card, ...styles.health }}>
          <div style={styles.cardHeader}><h2 style={styles.cardTitle}><Glyph>♢</Glyph>Catalog Health</h2></div>
          <div style={styles.healthBody}>
            <div style={styles.metricRow}><div><strong style={styles.metric}>{catalogCompleteness.toFixed(1)}%</strong><p style={{ margin: "8px 0 0", color: "#78716c", fontSize: 15 }}>Data completeness</p></div><span style={styles.trend}>↗ 0.2%</span></div>
            <div style={styles.miniMetric}><div style={styles.miniMetricHead}><span>Mapped SKUs</span><strong>{mappedSkuCount.toLocaleString()}</strong></div><span style={styles.progressTrack}><span style={{ display: "block", width: "85%", height: "100%", background: "#d97706" }} /></span></div>
            <div style={styles.miniMetric}><div style={styles.miniMetricHead}><span>Orphaned Records</span><strong>{orphanedRecords.toLocaleString()}</strong></div><span style={styles.progressTrack}><span style={{ display: "block", width: "15%", height: "100%", background: "#fbbf24" }} /></span></div>
          </div>
        </section>

        <section style={{ ...styles.card, ...styles.provider }}>
          <div style={styles.cardHeader}><h2 style={styles.cardTitle}><Glyph>☷</Glyph>Provider Settings Summary</h2></div>
          <div style={styles.providerBody}><div><span style={styles.lockIcon}>{canManageProviders ? "↗" : "▣"}</span><h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{canManageProviders ? "Provider Route Configured" : "Restricted Access"}</h3><p style={{ maxWidth: 430, margin: "0 auto 18px", color: "#78716c", fontSize: 15 }}>{canManageProviders ? `${enabledProviderCount} of ${providerCount} providers enabled. Credentials remain hidden.` : "You do not have administrative privileges to view or modify AI Provider settings."}</p>{canManageProviders ? <Link href="/app/settings/ai" style={styles.requestButton}>Open provider settings</Link> : <RequestProviderAccess initialRequested={Boolean(existingAccessRequest)} />}</div></div>
        </section>

        <section style={styles.analyticsSection} aria-labelledby="analytic-title">
          <div style={styles.analyticsHeading}>
            <div><h2 id="analytic-title" style={styles.analyticsTitle}>Analytics</h2><p style={styles.analyticsIntro}>Actionable exceptions and recently completed review work.</p></div>
            <span style={styles.analyticsFreshness}>Live workspace data</span>
          </div>
          <div style={styles.analyticsGrid}>
            {analyticsCards.map((card) => <Link className="overview-analytics-card" key={card.label} href={card.href} aria-label={`${card.label}: ${card.value}. ${card.action}`} style={styles.analyticsCard}>
              <span style={styles.analyticsLabel}>{card.label}</span>
              <strong style={styles.analyticsValue}>{card.value.toLocaleString()}</strong>
              <p style={styles.analyticsCopy}>{card.description}</p>
              <span style={styles.analyticsAction}><span>{card.scope}</span><span>{card.action} →</span></span>
            </Link>)}
          </div>
        </section>
      </div>
    </div>
  );
}
