# TICKET-021 Stage 7 Handoff Runbook

## Scope

Stage 6 records deployment readiness evidence only. Stage 7 owns production deployment execution, live credentials, hosted health checks, monitoring proof, and launch gates.

---

## Deployment Units

| Unit | Platform | Stage 6 status |
|---|---|---|
| `DEPLOY-WEB` | Vercel | configured-not-deployed contract |
| `DEPLOY-WORKER` | Fly.io | configured-not-deployed contract |
| `DEPLOY-DB` | Neon | schema contract validated |
| `DEPLOY-REDIS` | Upstash | queue contract validated |

---

## Health Checks

- Web: `corepack pnpm build`
- Worker: `corepack pnpm exec node --test apps/worker/import-job-contracts.test.mjs`
- Database: `corepack pnpm exec node --test prisma/workspace-schema.test.mjs`
- Queue: observable import-job event contract
- AI routing: `corepack pnpm exec node --test packages/ai/ai-router.test.mjs`

---

## Operational Runbooks

### `RUNBOOK-STUCK-JOB`

1. Check job event log for last terminal or retryable event.
1. Pause queue intake if failures are systemic.
1. Retry failed work from job detail after source artifacts are preserved.
1. Escalate to provider/manual fallback when AI capability route is unavailable.

### `RUNBOOK-PROVIDER-DEGRADED`

1. Run provider health check.
1. Disable degraded provider route through configuration.
1. Use manual fallback for affected catalog enrichment.
1. Re-enable only after health check passes.

### `RUNBOOK-ROLLBACK`

1. Roll back Vercel web deployment to previous production version.
1. Roll back Fly.io worker release or pause workers before redeploy.
1. Prefer forward-fix migration unless a tested database rollback exists.
1. Preserve source artifacts, job events, and candidate data for replay.

---

## Stage 7 Required Follow-up

- Verify production credentials and environment variables.
- Wire live Sentry project and alert routing.
- Verify hosted web and worker health endpoints.
- Rehearse rollback against the real deployment environment.
- Record Stage 7 launch readiness gates before public rollout.
