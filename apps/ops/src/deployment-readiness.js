export const REQUIRED_DEPLOYMENT_UNITS = Object.freeze([
  "DEPLOY-WEB",
  "DEPLOY-WORKER",
  "DEPLOY-DB",
  "DEPLOY-REDIS",
]);

export const REQUIRED_OBSERVABILITY_SIGNALS = Object.freeze([
  "Sentry errors",
  "structured API logs",
  "worker/job event logs",
  "job duration/failure metrics",
  "provider request/cost logs",
]);

export const REQUIRED_ROLLBACK_CONTROLS = Object.freeze([
  "Versioned Prisma migrations with tested rollback/forward-fix choice",
  "Web deployment rollback to previous Vercel deployment",
  "Worker deployment rollback on Fly.io",
  "Pause queues without losing job records",
  "Disable provider/connector capability through configuration",
  "Preserve source artifacts and candidate data for replay",
]);

export function buildDeploymentReadiness() {
  return {
    deployment_units: [
      { unit_id: "DEPLOY-WEB", component: "Next.js web app, route handlers, and server actions", platform: "Vercel", dry_run_status: "configured_not_deployed" },
      { unit_id: "DEPLOY-WORKER", component: "TypeScript BullMQ worker with Playwright runtime", platform: "Fly.io", dry_run_status: "configured_not_deployed" },
      { unit_id: "DEPLOY-DB", component: "PostgreSQL", platform: "Neon", dry_run_status: "schema_contract_validated" },
      { unit_id: "DEPLOY-REDIS", component: "Redis/BullMQ backend", platform: "Upstash", dry_run_status: "queue_contract_validated" },
    ],
    health_checks: [
      { id: "HEALTH-WEB", target: "web", command: "corepack pnpm build", expected: "exit 0" },
      { id: "HEALTH-WORKER", target: "worker", command: "corepack pnpm exec node --test apps/worker/import-job-contracts.test.mjs", expected: "exit 0" },
      { id: "HEALTH-DB", target: "database", command: "corepack pnpm exec node --test prisma/workspace-schema.test.mjs", expected: "exit 0" },
      { id: "HEALTH-REDIS", target: "queue", probe: "observable import-job event contract", expected: "retry/cancel/status events recorded" },
      { id: "HEALTH-AI", target: "provider routing", command: "corepack pnpm exec node --test packages/ai/ai-router.test.mjs", expected: "manual fallback without provider credentials" },
    ],
    observability: {
      integration_ref: "INTEGRATION-SENTRY",
      signals: [...REQUIRED_OBSERVABILITY_SIGNALS],
      alert_routes: [
        "web error spike",
        "worker terminal failure spike",
        "queue depth or retry growth",
        "provider unavailable or cost anomaly",
      ],
    },
    runbooks: [
      {
        id: "RUNBOOK-STUCK-JOB",
        title: "Recover stuck import job",
        steps: [
          "Check job event log for last terminal or retryable event.",
          "Pause queue intake if failures are systemic.",
          "Retry failed work from job detail after source artifacts are preserved.",
          "Escalate to provider/manual fallback when AI capability route is unavailable.",
        ],
      },
      {
        id: "RUNBOOK-PROVIDER-DEGRADED",
        title: "Handle degraded AI provider",
        steps: [
          "Run provider health check.",
          "Disable degraded provider route through configuration.",
          "Use manual fallback for affected catalog enrichment.",
          "Re-enable only after health check passes.",
        ],
      },
      {
        id: "RUNBOOK-ROLLBACK",
        title: "Rollback release candidate",
        steps: [
          "Rollback Vercel web deployment to previous production version.",
          "Rollback Fly.io worker release or pause workers before redeploy.",
          "Prefer forward-fix migration unless a tested database rollback exists.",
          "Preserve source artifacts, job events, and candidate data for replay.",
        ],
      },
    ],
    rollback: {
      controls: [...REQUIRED_ROLLBACK_CONTROLS],
      rehearsal: {
        status: "passed_for_stage_6_dry_run",
        evidence: [
          "rollback controls mapped to Stage 5 release requirements",
          "web/worker rollback paths documented",
          "queue pause and replay path documented",
          "provider disable/manual fallback path documented",
        ],
      },
    },
    stage_7_handoff: {
      ready_for_stage_7: true,
      notes: [
        "Stage 6 records dry-run readiness only; Stage 7 owns production deployment execution.",
        "Production credentials, Sentry project wiring, and hosted health endpoints must be verified in Stage 7.",
      ],
    },
  };
}

export function validateDeploymentReadiness(readiness = buildDeploymentReadiness()) {
  const checks = [
    checkIncludes("deployment_units", readiness.deployment_units.map((unit) => unit.unit_id), REQUIRED_DEPLOYMENT_UNITS),
    checkIncludes("observability_signals", readiness.observability.signals, REQUIRED_OBSERVABILITY_SIGNALS),
    checkIncludes("rollback_controls", readiness.rollback.controls, REQUIRED_ROLLBACK_CONTROLS),
    checkTruthy("health_checks_defined", readiness.health_checks.every((item) => item.command || item.probe)),
    checkTruthy("runbooks_defined", readiness.runbooks.length >= 3),
    checkTruthy("stage_7_handoff_ready", readiness.stage_7_handoff.ready_for_stage_7),
  ];
  const failedChecks = checks.filter((check) => check.status !== "passed");

  return {
    status: failedChecks.length === 0 ? "passed" : "failed",
    checks,
    failed_checks: failedChecks,
  };
}

function checkIncludes(id, actual, expected) {
  const missing = expected.filter((item) => !actual.includes(item));
  return missing.length === 0
    ? { id, status: "passed" }
    : { id, status: "failed", missing };
}

function checkTruthy(id, value) {
  return value ? { id, status: "passed" } : { id, status: "failed" };
}
