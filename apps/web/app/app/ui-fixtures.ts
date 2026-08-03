export type ImportJobPreview = {
  id: string;
  source: string;
  status: string;
  sessionId: string;
  eventCount: number;
};

export type CandidatePreview = {
  id: string;
  name: string;
  status: string;
  sku: string;
  price: string;
};

export type VendorPreview = {
  id: string;
  name: string;
  website: string;
  status: string;
};

export const vendors: VendorPreview[] = [
  { id: "vendor-acme", name: "Acme Foods", website: "https://example.test/catalog", status: "ready" },
  { id: "vendor-northstar", name: "Northstar Supply", website: "https://northstar.example.test", status: "needs review" },
];

export const importJobs: ImportJobPreview[] = [
  { id: "job-website-1", source: "Website", status: "running", sessionId: "session-website-1", eventCount: 4 },
  { id: "job-pdf-1", source: "PDF catalog", status: "partial failure", sessionId: "session-pdf-1", eventCount: 7 },
];

export const candidates: CandidatePreview[] = [
  { id: "candidate-1", name: "Jasmine Tea", status: "ready", sku: "TEA-JAS", price: "$4.50" },
  { id: "candidate-2", name: "Oolong Blend", status: "conflict", sku: "TEA-OOL", price: "$5.20" },
  { id: "candidate-3", name: "Packaging Labor", status: "needs review", sku: "LAB-PACK", price: "$18.00" },
];

export function findJob(jobId: string): ImportJobPreview {
  return importJobs.find((job) => job.id === jobId) ?? {
    id: jobId,
    source: "Import job",
    status: "permission_denied",
    sessionId: "session-preview",
    eventCount: 0,
  };
}

export function findVendor(vendorId: string): VendorPreview {
  return vendors.find((vendor) => vendor.id === vendorId) ?? {
    id: vendorId,
    name: "Unknown vendor",
    website: "",
    status: "not found",
  };
}
