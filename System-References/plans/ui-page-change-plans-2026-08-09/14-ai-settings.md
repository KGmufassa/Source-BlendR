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
- Credentials remain write-only after save and must never be returned to the browser or displayed in Active AI Providers.
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
| `DEC-AI-001` | A | Treat each Model Selection option as an active provider and display the provider name. | Matches the requested source directly but does not distinguish multiple models offered by one provider. | [ ] | [ ] | [ ] |
| `DEC-AI-001` | B | Group provider-supported model identifiers beneath each active provider. | Provides true model selection but requires provider model-discovery or stored model metadata. | [ ] | [ ] | [ ] |
| `DEC-AI-002` | A | Accept only provider identifiers supported by registered server adapters. | Preserves reliable health and routing behavior but limits arbitrary provider names. | [ ] | [ ] | [ ] |
| `DEC-AI-002` | B | Accept any OpenAI-compatible provider name and require a server-managed base URL configuration elsewhere. | Supports custom providers but needs a safe endpoint administration contract not present in this page. | [ ] | [ ] | [ ] |

## Conflict and Dependency Notes

- A completely free-form Provider field conflicts with the removal of Health Endpoint unless the server already knows how to contact the typed provider. `DEC-AI-002` must define that contract.
- `Model Selection` currently implies model identifiers, while the requested choices are active providers. `DEC-AI-001` must define whether the control is actually selecting providers or provider/model pairs.
- The new Add Provider placement assumes Provider Credentials is always rendered as a stable section rather than appearing only after a header action.

## Acceptance Criteria

- No header-level Add provider button appears.
- A visible Add Provider section exists below Provider Credentials and creates a provider through the secure API.
- Provider is a typed field and Health Endpoint is absent.
- Newly saved providers appear in Active AI Providers without exposing credentials.
- Capability Routing shows only eligible active-provider choices according to `DEC-AI-001`.
- Loading, validation, duplicate, authentication, permission, provider-unavailable, and save-failure states are accessible and actionable.

## Possible Effects

| Pros | Cons or possible effects |
|---|---|
| Inline provider creation creates a clearer and more discoverable setup flow. | Free-form provider identifiers can create unsupported configurations without a strict adapter contract. |
| Routing choices stay aligned with configured active providers. | Removing endpoint configuration reduces flexibility for self-hosted or custom-compatible providers. |

## Suggestions

- Use a typed combobox that permits searching registered adapters while clearly distinguishing supported providers from unknown text.
- Display provider and model as separate fields if multiple models per provider are expected.
- Add provider deactivation and deletion decisions before exposing those controls.

## Implementation Status

- Status: `planned_not_implemented`
- Blocked decisions: `DEC-AI-001` and `DEC-AI-002`.
- No code changes were made for this plan.
