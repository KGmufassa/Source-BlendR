# Skill — architecture-synthesis

# Purpose

The `architecture-synthesis` skill combines all Stage 3 architecture intelligence into final architecture outputs.

It produces:

* coherent system topology
* service architecture
* data architecture
* API architecture
* integration architecture
* security foundations
* infrastructure model
* scalability framework
* handoff guidance for Stage 4 and Stage 5

This skill is the final architecture synthesis and handoff engine for Stage 3.

---

# Inputs

```json
{
  "system_topology": {},
  "service_architecture": {},
  "data_architecture": {},
  "api_architecture": {},
  "integration_architecture": {},
  "security_foundations": {},
  "infrastructure_model": {},
  "scalability_framework": {},
  "existing_state": {}
}
```

Read and update shared architecture state from:

```text
Build-Plans/Build-status/Architecture-state.json
```

---

# Core Responsibilities

## Architecture Coherence

Validate:

* service boundaries align with capabilities
* data ownership is clear
* APIs support workflows
* integrations are mapped to dependencies
* infrastructure supports technical feasibility findings
* security controls map to risk validation
* scalability framework supports MVP and future growth

## Tradeoff Documentation

Record:

* major architecture decisions
* alternatives considered
* accepted risks
* deferred architecture concerns
* Stage 4 handoff implications
* Stage 5 execution implications

## Completion Determination

Determine whether Stage 3 is:

```text
ready_for_stage_4
needs_architecture_revision
needs_stage_2_revalidation
blocked
```

---

# Interactive Guidance Responsibilities

This skill should not finalize Stage 3 if architecture-blocking questions remain unresolved.

Before writing final outputs, inspect:

```text
interactive_guidance.open_questions
interactive_guidance.blocked_decisions
interactive_guidance.architecture_confidence_gaps
architecture_risks
open_questions
tradeoffs
```

Classify unresolved guidance items as:

```text
safe_to_assume
needs_user_confirmation
blocks_stage_3_completion
```

Ask the minimum number of final questions needed to complete Stage 3.

Do not ask broad technical preference questions at this stage. Only ask questions tied directly to:

* missing final architecture output fields
* unresolved service boundary decisions
* unresolved data ownership decisions
* unresolved security decisions
* unresolved infrastructure or integration decisions
* architecture risks that block Stage 4 or Stage 5 handoff

If proceeding with assumptions, record them in:

```text
interactive_guidance.assumptions_made
```

If Stage 3 cannot complete, set `completion_status` to one of:

```text
needs_architecture_revision
needs_stage_2_revalidation
blocked
```

and return the specific questions or decisions required.

---

# Outputs

```json
{
  "architecture_outputs": {},
  "architecture_decisions": [],
  "architecture_risks": [],
  "tradeoffs": [],
  "stage_4_handoff": {},
  "stage_5_handoff": {},
  "completion_status": {}
}
```

---

# Final Stage 3 Outputs

Write or update:

```text
Build-Plans/Stage-3/01-system-topology.json
Build-Plans/Stage-3/02-service-architecture.json
Build-Plans/Stage-3/03-data-architecture.json
Build-Plans/Stage-3/04-api-architecture.json
Build-Plans/Stage-3/05-integration-architecture.json
Build-Plans/Stage-3/06-security-foundations.json
Build-Plans/Stage-3/07-infrastructure-model.json
Build-Plans/Stage-3/08-scalability-framework.json
```

Each output must include:

* related Stage 1 source files
* related Stage 2 assumption IDs where applicable
* architecture decisions
* risks and constraints
* unresolved questions
* Stage 4 or Stage 5 handoff notes when relevant

---

# Shared State Updates

Update:

```text
architecture_decisions
architecture_risks
tradeoffs
stage_4_handoff
stage_5_handoff
completion_status
interactive_guidance
```

Persist updates to:

```text
Build-Plans/Build-status/Architecture-state.json
```

---

# Completion Gate

Stage 3 may complete only when:

* all eight architecture outputs exist
* system topology is defined
* service boundaries are clear enough for implementation planning
* data ownership is defined
* API surfaces are mapped to workflows
* integrations and infrastructure are defined
* security foundations are present
* scalability framework exists
* high and critical architecture risks have mitigation paths
* critical interactive guidance questions are answered or converted into recorded assumptions
* no architecture-blocking Stage 2 unknowns remain unresolved

---

# Validation Checklist

Before completing Stage 3, confirm:

* Stage 3 did not redefine product strategy
* Stage 3 did not perform UX screen design
* Stage 3 did not write implementation tickets
* every major capability maps to a system or service
* every core workflow is supported by the architecture
* every data entity has an owner
* every external dependency has an integration strategy
* security and scalability risks are recorded
* critical interactive guidance questions are answered or converted into recorded assumptions
* Stage 4 handoff is usable for UX architecture
* Stage 5 handoff is usable for development orchestration

