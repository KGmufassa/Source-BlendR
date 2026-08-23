export type JobCandidate = {
  id: string;
  name: string;
  sku: string;
  vendorName: string;
  category: string;
  imageUrl: string | null;
  priceCents: number;
  currency: string;
};

type CandidateRecord = {
  id: string;
  name: string;
  sku: string;
  payload: unknown;
  priceCents: number;
  currency: string;
};

function payloadRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function sourceCategory(sourceUri: string): string {
  try {
    const path = new URL(sourceUri).pathname.split("/").filter(Boolean);
    const collectionIndex = path.indexOf("collections");
    if (collectionIndex >= 0 && path[collectionIndex + 1]) return path[collectionIndex + 1]!.replaceAll("-", " ");
  } catch {
    // Legacy records may predate strict source URL validation.
  }
  return "Uncategorized";
}

export function toJobCandidate(candidate: CandidateRecord, vendorName: string, sourceUri: string): JobCandidate {
  const payload = payloadRecord(candidate.payload);
  const product = payloadRecord(payload.product);
  const images = Array.isArray(product.images) ? product.images : [];
  return {
    id: candidate.id,
    name: candidate.name,
    sku: candidate.sku,
    vendorName,
    category: text(payload.category) || sourceCategory(sourceUri),
    imageUrl: text(payload.imageUrl) || text(payload.image) || text(images[0]) || null,
    priceCents: candidate.priceCents,
    currency: candidate.currency,
  };
}
