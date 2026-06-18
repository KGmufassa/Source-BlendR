# Command — stage-5-development-orchestration

# Purpose

The `stage-5-development-orchestration` command orchestrates Stage 5.

It transforms:

* Stage 1 product model
* Stage 2 validation outputs
* Stage 3 system architecture
* Stage 4 UX and interaction architecture
* known risks, dependencies, and constraints

into:

* development roadmap
* implementation sequence
* engineering dependency map
* testing strategy
* build tickets
* agent assignment plan
* parallel execution plan
* release plan

This is the Stage 5 command skill. It is not a single planning subskill.

---

# Cognitive Boundary

Stage 5 asks:

```text
How should engineering execution be sequenced, coordinated, tested, and released?
```

Stage 5 must not:

* redefine product strategy
* perform validation research
* redesign system architecture
* redesign UX flows
* write production code
* perform QA execution

Stage 5 may recommend earlier-stage revision only when execution planning exposes a blocking dependency, missing specification, or unresolved contradiction.

---

# Output Directory

All final Stage 5 outputs must be recorded in:

```text
Build-Plans/Stage-5/
```

The command must create this folder if it does not exist.

---

# Shared Development Orchestration State

The command maintains a shared Stage 5 development orchestration state object.

The shared orchestration state must be written to:

```text
Build-Plans/Build-status/Development-state.json
```

The command must load this file at the beginning of Stage 5, update it after each orchestration skill runs, and preserve it as the durable engineering planning state for the build.

```json
{
  "stage": "Stage 5",
  "command": "stage-5-development-orchestration",
  "status": "not_started",
  "stage_1_inputs": {},
  "stage_2_inputs": {},
  "stage_3_inputs": {},
  "stage_4_inputs": {},
  "preflight": {},
  "ui_blueprint_inputs": {},
  "visual_spec_inputs": {},
  "design_system_inputs": {},
  "frontend_build_package": {},
  "development_roadmap": {},
  "implementation_sequence": {},
  "engineering_dependencies": {},
  "testing_strategy": {},
  "build_tickets": {},
  "agent_assignment_plan": {},
  "parallel_execution_plan": {},
  "release_plan": {},
  "milestones": [],
  "workstreams": [],
  "execution_risks": [],
  "coordination_notes": [],
  "open_questions": [],
  "interactive_guidance": {
    "open_questions": [],
    "answered_questions": [],
    "assumptions_made": [],
    "blocked_decisions": [],
    "user_confirmations": [],
    "execution_confidence_gaps": []
  },
  "stage_6_handoff": {},
  "completion_status": {}
}
```

Each subskill reads the current development state and writes its updates back into the shared state before the next skill runs.

After each subskill completes, the command must persist the updated shared state to:

```text
Build-Plans/Build-status/Development-state.json
```

---

# Interactive Guidance Rules

The Stage 5 command should behave like a guided engineering execution planning interview.

Use this decision rule:

```text
Ask only for execution decisions that materially affect implementation order, dependency sequencing, testing scope, release readiness, or Stage 6 execution.
Infer standard engineering defaults when risk is low and earlier-stage outputs support the inference.
Record assumptions when proceeding without user confirmation.
Block only when a missing decision prevents coherent engineering orchestration.
```

When asking the user questions:

* ask 1-3 questions at a time
* prioritize implementation-blocking dependencies first
* avoid asking questions already answered by Stages 1-4
* explain what roadmap, sequence, dependency, test, or release decision each question affects
* prefer concrete options over open-ended questions when the tradeoff is known
* update `interactive_guidance.open_questions`
* move answered questions into `interactive_guidance.answered_questions`
* record inferred defaults in `interactive_guidance.assumptions_made`
* record unresolved blockers in `interactive_guidance.blocked_decisions`

The command should continue automatically when an engineering planning decision has a low-risk default.

The command should pause for user input when:

* MVP launch scope is still ambiguous
* implementation order depends on an unresolved product or architecture decision
* dependency sequencing changes engineering feasibility
* testing scope materially changes release confidence
* release strategy affects what must be built first
* manual workaround tolerance is unknown
* Stage 6 cannot begin without a missing execution decision

The command should not ask the user to choose low-level implementation details that belong to Stage 6 unless the choice changes Stage 5 sequencing, testing, or release planning.

---

# Stage 5 Input Contract

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

Load Stage 4 outputs from:

```text
Build-Plans/Stage-4/
```

Minimum viable input set:

```text
Stage 1:
05-feature-structure.json
08-mvp-operational-model.json
09-risk-and-constraints.json

Stage 3:
02-service-architecture.json
03-data-architecture.json
04-api-architecture.json
07-infrastructure-model.json

Stage 4:
03-screen-system.json
04-feature-behaviors.json
05-state-transition-map.json
07-ui-blueprint-specification.json
08-design-system-foundation.json
```

If the minimum viable input set is missing, stop and set:

```text
completion_status.status = "blocked"
completion_status.reason = "missing_development_orchestration_inputs"
```

If Stage 4 completion status is not `ready_for_stage_5`, continue only if unresolved issues are not execution-blocking. Record all carry-forward risks in `execution_risks`.

---

# Preflight Validation

Before development orchestration, validate:

* Stage 1 MVP scope exists
* Stage 3 architecture outputs exist and are readable
* Stage 4 UX outputs exist and are readable
* Stage 4 UI blueprint output exists and is readable
* Stage 4 design system foundation exists and is readable
* launch-critical features are known
* service, data, API, and infrastructure dependencies are available
* feature behaviors and state transitions are clear enough to sequence implementation
* UI blueprints define launch-critical pages, components, routes, actions, states, visual specs, visual acceptance criteria, and frontend build package hints
* design system foundation defines shared visual tokens, component rules, responsive rules, and design approval status
* accessibility and security requirements are available for test planning
* earlier-stage risks do not block engineering planning

Record preflight results in:

```text
preflight
execution_risks
open_questions
interactive_guidance
completion_status
```

---

# Orchestrated Skills

Run Stage 5 skills in this order:

```text
1. development-roadmap-planning
2. implementation-sequence-planning
3. engineering-dependency-planning
4. testing-strategy-planning
5. build-ticket-generation
6. agent-assignment-planning
7. parallel-execution-planning
8. release-plan-orchestration
9. development-orchestration-synthesis
```

---

# Execution Sequence

## 1. Load Stage 1, Stage 2, Stage 3, And Stage 4 Outputs

Load and normalize earlier-stage outputs into:

```text
stage_1_inputs
stage_2_inputs
stage_3_inputs
stage_4_inputs
ui_blueprint_inputs
visual_spec_inputs
design_system_inputs
frontend_build_package
```

Do not modify earlier-stage outputs during Stage 5.

## 2. Initialize Shared Development State

Create or load:

```text
Build-Plans/Build-status/Development-state.json
```

Initialize missing fields using the shared development orchestration state schema.

## 3. Run `development-roadmap-planning`

Required shared state updates:

```text
development_roadmap
workstreams
milestones
execution_risks
open_questions
interactive_guidance
```

## 4. Run `implementation-sequence-planning`

Required shared state updates:

```text
implementation_sequence
engineering_dependencies
execution_risks
coordination_notes
interactive_guidance
```

## 5. Run `engineering-dependency-planning`

Required shared state updates:

```text
engineering_dependencies
coordination_notes
execution_risks
open_questions
interactive_guidance
```

## 6. Run `testing-strategy-planning`

Required shared state updates:

```text
testing_strategy
execution_risks
coordination_notes
interactive_guidance
```

## 7. Run `build-ticket-generation`

Required shared state updates:

```text
build_tickets
engineering_dependencies
execution_risks
coordination_notes
stage_6_handoff
interactive_guidance
```

## 8. Run `agent-assignment-planning`

Required shared state updates:

```text
agent_assignment_plan
build_tickets
engineering_dependencies
execution_risks
coordination_notes
stage_6_handoff
interactive_guidance
```

## 9. Run `parallel-execution-planning`

Required shared state updates:

```text
parallel_execution_plan
agent_assignment_plan
engineering_dependencies
execution_risks
coordination_notes
stage_6_handoff
interactive_guidance
```

## 10. Run `release-plan-orchestration`

Required shared state updates:

```text
release_plan
execution_risks
coordination_notes
stage_6_handoff
interactive_guidance
```

## 11. Run `development-orchestration-synthesis`

Required shared state updates:

```text
development_roadmap
implementation_sequence
engineering_dependencies
testing_strategy
build_tickets
agent_assignment_plan
parallel_execution_plan
release_plan
execution_risks
coordination_notes
stage_6_handoff
completion_status
interactive_guidance
```

---

# Final Stage 5 Outputs

Generate:

```text
Build-Plans/Stage-5/01-development-roadmap.json
Build-Plans/Stage-5/02-implementation-sequence.json
Build-Plans/Stage-5/03-engineering-dependencies.json
Build-Plans/Stage-5/04-testing-strategy.json
Build-Plans/Stage-5/05-build-tickets.json
Build-Plans/Stage-5/06-agent-assignment-plan.json
Build-Plans/Stage-5/07-parallel-execution-plan.json
Build-Plans/Stage-5/08-release-plan.json
```

Each output must include:

* related Stage 1 scope or feature inputs
* related Stage 3 architecture dependencies
* related Stage 4 UX dependencies
* related Stage 4 UI blueprint dependencies where applicable
* related Stage 4 visual spec dependencies where applicable
* related Stage 4 design system dependencies where applicable
* execution decisions
* risks and constraints
* unresolved questions
* Stage 6 handoff notes when relevant

The build ticket output must include:

* ticket IDs
* slice IDs
* ticket dependencies
* UI blueprint references for frontend tickets
* visual spec references and visual requirements for frontend tickets
* design system references for frontend tickets
* page, component, shared component, route, state, and action references when applicable
* frontend task hints from the Stage 4 frontend build package
* primary skill from the skill registry
* recommended skill chain from the skill registry
* required skills the assigned agent must use
* skill usage instructions for the assigned agent
* skill suitability score and selection rationale
* skill coverage gaps when no suitable skill exists
* acceptance criteria
* validation steps
* risk level
* Stage 6 execution queue position

---

# Completion Gate

Before Stage 5 may use `ready_for_stage_6`, run `global-stage-readiness-audit`.

The audit must write:

```text
Build-Plans/Build-status/Stage-5-readiness-audit.json
```

The audit must pass according to:

```text
System-References/Docs/Global-Stage-Workflow-Contract.md
```

If the audit does not pass, do not use `ready_for_stage_6`.

Stage 5 may complete only when:

* all eight development orchestration outputs exist
* development roadmap is defined
* implementation sequence is dependency-aware
* engineering dependencies are mapped
* testing strategy covers launch-critical workflows
* build tickets cover every MVP implementation slice
* build tickets include a best-suited primary skill or record why no matching skill exists
* build tickets include an ordered recommended skill chain
* build tickets include required skills for the assigned agent
* build tickets include skill usage instructions for the assigned agent
* build tickets include skill suitability scores and selection rationale
* build tickets include acceptance criteria and validation steps
* frontend build tickets reference applicable UI blueprint IDs or explicitly record why no UI blueprint applies
* frontend build tickets reference applicable visual spec IDs or explicitly record why no visual spec applies
* frontend build tickets reference applicable design system IDs or explicitly record why no design system applies
* frontend build tickets preserve page, component, route, action, state, validation, accessibility, responsive, visual, and design system requirements from Stage 4
* agent assignment plan scans available agents before assignment
* agent assignment plan assigns every MVP ticket to the most suitable available agent that can use the ticket-required skills, or records why it requires manual ownership
* generated agents are written under `.opencode/agents/`
* generated agents include valid subagent frontmatter and prompt body based on ticket-required skills
* generated agent permissions match the assigned role and risk level
* parallel execution plan separates safe parallel work from serial work
* release plan exists
* high and critical execution risks have mitigation paths
* critical interactive guidance questions are answered or converted into recorded assumptions
* no execution-blocking Stage 3 or Stage 4 unknowns remain unresolved

Possible completion statuses:

```text
ready_for_stage_6
needs_orchestration_revision
needs_earlier_stage_revision
blocked
```

---

# Validation Checklist

Before completing Stage 5, confirm:

* Stage 5 did not redefine product strategy
* Stage 5 did not redesign architecture or UX
* Stage 5 did not implement code
* every MVP feature appears in the roadmap or deferred work
* every launch-critical workflow has an implementation sequence
* every major engineering dependency is mapped
* testing strategy includes validation checkpoints
* build tickets exist for every MVP implementation slice
* build tickets include primary skill, recommended skill chain, agent-required skills, skill usage instructions, acceptance criteria, and validation steps
* frontend build tickets include UI blueprint references, visual spec references, design system references, component references, route references, state references, action references, visual requirements, and frontend task hints
* agent assignment plan gives each agent clear ownership and handoff inputs
* generated agents have valid markdown definitions in `.opencode/agents/`, safe permission settings, and complete prompt bodies
* parallel execution plan defines batches, merge strategy, and validation gates
* release plan includes readiness gates
* critical interactive guidance questions are answered or converted into recorded assumptions
* Stage 6 handoff is usable for implementation and validation

---

# A-Grade Workflow Compliance

Stage 5 must consume `stage_contract_profile` and `guidance_policy`.

Stage 5 must reference:

```text
System-References/Schemas/stage-5-output.schema.json
```

Build tickets must define `expected_artifacts` when validation, preview, visual QA, deployment proof, or launch readiness evidence will be required later.

Expected artifacts must be carried into:

```text
Build-Plans/Build-status/Artifact-evidence-registry.json
```

Before using `ready_for_stage_6`, Stage 5 must provide `schema_validation`, `reference_integrity`, `risk_acceptance_ledger`, and `revision_loops` in the readiness audit or stage state.

Accepted high and critical execution, sequencing, ticketing, or agent risks must be recorded in:

```text
Build-Plans/Build-status/Risk-acceptance-ledger.json
```

Failed readiness checks must become revision-loop actions with owning output, owning skill, required change, and next action.
