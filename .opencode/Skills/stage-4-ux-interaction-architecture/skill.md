# Command — stage-4-ux-interaction-architecture

# Purpose

The `stage-4-ux-interaction-architecture` command orchestrates Stage 4.

It transforms:

* Stage 1 product workflows
* Stage 2 validation findings
* Stage 3 architecture outputs
* user profiles
* capabilities and feature structures
* MVP boundaries

into:

* user journey architecture
* interaction architecture
* screen system architecture
* feature behavior specifications
* state transition map
* accessibility framework
* implementation-ready UI blueprints
* frontend build package

This is the Stage 4 command skill. It is not a single UX subskill.

---

# Cognitive Boundary

Stage 4 asks:

```text
How should users move through and interact with the validated product?
```

Stage 4 must not:

* redefine the product concept
* perform market validation
* redesign backend system architecture
* write implementation tickets
* produce final UI art direction as decoration
* generate frontend code
* plan engineering sprints

Stage 4 may recommend product or architecture revisions only when interaction design exposes a blocking contradiction.

---

# Output Directory

All final Stage 4 outputs must be recorded in:

```text
Build-Plans/Stage-4/
```

The command must create this folder if it does not exist.

---

# Shared UX State

The command maintains a shared Stage 4 UX state object.

The shared UX state must be written to:

```text
Build-Plans/Build-status/UX-state.json
```

The command must load this file at the beginning of Stage 4, update it after each UX skill runs, and preserve it as the durable interaction architecture state for the build.

```json
{
  "stage": "Stage 4",
  "command": "stage-4-ux-interaction-architecture",
  "status": "not_started",
  "stage_1_inputs": {},
  "stage_2_inputs": {},
  "stage_3_inputs": {},
  "preflight": {},
  "user_journeys": {},
  "interaction_architecture": {},
  "screen_system": {},
  "feature_behaviors": {},
  "state_transition_map": {},
  "accessibility_framework": {},
  "ui_blueprints": {},
  "visual_spec_inventory": [],
  "design_system_foundation": {},
  "frontend_build_package": {},
  "ux_decisions": [],
  "ux_risks": [],
  "interaction_tradeoffs": [],
  "open_questions": [],
  "interactive_guidance": {
    "open_questions": [],
    "answered_questions": [],
    "assumptions_made": [],
    "blocked_decisions": [],
    "user_confirmations": [],
    "ux_confidence_gaps": []
  },
  "stage_5_handoff": {},
  "completion_status": {}
}
```

Each subskill reads the current UX state and writes its updates back into the shared state before the next skill runs.

After each subskill completes, the command must persist the updated shared state to:

```text
Build-Plans/Build-status/UX-state.json
```

---

# Interactive Guidance Rules

The Stage 4 command should behave like a guided interaction design interview.

Use this decision rule:

```text
Ask only for UX decisions that materially affect user journeys, interaction behavior, screen structure, accessibility, or Stage 5 implementation planning.
Infer standard interaction defaults when risk is low and the product workflow supports the inference.
Record assumptions when proceeding without user confirmation.
Block only when a missing decision prevents coherent interaction architecture.
```

When asking the user questions:

* ask 1-3 questions at a time
* prioritize workflow-blocking or accessibility-critical questions first
* avoid asking questions already answered by Stage 1, Stage 2, or Stage 3 outputs
* explain what journey, screen, state, or behavior each question affects
* prefer concrete options over open-ended questions when the tradeoff is known
* update `interactive_guidance.open_questions`
* move answered questions into `interactive_guidance.answered_questions`
* record inferred defaults in `interactive_guidance.assumptions_made`
* record unresolved blockers in `interactive_guidance.blocked_decisions`

The command should continue automatically when a UX decision has a low-risk default.

The command should pause for user input when:

* primary user journey is unclear
* user role differences change screens or permissions
* a workflow has no clear start, success, or failure state
* feature behavior depends on an unresolved product decision
* accessibility requirements materially affect interaction design
* the screen system cannot support a core workflow
* a Stage 3 architecture constraint changes user interaction

The command should not ask the user to choose implementation details that belong to Stage 5 unless the decision changes Stage 4 interaction architecture.

---

# Stage 4 Input Contract

Load Stage 1 outputs from:

```text
Build-Plans/Stage-1/
```

Load Stage 2 outputs from:

```text
Build-Plans/Stage-2/
```

Load Stage 3 outputs from:

```text
Build-Plans/Stage-3/
```

Required Stage 1 files:

```text
02-user-system-map.json
03-workflow-architecture.json
04-product-capabilities.json
05-feature-structure.json
06-product-boundaries.json
08-mvp-operational-model.json
10-success-framework.json
```

Required Stage 2 files:

```text
01-market-analysis.json
05-risk-validation.json
06-strategic-positioning.json
```

Required Stage 3 files:

```text
01-system-topology.json
02-service-architecture.json
03-data-architecture.json
04-api-architecture.json
06-security-foundations.json
08-scalability-framework.json
```

Minimum viable input set:

```text
Stage 1:
02-user-system-map.json
03-workflow-architecture.json
05-feature-structure.json
08-mvp-operational-model.json

Stage 3:
01-system-topology.json
03-data-architecture.json
04-api-architecture.json
06-security-foundations.json
```

If the minimum viable input set is missing, stop and set:

```text
completion_status.status = "blocked"
completion_status.reason = "missing_ux_inputs"
```

If Stage 3 completion status is not `ready_for_stage_4`, continue only if unresolved issues are not interaction-blocking. Record all carry-forward risks in `ux_risks`.

---

# Preflight Validation

Before UX architecture design, validate:

* Stage 1 user and workflow outputs exist and are readable
* Stage 3 architecture outputs exist and are readable
* primary users are defined
* MVP workflows are defined
* feature structure is clear enough for behavior design
* security and permission constraints are available
* API and data constraints are available
* architecture risks do not block UX architecture

Record preflight results in:

```text
preflight
ux_risks
open_questions
interactive_guidance
completion_status
```

---

# Orchestrated Skills

Run Stage 4 skills in this order:

```text
1. user-journey-design
2. interaction-architecture-design
3. screen-system-design
4. feature-behavior-specification
5. state-transition-and-accessibility-design
6. ui-blueprint-specification
7. design-system-foundation
8. ux-interaction-synthesis
```

---

# Execution Sequence

## 1. Load Stage 1, Stage 2, And Stage 3 Outputs

Load Stage 1 outputs from `Build-Plans/Stage-1/`.

Load Stage 2 outputs from `Build-Plans/Stage-2/`.

Load Stage 3 outputs from `Build-Plans/Stage-3/`.

Normalize them into:

```text
stage_1_inputs
stage_2_inputs
stage_3_inputs
```

Do not modify earlier stage outputs during Stage 4.

---

## 2. Initialize Shared UX State

Create or load:

```text
Build-Plans/Build-status/UX-state.json
```

Initialize missing fields using the shared UX state schema.

---

## 3. Run `user-journey-design`

Required shared state updates:

```text
user_journeys
ux_decisions
ux_risks
open_questions
interactive_guidance
```

---

## 4. Run `interaction-architecture-design`

Required shared state updates:

```text
interaction_architecture
ux_decisions
ux_risks
interaction_tradeoffs
interactive_guidance
```

---

## 5. Run `screen-system-design`

Required shared state updates:

```text
screen_system
ux_decisions
ux_risks
open_questions
interactive_guidance
```

---

## 6. Run `feature-behavior-specification`

Required shared state updates:

```text
feature_behaviors
ux_decisions
ux_risks
interaction_tradeoffs
interactive_guidance
```

---

## 7. Run `state-transition-and-accessibility-design`

Required shared state updates:

```text
state_transition_map
accessibility_framework
ux_decisions
ux_risks
interactive_guidance
```

---

## 8. Run `ui-blueprint-specification`

Required shared state updates:

```text
ui_blueprints
visual_spec_inventory
frontend_build_package
stage_5_handoff
ux_confidence_gaps
interactive_guidance
```

---

## 9. Run `design-system-foundation`

Required shared state updates:

```text
design_system_foundation
visual_spec_inventory
stage_5_handoff
ux_confidence_gaps
interactive_guidance
```

---

## 10. Run `ux-interaction-synthesis`

Required shared state updates:

```text
ui_blueprints
visual_spec_inventory
design_system_foundation
frontend_build_package
ux_decisions
ux_risks
interaction_tradeoffs
stage_5_handoff
completion_status
interactive_guidance
```

---

# Final Stage 4 Outputs

Generate:

```text
Build-Plans/Stage-4/01-user-journeys.json
Build-Plans/Stage-4/02-interaction-architecture.json
Build-Plans/Stage-4/03-screen-system.json
Build-Plans/Stage-4/04-feature-behaviors.json
Build-Plans/Stage-4/05-state-transition-map.json
Build-Plans/Stage-4/06-accessibility-framework.json
Build-Plans/Stage-4/07-ui-blueprint-specification.json
Build-Plans/Stage-4/08-design-system-foundation.json
```

Each output must include:

* related Stage 1 workflows or features
* related Stage 3 architecture constraints where applicable
* UX decisions
* risks and constraints
* unresolved questions
* Stage 5 handoff notes when relevant

---

# Completion Gate

Before Stage 4 may use `ready_for_stage_5`, run `global-stage-readiness-audit`.

The audit must write:

```text
Build-Plans/Build-status/Stage-4-readiness-audit.json
```

The audit must pass according to:

```text
System-References/Docs/Global-Stage-Workflow-Contract.md
```

If the audit does not pass, do not use `ready_for_stage_5`.

Stage 4 may complete only when:

* all eight UX, UI blueprint, and design system outputs exist
* primary user journeys are defined
* interaction architecture supports MVP workflows
* screen system supports all launch-critical journeys
* feature behaviors are specified
* state transitions are mapped
* accessibility framework exists
* UI blueprints exist for all launch-critical pages and screens
* each launch-critical UI blueprint includes page purpose, primary user, screen type, layout type, sections, components, actions, data needs, states, validation, and navigation
* each launch-critical UI blueprint includes visual style, density, color direction, typography feel, component style, primary visual focus, responsive behavior, visual do and don't rules, visual acceptance criteria, and user approval status
* design system foundation exists and defines shared color, typography, spacing, radius, elevation, icon, component, and responsive rules
* launch-critical visual specs reference or align with the design system foundation
* launch-critical visual specs and design system approval statuses are approved or explicitly accepted as assumptions
* frontend build package includes page inventory, component inventory, shared components, routes, actions, states, frontend task hints, and recommended frontend skills
* high and critical UX risks have mitigation paths
* critical interactive guidance questions are answered or converted into recorded assumptions
* no interaction-blocking Stage 3 unknowns remain unresolved

Possible completion statuses:

```text
ready_for_stage_5
needs_ux_revision
needs_stage_3_revision
blocked
```

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
* every UI blueprint uses the page-definition matrix
* every launch-critical UI blueprint uses the visual spec matrix
* design system foundation exists for launch-critical frontend work
* component inventory, shared components, routes, states, and actions are defined
* every core workflow has states and recovery behavior
* accessibility risks are recorded
* critical interactive guidance questions are answered or converted into recorded assumptions
* Stage 5 handoff is usable for development orchestration

---

# A-Grade Workflow Compliance

Stage 4 must consume `stage_contract_profile` and `guidance_policy`.

Stage 4 must reference:

```text
System-References/Schemas/stage-4-output.schema.json
```

UI blueprints, visual specs, design system decisions, accessibility proof, and reference assets should be recorded or referenced in:

```text
Build-Plans/Build-status/Artifact-evidence-registry.json
```

Before using `ready_for_stage_5`, Stage 4 must provide `schema_validation`, `reference_integrity`, `risk_acceptance_ledger`, and `revision_loops` in the readiness audit or stage state.

Accepted high and critical UX, visual, accessibility, or design-system risks must be recorded in:

```text
Build-Plans/Build-status/Risk-acceptance-ledger.json
```

Failed readiness checks must become revision-loop actions with owning output, owning skill, required change, and next action.
