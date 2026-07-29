import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createCapabilityRouter } from "../../../packages/ai/src/router.js";
import { createCatalogApi } from "../../../packages/domain/src/catalog-api.js";
import { createMemoryCatalogRepository } from "../../../packages/domain/src/catalog.js";
import { createDiscoveryApi } from "../../../packages/domain/src/discovery-api.js";
import { normalizePdfSource } from "../../../packages/scrapers/src/pdf.js";
import { requireWorkspaceAccess } from "../../../packages/types/src/workspace.js";
import {
  renderCatalogItemFormPage,
  renderCatalogManagementPage,
  renderVendorsPage,
  renderAiSettingsPage,
} from "../../web/src/management-pages.js";
import {
  renderDiscoverySessionPage,
  renderPdfImportPage,
  renderTicket017PreviewPage,
  renderWebsiteImportPage,
} from "../../web/src/import-workflows.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

export const REQUIRED_LAUNCH_ROUTES = Object.freeze([
  "/app",
  "/app/imports",
  "/app/imports/website",
  "/app/imports/pdf",
  "/app/imports/jobs/:jobId",
  "/app/discovery/:sessionId",
  "/app/catalog",
  "/app/catalog/new",
  "/app/vendors",
  "/app/settings/ai",
]);

export const REQUIRED_LAUNCH_ACTIONS = Object.freeze([
  "EL-OV-001",
  "EL-OV-002",
  "EL-OV-003",
  "EL-IM-001",
  "EL-IM-002",
  "EL-IM-003",
  "EL-WEB-001",
  "EL-WEB-002",
  "ACTION-START-WEBSITE",
  "EL-WEB-004",
  "ACTION-QUEUE-CATEGORIES",
  "EL-WEB-006",
  "EL-PDF-001",
  "EL-PDF-002",
  "ACTION-START-PDF",
  "EL-PDF-004",
  "ACTION-RETRY-JOB",
  "ACTION-CANCEL-JOB",
  "EL-JOB-003",
  "ACTION-SEARCH-CANDIDATES",
  "ACTION-FILTER-CANDIDATES",
  "EL-DIS-003",
  "ACTION-PREVIEW-CANDIDATE",
  "ACTION-BULK-IMPORT",
  "ACTION-BULK-IGNORE",
  "ACTION-BULK-ARCHIVE",
  "ACTION-SEARCH-CATALOG",
  "ACTION-FILTER-CATALOG",
  "EL-CAT-003",
  "EL-CAT-004",
  "EL-FORM-001",
  "EL-FORM-002",
  "EL-FORM-003",
  "EL-FORM-004",
  "ACTION-SAVE-ITEM",
  "EL-FORM-006",
  "EL-VEN-001",
  "EL-VEN-002",
  "EL-AI-001",
  "ACTION-HEALTH-CHECK",
  "EL-AI-003",
  "ACTION-SAVE-AI",
]);

function passed(id, evidence = "") {
  return { id, status: "passed", evidence };
}

function failed(id, error) {
  return { id, status: "failed", error: error instanceof Error ? error.message : String(error) };
}

async function check(id, fn) {
  try {
    return passed(id, await fn());
  } catch (error) {
    return failed(id, error);
  }
}

function expectThrows(fn, pattern) {
  try {
    fn();
  } catch (error) {
    if (pattern.test(error.message)) return;
    throw error;
  }
  throw new Error(`expected ${pattern}`);
}

export async function validateSecurityContracts() {
  const checks = [];
  const context = { userId: "user_1", workspaceId: "workspace_1", role: "member" };

  checks.push(await check("tenant_isolation_denies_cross_workspace", () => {
    expectThrows(() => requireWorkspaceAccess(context, "workspace_2"), /workspace_forbidden/);
    return "cross-workspace access throws workspace_forbidden";
  }));

  checks.push(await check("catalog_search_excludes_other_workspace", () => {
    const api = createCatalogApi({
      repository: createMemoryCatalogRepository([
        { name: "Other Tea", sku: "other", priceCents: 100, currency: "USD", vendorId: "vendor_2", workspaceId: "workspace_2" },
      ]),
      workspaceContext: context,
    });
    if (api.searchItems("tea").length !== 0) throw new Error("other workspace item leaked");
    return "repository list is scoped by active workspace";
  }));

  checks.push(await check("discovery_promotion_requires_active_workspace_candidate", () => {
    const api = createDiscoveryApi({ catalogRepository: createMemoryCatalogRepository(), workspaceContext: context });
    expectThrows(() => api.promoteCandidate("candidate_from_other_workspace"), /candidate_not_found/);
    return "unknown or non-workspace candidate cannot be promoted";
  }));

  checks.push(await check("pdf_upload_rejects_path_traversal", () => {
    expectThrows(() => normalizePdfSource({ workspaceId: "workspace_1", fileName: "../secret.pdf", text: "" }), /file_name_invalid/);
    return "path traversal file name rejected";
  }));

  checks.push(await check("ai_provider_fallback_does_not_require_credentials", async () => {
    const result = await createCapabilityRouter([]).executeCapability("normalize_item", { input: { name: "Tea" } });
    if (result.mode !== "manual_fallback") throw new Error("manual fallback missing");
    return "zero-provider path returns manual fallback without credential access";
  }));

  checks.push(await check("frontend_previews_do_not_expose_secret_storage", async () => {
    const files = [
      "apps/web/preview.html",
      "apps/web/catalog-preview.html",
      "apps/web/ai-settings-preview.html",
      "apps/web/website-import-preview.html",
      "apps/web/pdf-import-preview.html",
      "apps/web/discovery-session-preview.html",
      "apps/web/import-workspace-preview.html",
    ];
    const contents = await Promise.all(files.map((file) => readFile(resolve(REPO_ROOT, file), "utf8")));
    if (contents.some((html) => /localStorage|sessionStorage|api[_-]?key|password|secret/i.test(html))) {
      throw new Error("secret-like storage or credential text found in preview HTML");
    }
    return "preview HTML contains no browser storage or secret-like credential strings";
  }));

  const failedChecks = checks.filter((item) => item.status !== "passed");
  return { status: failedChecks.length === 0 ? "passed" : "failed", checks, failed_checks: failedChecks };
}

function launchPages() {
  return [
    renderTicket017PreviewPage(),
    renderWebsiteImportPage({ vendors: [{ id: "vendor-1", name: "Acme" }], categories: ["Tea"], jobId: "job-1" }),
    renderPdfImportPage({ vendors: [{ id: "vendor-1", name: "Acme" }], jobId: "job-2", state: "error" }),
    renderDiscoverySessionPage({ candidates: [{ id: "candidate-1", name: "Tea", status: "ready" }] }),
    renderCatalogManagementPage({ items: [{ name: "Tea", sku: "TEA", priceCents: 300 }] }),
    renderCatalogItemFormPage(),
    renderVendorsPage({ vendors: [{ id: "vendor-1", name: "Acme" }] }),
    renderAiSettingsPage({ providers: [{ id: "local", status: "healthy", capability: "normalize_item" }] }),
  ].join("\n");
}

function missingTokens(html, tokens) {
  return tokens.filter((token) => !html.includes(token));
}

export async function validateLaunchUiContracts() {
  const html = launchPages();
  const checks = [];

  checks.push(await check("required_routes_present", () => {
    const missing = missingTokens(html, REQUIRED_LAUNCH_ROUTES.map((route) => `data-route="${route}"`));
    if (missing.length > 0) throw new Error(`missing routes: ${missing.join(", ")}`);
    return "all launch routes are represented";
  }));

  checks.push(await check("required_actions_present", () => {
    const missing = missingTokens(html, REQUIRED_LAUNCH_ACTIONS);
    if (missing.length > 0) throw new Error(`missing actions/elements: ${missing.join(", ")}`);
    return "all launch actions and interactive element refs are represented";
  }));

  checks.push(await check("keyboard_focus_styles_present", () => {
    if (!html.includes("focus-visible")) throw new Error("focus-visible styles missing");
    return "keyboard focus styles are present";
  }));

  checks.push(await check("responsive_contracts_present", () => {
    const required = ["@media (max-width:767px)", "stacked_labeled_records", "full_screen_sheet"];
    const missing = missingTokens(html, required);
    if (missing.length > 0) throw new Error(`missing responsive tokens: ${missing.join(", ")}`);
    return "mobile breakpoints, stacked records, and drawer sheet contracts are present";
  }));

  checks.push(await check("state_and_recovery_paths_present", () => {
    const required = ["data-state=\"permission_denied\"", "data-state=\"error\"", "ACTION-RETRY-JOB", "ACTION-CANCEL-JOB"];
    const missing = missingTokens(html, required);
    if (missing.length > 0) throw new Error(`missing state/recovery tokens: ${missing.join(", ")}`);
    return "permission denied, error, retry, and cancel paths are present";
  }));

  checks.push(await check("design_system_tokens_present", () => {
    const required = ["--sb-canvas:#F7F6F2", "--sb-action:#A85E2A", "--sb-focus:#155E75"];
    const missing = missingTokens(html.replaceAll(" ", ""), required);
    if (missing.length > 0) throw new Error(`missing design tokens: ${missing.join(", ")}`);
    return "approved canvas/action/focus tokens are present";
  }));

  const failedChecks = checks.filter((item) => item.status !== "passed");
  return {
    status: failedChecks.length === 0 ? "passed" : "failed",
    required_routes: REQUIRED_LAUNCH_ROUTES,
    required_actions: REQUIRED_LAUNCH_ACTIONS,
    coverage: {
      route_coverage: REQUIRED_LAUNCH_ROUTES.length - missingTokens(html, REQUIRED_LAUNCH_ROUTES.map((route) => `data-route="${route}"`)).length,
      action_coverage: REQUIRED_LAUNCH_ACTIONS.length - missingTokens(html, REQUIRED_LAUNCH_ACTIONS).length,
    },
    checks,
    failed_checks: failedChecks,
  };
}
