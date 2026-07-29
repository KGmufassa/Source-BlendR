import assert from "node:assert/strict";
import test from "node:test";

import {
  REQUIRED_LAUNCH_ACTIONS,
  REQUIRED_LAUNCH_ROUTES,
  validateLaunchUiContracts,
  validateSecurityContracts,
} from "./src/stage6-batch006-validation.js";

test("security validation covers tenant isolation credentials uploads and server authorization", async () => {
  const result = await validateSecurityContracts();

  assert.equal(result.status, "passed");
  assert.deepEqual(result.failed_checks, []);
  assert.deepEqual(result.checks.map((check) => check.id), [
    "tenant_isolation_denies_cross_workspace",
    "catalog_search_excludes_other_workspace",
    "discovery_promotion_requires_active_workspace_candidate",
    "pdf_upload_rejects_path_traversal",
    "ai_provider_fallback_does_not_require_credentials",
    "frontend_previews_do_not_expose_secret_storage",
  ]);
});

test("launch UI validation covers routes actions keyboard responsive and visual continuity", async () => {
  const result = await validateLaunchUiContracts();

  assert.equal(result.status, "passed");
  assert.deepEqual(result.failed_checks, []);
  assert.deepEqual(result.required_routes, REQUIRED_LAUNCH_ROUTES);
  assert.deepEqual(result.required_actions, REQUIRED_LAUNCH_ACTIONS);
  assert.equal(result.coverage.route_coverage, REQUIRED_LAUNCH_ROUTES.length);
  assert.equal(result.coverage.action_coverage, REQUIRED_LAUNCH_ACTIONS.length);
  assert.ok(result.checks.every((check) => check.status === "passed"));
});
