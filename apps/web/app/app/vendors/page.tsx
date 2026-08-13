import { getDatabase } from "@source-blendr/shared";
import { getWorkspaceContext } from "@/lib/workspace-context";
import { VendorsClient, type VendorRow } from "./vendors-client";

export const dynamic = "force-dynamic";

const fallbackVendors: VendorRow[] = [
  { id: "sample-global-logistics", name: "Global Logistics Corp", websiteUrl: "https://global-logistics.example", status: "active", sources: ["Website"], lastImport: null, placeholder: true },
  { id: "sample-apex-hardware", name: "Apex Hardware Solutions", websiteUrl: null, status: "onboarding", sources: ["PDF"], lastImport: null, placeholder: true },
];

export default async function VendorsPage() {
  const context = await getWorkspaceContext();
  const vendors = await getDatabase().vendor.findMany({ where: { workspaceId: context.workspaceId }, include: { importJobs: { orderBy: { createdAt: "desc" }, take: 20, select: { sourceType: true, createdAt: true } } }, orderBy: { name: "asc" } });
  const rows = vendors.length ? vendors.map((vendor): VendorRow => ({ id: vendor.id, name: vendor.name, websiteUrl: vendor.websiteUrl, status: vendor.archivedAt ? "inactive" : vendor.importJobs.length ? "active" : "onboarding", sources: [...new Set(vendor.importJobs.map((job) => job.sourceType === "pdf" ? "PDF" : "Website"))], lastImport: vendor.importJobs[0]?.createdAt.toISOString() ?? null, placeholder: false })) : fallbackVendors;
  return <VendorsClient initialVendors={rows} />;
}
