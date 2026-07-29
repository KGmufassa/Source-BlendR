---
name: engineering-dependency-planning
description: Map Stage 5 technical prerequisites, dependency edges, serial constraints, parallel groups, blockers, and dependency risk references.
compatibility: opencode
---

# Skill — engineering-dependency-planning

# Purpose

The `engineering-dependency-planning` skill maps engineering dependencies and coordination needs.

It determines:

* technical prerequisites
* cross-workstream dependencies
* sequencing blockers
* shared resources
* coordination risks
* handoff needs

This skill is the dependency and coordination layer for Stage 5.

---

# Inputs

```json
{
  "implementation_sequence": {},
  "service_architecture": {},
  "data_architecture": {},
  "api_architecture": {},
  "integration_architecture": {},
  "screen_system": {},
  "existing_state": {}
}
```

Read and update shared development state from:

```text
Build-Plans/Build-status/Development-state.json
```

---

# Core Responsibilities

## Dependency Mapping

Define:

* service dependencies
* data dependencies
* API dependencies
* integration dependencies
* UX dependencies
* security dependencies
* testing dependencies

## Coordination Planning

Identify:

* parallelizable work
* serial work
* handoff points
* required decisions
* owner domains
* coordination checkpoints

## Dependency Risk Detection

Identify:

* circular dependencies
* unclear ownership
* missing prerequisites
* risky parallelization
* blocked versus unblocked work

---

# Interactive Guidance Responsibilities

Guide the user through dependency and coordination decisions that affect execution order.

Ask targeted questions when any of these are unclear:

* who or what owns a dependency
* whether work can proceed in parallel
* whether a third-party integration blocks core development
* whether data or API work must precede screens
* whether security foundations block user-facing features
* whether testing requires special setup

Infer standard dependency ordering when architecture makes the dependency obvious, but record the assumption in:

```text
interactive_guidance.assumptions_made
```

Pause for user input when dependency uncertainty blocks sequencing or release planning.

---

# Outputs

```json
{
  "data": {
    "engineering_dependencies": {},
    "dependency_graph": [],
    "blocked_work": [],
    "risk_refs": []
  }
}
```

Keep prerequisites, parallelizable groups, and serial constraints inside `engineering_dependencies`. Store dependency edges once in `dependency_graph`; use risk IDs rather than copied risk objects.

---

# Shared State Updates

Update:

```text
engineering_dependencies
coordination_notes
execution_risks
open_questions
interactive_guidance
```

Persist updates to:

```text
Build-Plans/Build-status/Development-state.json
```

---

# Validation Responsibilities

Validate:

* no launch-critical work has an unmapped prerequisite
* parallel workstreams do not share unresolved blockers
* third-party integrations have clear sequencing and fallback paths
* security and testing dependencies are visible before Stage 6
* high or critical dependency risks include mitigation paths
