# Skill — ux-interaction-synthesis

# Purpose

The `ux-interaction-synthesis` skill combines all Stage 4 UX and interaction intelligence into final outputs.

It produces:

* user journey architecture
* interaction architecture
* screen system
* feature behavior specifications
* state transition map
* accessibility framework
* UI blueprint specification
* design system foundation
* complete app blueprint markdown tree
* frontend build package
* handoff guidance for Stage 5

This skill is the final UX synthesis and handoff engine for Stage 4.

---

# Inputs

```json
{
  "user_journeys": {},
  "interaction_architecture": {},
  "screen_system": {},
  "feature_behaviors": {},
  "state_transition_map": {},
  "accessibility_framework": {},
  "ui_blueprints": {},
  "visual_spec_inventory": [],
  "design_system_foundation": {},
  "visual_reference_selection": {},
  "complete_app_blueprint_markdown_path": "",
  "frontend_build_package": {},
  "existing_state": {}
}
```

Read and update shared UX state from:

```text
Build-Plans/Build-status/UX-state.json
```

---

# Core Responsibilities

## UX Coherence

Validate:

* user journeys align with Stage 1 workflows
* interactions support user goals
* screens support journeys and feature behavior
* feature behavior aligns with API and permission constraints
* state transitions are complete
* accessibility requirements are represented
* UI blueprints cover launch-critical pages and screens
* selected page and screen types are justified by upstream product, workflow, role, feature, journey, or route evidence
* visual specs cover launch-critical pages and screens
* visual acceptance criteria and user approval status are present for launch-critical pages
* selected visual style references are recorded when visual references influenced the design system
* design system foundation exists and launch-critical visual specs align with it
* launch-critical UI blueprints reference the selected design system and selected visual style references, or record why no reference applies
* intentional deviations from selected visual references are documented
* complete app blueprint markdown exists and covers every launch-critical page
* complete app blueprint markdown maps every launch-critical page to a `ui_blueprint_id`
* complete app blueprint markdown includes page sections, components, actions, routes, states, data requirements, and frontend build package summary
* frontend build package can be consumed by Stage 5 without reinterpreting UI intent

## Tradeoff Documentation

Record:

* major UX decisions
* interaction tradeoffs
* accepted UX risks
* deferred UX concerns
* Stage 5 implementation implications

## Completion Determination

Determine whether Stage 4 is:

```text
ready_for_stage_5
needs_ux_revision
needs_stage_3_revision
blocked
```

Also determine whether `Build-Plans/Stage-4/00-stage-decision-brief.md` exists and `stage_decision_brief.approval_status` is `approved`.

Also determine whether `Build-Plans/Stage-4/09-complete-app-blueprint.md` exists and covers all launch-critical pages.

---

# Interactive Guidance Responsibilities

This skill should not finalize Stage 4 if interaction-blocking questions remain unresolved.

Before writing final outputs, inspect:

```text
interactive_guidance.open_questions
interactive_guidance.blocked_decisions
interactive_guidance.ux_confidence_gaps
ux_risks
open_questions
interaction_tradeoffs
```

Classify unresolved guidance items as:

```text
safe_to_assume
needs_user_confirmation
blocks_stage_4_completion
```

Ask the minimum number of final questions needed to complete Stage 4.

Do not ask broad aesthetic preference questions at this stage. Only ask questions tied directly to:

* missing final UX output fields
* unresolved journey decisions
* unresolved screen system decisions
* unresolved feature behavior decisions
* unresolved UI blueprint decisions
* unresolved visual spec decisions
* unresolved visual reference decisions
* unresolved design system decisions
* unresolved accessibility decisions
* UX risks that block Stage 5 handoff
* unapproved Stage 4 recommended UX/UI decision brief

If proceeding with assumptions, record them in:

```text
interactive_guidance.assumptions_made
```

If Stage 4 cannot complete, set `completion_status` to one of:

```text
needs_ux_revision
needs_stage_3_revision
blocked
```

and return the specific questions or decisions required.

---

# Outputs

```json
{
  "ux_outputs": {},
  "ux_decisions": [],
  "ux_risks": [],
  "interaction_tradeoffs": [],
  "ui_blueprints": {},
  "visual_spec_inventory": [],
  "visual_approval_status": {},
  "design_system_foundation": {},
  "visual_reference_selection": {},
  "complete_app_blueprint_markdown_path": "Build-Plans/Stage-4/09-complete-app-blueprint.md",
  "frontend_build_package": {},
  "stage_5_handoff": {},
  "completion_status": {}
}
```

---

# Final Stage 4 Outputs

Write or update:

```text
Build-Plans/Stage-4/01-user-journeys.json
Build-Plans/Stage-4/02-interaction-architecture.json
Build-Plans/Stage-4/03-screen-system.json
Build-Plans/Stage-4/04-feature-behaviors.json
Build-Plans/Stage-4/05-state-transition-map.json
Build-Plans/Stage-4/06-accessibility-framework.json
Build-Plans/Stage-4/07-ui-blueprint-specification.json
Build-Plans/Stage-4/08-design-system-foundation.json
Build-Plans/Stage-4/09-complete-app-blueprint.md
```

Each output must include:

* related Stage 1 workflows or features
* related Stage 3 architecture constraints where applicable
* UX decisions
* risks and constraints
* unresolved questions
* Stage 5 handoff notes when relevant

---

# Shared State Updates

Update:

```text
ux_decisions
ux_risks
interaction_tradeoffs
visual_spec_inventory
design_system_foundation
visual_reference_selection
complete_app_blueprint_markdown_path
stage_5_handoff
completion_status
interactive_guidance
```

Persist updates to:

```text
Build-Plans/Build-status/UX-state.json
```

---

# Completion Gate

Stage 4 may complete only when:

* all nine UX, UI blueprint, design system, and complete app blueprint outputs exist
* primary user journeys are defined
* interaction architecture supports MVP workflows
* screen system supports all launch-critical journeys
* feature behaviors are specified
* state transitions are mapped
* accessibility framework exists
* UI blueprints exist for all launch-critical pages and screens
* each selected page or screen type includes `page_type_selection_rationale`
* visual specs exist for all launch-critical pages and screens
* launch-critical visual specs include visual acceptance criteria and user approval status
* design system foundation exists and launch-critical visual specs align with it
* selected visual style references are recorded in the design system foundation when used
* launch-critical visual specs reference selected visual style references or explicitly record why no visual reference applies
* launch-critical visual specs document intentional deviations from selected references
* complete app blueprint markdown exists at `Build-Plans/Stage-4/09-complete-app-blueprint.md`
* complete app blueprint markdown includes every launch-critical page and maps each page to a `ui_blueprint_id`
* complete app blueprint markdown includes page sections, components, actions, routes, states, data requirements, and frontend build package summary
* frontend build package includes page, component, shared component, route, state, action, and frontend task inventories
* high and critical UX risks have mitigation paths
* critical interactive guidance questions are answered or converted into recorded assumptions
* no interaction-blocking Stage 3 unknowns remain unresolved
* Stage 4 decision brief exists and is approved

---

# Validation Checklist

Before completing Stage 4, confirm:

* Stage 4 did not redefine product strategy
* Stage 4 did not redesign backend architecture
* Stage 4 did not write implementation tickets
* Stage 4 did not generate frontend code
* every MVP workflow has a user journey
* every launch-critical feature has behavior rules
* every required screen maps to a journey or feature
* every launch-critical page has a UI blueprint
* every launch-critical page appears in `09-complete-app-blueprint.md`
* every selected page type has an inclusion rationale tied to upstream product, workflow, role, feature, journey, or route evidence
* every launch-critical page has a visual spec
* every launch-critical visual spec includes visual acceptance criteria and user approval status
* design system foundation exists for launch-critical frontend work
* visual reference selections are traceable into design system rules, UI blueprint visual specs, and Stage 5 handoff
* every UI blueprint enumerates every interactive element per component per section
* every interactive element with navigate behavior has a route_target in route_inventory
* action_inventory covers all launch-critical pages
* route_inventory covers all navigation and action targets
* navigation items have structured route_target entries that resolve
* UI blueprints are usable by Stage 5 development orchestration
* complete app blueprint markdown is usable by Stage 5 without reinterpreting page, component, route, action, state, or data requirements
* every core workflow has states and recovery behavior
* accessibility risks are recorded
* critical interactive guidance questions are answered or converted into recorded assumptions
* Stage 5 handoff is usable for development orchestration
* Stage 4 decision brief approval is recorded before Stage 5 handoff is used

Before using `ready_for_stage_5`, this skill must generate or verify:

```text
Build-Plans/Stage-4/00-stage-decision-brief.md
```

If the decision brief is not approved, return the recommended UX/UI direction for user review instead of locking Stage 4.

Before using `ready_for_stage_5`, this skill must also generate or verify:

```text
Build-Plans/Stage-4/09-complete-app-blueprint.md
```

If the complete app blueprint is missing, incomplete, or does not map launch-critical pages to `ui_blueprint_id` values, return the blueprint gaps for revision before locking Stage 4.
