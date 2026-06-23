# Support And Operations Notes

## Support Triage

- Import failures: inspect import batch status, row errors, and raw row preservation before retrying.
- Pricing issues: compare cost components, pricing rule, and immutable snapshot values.
- Quote generation issues: inspect `quote.output.generate` job state, attempts, support reference, and retry eligibility.
- Share-link issues: verify token expiration, revocation state, and audit events before reissuing a link.

## Monitoring Targets For Stage 7

- API error rate by route family.
- Import validation and commit failures.
- Quote output job queue depth, failed jobs, and retry exhaustion.
- Quote share-link creation, revocation, and expired-link access attempts.
- Audit event write failures.

## Backup And Recovery Expectations

- Database backups must cover workspaces, suppliers, imports, assets, pricing snapshots, quotes, share links, jobs, and audit events.
- Object storage backups must cover imported files and generated outputs.
- Recovery validation must verify workspace access, import consistency, pricing snapshot consistency, quote output access, and worker retry health.
