# PDF Import Page Change Plan

## Route

- `/app/imports/pdf`

## Goal

- Remove prototype-only demo controls while preserving the real states users need during PDF import.

## Proposed Changes

- Apply all shared requirements in [`README.md`](README.md).
- Remove the visible Demo States field or control from the page.
- Preserve loading, processing, validation, success, empty-selection, and failure behavior in the fields and regions where each state is applicable.
- Keep state changes driven by real upload and import activity rather than a demo selector.

## Field-Level State Coverage

- File input: default, drag-over where supported, selected file, unsupported type, oversized file, and upload failure.
- Vendor association: unselected, selected, required-field validation, and unavailable vendor data.
- Submission: ready, submitting, duplicate submission prevention, success, and API failure.
- Job handoff: created job identifier, processing state, and a link to the resulting job details when available.

## Acceptance Criteria

- No Demo States label, select, tab group, or test-only switch is visible.
- A user can complete a normal PDF import without access to a demo-state control.
- Applicable fields display validation messages next to the field that needs attention.
- Loading controls expose progress or busy state and prevent accidental duplicate submissions.
- Failure messaging explains what failed and offers a retry or corrective action.

## Dead-Button Report

- The main `Start PDF Extraction` submit action is connected to the PDF import API and is not dead.
- The five Demo States buttons only force prototype render states. They do not represent production workflow actions and are already planned for removal.
- `Choose another`, `Try Another File`, and `Upload New` change the visible demo state but do not explicitly clear the selected file, filename, pending state, or native file input; they are incomplete reset actions.
- `View Job Results` points to the generic jobs list instead of the job created by the upload. The successful submit also immediately navigates to the created job, making the demo success action unreliable or unreachable during the real flow.
- The extraction-setting checkboxes have no submitted names and do not affect the request, so they are inert controls even though they are not buttons.

## Proposed Dead-Button Fixes

- Remove the Demo States control as already specified.
- Implement one real reset function for all choose-another/upload-new/retry controls. It must clear the file input, filename, request message, error, pending state, and progress state.
- Resolve the post-upload handoff using one option in decision group `FIX-PDF-003`.
- Resolve extraction-setting controls using one option in decision group `FIX-PDF-004`.

## Proposed Fix Selection

- Select Approve, Defer, or Discard for each proposed fix; do not select more than one choice in the same row.
- Leave all choices unchecked when a decision is still pending.
- Rows sharing an ID before the final letter are alternatives; approve no more than one option in that group.
- `FIX-PDF-003` was previously approved and `FIX-PDF-004` was previously deferred as combined actions; both require a branch decision.

| ID | Proposed fix | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `FIX-PDF-001` | Remove the Demo States control. | Simplifies the page and requires real request state to drive all feedback. | [x] | [ ] | [ ] |
| `FIX-PDF-002` | Use one reset function that clears file, filename, message, error, pending, and progress state. | Makes retry reliable but requires direct control of the native file input. | [ ] | [x] | [ ] |
| `FIX-PDF-003A` | Navigate directly to `/app/imports/jobs/:importID` after a successful upload. | Minimizes steps but omits a separate success screen. | [x] | [ ] | [ ] |
| `FIX-PDF-003B` | Show a success screen with a `View Job Results` link to the created job. | Confirms completion but adds an extra user action before viewing the job. | [ ] | [x] | [ ] |
| `FIX-PDF-004A` | Submit extraction settings and honor them server-side. | Expands the API and worker contract while retaining user configuration. | [ ] | [x] | [ ] |
| `FIX-PDF-004B` | Remove extraction-setting controls until the backend supports them. | Reduces configuration but prevents misleading controls. | [x] | [ ] | [ ] |

## Completion Scope

- Completion date: `2026-08-10`
- Status: `implemented_awaiting_bulk_review`

### Completed

| Change | Record |
|---|---|
| Production states | Removed Demo States and now derive empty, selected, validating, uploading, failure, and handoff behavior from the real file and request state. |
| File validation | Added client and server checks for PDF type and the 50MB size limit with field-adjacent feedback. |
| Extraction controls | Removed the inert extraction-setting checkboxes under approved `FIX-PDF-004B`. |
| Job handoff | Preserved direct navigation to the created job under `FIX-PDF-003A`. |
| Vendor context | Supports a validated vendor ID supplied by Vendor Details. |
| Shared changes | Linked Workspace and Imports breadcrumbs and retained the shared sidebar. |

### Deferred

- `FIX-PDF-002`: a single explicit reset function and reset-button family remain deferred; native file replacement remains available.
- `FIX-PDF-003B`: a separate success screen remains deferred.
- `FIX-PDF-004A`: configurable server-side extraction settings remain deferred.

### Discarded

- None selected.

### Page Effects

| Pros | Cons or effects |
|---|---|
| Users see only states caused by their actual upload. | There is no standalone success screen before Job Details. |
| Misleading settings and generic job-result links are gone. | Extraction behavior is fixed until the worker/API settings contract is implemented. |

### Suggestions

- Add upload progress from the storage layer instead of the current indeterminate busy treatment.
- Add password-protected/corrupt-PDF error mapping when the extraction worker exposes those codes.

### Verification Record

- Focused page-plan test passed; TypeScript check and production build passed.
- Migrated local runtime check passed with HTTP `200` on `/app/imports/pdf`; interactive browser/visual QA remains pending because no browser backend was connected.
