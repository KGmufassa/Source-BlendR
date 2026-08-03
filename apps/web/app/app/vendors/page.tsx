import { blueprintActions } from "../../workspace-routes";
import { ButtonLink, DataTable, PageHeader, StatusBadge } from "../page-actions";
import { vendors } from "../ui-fixtures";

export default function VendorsPage() {
  return (
    <>
      <PageHeader eyebrow="UI-BLUEPRINT-SCREEN-009" title="Vendors" description="Manage source vendors used by website and PDF imports.">
        <ButtonLink href={blueprintActions.newVendor.href} elementId={blueprintActions.newVendor.elementId} primary>{blueprintActions.newVendor.label}</ButtonLink>
      </PageHeader>
      <section className="panel">
        <DataTable label="Vendors">
          <thead><tr><th>Vendor</th><th>Website</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td data-label="Vendor">{vendor.name}</td>
                <td data-label="Website">{vendor.website}</td>
                <td data-label="Status"><StatusBadge>{vendor.status}</StatusBadge></td>
                <td data-label="Action"><ButtonLink href={`/app/vendors/${vendor.id}`} elementId={blueprintActions.openVendor.elementId}>{blueprintActions.openVendor.label}</ButtonLink></td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
    </>
  );
}
