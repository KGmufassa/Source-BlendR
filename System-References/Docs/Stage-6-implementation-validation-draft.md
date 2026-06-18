# Stage 6 — Implementation & Validation Command & Skill Draft

# Core Philosophy

Stage 6 is centered around:

```text
continuous engineering execution cognition
```

NOT:

* product strategy
* market validation
* architecture design
* UX planning
* release planning

Those responsibilities were handled in earlier stages.

Stage 6 is responsible for executing implementation, validating behavior, detecting regressions, repairing failures, and reporting system health.

---

# Recommended Stage 6 Architecture

```text
stage-6-implementation-validation (command)
│
├── implementation-execution
├── validation-execution
├── regression-analysis
├── repair-workflow
└── system-health-synthesis
```

---

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

---

# Shared Implementation State

The shared Stage 6 state must be written to:

```text
Build-Plans/Build-status/Implementation-state.json
```

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
  "environment_state": {
    "detected_stack": [],
    "dependency_status": {},
    "env_requirements": [],
    "missing_dependencies": [],
    "external_services": [],
    "migration_requirements": [],
    "seed_data_requirements": []
  },
  "dev_server": {
    "required": false,
    "command": null,
    "port": null,
    "url": null,
    "status": "not_started",
    "startup_logs": [],
    "healthcheck": null
  },
  "execution_controls": {
    "default_max_repair_attempts_per_ticket": 3,
    "default_max_validation_attempts_per_ticket": 3,
    "default_max_agent_retry_attempts": 2,
    "ticket_terminal_statuses": [
      "complete",
      "blocked",
      "deferred",
      "failed",
      "not_applicable"
    ]
  },
  "ticket_status_registry": {},
  "agent_execution_log": [],
  "implementation_status": {},
  "validation_results": {},
  "regression_analysis": {},
  "system_health": {},
  "repair_log": [],
  "artifact_registry": [],
  "change_safety": {
    "pre_execution_git_status": null,
    "user_changes_detected": [],
    "changed_files_by_ticket": {},
    "rollback_notes": [],
    "protected_files": []
  },
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

# Environment And Dependency Preflight

Before executing tickets, Stage 6 must inspect the project environment and record `environment_state`.

Stage 6 should identify:

* package managers and framework signals
* install commands
* build commands
* test commands
* lint and typecheck commands
* required environment variables
* missing `.env` or secret requirements
* database, migration, and seed requirements
* external services required for validation

Common discovery sources:

```text
package.json
pnpm-lock.yaml
yarn.lock
package-lock.json
pyproject.toml
requirements.txt
Pipfile
Cargo.toml
go.mod
Makefile
docker-compose.yml
Dockerfile
README.md
docs/
```

If dependencies are missing, Stage 6 must:

* record the missing dependency
* identify the likely install command
* determine whether installation is safe and within permissions
* block when installation requires unavailable network access, secrets, or user approval
* avoid inventing environment variable values or secrets

If migrations or seed data are required, Stage 6 must not run destructive database commands unless Stage 5 explicitly authorizes them or the user confirms.

---

# Test Command Discovery

Stage 6 must discover validation commands before running implementation.

Validation command priority:

```text
1. Stage 5 testing strategy commands
2. build ticket validation_steps
3. package or project scripts
4. documented repository commands
5. framework-standard commands inferred from project files
```

For JavaScript and TypeScript projects, inspect `package.json` scripts for:

```text
test
test:unit
test:integration
lint
typecheck
build
dev
start
preview
e2e
```

If no validation command is available for a launch-critical ticket, mark the ticket `blocked` with:

```text
blocker_reason = "missing_validation_command"
next_action = "define validation command or acceptance check"
```

If validation can be performed manually, Stage 6 must record the manual check, evidence, and confidence level.

---

# Validation Layers

Stage 6 validation should be grouped into explicit validation layers.

Supported validation layers:

```text
unit_tests
integration_tests
typecheck
lint
build
smoke_test
browser_ui_test
accessibility_check
regression_check
manual_verification
```

Each ticket must map its `validation_steps` to one or more validation layers.

Each validation result must include:

```json
{
  "validation_id": "",
  "ticket_id": "",
  "layer": "",
  "command": "",
  "status": "passed",
  "exit_code": 0,
  "evidence_artifacts": [],
  "failure_summary": null,
  "confidence": "high"
}
```

Allowed validation statuses:

```text
passed
failed
blocked
skipped
manual_passed
manual_failed
```

Skipped validation must include a reason and risk note.

---

# Localhost And Dev Server Rules

When Stage 6 builds a runnable app or UI, it must determine whether a local dev server is required for validation.

Stage 6 should start a local server when:

* browser/UI validation is required
* smoke testing requires an HTTP endpoint
* acceptance criteria depend on rendered app behavior
* Stage 5 testing strategy requires local preview

Dev server command discovery priority:

```text
1. Stage 5 testing strategy
2. build ticket validation_steps
3. package scripts such as dev, start, preview
4. documented README command
5. framework-standard command
```

Port handling:

* use the configured project port when available
* if the port is occupied, use the next safe available port when the framework supports it
* record the final URL in `dev_server.url`
* do not kill unrelated processes without explicit user approval

Server readiness checks:

* process is running
* expected port responds
* app returns a non-error HTTP response when applicable
* startup logs do not contain fatal errors

If the server cannot start, Stage 6 must mark affected tickets `blocked` or `failed` depending on cause and record logs as artifacts.

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

Stage 6 must validate referenced UI blueprint requirements for:

* page structure
* layout type
* sections and components
* shared components
* routes
* user actions
* required UI states
* data requirements
* validation requirements
* accessibility requirements
* responsive requirements
* visual requirements
* visual acceptance criteria
* design system compliance

For frontend tickets requiring preview or visual QA, Stage 6 must record:

```json
{
  "preview_url": "",
  "visual_qa_results": [],
  "responsive_validation_results": [],
  "design_system_compliance": {},
  "visual_drift_status": "visual_match | minor_visual_drift | major_visual_drift | requires_user_review"
}
```

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
* frontend tickets include UI blueprint handoff inputs when `ui_blueprint_refs` are present
* frontend tickets include visual requirements and visual acceptance criteria when `visual_spec_refs` are present
* frontend tickets include design system handoff inputs when `design_system_refs` are present
* frontend tickets include preview and visual QA requirements when required by Stage 5
* parallel execution conflicts are resolved or the ticket is placed in a serial batch

---

# Execution Control Rules

Stage 6 must run build tickets until every ticket reaches a terminal ticket status.

Terminal ticket statuses:

```text
complete
blocked
deferred
failed
not_applicable
```

Ticket status meanings:

| Status           | Meaning                                                               |
| ---------------- | --------------------------------------------------------------------- |
| `complete`       | Implemented, validated, regression-checked, and accepted              |
| `blocked`        | Cannot continue because required input, dependency, agent, permission, command, or decision is missing |
| `deferred`       | Intentionally postponed with approval or explicit planning rationale   |
| `failed`         | Attempted but could not pass validation after allowed repair attempts  |
| `not_applicable` | Ticket no longer applies because a prior ticket or approved decision removed the need |

Non-terminal ticket statuses:

```text
not_started
in_progress
implemented
needs_validation
validation_failed
needs_repair
repair_in_progress
needs_revalidation
```

Stage 6 must maintain a `ticket_status_registry` in shared implementation state. Each ticket entry must include:

```json
{
  "ticket_id": "",
  "slice_id": "",
  "agent_id": "",
  "status": "not_started",
  "attempt_count": 0,
  "validation_attempt_count": 0,
  "repair_attempt_count": 0,
  "last_failure": null,
  "last_repair": null,
  "blocker_reason": null,
  "next_action": "",
  "terminal": false
}
```

---

# Run-Until-Terminal Loop

For each executable ticket, Stage 6 must follow this loop:

```text
1. Verify ticket preconditions.
2. Execute implementation using the assigned agent or manual executor.
3. Mark ticket as implemented.
4. Run ticket validation steps.
5. Run relevant regression checks.
6. If validation and regression pass, mark ticket complete.
7. If validation or regression fails, route failure to repair-workflow.
8. Apply repair using the responsible agent and required ticket skills.
9. Revalidate the repaired ticket.
10. Continue until the ticket reaches a terminal status.
```

The command must continue processing pending tickets while any ticket remains non-terminal and executable.

The command must stop processing a specific ticket when:

* the ticket reaches `complete`
* the ticket is marked `blocked` with a blocker reason and next action
* the ticket is marked `deferred` with approval or explicit planning rationale
* the ticket is marked `failed` after allowed retry and repair attempts are exhausted
* the ticket is marked `not_applicable` with rationale

The command must stop the full Stage 6 run when:

* minimum viable Stage 5 inputs are missing
* required generated agents are missing or malformed and no manual fallback is approved
* dependency sequencing prevents all remaining tickets from running
* critical file-scope, API, schema, architecture, or UX conflicts remain unresolved
* validation commands are missing for launch-critical tickets
* repeated critical validation failures exhaust the retry budget
* user input is required and cannot be safely inferred

---

# Retry And Repair Limits

Default execution limits:

```text
max_repair_attempts_per_ticket = 3
max_validation_attempts_per_ticket = 3
max_agent_retry_attempts = 2
```

Stage 5 may override these limits per ticket only when the ticket explains why the risk justifies a different budget.

Retry rules:

* retry an agent only when the failure is caused by agent execution failure, incomplete output, or recoverable tool error
* do not retry an agent when the ticket requirement is ambiguous, unsafe, or missing validation criteria
* do not apply the same repair more than once unless new evidence explains why it may succeed
* after each repair attempt, rerun the affected validation checks
* after high-risk repairs, rerun relevant regression checks
* when retry or repair limits are exhausted, mark the ticket `failed` or `blocked` based on whether the remaining issue is implementation failure or missing external input

---

# Agent Execution Mechanics

Stage 6 must execute assigned tickets through the agent named in the Stage 5 agent assignment plan, unless the ticket is explicitly marked for manual execution.

Before invoking an agent, Stage 6 must verify:

* the agent file exists in `.opencode/agents/`
* frontmatter is valid
* permissions match the assigned work
* the prompt includes assigned tickets, required skills, file scopes, validation requirements, and reporting requirements
* the agent has access to every `agent_required_skills` entry listed on the ticket

Each agent run must produce an `agent_execution_log` entry:

```json
{
  "agent_id": "",
  "agent_file": "",
  "ticket_ids": [],
  "required_skills": [],
  "status": "completed",
  "attempt": 1,
  "inputs": [],
  "outputs": [],
  "changed_files": [],
  "validation_claims": [],
  "errors": [],
  "next_action": ""
}
```

Allowed agent run statuses:

```text
completed
partial
failed
blocked
skipped
retrying
```

Agent output must not be treated as validated until `validation-execution` verifies the relevant acceptance criteria.

---

# Parallel Execution Safety

Stage 6 may run multiple agents or batches concurrently only when the Stage 5 parallel execution plan proves the work is conflict-safe.

Parallel execution must enforce:

* no two parallel tickets may write to the same file unless a merge owner is assigned
* shared schema, API, routing, state management, database, or configuration files require serial execution or explicit merge controls
* each parallel batch must have a batch owner or merge owner
* each batch must define validation gates
* failed launch-critical batch validation blocks dependent batches
* non-critical batch failures may allow unrelated batches to continue when dependencies are clear

Each parallel batch result must include:

```json
{
  "batch_id": "",
  "ticket_ids": [],
  "agent_ids": [],
  "status": "completed",
  "file_locks": [],
  "conflicts_detected": [],
  "merge_owner": "",
  "validation_gates": [],
  "blocking_failures": [],
  "downstream_batches_blocked": []
}
```

---

# Change Safety And Rollback Rules

Before implementation begins, Stage 6 must inspect and record the existing working state.

Record:

* current git status
* user changes already present
* files protected by Stage 5 scope rules
* files each ticket is allowed to edit

Stage 6 must not overwrite or revert user changes unless explicitly instructed.

For every ticket, record:

```text
changed_files
created_files
deleted_files
protected_files_touched
rollback_notes
```

If a repair makes behavior worse, Stage 6 must:

* stop additional repairs for the affected ticket
* record the failed repair
* identify changed files involved
* provide a rollback recommendation
* avoid destructive rollback unless the user explicitly confirms

---

# Artifact Capture Rules

Stage 6 must preserve evidence for implementation, validation, regression, repair, and server execution.

Artifacts may include:

* command output
* test logs
* build logs
* lint/typecheck output
* server startup logs
* browser screenshots
* smoke test responses
* error traces
* changed file summaries
* manual verification notes

Each artifact entry must include:

```json
{
  "artifact_id": "",
  "type": "",
  "source": "",
  "ticket_id": "",
  "agent_id": "",
  "path_or_reference": "",
  "summary": "",
  "created_at": ""
}
```

Artifacts should be referenced by Stage 6 output files rather than duplicated in full when they are large.

---

# Stage 6 Skills

## Skill — implementation-execution

Purpose:

* execute assigned build tickets
* run generated or assigned agents when applicable
* follow ticket `agent_required_skills` and `agent_skill_instructions`
* respect allowed and restricted file scopes
* track implemented slices and tickets
* map implementation back to Stage 5 sequence, tickets, and agents
* detect implementation blockers

Outputs:

```json
{
  "implemented_items": [],
  "implemented_tickets": [],
  "ticket_status_updates": [],
  "agent_execution_results": [],
  "parallel_batch_results": [],
  "environment_updates": {},
  "dev_server_updates": {},
  "change_safety_updates": {},
  "artifacts": [],
  "artifact_evidence_updates": [],
  "pending_items": [],
  "blocked_items": [],
  "failed_items": [],
  "implementation_notes": [],
  "implementation_risks": []
}
```

Shared state updates:

```text
implementation_status
execution_blockers
active_agents
parallel_batches
ticket_status_registry
agent_execution_log
environment_state
dev_server
change_safety
artifact_registry
interactive_guidance
```

---

## Skill — validation-execution

Purpose:

* run or coordinate planned validation
* map tests to features, workflows, and acceptance criteria
* validate ticket acceptance criteria
* validate agent-reported results
* validate batch-level gates from the parallel execution plan
* record pass/fail status
* identify missing coverage

Outputs:

```json
{
  "validation_results": {},
  "ticket_validation_results": [],
  "agent_validation_results": [],
  "batch_validation_results": [],
  "passed_checks": [],
  "failed_checks": [],
  "revalidation_required": [],
  "validation_attempt_updates": [],
  "validation_layers": {},
  "discovered_commands": [],
  "artifacts": [],
  "artifact_evidence_updates": [],
  "coverage_gaps": [],
  "validation_risks": []
}
```

Shared state updates:

```text
validation_results
test_failures
system_health
ticket_status_registry
dev_server
artifact_registry
interactive_guidance
```

---

## Skill — regression-analysis

Purpose:

* detect behavior regressions
* compare current behavior to planned workflows
* identify broken dependencies
* identify regressions introduced by specific tickets, agents, or parallel batches
* assess blast radius

Outputs:

```json
{
  "regression_analysis": {},
  "regressions": [],
  "affected_features": [],
  "affected_workflows": [],
  "affected_tickets": [],
  "affected_agents": [],
  "affected_batches": [],
  "severity": {},
  "regression_blockers": [],
  "tickets_requiring_repair": [],
  "artifacts": []
}
```

Shared state updates:

```text
regression_analysis
system_health
execution_blockers
ticket_status_registry
artifact_registry
interactive_guidance
```

---

## Skill — repair-workflow

Purpose:

* propose and track repairs
* prioritize fixes
* verify repaired behavior
* document repair decisions
* route repair work back to the responsible ticket, agent, or batch
* preserve ticket-required skill instructions during repair

Outputs:

```json
{
  "repair_log": [],
  "repair_actions": [],
  "ticket_repairs": [],
  "agent_repair_assignments": [],
  "repair_status": {},
  "repair_attempt_updates": [],
  "revalidation_queue": [],
  "artifacts": [],
  "remaining_defects": [],
  "repair_risks": []
}
```

Shared state updates:

```text
repair_log
validation_results
system_health
ticket_status_registry
change_safety
artifact_registry
interactive_guidance
```

---

## Skill — system-health-synthesis

Purpose:

* synthesize implementation, validation, regression, and repair results
* determine readiness for Stage 7
* produce final Stage 6 outputs
* verify all assigned tickets, agents, and parallel batches are accounted for

Final outputs:

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

The implementation status output must include:

* implemented tickets
* pending tickets
* blocked tickets
* failed tickets
* deferred tickets
* ticket terminal status summary
* agent execution results
* parallel batch results
* files changed when available
* ticket skill usage notes
* environment status
* dev server status
* artifact references

The validation results output must include:

* ticket validation results
* agent validation results
* batch validation results
* acceptance criteria status
* test/check results
* validation layers
* discovered validation commands
* dev server validation results
* coverage gaps
* artifact references

The regression analysis output must include:

* affected tickets
* affected agents
* affected batches
* affected features
* affected workflows
* severity and blast radius
* artifact references

The repair log output must include:

* ticket repairs
* agent repair assignments
* repair verification status
* remaining defects
* unresolved repair risks
* artifact references

---

# Final Output Schemas

`01-implementation-status.json` must follow this structure:

```json
{
  "stage": "Stage 6",
  "status": "",
  "ticket_status_summary": {},
  "implemented_tickets": [],
  "pending_tickets": [],
  "blocked_tickets": [],
  "failed_tickets": [],
  "deferred_tickets": [],
  "not_applicable_tickets": [],
  "agent_execution_results": [],
  "parallel_batch_results": [],
  "environment_state": {},
  "dev_server": {},
  "changed_files": {},
  "artifact_evidence_updates": [],
  "artifact_refs": []
}
```

`02-validation-results.json` must follow this structure:

```json
{
  "stage": "Stage 6",
  "status": "",
  "validation_layers": {},
  "discovered_commands": [],
  "ticket_validation_results": [],
  "agent_validation_results": [],
  "batch_validation_results": [],
  "acceptance_criteria_results": [],
  "dev_server_validation": {},
  "coverage_gaps": [],
  "failed_checks": [],
  "artifact_evidence_updates": [],
  "artifact_refs": []
}
```

`03-regression-analysis.json` must follow this structure:

```json
{
  "stage": "Stage 6",
  "status": "",
  "regressions": [],
  "affected_tickets": [],
  "affected_agents": [],
  "affected_batches": [],
  "affected_features": [],
  "affected_workflows": [],
  "severity_summary": {},
  "blast_radius": {},
  "tickets_requiring_repair": [],
  "artifact_refs": []
}
```

`04-system-health.json` must follow this structure:

```json
{
  "stage": "Stage 6",
  "status": "",
  "readiness_for_stage_7": "",
  "implementation_health": {},
  "validation_health": {},
  "regression_health": {},
  "repair_health": {},
  "dev_server_health": {},
  "critical_blockers": [],
  "known_risks": [],
  "stage_7_handoff": {},
  "artifact_refs": []
}
```

`05-repair-log.json` must follow this structure:

```json
{
  "stage": "Stage 6",
  "status": "",
  "repair_actions": [],
  "ticket_repairs": [],
  "agent_repair_assignments": [],
  "repair_attempts": [],
  "revalidation_results": [],
  "remaining_defects": [],
  "rollback_notes": [],
  "artifact_refs": []
}
```

---

# Stage 7 Handoff Schema

Stage 6 must produce a Stage 7 handoff inside `04-system-health.json`.

The handoff must include:

```json
{
  "deployment_blockers": [],
  "deployment_prerequisites": [],
  "setup_commands": [],
  "build_command": "",
  "start_command": "",
  "test_commands": [],
  "environment_variables_required": [],
  "secrets_required": [],
  "migration_requirements": [],
  "seed_data_requirements": [],
  "monitoring_needs": [],
  "analytics_needs": [],
  "support_needs": [],
  "known_defects": [],
  "accepted_risks": [],
  "dev_server_url": "",
  "artifact_refs": []
}
```

Stage 7 handoff must distinguish:

* unresolved blockers
* known risks accepted for launch preparation
* operational setup requirements
* validation evidence from Stage 6

Completion statuses:

```text
ready_for_stage_7
needs_repair
needs_revalidation
blocked
```

---

# Completion Gate

Before Stage 6 may use `ready_for_stage_7`, it must run `global-stage-readiness-audit` and write:

```text
Build-Plans/Build-status/Stage-6-readiness-audit.json
```

The audit must pass according to:

```text
System-References/Docs/Global-Stage-Workflow-Contract.md
```

Stage 6 may complete only when:

* all assigned Stage 5 build tickets have terminal ticket statuses
* completed tickets are implemented, validated, regression-checked, and accepted
* blocked tickets include blocker reason and next action
* deferred tickets include approval or explicit planning rationale
* failed tickets include exhausted attempt counts, final failure reason, and escalation path
* not-applicable tickets include rationale
* every executed ticket followed its `agent_required_skills` and `agent_skill_instructions`
* every executed frontend ticket with UI blueprint references was validated against the referenced UI blueprint requirements
* every executed frontend ticket with visual spec references was validated against the referenced visual requirements and visual acceptance criteria
* every executed frontend ticket with design system references was validated against the referenced design system foundation
* every frontend ticket requiring preview recorded a preview URL or blocker
* every frontend ticket requiring visual QA recorded visual QA results, responsive validation results, and visual drift status
* every ticket with `expected_artifacts` has matching entries in `Build-Plans/Build-status/Artifact-evidence-registry.json` or a documented blocker
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
* all launch-critical expected artifacts are recorded in the artifact evidence registry or explicitly accepted as known release risk
* all high-risk repairs are verified or explicitly accepted as known risk
* no launch-critical ticket is `failed`, `blocked`, or `deferred` unless explicitly accepted as a known release risk

---

# Validation Checklist

Before completing Stage 6, confirm:

* Stage 6 did not redefine product strategy
* Stage 6 did not redesign architecture or UX
* Stage 6 did not silently change release strategy
* every Stage 5 ticket has execution status
* every Stage 5 ticket has a terminal status before completion
* retry and repair attempts are recorded for every failed validation path
* failed tickets include final failure reason and escalation path
* blocked tickets include blocker reason and next action
* every assigned agent has execution status
* every parallel batch has validation status
* validation results map to ticket acceptance criteria
* expected artifact evidence maps back to Stage 5 ticket IDs
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

Stage 6 output validation should reference:

```text
System-References/Schemas/stage-6-output.schema.json
```

Stage 6 must record implementation, validation, repair, regression, preview, visual QA, and build evidence in:

```text
Build-Plans/Build-status/Artifact-evidence-registry.json
```

Stage 6 readiness must also record:

```json
{
  "schema_validation": {},
  "reference_integrity": {},
  "risk_acceptance_ledger": {},
  "revision_loops": []
}
```

Stage 6 may not use `ready_for_stage_7` until required schema validation passes, ticket, agent, batch, validation, artifact, UI blueprint, visual spec, design system, repair, and regression references resolve to upstream sources, accepted high and critical implementation or validation risks are written to `Build-Plans/Build-status/Risk-acceptance-ledger.json`, and failed readiness checks are converted into revision-loop actions.
