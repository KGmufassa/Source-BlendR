# Stage 4 UX/UI Decision Brief

## Recommended direction

Build Source BlendR as a precise, compact operations workspace: a Utilitarian foundation with restrained Bento-style modular grouping for overview and status panels. Use a persistent workspace sidebar, dense searchable tables, explicit async job status, and review-first import flows.

## Why this fits

- The primary user is a workspace owner performing high-frequency import, review, and catalog curation work.
- Website and PDF imports converge on a Discovery Session before catalog writes.
- Manual entry must remain fully capable when no AI provider is configured.
- BullMQ-backed work is asynchronous and needs visible progress, retry, cancel, and partial-failure recovery.
- Accessibility requires semantic controls, visible focus, text-based status, and responsive table fallbacks.

## Key UX decisions

- MVP role: `workspace_owner`; future roles are not given separate MVP workflows.
- Navigation: persistent sidebar with Overview, Imports, Discovery, Catalog, Vendors, and Settings.
- Editing: candidate preview/edit uses an accessible drawer; catalog creation uses a dedicated form.
- Safety: AI output remains a candidate until deterministic validation and explicit user import.
- Visual system: compact spacing, flat bordered surfaces, high contrast, restrained amber action accent, tabular data numerals.

## Main risks and mitigations

- Long-running jobs: persistent job detail with step timeline, event log, retry/cancel, and partial-result access.
- Unsafe extraction: Discovery Session review gate, validation, duplicate/conflict states, and manual fallback.
- Dense responsive UI: stacked mobile records, semantic table headers, keyboard selection, and live announcements.

## Approval

Do you approve this recommended UX/UI direction?

- [ ] Approve recommended UI direction
- [ ] Revise visual style
- [ ] Revise page/screen structure
- [ ] Revise navigation/layout
- [ ] Revise component priorities

Approval is required before Stage 4 can use `ready_for_stage_5`.

## Recorded approval

Approved by user at `2026-07-14T03:54:34.812187+00:00`. Stage 4 may proceed to readiness audit for Stage 5 handoff.

## Notable out-of-scope Stitch additions

These Stitch-added interactions were mapped but classified as `rejected_out_of_scope`. They must not enter Stage 5 unless a prior-stage revision explicitly approves them.

| Page | Stitch addition | Classification | Reason |
|------|-----------------|----------------|--------|
| Vendors | Privacy Policy | `rejected_out_of_scope` | Static policy surface is not part of the approved Stage 1-4 workspace scope. |
| Vendors | Operations Log | `rejected_out_of_scope` | Operational audit/log route is not part of the approved MVP screen system. |
| Vendors | System Status | `rejected_out_of_scope` | Public/system status surface is not part of the approved MVP workflow set. |
| AI Provider Settings | View audit log | `rejected_out_of_scope` | Audit-log workflow is not defined in Stage 1-3 or earlier Stage 4 artifacts. |
| AI Provider Settings | Documentation | `rejected_out_of_scope` | External documentation/support surface is not part of the approved app scope. |
| AI Provider Settings | Support | `rejected_out_of_scope` | Support workflow is not part of the approved MVP screen system. |
