import { getDatabase } from "@source-blendr/shared";
import { notFound } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { VendorDetailClient } from "./vendor-detail-client";

export const dynamic = "force-dynamic";

export default async function VendorDetailPage({ params }: Readonly<{ params: Promise<{ vendorId: string }> }>) {
  const { vendorId } = await params;
  const context = await getWorkspaceContext();
  const vendor = await getDatabase().vendor.findFirst({
    where: { id: vendorId, workspaceId: context.workspaceId },
    include: { items: { orderBy: { updatedAt: "desc" }, take: 50 }, importJobs: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
  if (!vendor) notFound();
  return <VendorDetailClient canEdit={context.role !== "viewer"} initialVendor={{
    id: vendor.id,
    name: vendor.name,
    websiteUrl: vendor.websiteUrl,
    description: vendor.description,
    logoUrl: vendor.logoUrl,
    contactName: vendor.contactName,
    contactRole: vendor.contactRole,
    contactEmail: vendor.contactEmail,
    contactPhone: vendor.contactPhone,
    address: vendor.address,
    defaultImportMethod: vendor.defaultImportMethod,
    offeringType: vendor.offeringType,
    offeringCategories: vendor.offeringCategories,
    offeringDescription: vendor.offeringDescription,
    archived: Boolean(vendor.archivedAt),
    itemCount: vendor.items.length,
    derivedTypes: [...new Set(vendor.items.map((item) => item.type).filter(Boolean))],
    derivedCategories: [...new Set(vendor.items.map((item) => item.category).filter(Boolean))],
    importJobs: vendor.importJobs.map((job) => ({ id: job.id, sourceType: job.sourceType, status: job.status, createdAt: job.createdAt.toISOString() })),
  }} />;
}
