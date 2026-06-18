# Skill — product-synthesis

# Purpose

The `product-synthesis` skill is responsible for:

* synthesizing all planning intelligence
* generating normalized product structures
* creating architecture-ready outputs
* organizing operational product topology
* producing final structured planning artifacts

This skill acts as the final operational synthesis and output generation engine of the harness.

---

# Core Responsibilities

## Product Topology Synthesis

Combine:

* workflows
* capabilities
* features
* dependencies
* risks
* MVP structure

into:

* a unified operational product model

---

## Operational Structure Generation

Generate:

* normalized product systems
* organized operational domains
* structured feature architecture
* implementation-aware product definitions

---

## Final Product Model Construction

Construct:

* architecture-ready planning outputs
* operational product blueprints
* structured planning artifacts

---

## Product Coherence Validation

Validate:

* workflow consistency
* capability alignment
* dependency coherence
* MVP completeness
* operational integrity

---

# Interactive Guidance Responsibilities

This skill should not finalize Stage 1 if critical gaps remain unresolved.

Before writing final outputs, inspect:

```text
interactive_guidance.open_questions
interactive_guidance.blocked_decisions
interactive_guidance.confidence_gaps
missing_information
risk_severity
```

If gaps remain, classify them as:

```text
safe_to_assume
needs_user_confirmation
blocks_stage_1_completion
```

Ask the minimum number of final questions needed to complete Stage 1.

Do not ask broad exploratory questions at this stage. Only ask questions tied directly to:

* missing final output fields
* contradictions between skill outputs
* unresolved MVP boundaries
* unresolved dependency or risk decisions
* readiness for Stage 2 validation

If proceeding with assumptions, record them in:

```text
interactive_guidance.assumptions_made
```

If Stage 1 cannot complete, set `completion_status` to one of:

```text
needs_more_product_input
needs_scope_reduction
blocked_by_missing_foundation
```

and return the specific questions or decisions required.

---

## Structured Output Generation

Generate:

* normalized JSON outputs
* operational planning artifacts
* structured system definitions
* implementation-ready product documents

---

# Inputs

```json id="jlwm117"
{
  "product_identity": {},
  "workflows": {},
  "capabilities": {},
  "feature_groups": {},
  "dependencies": {},
  "risks": {},
  "mvp_scope": {},
  "recommendations": {},
  "existing_state": {}
}
```

---

# Outputs

Record this skill's Stage 1 outputs in:

```text
Build-Plans/Stage-1/
```

```json id="jlwm118"
{
  "product_foundation": {},
  "user_system_map": {},
  "workflow_architecture": {},
  "product_capabilities": {},
  "feature_structure": {},
  "product_boundaries": {},
  "dependency_map": {},
  "mvp_operational_model": {},
  "risk_and_constraints": {},
  "success_framework": {}
}
```

Write or update all final Stage 1 output files:

```text
Build-Plans/Stage-1/01-product-foundation.json
Build-Plans/Stage-1/02-user-system-map.json
Build-Plans/Stage-1/03-workflow-architecture.json
Build-Plans/Stage-1/04-product-capabilities.json
Build-Plans/Stage-1/05-feature-structure.json
Build-Plans/Stage-1/06-product-boundaries.json
Build-Plans/Stage-1/07-dependency-map.json
Build-Plans/Stage-1/08-mvp-operational-model.json
Build-Plans/Stage-1/09-risk-and-constraints.json
Build-Plans/Stage-1/10-success-framework.json
```

This skill is the final Stage 1 output aggregator. It should normalize and reconcile outputs from the other Stage 1 skills before writing the final files.

---

# Internal Responsibilities

## Product Normalization

Normalize:

* duplicated workflows
* overlapping systems
* conflicting feature groups
* inconsistent operational structures

---

## Operational Domain Organization

Organize:

* systems
* subsystems
* workflows
* capabilities
* feature hierarchies

---

## Product Blueprint Generation

Generate:

* coherent product topology
* implementation-aware structure
* architecture transition readiness

---

## Artifact Structuring

Create:

* standardized planning outputs
* reusable structured artifacts
* normalized operational definitions

---

# Final Structured Outputs

All final structured Stage 1 outputs must be written to:

```text
Build-Plans/Stage-1/
```

```text id="jlwm119"
01-product-foundation.json
02-user-system-map.json
03-workflow-architecture.json
04-product-capabilities.json
05-feature-structure.json
06-product-boundaries.json
07-dependency-map.json
08-mvp-operational-model.json
09-risk-and-constraints.json
10-success-framework.json
```

---

# Internal Trace Outputs

The shared Stage 1 planning state must be written to:

```text
Build-Plans/Build-status/Planning-state.json
```

Other internal trace outputs for Stage 1 should be written to:

```text
Build-Plans/Stage-1/
```

```text id="jlwm120"
planning-trace.json
recommendation-log.json
gap-analysis.json
inference-log.json
confidence-report.json
```

---

# Shared State Updates

This skill updates:

```text id="jlwm121"
final_outputs
normalized_product_model
product_topology
validation_results
```

---

# Validation Responsibilities

The skill should validate:

* operational completeness
* dependency consistency
* MVP integrity
* workflow continuity
* feature alignment
* capability coherence
* output standardization

---

# Final Role

The `product-synthesis` skill acts as:

```text id="jlwm122"
the final operational synthesis and architecture-ready output engine
```

for the harness.

It transforms:

* fragmented planning intelligence

into:

* coherent operational product systems
* normalized planning artifacts
* structured architecture-ready product definitions.
