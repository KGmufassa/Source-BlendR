# Command — stage-6-implementation-validation

# Purpose

The `stage-6-implementation-validation` command orchestrates Stage 6.

It transforms:

* Stage 5 implementation sequence
* engineering dependencies
* testing strategy
* build tickets with ticket-required skills
* agent assignment plan
* generated agents
* parallel execution plan
* release plan
* prior stage architecture and UX outputs

into:

* implementation status
* validation results
* regression analysis
* system health assessment
* repair log

This is the Stage 6 command skill. It is not a single implementation subskill.

---

# Cognitive Boundary

Stage 6 asks:

```text
Can the planned system be built, validated, repaired, and verified?
```

Stage 6 must not:

* redefine product strategy
* redesign architecture
* redesign UX flows
* change release strategy unless execution exposes a blocker
* perform post-launch optimization

Stage 6 may recommend earlier-stage revision only when implementation or validation exposes a blocking flaw in the plan.

---

# Output Directory

All final Stage 6 outputs must be recorded in:

```text
Build-Plans/Stage-6/
```

The command must create this folder if it does not exist.

---

# Shared Implementation State

The shared Stage 6 state must be written to:

```text
Build-Plans/Build-status/Implementation-state.json
```

The command must load this file at the beginning of Stage 6, update it after each implementation/validation skill runs, and preserve it as durable execution state.

```json
{
  "stage": "Stage 6",
  "command": "stage-6-implementation-validation",
  "status": "not_started",
  "stage_5_inputs": {},
  "build_tickets": {},
  "agent_assignment_plan": {},
  "parallel_execution_plan": {},
  "active_agents": [],
  "parallel_batches": [],
  "preflight": {},
  "implementation_status": {},
  "validation_results": {},
  "regression_analysis": {},
  "system_health": {},
  "repair_log": [],
  "execution_blockers": [],
  "test_failures": [],
  "open_questions": [],
  "interactive_guidance": {
    "open_questions": [],
    "answered_questions": [],
    "assumptions_made": [],
    "blocked_decisions": [],
    "user_confirmations": [],
    "implementation_confidence_gaps": []
  },
  "stage_7_handoff": {},
  "completion_status": {}
}
```

After each subskill completes, persist the updated state to:

```text
Build-Plans/Build-status/Implementation-state.json
```

---

# Interactive Guidance Rules

The Stage 6 command should behave like a guided implementation and validation controller.

Use this decision rule:

```text
Ask only for execution decisions that materially affect implementation, validation, repair, or system verification.
Infer standard engineering defaults when risk is low and Stage 5 planning supports the inference.
Record assumptions when proceeding without user confirmation.
Block only when a missing decision prevents implementation or trustworthy validation.
```

Pause for user input when:

* implementation cannot proceed because a requirement is ambiguous
* a generated agent is missing, malformed, or lacks required permissions
* a ticket lacks required skills, skill instructions, acceptance criteria, or validation steps
* a parallel batch has unresolved dependency, file ownership, API, schema, architecture, or UX conflicts
* a validation failure has multiple valid repair paths
* a regression affects product behavior or architecture assumptions
* test scope must change to verify correctness
* repair would alter Stage 5 sequencing or Stage 7 readiness

---

# Stage 6 Input Contract

Load Stage 5 outputs from:

```text
Build-Plans/Stage-5/
```

Required Stage 5 files:

```text
01-development-roadmap.json
02-implementation-sequence.json
03-engineering-dependencies.json
04-testing-strategy.json
05-build-tickets.json
06-agent-assignment-plan.json
07-parallel-execution-plan.json
08-release-plan.json
```

Minimum viable input set:

```text
02-implementation-sequence.json
03-engineering-dependencies.json
04-testing-strategy.json
05-build-tickets.json
06-agent-assignment-plan.json
07-parallel-execution-plan.json
```

If the minimum viable input set is missing, stop and set:

```text
completion_status.status = "blocked"
completion_status.reason = "missing_implementation_inputs"
```

---

# Stage 5 Handoff Requirements

Stage 6 must consume Stage 5 as an execution handoff, not as general planning notes.

Each build ticket must include:

```text
primary_skill
recommended_skills
agent_required_skills
agent_skill_instructions
acceptance_criteria
validation_steps
risk_level
completion_status
ui_blueprint_refs
visual_spec_refs
design_system_refs
page_refs
component_refs
route_refs
state_refs
action_refs
frontend_task_hint
visual_requirements
responsive_requirements
visual_acceptance_criteria_refs
preview_required
visual_qa_required
design_system_compliance_required
expected_artifacts
```

Frontend tickets that include `ui_blueprint_refs` must preserve the referenced UI blueprint requirements from:

```text
Build-Plans/Stage-4/07-ui-blueprint-specification.json
```

Stage 6 must validate referenced UI blueprint requirements for page structure, layout type, sections, components, shared components, routes, actions, states, data requirements, validation requirements, accessibility requirements, responsive requirements, visual requirements, visual acceptance criteria, and design system compliance.

For frontend tickets that require preview or visual QA, Stage 6 must record:

```json
{
  "preview_url": "",
  "visual_qa_results": [],
  "responsive_validation_results": [],
  "design_system_compliance": {},
  "visual_drift_status": "visual_match | minor_visual_drift | major_visual_drift | requires_user_review"
}
```

For any ticket with `expected_artifacts`, Stage 6 must record matching artifact evidence updates or a blocker explaining why the artifact could not be produced.

Each agent assignment must include:

```text
agent_id
assigned_tickets
ticket_required_skills
ticket_skill_instructions
allowed_file_scopes
restricted_file_scopes
validation_requirements
```

Generated agents must exist in:

```text
.opencode/agents/
```

Generated agent files must include:

* valid subagent frontmatter
* `model: GPT 5.5` unless Stage 5 explicitly selected another model
* safe permission settings for the assigned role
* a prompt body with assigned tickets, required skills, skill usage order, file scopes, handoff inputs, validation requirements, rules, and reporting requirements

The parallel execution plan must include:

```text
parallel_batches
serial_batches
conflict_controls
workspace_plan
merge_plan
batch_validation_gates
```

Stage 6 must not execute a ticket until:

* the ticket has required skill instructions
* the ticket is assigned to an agent or explicitly marked for manual execution
* the agent can use the ticket-required skills
* file scopes are clear
* validation requirements are clear
* parallel execution conflicts are resolved or the ticket is placed in a serial batch

---

# Orchestrated Skills

Run Stage 6 skills in this order:

```text
1. implementation-execution
2. validation-execution
3. regression-analysis
4. repair-workflow
5. system-health-synthesis
```

---

# Execution Sequence

## 1. Load Stage 5 Handoff

Load and normalize:

```text
build_tickets
agent_assignment_plan
parallel_execution_plan
testing_strategy
release_plan
```

Do not modify Stage 5 outputs during Stage 6.

## 2. Initialize Shared Implementation State

Create or load:

```text
Build-Plans/Build-status/Implementation-state.json
```

Initialize missing fields using the shared implementation state schema.

## 3. Run `implementation-execution`

Required shared state updates:

```text
implementation_status
execution_blockers
active_agents
parallel_batches
interactive_guidance
```

## 4. Run `validation-execution`

Required shared state updates:

```text
validation_results
test_failures
system_health
interactive_guidance
```

## 5. Run `regression-analysis`

Required shared state updates:

```text
regression_analysis
system_health
execution_blockers
interactive_guidance
```

## 6. Run `repair-workflow`

Required shared state updates:

```text
repair_log
validation_results
system_health
interactive_guidance
```

## 7. Run `system-health-synthesis`

Required shared state updates:

```text
implementation_status
validation_results
regression_analysis
system_health
repair_log
stage_7_handoff
completion_status
interactive_guidance
```

---

# Final Stage 6 Outputs

Generate:

```text
Build-Plans/Stage-6/01-implementation-status.json
Build-Plans/Stage-6/02-validation-results.json
Build-Plans/Stage-6/03-regression-analysis.json
Build-Plans/Stage-6/04-system-health.json
Build-Plans/Stage-6/05-repair-log.json
```

Each output must include references to relevant:

* Stage 5 ticket IDs
* implementation slice IDs
* agent IDs
* parallel batch IDs
* required skills used
* validation gates
* unresolved blockers

---

# Completion Gate

Before Stage 6 may use `ready_for_stage_7`, run `global-stage-readiness-audit`.

The audit must write:

```text
Build-Plans/Build-status/Stage-6-readiness-audit.json
```

The audit must pass according to:

```text
System-References/Docs/Global-Stage-Workflow-Contract.md
```

If the audit does not pass, do not use `ready_for_stage_7`.

Stage 6 may complete only when:

* all assigned Stage 5 build tickets are implemented, blocked with reason, deferred with approval, or explicitly marked not applicable
* every executed ticket followed its `agent_required_skills` and `agent_skill_instructions`
* every executed frontend ticket with UI blueprint references was validated against the referenced UI blueprint requirements
* every executed frontend ticket with visual spec references was validated against the referenced visual requirements and visual acceptance criteria
* every executed frontend ticket with design system references was validated against the referenced design system foundation
* every frontend ticket requiring preview recorded a preview URL or a blocker
* every frontend ticket requiring visual QA recorded visual QA results, responsive validation results, and visual drift status
* every generated or assigned agent reported execution status
* every parallel batch has validation results
* all required validation gates have pass/fail status
* regressions are analyzed and assigned severity
* high and critical defects have repairs, blockers, or escalation paths
* repair work has been revalidated
* system health is synthesized from implementation, validation, regression, and repair results
* Stage 7 handoff contains unresolved operational, deployment, monitoring, analytics, and support needs

Stage 6 is `ready_for_stage_7` only when:

* no critical implementation blockers remain
* no unresolved critical validation failures remain
* no unresolved critical regressions remain
* all launch-critical tickets are implemented and validated
* all launch-critical frontend tickets preserve referenced UI blueprint page, component, route, action, state, validation, accessibility, responsive, visual, and design system requirements
* all launch-critical frontend tickets requiring preview have a recorded preview URL or accepted blocker
* all launch-critical frontend tickets have no `major_visual_drift` unless explicitly accepted as known release risk
* all high-risk repairs are verified or explicitly accepted as known risk

Possible completion statuses:

```text
ready_for_stage_7
needs_repair
needs_revalidation
blocked
```

---

# Validation Checklist

Before completing Stage 6, confirm:

* Stage 6 did not redefine product strategy
* Stage 6 did not redesign architecture or UX
* Stage 6 did not silently change release strategy
* every Stage 5 ticket has execution status
* every assigned agent has execution status
* every parallel batch has validation status
* validation results map to ticket acceptance criteria
* frontend validation results map to referenced UI blueprint IDs when present
* frontend validation results map to referenced visual spec IDs when present
* frontend validation results map to referenced design system IDs when present
* visual QA, responsive validation, design system compliance, and visual drift status are recorded for frontend tickets when required
* regression analysis maps failures back to affected tickets, agents, batches, workflows, and features
* repair log includes verification results
* Stage 7 handoff is usable for launch and operationalization

---

# A-Grade Workflow Compliance

Stage 6 must consume `stage_contract_profile` and `guidance_policy`.

Stage 6 must reference:

```text
System-References/Schemas/stage-6-output.schema.json
```

Stage 6 must record implementation, validation, repair, regression, preview, visual QA, and build evidence in:

```text
Build-Plans/Build-status/Artifact-evidence-registry.json
```

Before using `ready_for_stage_7`, Stage 6 must provide `schema_validation`, `reference_integrity`, `risk_acceptance_ledger`, and `revision_loops` in the readiness audit or stage state.

Accepted high and critical implementation, validation, regression, repair, or visual QA risks must be recorded in:

```text
Build-Plans/Build-status/Risk-acceptance-ledger.json
```

Failed readiness checks must become revision-loop actions with owning output, owning skill, required change, and next action.
