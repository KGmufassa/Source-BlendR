# Website Import Page Change Plan

## Route

- `/app/imports/website`

## Goal

- Keep website import focused on source setup and move category review to the resulting job.

## Proposed Changes

- Apply all shared requirements in [`README.md`](README.md).
- Remove the Detected Category Tree section from this page.
- Do not discard detected category data; retain it with the import job so it can be reviewed at `/app/imports/jobs/:importID`.
- Keep the URL, vendor, and other source-setup fields required to start the website import.
- After job creation, hand the user off to Job Details using the approved post-analysis behavior.

## Workflow Contract

1. User supplies and validates the website source.
1. User starts the import.
1. The system creates a job and performs discovery.
1. Job Details exposes discovered categories in list and tree views when category data becomes available.
1. The user selects scrape-eligible categories and continues processing from the job.

## Open Decision Selection

- Approve no more than one option in each decision group.

| Decision group | Option | Clear action | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|---|
| `DEC-WEB-001` | A | Automatically navigate to the created Job Details page after website analysis starts. | Minimizes steps but provides no intermediate success screen. | [x] | [ ] | [ ] |
| `DEC-WEB-001` | B | Show a success state with a `View Job Details` link to the created job. | Confirms job creation but adds one click before category review. | [ ] | [x] | [ ] |

## Acceptance Criteria

- No Detected Category Tree is rendered on the website-import setup page.
- Starting an import still captures category detection output on the created job.
- The success or handoff state includes a working route to the relevant Job Details page.
- Refreshing or revisiting the job does not lose detected category or selection data.

## Dead-Button Report

- `Select All` in the current Detected Category Tree is dead: it has no handler and does not update the checkboxes.
- `Start Selected Categories` is dead: it has no handler, selected-category state, API call, or navigation.
- `Analyze Website` is connected to the website import API and created-job route and is not dead.
- The `Workspace` breadcrumb ancestor is inert text and is covered by the shared linked-breadcrumb change.

## Proposed Dead-Button Fixes

- Remove both dead category buttons with the Detected Category Tree section, as already specified for this page.
- Do not recreate these controls here. Implement category selection and scrape submission on Job Details using the detected job data and stable job ID.
- Keep `Analyze Website` as the only primary submission action on source setup and retain its pending, error, and created-job handoff behavior.

## Proposed Fix Selection

- Select Approve, Defer, or Discard for each proposed fix; do not select more than one choice in the same row.
- Leave all choices unchecked when a decision is still pending.

| ID | Proposed fix | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `FIX-WEB-001` | Remove the dead category buttons with the Detected Category Tree section. | Shortens source setup and moves category decisions out of this page. | [x] | [ ] | [ ] |
| `FIX-WEB-002` | Implement category selection and scrape submission on Job Details using the stable job ID. | Centralizes category work but makes Job Details responsible for the full selection workflow. | [x] | [ ] | [ ] |
| `FIX-WEB-003` | Keep `Analyze Website` as the only primary source-setup submission action. | Clarifies the workflow and makes the created-job handoff mandatory. | [x] | [ ] | [ ] |

## Completion Scope

- Completion date: `2026-08-10`
- Status: `implemented_awaiting_bulk_review`

### Completed

| Change | Record |
|---|---|
| Setup scope | Removed Detected Category Tree, Select All, and Start Selected Categories from source setup. |
| Source form | Kept vendor and HTTP(S) URL inputs with real validation and request feedback. |
| Handoff | `Analyze Website` creates the job and automatically opens its stable Job Details route. |
| Vendor context | Accepts and validates a preselected vendor ID from Vendor Details. |
| Shared cleanup | Removed the generic System Ready footer and linked breadcrumb ancestors. |

### Deferred

- `DEC-WEB-001B`: a separate success state and View Job Details step remain deferred.

### Discarded

- None selected.

### Page Effects

| Pros | Cons or effects |
|---|---|
| Source setup is shorter and has one clear primary action. | Users move immediately to Job Details without an intermediate confirmation screen. |
| Category data remains owned by the job workflow. | Category review depends on discovery completing before the Job Details selector appears. |

### Suggestions

- Add live discovery progress or polling on Job Details so category availability is clear after handoff.
- Prefill the vendor website URL when a vendor-scoped import is launched and the stored URL is valid.

### Verification Record

- Focused page-plan test passed; TypeScript check and production build passed.
- Migrated local runtime check passed with HTTP `200` on `/app/imports/website`; interactive browser/visual QA remains pending because no browser backend was connected.

## Revision — 2026-08-12

### Revised Page Goal

- Use this page as the prerequisite for scraping a user-selected website for products or services.
- The user identifies the vendor and supplies its website, then selects `Analyze Website` to create the analysis job.

### Page Edits

| ID | Approved change | Ramification | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `CHANGE-WEB-004` | Replace the Vendor Entity select with a typed combobox that filters existing workspace vendors as the user types. | Improves vendor lookup but requires accessible suggestion, no-result, keyboard, and exact-selection behavior. | [x] | [ ] | [ ] |
| `CHANGE-WEB-005` | Remove the `ACTIVE` note from the source-setup card. | Reduces nonessential status decoration without changing the form state. | [x] | [ ] | [ ] |

### Vendor Combobox Contract

- The field accepts typed text and opens a filtered dropdown of workspace vendor names.
- Arrow keys move through suggestions, Enter selects, Escape closes, and focus/selection are announced accessibly.
- Selecting a suggestion must submit the stable vendor ID while displaying its name.
- Free text that does not match an existing vendor must not silently create or assign a vendor.
- A typed non-match must show a clear validation or no-results state before analysis can start.
- The existing vendor supplied by a vendor-scoped import link must prepopulate as a selected value.

### Open Decision Selection

| Decision group | Option | Clear action | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|---|
| `DEC-WEB-002` | A | Require selection of an existing vendor from the suggestions. | Preserves referential integrity but requires users to create a vendor before analysis. | [ ] | [ ] | [ ] |
| `DEC-WEB-002` | B | Allow a non-matching typed name to create a vendor during submission. | Shortens setup but combines vendor creation, duplicate handling, and website analysis in one transaction. | [ ] | [ ] | [ ] |

### Revised Acceptance Criteria

- Vendor Entity is an accessible typed combobox rather than a static select.
- The submitted value resolves to a workspace-scoped vendor ID according to the approved `DEC-WEB-002` branch.
- The `ACTIVE` note is absent.

### Implementation Status

- Status: `planned_not_implemented`
- `DEC-WEB-002` requires a branch selection before implementation.
- No code changes were made for this revision.
