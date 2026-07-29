import assert from "node:assert/strict";
import test from "node:test";

import {
  REQUIRED_DEPLOYMENT_UNITS,
  REQUIRED_OBSERVABILITY_SIGNALS,
  REQUIRED_ROLLBACK_CONTROLS,
  buildDeploymentReadiness,
  validateDeploymentReadiness,
} from "./src/deployment-readiness.js";

test("deployment readiness defines required deploy units health checks and observability", () => {
  const readiness = buildDeploymentReadiness();
  const result = validateDeploymentReadiness(readiness);

  assert.equal(result.status, "passed");
  assert.deepEqual(result.failed_checks, []);
  assert.deepEqual(readiness.deployment_units.map((unit) => unit.unit_id), REQUIRED_DEPLOYMENT_UNITS);
  assert.deepEqual(readiness.observability.signals, REQUIRED_OBSERVABILITY_SIGNALS);
  assert.ok(readiness.health_checks.every((check) => check.command || check.probe));
});

test("deployment readiness includes runbooks and rollback rehearsal evidence", () => {
  const readiness = buildDeploymentReadiness();

  assert.deepEqual(readiness.rollback.controls, REQUIRED_ROLLBACK_CONTROLS);
  assert.equal(readiness.rollback.rehearsal.status, "passed_for_stage_6_dry_run");
  assert.ok(readiness.runbooks.some((runbook) => runbook.id === "RUNBOOK-STUCK-JOB"));
  assert.ok(readiness.runbooks.some((runbook) => runbook.id === "RUNBOOK-ROLLBACK"));
  assert.ok(readiness.stage_7_handoff.ready_for_stage_7);
});
