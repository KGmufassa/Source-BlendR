import assert from "node:assert/strict";
import test from "node:test";

import {
  renderDiscoverySessionPage,
  renderImportJobDetailPage,
  renderImportsWorkspacePage,
  renderPdfImportPage,
  renderTicket017PreviewPage,
  renderWebsiteImportPage,
} from "./src/import-workflows.js";

test("website import wizard exposes source inputs, category controls, and job navigation", () => {
  const html = renderWebsiteImportPage({
    vendors: [{ id: "vendor-1", name: "Acme Foods" }],
    categories: ["Tea", "Coffee"],
    jobId: "job-1",
  });

  assert.match(html, /data-route="\/app\/imports\/website"/);
  assert.match(html, /data-element="EL-WEB-001"/);
  assert.match(html, /data-element="EL-WEB-002"/);
  assert.match(html, /data-action="ACTION-START-WEBSITE"/);
  assert.match(html, /data-action="ACTION-QUEUE-CATEGORIES"/);
  assert.match(html, /href="\/app\/imports\/jobs\/job-1"/);
});

test("pdf import page exposes upload, recovery state, and job navigation", () => {
  const html = renderPdfImportPage({
    vendors: [{ id: "vendor-1", name: "Acme Foods" }],
    jobId: "job-2",
    state: "error",
  });

  assert.match(html, /data-route="\/app\/imports\/pdf"/);
  assert.match(html, /data-state="error"/);
  assert.match(html, /type="file"/);
  assert.match(html, /data-action="ACTION-START-PDF"/);
  assert.match(html, /href="\/app\/imports\/jobs\/job-2"/);
});

test("discovery session page exposes stacked candidate table, drawer, and bulk actions", () => {
  const html = renderDiscoverySessionPage({
    candidates: [{ id: "cand-1", name: "Jasmine Tea", status: "ready" }],
  });

  assert.match(html, /data-route="\/app\/discovery\/:sessionId"/);
  assert.match(html, /data-action="ACTION-SEARCH-CANDIDATES"/);
  assert.match(html, /data-action="ACTION-FILTER-CANDIDATES"/);
  assert.match(html, /data-component="DataTable"/);
  assert.match(html, /data-mobile-behavior="stacked_labeled_records"/);
  assert.match(html, /data-component="AccessibleDrawer"/);
  assert.match(html, /data-action="ACTION-BULK-IMPORT"/);
  assert.match(html, /data-action="ACTION-BULK-IGNORE"/);
  assert.match(html, /data-action="ACTION-BULK-ARCHIVE"/);
});

test("overview, imports workspace, and job detail expose approved routes and recovery actions", () => {
  const overview = renderImportsWorkspacePage({ jobs: [{ id: "job-1", source: "Website", status: "running" }] });
  const job = renderImportJobDetailPage({ jobId: "job-1", sessionId: "session-1", state: "permission_denied" });

  assert.match(overview, /data-route="\/app\/imports"/);
  assert.match(overview, /href="\/app\/imports\/website"/);
  assert.match(overview, /href="\/app\/imports\/pdf"/);
  assert.match(overview, /href="\/app\/imports\/jobs\/job-1"/);
  assert.match(job, /data-route="\/app\/imports\/jobs\/:jobId"/);
  assert.match(job, /data-state="permission_denied"/);
  assert.match(job, /data-action="ACTION-RETRY-JOB"/);
  assert.match(job, /data-action="ACTION-CANCEL-JOB"/);
  assert.match(job, /href="\/app\/discovery\/session-1"/);

  const app = renderWebsiteImportPage();
  assert.match(app, /a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible/);
  assert.match(app, /@media \(max-width:767px\)/);
});

test("ticket 017 preview combines overview imports and job detail in one valid document", () => {
  const html = renderTicket017PreviewPage();

  assert.equal(html.match(/<!doctype html>/g).length, 1);
  assert.match(html, /data-route="\/app"/);
  assert.match(html, /data-route="\/app\/imports"/);
  assert.match(html, /data-route="\/app\/imports\/jobs\/:jobId"/);
});
