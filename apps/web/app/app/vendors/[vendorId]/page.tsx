import { ButtonLink, PageHeader, StatusBadge } from "../../page-actions";
import { findVendor } from "../../ui-fixtures";

export default async function VendorDetailPage({ params }: Readonly<{ params: Promise<{ vendorId: string }> }>) {
  const { vendorId } = await params;
  const vendor = findVendor(vendorId);

  return (
    <>
      <PageHeader title={vendor.name} description="Vendor source detail and import entrypoint." />
      <section className="panel">
        <p>Website: {vendor.website || "No website recorded"}</p>
        <p>Status: <StatusBadge>{vendor.status}</StatusBadge></p>
        <ButtonLink href="/app/imports/website" primary>Start website discovery</ButtonLink>
      </section>
    </>
  );
}
