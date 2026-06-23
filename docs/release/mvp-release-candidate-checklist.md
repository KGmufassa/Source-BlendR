# MVP Release Candidate Checklist

## Release Gates

| Gate | Status | Evidence |
| --- | --- | --- |
| GATE-001 Automated Test Gate | Passed | `npm test`, `npm run test:e2e`, `npm run typecheck`, `npm run build` |
| GATE-002 Security Gate | Passed for local MVP scope | Quote share-link tests, RBAC tests, audit event tests, secret exposure review |
| GATE-003 Accessibility And Visual Gate | Passed for current scope | Component keyboard tests, Playwright keyboard route checks, visual evidence screenshots |
| GATE-004 Data Integrity Gate | Passed for local MVP scope | Import conflict tests, pricing snapshot immutability tests, quote lifecycle tests |
| GATE-005 Operational Readiness Gate | Ready for Stage 7 completion | Status center retry visibility, support references, rollback and support notes below |

## Rollback Triggers

- Auth or RBAC regression.
- Incorrect pricing or margin calculation.
- Import commit data integrity failure.
- Quote share-link exposure or revocation failure.
- Generated output job states become unrecoverable.

## Rollback Actions

- Disable beta workspace access or entitlement for affected users.
- Pause import and generated-output workers.
- Revoke active quote share links if external access is affected.
- Revert the release branch or deployment artifact.
- Restore affected records from the latest verified backup when production storage exists.
- Notify impacted beta users and record incident notes.

## Known Deferred Work

- Managed database, object storage, queue, and worker deployment adapters.
- Real generated PDF renderer and template storage.
- Direct supplier portal integrations and secure credential vaulting.
- Full automated accessibility scanner integration.
- CI-hosted visual regression comparison.
- Customer portal, AI features, analytics, ecommerce, CRM, and accounting integrations.

## Stage 7 Handoff Needs

- Select deployment provider and managed persistence/queue/storage adapters.
- Add monitoring, alerting, backup/restore validation, and worker process supervision.
- Add production support intake workflow and incident response ownership.
- Configure private beta workspace entitlement and release toggles.
- Decide whether accepted local-adapter limitations need risk signoff before beta.
