# Global Stage Readiness Audit

# Purpose

The global stage readiness audit verifies that a stage is ready to hand off to the next stage according to:

```text
System-References/Docs/Global-Stage-Workflow-Contract.md
```

This audit is required before any stage may mark itself ready for the next stage.

---

# Audit Skill

Use:

```text
global-stage-readiness-audit
```

The audit validates:

* required output files exist
* output files follow the expected stage schemas
* completion status exists
* global completion status is mapped
* handoff object exists
* handoff contains enough structured data for the next stage
* risks are recorded
* assumptions are recorded
* blockers are explicit
* traceability IDs exist or missing traceability is justified
* artifact references are recorded when evidence exists
* visual and design continuity checks pass when the stage contains frontend-facing work
* stage contract profile requirements are satisfied
* schema validation results are recorded for required outputs
* accepted risks are recorded in the risk acceptance ledger when progression depends on accepted risk
* cross-stage references are valid, not duplicated, and not stale
* failed readiness conditions produce revision-loop records with owning stage, output, skill, and next action

---

# Required Audit Output

Each stage must write:

```text
Build-Plans/Build-status/Stage-X-readiness-audit.json
```

Where `X` is the stage number.

Example:

```text
Build-Plans/Build-status/Stage-5-readiness-audit.json
```

---

# Audit Output Schema

```json
{
  "stage": "",
  "command": "global-stage-readiness-audit",
  "audit_status": "pending",
  "global_workflow_contract": "System-References/Docs/Global-Stage-Workflow-Contract.md",
  "required_files_present": false,
  "schemas_valid": false,
  "completion_status_present": false,
  "global_status_mapped": false,
  "handoff_present": false,
  "handoff_usable": false,
  "risks_recorded": false,
  "assumptions_recorded": false,
  "traceability_present": false,
  "artifacts_recorded": false,
  "stage_contract_profile": {
    "profile_id": "",
    "profile_requirements_checked": false,
    "missing_profile_requirements": []
  },
  "schema_validation": {
    "schema_refs": [],
    "validated_files": [],
    "schema_errors": [],
    "schemas_valid": false,
    "validated_at": "",
    "validator": "",
    "blocking": true
  },
  "reference_integrity": {
    "checked_refs": [],
    "missing_refs": [],
    "orphaned_refs": [],
    "stale_refs": [],
    "duplicate_ids": [],
    "integrity_status": "passed | passed_with_warnings | failed",
    "blocking_ref_errors": []
  },
  "artifact_evidence_registry": {
    "registry_path": "Build-Plans/Build-status/Artifact-evidence-registry.json",
    "required": false,
    "required_artifacts_present": false,
    "missing_artifacts": []
  },
  "risk_acceptance_ledger": {
    "ledger_path": "Build-Plans/Build-status/Risk-acceptance-ledger.json",
    "required": false,
    "accepted_risks_present": false,
    "missing_risk_acceptance_entries": [],
    "expired_or_unowned_risks": []
  },
  "revision_loops": [],
  "visual_design_continuity": {
    "required": false,
    "ui_blueprint_refs_present": false,
    "visual_spec_refs_present": false,
    "design_system_refs_present": false,
    "visual_acceptance_criteria_mapped": false,
    "preview_or_visual_qa_evidence_present": false,
    "design_system_compliance_recorded": false,
    "visual_drift_status_recorded": false,
    "blocking_visual_gaps": []
  },
  "blocking_gaps": [],
  "warnings": [],
  "next_actions": [],
  "ready_for_next_stage": false
}
```

Allowed audit statuses:

```text
passed
passed_with_warnings
failed
blocked
```

---

# Readiness Rule

A stage may use a stage-specific ready status only when:

```text
ready_for_next_stage = true
```

For frontend-facing work, the audit must also enforce the visual and design continuity rules in:

```text
System-References/Docs/Global-Stage-Workflow-Contract.md
```

For evidence-backed readiness claims, the audit must verify related evidence exists in:

```text
Build-Plans/Build-status/Artifact-evidence-registry.json
```

For accepted-risk readiness claims, the audit must verify risk acceptance entries exist in:

```text
Build-Plans/Build-status/Risk-acceptance-ledger.json
```

For every failed or blocked readiness condition, the audit must create a revision-loop object with the owning stage, output, skill, required change, and whether accepted risk is allowed.

If the audit fails, the stage must set completion status to one of:

```text
needs_current_stage_revision
needs_prior_stage_revision
blocked
```

---

# Global Workflow State Update

After each audit, update:

```text
Build-Plans/Build-status/Global-workflow-state.json
```

The workflow state must record:

* stage status
* audit result
* current stage
* blockers
* revision loops
* next recommended action
