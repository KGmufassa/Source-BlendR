# AI Provider Settings Page Change Plan

## Route

- `/app/settings/ai`

## Revision Date

- `2026-08-12`

## Page Goal

- Manage configured AI providers and route application capabilities through active provider choices.

## Page Edits

| ID | Approved change | Ramification | Approve | Defer | Discard |
|---|---|---|---|---|---|
| `CHANGE-AI-001` | Remove the header-level `Add provider` button. | Eliminates the current entry point and makes the new inline Add Provider section the only creation path. | [x] | [ ] | [ ] |
| `CHANGE-AI-002` | Add a persistent `Add Provider` section below Provider Credentials; successful providers populate Active AI Providers. | Clarifies creation flow but requires validation, secure credential storage, duplicate handling, and refresh behavior. | [x] | [ ] | [ ] |
| `CHANGE-AI-003` | Remove Health Endpoint from Provider Credentials. | Simplifies provider configuration and requires health checks to use provider defaults or another server-defined endpoint policy. | [x] | [ ] | [ ] |
| `CHANGE-AI-004` | Change Provider from a fixed select into a typed entry field. | Supports providers outside the hard-coded list but requires normalization, supported-capability rules, and duplicate-name handling. | [x] | [ ] | [ ] |
| `CHANGE-AI-005` | Populate Capability Routing dropdown choices from Active AI Providers. | Prevents routing to inactive/unconfigured providers but requires live synchronization after provider changes. | [x] | [ ] | [ ] |

## Provider Management Contract

- Active AI Providers remains the authoritative list of configured providers and their enabled/health state.
- Provider Credentials contains credentials for the provider being added or edited and no longer exposes a Health Endpoint input.
- The new Add Provider section appears immediately below Provider Credentials and contains the explicit submit action for creating the typed provider.
- A successful addition updates Active AI Providers only after server confirmation; failure keeps entered values available for correction.
- Provider names are trimmed and normalized for duplicate detection while preserving an appropriate display label.
- Full credentials remain write-only after save; Active AI Providers may show only a masked API preview.
- Removing Health Endpoint must not weaken server-side outbound-request protections; health behavior uses a server-controlled provider adapter or predefined endpoint.

## Capability Routing Contract

- Every Model Selection dropdown is derived from currently active, configured providers rather than prototype provider/model values.
- Disabling or removing a provider immediately makes it unavailable for new routing selections.
- An existing route that loses its provider enters a clear unassigned/manual-fallback state and cannot silently select another provider.
- Save Routing validates provider activity and workspace ownership on the server.
- Empty Active AI Providers produces a clear manual-fallback state rather than a dead dropdown.

## Open Decision Selection

| Decision group | Option | Clear action | Ramification of approval | Approve | Defer | Discard |
|---|---|---|---|---|---|---|
| `DEC-AI-001` | A | Treat each Model Selection option as an active provider and display the provider name. | Matches the requested source directly but does not distinguish multiple models offered by one provider. | [x] | [ ] | [ ] |
| `DEC-AI-001` | B | Group provider-supported model identifiers beneath each active provider. | Provides true model selection but requires provider model-discovery or stored model metadata. | [ ] | [x] | [ ] |
| `DEC-AI-002` | A | Accept only provider identifiers supported by registered server adapters. | Preserves reliable health and routing behavior but limits arbitrary provider names. | [ ] | [ ] | [x] |
| `DEC-AI-002` | B | Accept custom provider identifiers and store them as workspace providers without browser-managed health endpoints. | Supports custom provider names but health behavior remains limited to server-controlled defaults until endpoint administration exists. | [x] | [ ] | [ ] |

## Conflict and Dependency Notes

- A custom Provider field conflicts with browser-managed Health Endpoint removal unless health behavior stays server-controlled. `DEC-AI-002B` defines the current contract.
- `Model Selection` currently implies model identifiers, while the requested choices are active providers. `DEC-AI-001` must define whether the control is actually selecting providers or provider/model pairs.
- The new Add Provider placement assumes Provider Credentials is always rendered as a stable section rather than appearing only after a header action.

## Acceptance Criteria

- No header-level Add provider button appears.
- A visible Add Provider section exists below Provider Credentials and creates a provider through the secure API.
- Provider is a typed field and Health Endpoint is absent.
- Newly saved providers appear in Active AI Providers with only a masked API preview.
- Active AI Providers includes an API preview column, Edit action for every provider, and activation toggle for every provider.
- Save Routing only persists Capability Routing selections and does not activate, deactivate, create, or edit providers.
- Capability Routing shows only eligible active-provider choices according to `DEC-AI-001`.
- Loading, validation, duplicate, authentication, permission, provider-unavailable, and save-failure states are accessible and actionable.

## Possible Effects

| Pros | Cons or possible effects |
|---|---|
| Inline provider creation creates a clearer and more discoverable setup flow. | Custom provider identifiers can create configurations whose health checks are limited until server adapters or endpoint administration are added. |
| Routing choices stay aligned with configured active providers. | Removing endpoint configuration reduces flexibility for self-hosted or custom-compatible providers. |

## Suggestions

- Use a typed combobox that permits searching registered adapters while clearly distinguishing supported providers from unknown text.
- Display provider and model as separate fields if multiple models per provider are expected.
- Add provider deletion decisions before exposing destructive provider removal.

## Implementation Status

- Completion date: `2026-08-17`
- Status: `approved`
- Approval date: `2026-08-20`

## Completion Scope

| Change | Completion record |
|---|---|
| Header action | Removed the header-level `Add provider` button. |
| Provider Credentials | Made Provider Credentials a stable always-visible section and removed the Health Endpoint field. |
| Typed provider | Changed Provider from a fixed select into a typed input with provider datalist suggestions while allowing custom identifiers. |
| Add Provider section | Added a dedicated `Add Provider` section immediately below Provider Credentials with the only provider creation submit action. |
| Credential safety | Saved provider credentials remain write-only; Active AI Providers receives server-confirmed provider metadata and a masked API preview only. |
| Active providers | Removed prototype fallback providers so Active AI Providers reflects configured workspace providers only. |
| Capability routing | Model Selection dropdowns now derive from active configured providers, with Manual fallback available when no active provider is selected. |
| Dead footer cleanup | Removed inert Documentation and Support footer buttons from the prototype page. |
| Custom providers | Expanded provider validation so typed custom AI provider identifiers can be saved as workspace providers. |
| API preview | Added an API column to Active AI Providers that shows only a masked credential preview. |
| Provider editing | Added Edit controls for every active-provider row so the selected provider API key can be replaced. |
| Provider activation | Added a per-provider active/deactivated toggle that updates provider availability independently from routing. |
| Routing persistence | Added persisted capability-route records so Save Routing only saves Capability Routing selections. |

## Deferred Scope

- Full model discovery per provider remains deferred under `DEC-AI-001B`; current dropdowns select active providers by name.
- Custom base URL configuration remains deferred until there is a server-managed endpoint administration contract.
- Provider deletion remains deferred pending an explicit destructive-action decision.
- Interactive browser validation remains pending because no connected browser backend is available.

## Discarded Scope

- Discarded the header Add provider entry point in favor of the inline Add Provider section.
- Discarded the Health Endpoint field from browser-managed credentials.
- Discarded prototype provider/model options such as GPT-4o and Claude defaults from Capability Routing.

## Conflict Resolution Record

- The requested typed Provider field now accepts custom provider identifiers, while Health Endpoint remains removed so endpoint behavior stays server-controlled.
- Model Selection now selects active providers, not individual model identifiers, per `DEC-AI-001A`.
- Health behavior remains server-controlled; the browser no longer submits health endpoints.
- Save Routing is separated from provider activation and credential editing through persisted route records.

## Page Effects

| Pros | Cons or resulting effects |
|---|---|
| Provider setup is visible without opening a header action. | Custom provider names can be saved before full provider-specific health support exists. |
| Routing choices stay aligned with configured active providers. | Users cannot select specific model IDs yet. |
| Removing Health Endpoint reduces browser-exposed endpoint risk. | Self-hosted/custom endpoint configuration requires a future server-managed settings contract. |
| Removing prototype providers prevents routing to fake options. | Empty workspaces show manual fallback until a provider is added. |
| Save Routing no longer changes provider activation state. | Capability routes now depend on the new `AIProviderRoute` persistence table. |

## Suggestions

- Add an explicit provider support message near the typed field for custom providers whose health checks use generic behavior.
- Add a provider delete decision before exposing destructive provider removal.
- Add model discovery or stored model metadata before changing the dropdown label back to true model selection.

## Verification Record

- Focused implementation tests cover the removed header action, typed Provider input, removed Health Endpoint, Add Provider section, active-provider routing, manual fallback, and custom-provider API validation.
- TypeScript validation, focused app/API ESLint validation, and whitespace checks pass.
- The live `/app/settings/ai` route returned HTTP `200`.
- The live route rendered Active AI Providers, Provider Credentials, Add Provider, and Manual fallback.
- The live route did not render the old lowercase header `Add provider` button, Health Endpoint field, or prototype GPT/Claude model defaults.
- Runtime provider creation was not performed to avoid changing credentials before review approval.
- Applied migration `20260817000100_ai_provider_routes` to persist Capability Routing independently from provider activation.
- Prisma client generation passed after adding `AIProviderRoute`.
- Focused implementation tests pass from `apps/web/page-plan-implementation.test.mjs`.
- The live provider API returned providers with `apiPreview` metadata and a routes object.
- Runtime provider creation, toggle mutation, and routing mutation were not performed to avoid changing credentials or workspace routing before review approval.

## Post-Review Correction — 2026-08-17

| Issue | Correction |
|---|---|
| Active AI Provider `Edit` did not explicitly track which provider API key was being replaced. | Added selected-provider edit state, changed the Add Provider section into Update Provider while editing, and kept credentials write-only. |
| Model Selection could still preserve an inactive selected provider as an option. | Changed Model Selection options to derive only from active configured providers plus Manual fallback. |
| Save Routing needed clearer synchronization after the server update. | Save Routing now resets the selected provider from the server-confirmed enabled provider response. |
| Provider entry needed to remain a user entry line while still offering common choices. | Kept the Provider field as a typed input with provider datalist suggestions. |
| Save Routing was still coupled to the provider `enabled` state. | Added persisted capability route records so Save Routing only saves Capability Routing selections. |
| Custom AI providers needed to be accepted from the Provider entry line. | Expanded provider validation to accept custom provider identifiers and add them to Active AI Providers after server confirmation. |
| Active AI Providers needed a visible API column and activation control. | Added a masked API preview column and a per-provider active/deactivated toggle. |

### Correction Verification Record

- Focused implementation tests cover selected-provider edit state, Update Provider actions, active-provider-only routing options, and server-synchronized Save Routing state.
- Focused implementation tests cover custom provider validation, masked API previews, activation toggles, and the new `AIProviderRoute` persistence model.

## Post-Review Correction — 2026-08-18

| Issue | Correction |
|---|---|
| Provider Credentials still appeared as a general add/edit form. | Made Provider Credentials conditional so it opens only after an Active AI Providers row-level `Edit` button is clicked. |
| Provider creation and credential editing were combined in one section. | Added a separate `New AI Provider` section above Capability Routing for adding typed providers. |
| Provider Credentials still exposed a `New provider` option while editing. | Removed the `New provider` button and kept Provider Credentials focused on updating the selected provider API key. |
| Active-provider status appeared below the provider name. | Moved the status indicator before the provider name and reduced its visual weight. |
| Missing/decryption-failed API previews displayed `Unavailable`. | Replaced the fallback with masked API-style text so the API column keeps the hidden-value format. |

### Correction Completion Scope

| Change | Completion record |
|---|---|
| Collapsible credentials | Provider Credentials is not rendered until a provider row is selected for editing. |
| Row edit behavior | Each provider row retains its own `Edit` button, and clicking it populates Provider Credentials with that provider name and masked API placeholder. |
| New provider creation | `New AI Provider` now has its own provider-name and API-key inputs and adds successful entries to Active AI Providers. |
| Credential edit cleanup | Removed the `New provider` button from Provider Credentials. |
| API preview fallback | Replaced `Unavailable` API preview fallback with `•••• ••••`. |

### Correction Page Effects

| Pros | Cons or resulting effects |
|---|---|
| Provider creation and credential replacement now have separate, clearer flows. | Users must click a row-level Edit button before seeing credential replacement fields. |
| The API column always preserves the hidden-secret visual pattern. | A masked fallback cannot distinguish missing credentials from decrypt-unavailable credentials without extra messaging. |

### Correction Verification Record

- TypeScript validation, focused app/API ESLint validation, focused page-plan tests, and whitespace checks pass.
- The live `/app/settings/ai` route returned HTTP `200`.
- The live provider API returned masked API preview text and routes metadata.
- Runtime provider creation, credential replacement, toggle mutation, and routing mutation were not performed to avoid changing workspace credentials or routing before review approval.

## Runtime Button Fix — 2026-08-18

| Broken control | Root cause | Fix or verification |
|---|---|---|
| `Add Provider` | Local dev server was missing `CREDENTIAL_ENCRYPTION_KEY`, causing provider credential encryption to return HTTP `500`. | Restarted localhost with a local 32-byte hex credential key and added ignored `.env.local` values for future dev restarts. |
| `Update Provider` | Uses the same provider credential POST path as Add Provider, so it failed for the same encryption-key reason. | Verified the POST path can update an existing provider credential after the key is present. |
| `Save routing` | API route was functional; prior failures were not caused by the routing handler. | Verified routing PATCH returns HTTP `200` and persists capability-route selections independently from provider activation. |
| `Run health check` | API route was functional; health results can still show manual fallback when no enabled provider is healthy. | Verified health GET returns HTTP `200` with route/provider health metadata. |

### Runtime Fix Verification Record

- Restarted local dev server with `CREDENTIAL_ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000001`.
- Added local ignored `.env.local` with `DATABASE_URL`, `SOURCE_BLENDR_DEV_AUTH`, and `CREDENTIAL_ENCRYPTION_KEY` so local restarts retain the required configuration.
- Verified temporary provider creation returned HTTP `201`.
- Verified temporary provider credential update returned success.
- Verified routing PATCH to the temporary provider returned HTTP `200`.
- Verified health check returned HTTP `200` and selected the temporary enabled provider.
- Removed the temporary `codex-button-test` provider and restored routing to manual fallback after verification.

## Section Isolation Correction — 2026-08-18

| Requested change | Completion record |
|---|---|
| Smaller Active control | Reduced each provider activation checkbox from 18px to 14px. |
| Remove `Provider API Active Action` text | Removed the Active AI Providers column-heading row while retaining accessible names on the provider list, masked API value, checkbox, and buttons. |
| Update Provider isolation | Added a dedicated `provider-credential` PATCH action. Update Provider changes only the selected provider credential and Active AI Providers state. |
| Add Provider isolation | Add Provider now creates a distinct provider. A duplicate name returns guidance to use that provider's Edit button instead of silently replacing its credential. |
| Save Routing isolation | Save Routing persists and refreshes only Capability Routing selections; it no longer refreshes or changes Active AI Providers state. |
| Independent progress states | Add Provider, Update Provider, Save Routing, health check, and provider activation use separate pending indicators so one section no longer disables or relabels another section's controls. |

### Section Isolation Effects

| Pros | Cons or resulting effects |
|---|---|
| Each action has a single, predictable data scope and section-specific progress feedback. | Adding an already configured provider now requires returning to its row and using Edit. |
| Removing the heading row makes the provider list more compact. | Column meaning is conveyed by content and accessible labels instead of persistent visible headings. |

### Section Isolation Verification

- Focused tests assert the separate provider-credential and routing actions, independent state updates, and removal of the visible provider-list heading row.
- TypeScript, focused ESLint, focused page-plan tests, live route validation, and whitespace validation pass.

## Provider and Routing Stability Correction — 2026-08-18

| Requested change | Completion record |
|---|---|
| Smaller static activation control | Replaced the changing checkbox-and-text treatment with a fixed 28px-by-16px compact switch. Its footprint and position do not change between active and inactive states. |
| Multiple providers | Kept New AI Provider available after every successful addition, resets the form after save, and permits any number of uniquely named provider records. |
| Stable routing columns | Added fixed Capability Routing column widths and fixed table layout so selecting providers with different name lengths does not move columns. |
| Dynamic Save Routing | Added saved-route comparison. The button is grey, disabled, and reads `Routing saved` until a routing selection changes; it becomes active as `Save routing` only while unsaved changes exist. |

### Stability Effects

| Pros | Cons or resulting effects |
|---|---|
| Provider activation and routing columns no longer shift as values change. | Long provider names may truncate or wrap within the fixed-width cells instead of expanding a column. |
| Save Routing clearly communicates whether routing has unsaved changes. | Users cannot submit an identical routing configuration, because there is nothing new to persist. |

### Stability Verification

- TypeScript, focused ESLint, focused page-plan tests, and whitespace validation pass.
- Tests cover the compact switch markup, unlimited-provider guidance, fixed routing columns, saved-route comparison, and dynamic Save Routing state.

## Provider Creation Validation Correction — 2026-08-18

| Reported issue | Correction |
|---|---|
| Active control still looked like a switch. | Replaced the switch treatment with a fixed 13px native checkbox inside a 14px layout footprint. |
| User-entered provider names returned `The request was invalid.` | Expanded provider-name validation to accept natural names with spaces, Unicode letters and numbers, and common name punctuation. Repeated whitespace is normalized before duplicate checking. |
| Validation feedback was too generic. | The provider form now displays the provider or credential field error returned by the API before falling back to the generic request message. |

### Validation Correction Effects

| Pros | Cons or resulting effects |
|---|---|
| Names such as `Google Gemini` and `Azure OpenAI` can be added directly. | Provider names remain limited to 80 characters and exclude control or unusual symbol characters. |
| The Active control matches the requested checkbox format and remains positionally stable. | The smaller checkbox has less visual prominence than the prior switch. |

### Validation Correction Verification

- TypeScript, focused ESLint, focused page-plan tests, and whitespace validation pass.
- A live POST using the spaced name `Codex Validation Provider` returned HTTP `201` and a masked API preview.
- Removed the temporary validation provider immediately after the live test; no test provider remains in workspace data.

## Provider Table and Drawer Correction — 2026-08-19

| Requested change | Completion record |
|---|---|
| AI Provider column titles | Restored separate `Provider`, `API`, `Active`, and `Action` headings aligned to the provider-row grid. |
| Collapse after Update Provider | A successful credential update now explicitly clears the selected provider and resets the form, collapsing Provider Credentials. Failed updates keep the section open so the entered value can be corrected. |

### Correction Effects

| Pros | Cons or resulting effects |
|---|---|
| Column purpose is visible without inferring it from row content. | The heading row adds a small amount of vertical height to Active AI Providers. |
| Successful updates return users directly to the provider list. | Users must select Edit again to make another credential change. |

### Correction Verification

- TypeScript, focused ESLint, focused page-plan tests, and whitespace validation pass.
- Focused tests cover the restored heading row and successful-update collapse behavior.

## Provider Form Runtime and Layout Correction — 2026-08-19

| Reported issue or request | Completion record |
|---|---|
| `event.currentTarget.reset` runtime TypeError after Add Provider | Captured the form element before the asynchronous request and reset that stable reference after success. Applied the same safeguard to Update Provider. |
| Page format changed after refresh | Provider rows now use deterministic alphabetical ordering after add, edit, activation changes, and initial load. Removed the CSS order override so New AI Provider remains above Capability Routing in both server and client renders. |
| Active column placement | Moved `Active` before `Provider` in both the heading and every provider row, using the same fixed grid template. |
| Provider Credentials Cancel action | Added Cancel beside Update Provider. It closes Provider Credentials without submitting or changing the stored credential. |

### Runtime and Layout Effects

| Pros | Cons or resulting effects |
|---|---|
| Provider creation no longer dereferences a cleared React event after the request completes. | None expected; the retained reference exists only for the lifetime of the submit handler. |
| Provider order and section placement remain stable across refreshes. | Newly added providers appear alphabetically instead of always appearing first. |
| Cancel provides an explicit non-saving exit from credential editing. | Any unsaved API-key entry is discarded when Cancel is selected. |

### Runtime and Layout Verification

- TypeScript, focused ESLint, focused page-plan tests, live route validation, and whitespace validation pass.
- Focused tests reject direct asynchronous `event.currentTarget.reset` usage and cover stable form references, deterministic provider sorting, Active-first columns, and the Cancel control.

## Minimal LLM Connection Inputs — 2026-08-19

| Input | Completion record |
|---|---|
| Provider Name | Added a required user-entered display name. |
| Provider Type | Added required presets for OpenAI-compatible, Anthropic, Google Gemini, Ollama/local, Azure OpenAI, and Custom providers. |
| Base API URL | Added a required URL input. Known provider types supply a default; Azure and Custom remain user-defined. |
| Model ID | Added a required model or deployment identifier. |
| API Key | Added a hosted-provider requirement while keeping the key optional for Ollama/local connections. |

### Persistence and Editing Scope

- Provider type, base URL, model ID, API key, and supported capabilities are stored together inside the encrypted provider credential.
- API-key updates merge into the existing encrypted configuration so Provider Credentials does not erase the provider type, base URL, or model ID.
- Server validation enforces the minimal configuration even if the browser form is bypassed.
- Validation responses display the first relevant field error instead of a generic invalid-request message.

### Effects

| Pros | Cons or resulting effects |
|---|---|
| New provider records contain enough connection metadata for a future provider invocation adapter. | The current runtime still needs provider-specific request adapters before it can send inference requests to every listed provider type. |
| Known provider defaults reduce URL entry errors. | Provider endpoints can change and may eventually need managed preset versioning. |

### Verification

- TypeScript, focused ESLint, focused page-plan tests, and whitespace validation pass.
- A live provider POST containing all five minimal fields returned HTTP `201` with a masked API preview.
- Removed the temporary `Codex Minimal Input Test` provider immediately after verification.

## New Provider Field Layout — 2026-08-19

| Requested change | Completion record |
|---|---|
| Shorter Provider Type | Limited the Provider Type field to a responsive maximum width of 260px. |
| Provider Type placement | Moved Provider Type into its own first row above the remaining connection fields. |
| API Key placement | Positioned Provider Name and API Key side by side on the next row. Base API URL and Model ID remain paired below them. |

### Layout Effect and Verification

- The form now presents connection type before provider identity and credentials, improving the setup sequence.
- The compact first row introduces unused horizontal space by design rather than stretching a short-choice dropdown across the card.
- TypeScript, focused ESLint, focused page-plan tests, and whitespace validation pass.

## Capability Routing Header Cleanup — 2026-08-19

- Removed the `View audit log` text and its inactive button from the Capability Routing header.
- Capability Routing now exposes only controls that affect routing configuration.

## Provider Connection Status and Refresh Stability — 2026-08-19

| Requested change | Completion record |
|---|---|
| Action heading alignment | Added a fixed five-column provider grid and right-aligned the Action heading with the right-aligned row actions. |
| Status column | Added `Status` between API and Action. It displays only `Connected` or `Not connected` with a compact status dot. |
| Accurate connection meaning | `Connected` requires a successful live provider models request; a stored key or enabled checkbox alone is not treated as a working connection. |
| Refresh stability | Persisted the latest connection result and check timestamp, retained deterministic provider ordering, fixed all provider column widths, and verified identical visible server markup across consecutive refreshes. |

### Connection Check Scope

- OpenAI-compatible providers use the configured base URL's models endpoint with bearer authentication.
- Anthropic, Gemini, Ollama, and Azure OpenAI use provider-specific model-list endpoints and authentication headers.
- Local Ollama loopback checks remain allowed; hosted provider endpoints retain HTTPS and private-address protections.
- Credential changes and activation changes clear stale connection results until the next health check.

### Effects

| Pros | Cons or resulting effects |
|---|---|
| Users can distinguish configured providers from providers whose credentials and endpoint passed a live request. | Providers remain `Not connected` until Run Health Check succeeds. |
| Connection status and page geometry remain stable after refresh. | Persisting status adds two nullable fields to AI provider credentials. |

### Verification

- Added and applied migration `20260819000100_ai_provider_connection_status`.
- Prisma generation, TypeScript, focused ESLint, focused page-plan tests, runtime health tests, and whitespace validation pass.
- Runtime tests verify authenticated OpenAI-compatible checks and loopback Ollama checks against their model-list endpoints.
- The live page returned HTTP `200`, rendered the five-column heading, and produced identical visible server markup across consecutive refreshes.

## Visual Rollback — 2026-08-19

- Reverted the most recent five-column Active AI Providers presentation after review feedback that it changed the page visuals beyond the intended scope.
- Restored the prior four-column `Active`, `Provider`, `API`, and `Action` layout, original column sizing, and compact provider-status treatment beside the provider name.
- Removed the newly exposed connection-status column and its visual styles.
- Preserved earlier approved New AI Provider, credential editing, routing, checkbox, ordering, and refresh-stability work.
- Kept the already-applied nullable connection-status database fields to avoid a destructive rollback migration; they do not affect the restored UI.
- TypeScript, focused ESLint, focused page-plan tests, live route validation, and whitespace validation pass after rollback.

## Minimal Provider Table Status Revision — 2026-08-19

- Added a compact `Status` column directly after API without changing the provider card, row height, typography, provider identity treatment, checkbox, API preview, or Edit-button styling.
- Reused the persisted live connection result to display `Connected` or `Not connected`.
- Right-aligned the Action heading to the same grid edge used by the Edit-button container.
- Limited the layout change to narrower provider and action tracks needed to fit the additional 110px status track within the existing card.
- TypeScript, focused ESLint, focused page-plan tests, live route validation, and whitespace validation pass.
