# Skill — launch-readiness-validation

# Purpose

The `launch-readiness-validation` skill validates whether the implemented system is ready for launch preparation.

It confirms:

* production readiness
* unresolved launch blockers
* onboarding readiness
* support readiness
* visual QA readiness
* design system compliance readiness
* accepted launch risks

---

# Core Responsibilities

## Readiness Gate Review

Validate:

* implementation status
* validation results
* regression status
* system health
* visual QA results
* responsive validation results
* design system compliance
* visual drift status
* unresolved repair items
* launch-critical risks

## Onboarding And Support Readiness

Identify:

* onboarding gaps
* support gaps
* user-facing setup needs
* operational handoff needs

## Blocker Detection

Record launch blockers with owner, severity, affected systems, required action, and launch impact.

---

# Inputs

```json
{
  "implementation_status": {},
  "validation_results": {},
  "regression_analysis": {},
  "system_health": {},
  "repair_log": {},
  "existing_state": {}
}
```

---

# Outputs

Update shared Stage 7 state in:

```text
Build-Plans/Build-status/Operationalization-state.json
```

Return:

```json
{
  "launch_readiness": {},
  "launch_blockers": [],
  "readiness_gates": [],
  "visual_launch_readiness": {},
  "design_system_launch_readiness": {},
  "deployment_proof_readiness": {},
  "onboarding_gaps": [],
  "support_gaps": []
}
```

Block launch readiness when launch-critical frontend work has:

* missing required preview URL or preview evidence
* unresolved visual QA failures
* unresolved responsive validation failures
* unresolved design system compliance failures
* `major_visual_drift`

These may proceed only when explicitly recorded as accepted launch risks.

Launch readiness must also validate production build proof, deployment dry-run evidence, smoke test evidence, rollback verification, environment verification, and monitoring alert proof when they are required by the active stage contract profile.

This skill contributes to:

```text
Build-Plans/Stage-7/01-launch-readiness.json
```
