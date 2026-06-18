# Skill — validation-execution

# Purpose

The `validation-execution` skill runs or coordinates planned validation for Stage 6.

It is responsible for:

* running or coordinating planned validation
* mapping tests to features, workflows, tickets, agents, and acceptance criteria
* validating ticket acceptance criteria
* validating agent-reported results
* validating batch-level gates from the parallel execution plan
* recording pass/fail status
* identifying missing coverage

This skill is the validation layer for Stage 6.

---

# Inputs

```json
{
  "implementation_status": {},
  "build_tickets": {},
  "agent_assignment_plan": {},
  "parallel_execution_plan": {},
  "testing_strategy": {},
  "ui_blueprint_inputs": {},
  "existing_state": {}
}
```

Read and update shared implementation state from:

```text
Build-Plans/Build-status/Implementation-state.json
```

---

# Validation Execution Rules

Use validation steps from:

* Stage 5 testing strategy
* build ticket `validation_steps`
* ticket acceptance criteria
* agent validation requirements
* parallel batch validation gates
* Stage 4 UI blueprint specification for frontend tickets with `ui_blueprint_refs`
* Stage 4 visual spec matrix for frontend tickets with `visual_spec_refs`
* Stage 4 design system foundation for frontend tickets with `design_system_refs`
* repository test scripts when available

Do not guess missing test commands blindly.

If validation cannot run because a command or check is undefined, mark validation as blocked and record:

```text
missing_validation_command
```

If validation fails, record the failure and route it to `repair-workflow`.

For frontend tickets with `ui_blueprint_refs`, validate implementation against:

```text
Build-Plans/Stage-4/07-ui-blueprint-specification.json
```

Confirm referenced page structure, layout, sections, components, shared components, routes, actions, states, data requirements, validation requirements, accessibility requirements, responsive requirements, visual requirements, visual acceptance criteria, and design system compliance.

For frontend tickets with `visual_qa_required`, validate through available visual evidence such as screenshots, browser preview, responsive viewport checks, Playwright checks, or documented manual review. Record visual drift as:

```text
visual_match
minor_visual_drift
major_visual_drift
requires_user_review
```

---

# Outputs

```json
{
  "validation_results": {},
  "ticket_validation_results": [],
  "agent_validation_results": [],
  "batch_validation_results": [],
  "ui_blueprint_validation_results": [],
  "visual_spec_validation_results": [],
  "design_system_validation_results": [],
  "visual_qa_results": [],
  "responsive_validation_results": [],
  "visual_drift_results": [],
  "artifact_evidence_updates": [],
  "passed_checks": [],
  "failed_checks": [],
  "coverage_gaps": [],
  "validation_risks": []
}
```

---

# Shared State Updates

Update:

```text
validation_results
test_failures
system_health
interactive_guidance
```

Persist updates to:

```text
Build-Plans/Build-status/Implementation-state.json
```

---

# Validation Responsibilities

Validate:

* every implemented ticket has pass/fail status for acceptance criteria
* every assigned agent has validation results when work was executed
* every parallel batch has validation gate results
* failed checks include error output or failure reason when available
* coverage gaps are explicit
* validation results map back to ticket IDs
* frontend validation results map to referenced UI blueprint IDs when present
* frontend validation results map to referenced visual spec IDs when present
* frontend validation results map to referenced design system IDs when present
* frontend tickets with UI blueprint refs validate required page, component, route, action, state, accessibility, responsive, and visual behavior
* frontend tickets with visual spec refs validate visual acceptance criteria and report any visual gaps
* frontend tickets with visual QA requirements report visual QA evidence and visual drift status
* frontend tickets with design system refs report design system compliance
* validation outputs, screenshots, preview URLs, logs, and reports are recorded or queued for `Build-Plans/Build-status/Artifact-evidence-registry.json`
