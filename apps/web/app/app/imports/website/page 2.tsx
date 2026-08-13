import { getDatabase } from "@source-blendr/shared";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { Icon, PageHeader, StatusBadge } from "../../page-actions";
import { WebsiteImportForm } from "../../runtime-forms";

export const dynamic = "force-dynamic";

export default async function WebsiteImportPage() {
  const context = await getWorkspaceContext();
  const vendors = await getDatabase().vendor.findMany({ where: { workspaceId: context.workspaceId, archivedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <>
      <PageHeader eyebrow="UI-BLUEPRINT-SCREEN-003" title="Website Import Wizard" description="Analyze a vendor website, select categories, and open the created import job." />
      <div className="workflow-grid">
        <section className="panel workflow-primary">
          <div className="panel-header"><div><h2><Icon name="language" />Source</h2><p className="muted">Vendor URL and workspace-safe import setup.</p></div><StatusBadge tone="success">runtime enabled</StatusBadge></div>
          <WebsiteImportForm vendors={vendors} />
        </section>
        <aside className="panel workflow-aside">
          <h2>Detected Category tree</h2>
          <div className="category-tree"><div className="category-branch"><h3>Awaiting analysis</h3><p className="muted">Submit a website to populate approved detected categories from the existing category API.</p></div></div>
          <h2>What happens next</h2>
          <p className="muted">The worker analyzes the submitted site, records normalized source data, and opens a discovery session with reviewable candidates.</p>
        </aside>
      </div>
    </>
  );
}
