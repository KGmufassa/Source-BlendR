# Command — stage-7-launch-operationalization

# Purpose

The `stage-7-launch-operationalization` command orchestrates Stage 7.

It transforms:

* Stage 6 implementation outputs
* Stage 6 system health
* Stage 6 repair and validation evidence
* Stage 6 visual QA and design system compliance evidence
* deployment prerequisites
* operational requirements

into:

* launch readiness model
* deployment framework
* monitoring systems
* analytics framework
* operational tooling model
* Stage 8 handoff

This is the Stage 7 command skill. It is not a single operationalization subskill.

---

# Output Directory

All final Stage 7 outputs must be recorded in:

```text
Build-Plans/Stage-7/
```

The command must create this folder if it does not exist.

---

# Shared Operationalization State

The shared Stage 7 state must be written to:

```text
Build-Plans/Build-status/Operationalization-state.json
```

The command must load this file at the beginning of Stage 7, update it after each operationalization skill runs, and preserve it as durable operationalization state.

---

# Input Contract

Load Stage 6 outputs from:

```text
Build-Plans/Stage-6/
```

Required Stage 6 files:

```text
01-implementation-status.json
02-validation-results.json
03-regression-analysis.json
04-system-health.json
05-repair-log.json
```

Minimum viable input set:

```text
01-implementation-status.json
02-validation-results.json
04-system-health.json
```

---

# Orchestrated Skills

Run Stage 7 skills in this order:

```text
1. launch-readiness-validation
2. deployment-framework-planning
3. monitoring-systems-planning
4. analytics-framework-planning
5. operational-tooling-planning
6. launch-operationalization-synthesis
```

---

# Final Outputs

Generate:

```text
Build-Plans/Stage-7/01-launch-readiness.json
Build-Plans/Stage-7/02-deployment-framework.json
Build-Plans/Stage-7/03-monitoring-systems.json
Build-Plans/Stage-7/04-analytics-framework.json
Build-Plans/Stage-7/05-operational-tooling.json
```

---

# Global Readiness Audit

Before Stage 7 may use `ready_for_stage_8`, run `global-stage-readiness-audit`.

The audit must write:

```text
Build-Plans/Build-status/Stage-7-readiness-audit.json
```

The audit must pass according to:

```text
System-References/Docs/Global-Stage-Workflow-Contract.md
```

If the audit does not pass, do not use `ready_for_stage_8`.

---

# Completion Status Values

```text
ready_for_stage_8
needs_launch_readiness_work
needs_operational_revision
blocked
```

Use `ready_for_stage_8` only when Stage 8 can safely consume launch, monitoring, analytics, support, incident, and operational signal sources.

Stage 7 must not use `ready_for_stage_8` when launch-critical frontend work has unresolved visual QA failures, unresolved design system compliance failures, missing required preview evidence, or `major_visual_drift`, unless each item is explicitly accepted as a known launch risk.

---

# A-Grade Workflow Compliance

Stage 7 must consume `stage_contract_profile` and `guidance_policy`.

Stage 7 must reference:

```text
System-References/Schemas/stage-7-output.schema.json
```

Stage 7 must record production build proof, deployment dry-run evidence, smoke test results, rollback verification, environment verification, monitoring alert proof, and accepted launch risk evidence in:

```text
Build-Plans/Build-status/Artifact-evidence-registry.json
```

Before using `ready_for_stage_8`, Stage 7 must provide `schema_validation`, `reference_integrity`, `risk_acceptance_ledger`, and `revision_loops` in the readiness audit or stage state.

Accepted high and critical launch, deployment, monitoring, analytics, support, or operational risks must be recorded in:

```text
Build-Plans/Build-status/Risk-acceptance-ledger.json
```

Failed readiness checks must become revision-loop actions with owning output, owning skill, required change, and next action.
