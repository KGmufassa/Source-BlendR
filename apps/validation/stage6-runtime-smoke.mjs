import assert from "node:assert/strict";

const baseUrl = process.env.SOURCE_BLENDR_SMOKE_URL ?? "http://127.0.0.1:3001";
const stamp = Date.now().toString(36);

async function api(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { origin: baseUrl, ...options.headers },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`${options.method ?? "GET"} ${path}: ${response.status} ${result.error?.message ?? JSON.stringify(result)}`);
  return result.data;
}

async function json(path, method, body) {
  return api(path, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}

async function waitForJob(jobId) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const job = await api(`/api/imports/jobs/${jobId}`);
    if (job.status === "completed") return job;
    if (job.status === "failed" || job.status === "canceled") throw new Error(`job ${jobId} ended ${job.status}: ${job.errorCode ?? "no error code"}`);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`job ${jobId} timed out`);
}

const vendor = await json("/api/vendors", "POST", { name: `Stage 6 Smoke Vendor ${stamp}`, websiteUrl: "https://example.com" });
assert.equal((await api(`/api/vendors/${vendor.id}`)).id, vendor.id);

const catalogItem = await json("/api/catalog-items", "POST", { name: `Stage 6 Catalog Item ${stamp}`, sku: `S6-${stamp}`, type: "product", description: "Runtime smoke record", priceCents: 1099, currency: "USD", vendorId: vendor.id });
assert.equal(catalogItem.vendorId, vendor.id);

const provider = await json("/api/ai-settings/providers", "POST", { provider: "ollama", credential: JSON.stringify({ healthUrl: `${baseUrl}/api/health`, capabilities: ["normalize_item"] }) });
const health = await api("/api/ai-settings/providers/health?capability=normalize_item");
assert.equal(health.providers.find((item) => item.id === provider.id)?.status, "healthy");
const routedProviders = await json("/api/ai-settings/providers", "PATCH", { providerId: provider.id });
assert.equal(routedProviders.find((item) => item.id === provider.id)?.enabled, true);

const websiteJob = await json("/api/imports/website", "POST", { url: "https://example.com", vendorId: vendor.id });
const completedWebsiteJob = await waitForJob(websiteJob.id);
assert.ok(completedWebsiteJob.session?.id);
const websiteCandidates = await api(`/api/discovery-sessions/${completedWebsiteJob.session.id}/candidates`);
assert.ok(websiteCandidates.length > 0);
await json(`/api/discovery-sessions/${completedWebsiteJob.session.id}/import`, "POST", { candidateIds: [websiteCandidates[0].id] });

const pdfForm = new FormData();
pdfForm.set("vendor_id", vendor.id);
pdfForm.set("pdf_file", new Blob(["%PDF-1.4\nSMOKE-PDF|Smoke PDF Item|19.99|USD\nUnstructured one\nUnstructured two\n%%EOF"], { type: "application/pdf" }), "stage6-smoke.pdf");
const pdfJob = await api("/api/imports/pdf", { method: "POST", body: pdfForm });
const completedPdfJob = await waitForJob(pdfJob.id);
assert.ok(completedPdfJob.session?.id);
const sessionPath = `/api/discovery-sessions/${completedPdfJob.session.id}`;
const pdfCandidates = await api(`${sessionPath}/candidates`);
const validPdfCandidate = pdfCandidates.find((item) => item.sku === "SMOKE-PDF");
const conflicts = pdfCandidates.filter((item) => item.state === "conflict");
assert.ok(validPdfCandidate);
assert.ok(conflicts.length >= 3);

const savedCandidates = await json(`${sessionPath}/candidates`, "PATCH", { action: "save", candidateIds: [conflicts[0].id], name: "Resolved PDF Item", sku: `RESOLVED-${stamp}`, priceCents: 500, currency: "USD" });
const resolved = savedCandidates.find((item) => item.id === conflicts[0].id);
assert.equal(resolved.state, "updated");
await json(`${sessionPath}/candidates`, "PATCH", { action: "ignore", candidateIds: [conflicts[1].id] });
await json(`${sessionPath}/candidates`, "PATCH", { action: "archive", candidateIds: [conflicts[2].id] });
const importedPdfItems = await json(`${sessionPath}/import`, "POST", { candidateIds: [validPdfCandidate.id, resolved.id] });
assert.equal(importedPdfItems.length, 2);

const catalog = await api(`/api/catalog-items?query=${encodeURIComponent(stamp)}`);
assert.ok(catalog.some((item) => item.id === catalogItem.id));
assert.ok(catalog.some((item) => item.sku === `RESOLVED-${stamp}`.toUpperCase()));

process.stdout.write(`${JSON.stringify({
  status: "passed",
  vendorId: vendor.id,
  catalogItemId: catalogItem.id,
  providerId: provider.id,
  websiteJobId: websiteJob.id,
  websiteSessionId: completedWebsiteJob.session.id,
  pdfJobId: pdfJob.id,
  pdfSessionId: completedPdfJob.session.id,
  importedCandidateCount: 3,
}, null, 2)}\n`);
