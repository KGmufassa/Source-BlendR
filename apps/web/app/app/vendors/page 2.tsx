import { getDatabase } from "@source-blendr/shared";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { blueprintActions } from "../../workspace-routes";
import { ButtonLink, DataTable, PageHeader, StatusBadge } from "../page-actions";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const context = await getWorkspaceContext();
  const vendors = await getDatabase().vendor.findMany({ where: { workspaceId: context.workspaceId }, orderBy: { name: "asc" } });
  return (
    <>
      <PageHeader eyebrow="UI-BLUEPRINT-SCREEN-009" title="Vendors" description="Manage source vendors used by website and PDF imports.">
        <ButtonLink href={blueprintActions.newVendor.href} elementId={blueprintActions.newVendor.elementId} primary>{blueprintActions.newVendor.label}</ButtonLink>
      </PageHeader>
      <section className="panel vendors-panel">
        {vendors.length ? <DataTable label="Vendors">
          <thead><tr><th>Vendor</th><th>Website</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td data-label="Vendor">{vendor.name}</td>
                <td data-label="Website">{vendor.websiteUrl ?? "Not set"}</td>
                <td data-label="Status"><StatusBadge>{vendor.archivedAt ? "archived" : "active"}</StatusBadge></td>
                <td data-label="Action"><ButtonLink href={`/app/vendors/${vendor.id}`} elementId={blueprintActions.openVendor.elementId}>{blueprintActions.openVendor.label}</ButtonLink></td>
              </tr>
            ))}
          </tbody>
        </DataTable> : <div className="stitch-empty-table"><p>No vendors yet.</p><span>Create one to associate imports with a source.</span></div>}
      </section>
    </>
  );
}
