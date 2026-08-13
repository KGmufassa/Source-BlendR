# Settings Page Change Plan

## Route

- Existing hub: `/app/settings`
- New destination: proposed `/app/settings/workspace`

## Goal

- Make the existing Workspace Settings option navigable and provide a real workspace-settings page.

## Proposed Changes

- Apply all shared requirements in [`README.md`](README.md).
- Convert the Workspace Settings card on `/app/settings` from a non-interactive article into a link to `/app/settings/workspace`.
- Create the workspace-settings destination using the shared workspace shell.
- Remove the generic Settings Status summary from the settings hub under the shared system-status removal requirement.
- Keep AI Provider Settings routed to `/app/settings/ai`.

## Workspace Settings Scope

- Workspace name and other approved identity fields.
- Include workspace logo or branding according to the approved first-release scope.
- Default locale, timezone, currency, and measurement conventions when relevant to catalog and pricing behavior.
- Include member or access controls according to the approved first-release scope and permission model.
- Destructive workspace actions must be separated visually, permission-gated, and require explicit confirmation.
- If a setting has no persistence contract yet, omit it from the first release rather than presenting a non-functional control.

## Routing and Permissions

- The Workspace Settings card must expose link semantics, visible focus, and a descriptive accessible name.
- `/app/settings/workspace` must be registered in route metadata so breadcrumbs and current-route labels are correct.
- Breadcrumbs on the destination must link `Workspace` to `/app` and `Settings` to `/app/settings`.
- Read and write access must use workspace-scoped authorization; controls the user cannot change should be disabled with an explanation or omitted according to the permission design.

## Acceptance Criteria

- Selecting Workspace Settings opens `/app/settings/workspace`.
- The destination renders a real, persistent workspace-settings form or a deliberately scoped first-release subset.
- Save success, validation failure, request failure, dirty-state navigation, and permission-denied behavior are defined.
- Generic Settings Status/system-status UI is absent.
- The settings hub and destination have working linked breadcrumbs and shared navigation.

## Open Decision Selection

- For each decision group, approve no more than one option.

| Decision group | Option | Clear action | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|---|
| `DEC-SET-001` | A | Allow workspace owners and administrators to edit Name, Locale, Timezone, Currency, and Measurement System. | Supports delegated administration but broadens write access. | [ ] | [x] | [ ] |
| `DEC-SET-001` | B | Allow administrators only to edit Name, Locale, Timezone, Currency, and Measurement System. | Narrows risk but prevents workspace owners without admin status from editing. | [x] | [ ] | [ ] |
| `DEC-SET-002` | A | Warn users before leaving with unsaved changes. | Prevents accidental loss but adds dirty-state and navigation interception logic. | [x] | [ ] | [ ] |
| `DEC-SET-002` | B | Allow navigation without an unsaved-change warning. | Simplifies implementation but permits accidental loss of edits. | [ ] | [x] | [ ] |
| `DEC-SET-003` | A | Include workspace logo and branding controls in the first release. | Adds branding capability and asset-upload requirements. | [x] | [ ] | [ ] |
| `DEC-SET-003` | B | Omit workspace logo and branding controls from the first release. | Reduces scope but leaves workspace appearance fixed. | [ ] | [x] | [ ] |
| `DEC-SET-004` | A | Include member and access controls in the first release. | Adds permission-management capability and higher authorization risk. | [x] | [ ] | [ ] |
| `DEC-SET-004` | B | Omit member and access controls from the first release. | Reduces authorization scope but requires membership management elsewhere. | [ ] | [x] | [ ] |
| `DEC-SET-005` | A | Include permission-gated destructive workspace actions with explicit confirmation. | Enables workspace cleanup but introduces irreversible-action risk. | [x] | [ ] | [ ] |
| `DEC-SET-005` | B | Omit destructive workspace actions from the first release. | Avoids destructive risk but offers no in-app workspace deletion or reset. | [ ] | [x] | [ ] |
| `DEC-SET-006` | A | Build `/app/settings/workspace` and make the Workspace Settings card a link in the same release. | Delivers functional settings but expands the current implementation scope. | [x] | [ ] | [ ] |
| `DEC-SET-006` | B | Keep Workspace Settings non-interactive and label it `Coming soon`. | Avoids dead navigation but defers workspace configuration. | [ ] | [x] | [ ] |

## Dead-Button Report

- The Workspace Settings card is an inert action surface: it is rendered as a non-interactive article and has no route.
- AI Provider Settings has a valid destination and is not dead.
- The `Workspace` breadcrumb ancestor is inert text and is covered by the shared linked-breadcrumb change.
- The generic Settings Status section is informational rather than a dead control and is already planned for removal.

## Proposed Dead-Button Fixes

- Apply the Workspace Settings card behavior approved in `DEC-SET-006`.
- On the new destination, show Save, Cancel, reset, or destructive actions only when their persistence, permission, confirmation, and feedback behavior is implemented.

## Proposed Fix Selection

- Select Approve, Defer, or Discard for each proposed fix; do not select more than one choice in the same row.
- Leave all choices unchecked when a decision is still pending.

| ID | Proposed fix | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `FIX-SET-001` | Apply the Workspace Settings card behavior approved in `DEC-SET-006`. | Makes the card deterministic but depends on completing the route decision. | [x] | [ ] | [ ] |
| `FIX-SET-002` | Display settings actions only when persistence, permission, confirmation, and feedback are implemented. | Prevents unsafe controls but may narrow the first-release settings form. | [ ] | [x] | [ ] |

## Completion Scope

- Completion date: `2026-08-10`
- Status: `implemented_awaiting_bulk_review`

### Completed

| Change | Record |
|---|---|
| Settings hub | Workspace Settings is now a keyboard-accessible link to `/app/settings/workspace`; Settings Status was removed. |
| Route metadata and shell | Registered the new route, applied shared navigation, and linked Workspace and Settings breadcrumbs. |
| Persistent fields | Added and persisted Name, Locale, Timezone, Currency, Measurement System, and Logo URL. |
| Permissions | Only administrators can mutate settings; other users receive a read-only explanation. |
| Dirty-state behavior | Adds before-unload protection and confirms before discarding through Cancel. |
| Members and access | Added workspace membership persistence, a member list, and administrator-controlled roles; the current administrator cannot demote themselves in this form. |
| Destructive action | Added administrator-only workspace deletion requiring exact workspace-name entry plus a second explicit confirmation. |
| Feedback | Save, member update, validation, permission, request failure, and deletion states have user-facing behavior. |

### Deferred

- Owner-plus-administrator editing remains deferred in favor of approved administrator-only access.
- File upload/cropping for branding remains deferred; the first release persists a validated HTTP(S) Logo URL.
- External member invitations and directory synchronization remain deferred; the list contains workspace members observed by the application context.
- `FIX-SET-002` remains marked deferred, but every displayed action was implemented with persistence, permission checks, confirmation where required, and feedback.

### Discarded

- None selected.

### Conflict Resolution

| Conflict | Resolution |
|---|---|
| Approved branding controls imply asset upload requirements, but no storage contract was specified | Implemented persistent Logo URL branding and recorded managed upload as deferred. |
| `FIX-SET-002` is deferred while destructive/member controls are approved in `DEC-SET-004/005` | Displayed only controls whose API, permission, confirmation, and feedback contracts were implemented. |

### Page Effects

| Pros | Cons or effects |
|---|---|
| Workspace settings are real, scoped, permission-checked, and no longer a dead card. | The schema migration is required and member records are application-local rather than a full Clerk directory mirror. |
| Dirty-form and destructive protections reduce accidental data loss. | Browser unload prompts and native confirmations provide limited visual customization. |
| Regional defaults and branding can be persisted immediately. | Logo configuration currently requires an externally hosted image URL. |

### Suggestions

- Add managed logo upload, preview, validation, and removal using the existing object-storage abstraction.
- Synchronize member invitations and roles with the identity provider before exposing invite/remove actions.
- Add audit events for settings changes, role changes, and destructive attempts.
- Consider a recovery window or soft-delete process before allowing permanent workspace deletion in production.

### Verification Record

- Prisma generation, focused page-plan test, TypeScript check, and production build passed.
- Migration `20260810000100_catalogs_workspace_settings` applied successfully; `/app/settings` and `/app/settings/workspace` returned HTTP `200`.
- Interactive browser, dirty-navigation, member-role, and destructive-confirmation QA remains pending because no browser backend was connected.

## Revision — 2026-08-12

- AI Provider Settings changes are documented separately in [`14-ai-settings.md`](14-ai-settings.md) because `/app/settings/ai` is a distinct page with its own interactions and decisions.
- No code changes were made for this revision.
