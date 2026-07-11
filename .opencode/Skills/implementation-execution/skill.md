# Skill — implementation-execution

# Purpose

The `implementation-execution` skill executes assigned Stage 5 build tickets.

It is responsible for:

* executing assigned build tickets
* running generated or assigned agents when applicable
* following ticket `agent_required_skills` and `agent_skill_instructions`
* respecting allowed and restricted file scopes
* tracking implemented slices and tickets
* mapping implementation back to Stage 5 sequence, tickets, and agents
* detecting implementation blockers

This skill is the execution layer for Stage 6.

---

# Inputs

```json
{
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

# Execution Requirements

Before executing a ticket, verify:

* ticket has `agent_required_skills`
* ticket has `agent_skill_instructions`
* ticket has acceptance criteria
* ticket has validation steps
* frontend tickets with `ui_blueprint_refs` have UI blueprint handoff inputs
* frontend tickets with `visual_spec_refs` include visual requirements and visual acceptance criteria
* frontend tickets with `visual_reference_refs` include selected visual style reference handoff inputs
* frontend tickets with `design_system_refs` include design system handoff inputs
* frontend tickets with `preview_required` include dev server or preview instructions
* frontend tickets include page, component, route, state, and action refs when applicable
* ticket is assigned to an agent or explicitly marked for manual execution
* agent can use the ticket-required skills
* allowed and restricted file scopes are clear
* parallel execution conflicts are resolved or the ticket is in a serial batch

Do not execute blocked tickets.

Do not modify files outside assigned file scopes.

Do not change Stage 5 outputs during Stage 6 execution.

When executing a frontend ticket with `ui_blueprint_refs`, use:

```text
Build-Plans/Stage-4/07-ui-blueprint-specification.json
```

as the source for page structure, layout type, sections, components, shared components, routes, actions, states, data requirements, validation requirements, accessibility requirements, responsive requirements, visual requirements, visual reference requirements, visual acceptance criteria, and design system requirements.

---

# Outputs

```json
{
  "implemented_items": [],
  "implemented_tickets": [],
  "agent_execution_results": [],
  "parallel_batch_results": [
    {
      "batch_id": "",
      "status": "",
      "completed_at": "",
      "recorded_at": "",
      "completed_tickets": [],
      "blocked_tickets": [],
      "failed_tickets": [],
      "validation_gates_passed": [],
      "validation_gates_failed": [],
      "conflicts_detected": [],
      "blocking_failures": [],
      "batch_completion_recorded": false
    }
  ],
  "ui_blueprint_execution_refs": [],
  "visual_spec_execution_refs": [],
  "visual_reference_execution_refs": [],
  "design_system_execution_refs": [],
  "preview_urls": [],
  "artifact_evidence_updates": [],
  "pending_items": [],
  "blocked_items": [],
  "implementation_notes": [],
  "implementation_risks": []
}
```

---

# Shared State Updates

Update:

```text
implementation_status
execution_blockers
active_agents
parallel_batches
interactive_guidance
```

Persist updates to:

```text
Build-Plans/Build-status/Implementation-state.json
```

---

# Validation Responsibilities

Validate:

* every executed ticket maps to a Stage 5 ticket ID
* every executed ticket records the agent or manual executor
* every executed ticket records required skills used
* every executed ticket records changed files when available
* every executed frontend ticket with `ui_blueprint_refs` records the referenced UI blueprint IDs
* every executed frontend ticket with `visual_spec_refs` records the referenced visual spec IDs
* every executed frontend ticket with `visual_reference_refs` records the referenced visual style references
* every executed frontend ticket with `design_system_refs` records the referenced design system IDs
* every executed frontend ticket with `preview_required` records a preview URL or blocker
* every executed frontend ticket preserves referenced page, component, route, action, state, interactive element (with element_type, label, route_target, and behavior), validation, accessibility, responsive, visual, visual reference, and design system requirements
* every generated implementation, preview, build, or log artifact is recorded or queued for `Build-Plans/Build-status/Artifact-evidence-registry.json`
* every blocker includes a reason and next action
* every parallel batch execution records batch status
* every parallel batch result records completion status, completed_at, and recorded_at
