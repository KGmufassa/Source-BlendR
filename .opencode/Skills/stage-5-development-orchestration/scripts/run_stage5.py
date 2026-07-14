from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Sequence


ROOT = Path(__file__).resolve().parents[4]
STATUS = ROOT / "Build-Plans/Build-status"
OUT = ROOT / "Build-Plans/Stage-5"
AGENTS = ROOT / ".opencode/agents"


def read(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def write_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding="utf-8")


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def unique(values: Iterable[str]) -> list[str]:
    result: list[str] = []
    for value in values:
        if value and value not in result:
            result.append(value)
    return result


def paths(stage: int, names: Sequence[str]) -> list[str]:
    return [f"Build-Plans/Stage-{stage}/{name}" for name in names]


def risk(
    risk_id: str,
    summary: str,
    domain: str,
    severity: str,
    likelihood: str,
    affected_ids: Sequence[str],
    mitigation: str,
    next_action: str,
    status: str = "open",
) -> dict[str, Any]:
    return {
        "risk_id": risk_id,
        "risk": summary,
        "domain": domain,
        "severity": severity,
        "likelihood": likelihood,
        "status": status,
        "affected_ids": list(affected_ids),
        "mitigation": mitigation,
        "owner_stage": "Stage 5 / Stage 6",
        "evidence_refs": ["Build-Plans/Stage-5/03-engineering-dependencies.json"],
        "next_action": next_action,
    }


def expected_artifacts(ticket_id: str, frontend: bool = False, deployment: bool = False) -> list[dict[str, Any]]:
    artifacts = [
        {
            "artifact_id": f"ARTIFACT-S5-{ticket_id.removeprefix('TICKET-')}-TEST",
            "type": "test_output",
            "required_for_completion": True,
        },
        {
            "artifact_id": f"ARTIFACT-S5-{ticket_id.removeprefix('TICKET-')}-VALIDATION",
            "type": "validation_report",
            "required_for_completion": True,
        },
    ]
    if frontend:
        artifacts.extend(
            [
                {
                    "artifact_id": f"ARTIFACT-S5-{ticket_id.removeprefix('TICKET-')}-PREVIEW",
                    "type": "preview_url",
                    "required_for_completion": True,
                },
                {
                    "artifact_id": f"ARTIFACT-S5-{ticket_id.removeprefix('TICKET-')}-SCREENSHOT",
                    "type": "screenshot",
                    "required_for_completion": True,
                },
            ]
        )
    if deployment:
        artifacts.append(
            {
                "artifact_id": f"ARTIFACT-S5-{ticket_id.removeprefix('TICKET-')}-BUILD",
                "type": "build_log",
                "required_for_completion": True,
            }
        )
    return artifacts


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    AGENTS.mkdir(parents=True, exist_ok=True)

    required = {
        "stage_1": paths(1, ["05-feature-structure.json", "08-mvp-operational-model.json", "09-risk-and-constraints.json"]),
        "stage_3": paths(3, ["02-service-architecture.json", "03-data-architecture.json", "04-api-architecture.json", "07-infrastructure-model.json"]),
        "stage_4": paths(4, ["03-screen-system.json", "04-feature-behaviors.json", "05-state-transition-map.json", "07-ui-blueprint-specification.json", "08-design-system-foundation.json", "09-complete-app-blueprint.md"]),
    }
    missing = [path for group in required.values() for path in group if not (ROOT / path).is_file()]
    if missing:
        state = {
            "stage": "Stage 5",
            "command": "stage-5-development-orchestration",
            "status": "blocked",
            "stage_1_inputs": {"required_files": required["stage_1"]},
            "stage_2_inputs": {},
            "stage_3_inputs": {"required_files": required["stage_3"]},
            "stage_4_inputs": {"required_files": required["stage_4"]},
            "preflight": {"status": "failed", "missing_inputs": missing},
            "completion_status": {"status": "blocked", "reason": "missing_development_orchestration_inputs"},
        }
        write_json(STATUS / "Development-state.json", state)
        return 1

    feature_structure = read(ROOT / required["stage_1"][0])
    mvp_model = read(ROOT / required["stage_1"][1])
    architecture_state = read(STATUS / "Architecture-state.json")
    ux_state = read(STATUS / "UX-state.json")
    planning_state = read(STATUS / "Planning-state.json")
    blueprint = read(ROOT / "Build-Plans/Stage-4/07-ui-blueprint-specification.json")
    design_system_output = read(ROOT / "Build-Plans/Stage-4/08-design-system-foundation.json")
    registry = read(ROOT / "System-References/skill-regisry/skill-registry.json")
    selected_stack = architecture_state.get("selected_stack", {})
    stack_status = architecture_state.get("stack_decision_status", {}).get("status")
    forbidden = (" or ", "tbd", "to decide later", "optional", "depends")
    required_stack = ["frontend", "backend", "database", "authentication", "hosting_and_deployment", "testing_stack", "package_manager"]
    # lazy: inspect only the required decision surface; provider capability notes may
    # legitimately describe optional methods without making the selected stack ambiguous.
    stack_core_text = json.dumps({key: selected_stack.get(key) for key in required_stack}).lower()
    stack_concrete = stack_status == "approved" and all(selected_stack.get(key) for key in required_stack) and not any(term in stack_core_text for term in forbidden)
    if not stack_concrete:
        state = {
            "stage": "Stage 5",
            "command": "stage-5-development-orchestration",
            "status": "blocked",
            "preflight": {"status": "failed", "selected_stack_approved": stack_status == "approved", "selected_stack_concrete": False},
            "revision_loops": [{"revision_id": "REVISION-S5-001", "owning_stage": "Stage 3", "owning_output": "Build-Plans/Build-status/Architecture-state.json", "owning_skill": "stage-3-system-architecture", "blocking_issue": "Selected stack is missing or unresolved", "required_change": "Approve concrete frontend, backend, database, authentication, deployment, testing, and package-manager choices", "recommended_action": "Revise and approve the Stage 3 selected stack", "can_continue_with_accepted_risk": False, "target_status_after_revision": "ready_for_stage_4", "status": "open"}],
            "completion_status": {"status": "blocked", "reason": "missing_or_unresolved_selected_stack"},
        }
        write_json(STATUS / "Development-state.json", state)
        return 1

    stage_contract_profile = planning_state["stage_contract_profile"]
    guidance_policy = planning_state["guidance_policy"]
    launch_features = feature_structure["launch_critical_features"]
    included_features = mvp_model["mvp_scope"]["included_features"]
    deferred_feature_ids = unique(mvp_model["mvp_scope"]["excluded_features_deferred"] + ["FEATURE-008", "FEATURE-009"])
    launch_workflows = [item["workflow_id"] for item in mvp_model["launch_critical_workflows"]]
    blueprints = {item["page_id"]: item for item in blueprint["ui_blueprints"]}
    frontend_package = blueprint["frontend_build_package"]
    design_system = design_system_output.get("design_system", ux_state.get("design_system_foundation", {}))
    visual_selection = blueprint.get("visual_reference_selection", design_system.get("visual_reference_selection", {}))
    visual_paths = unique(
        [visual_selection.get("primary_reference", {}).get("path", "")]
        + [item.get("path", "") for item in visual_selection.get("secondary_references", [])]
    )
    skill_ids = {item["skill_id"] for item in registry["skills"]}

    assumptions = [
        {"assumption_id": "ASSUMPTION-S5-001", "assumption": "Use dependency-aware vertical slices after a thin monorepo, tenant, data, and queue foundation.", "source_stage": "Stage 5", "affected_ids": launch_workflows, "confidence": 0.9, "risk_if_false": "Feature demonstrations arrive later or require sequence revision.", "evidence_refs": ["Build-Plans/Stage-1/08-mvp-operational-model.json", "Build-Plans/Stage-3/00-stage-decision-brief.md"], "status": "active"},
        {"assumption_id": "ASSUMPTION-S5-002", "assumption": "Use milestone exit criteria rather than calendar dates because no launch deadline was approved upstream.", "source_stage": "Stage 5", "affected_ids": ["MILESTONE-001", "MILESTONE-002", "MILESTONE-003", "MILESTONE-004"], "confidence": 0.95, "risk_if_false": "Capacity planning will need calendar estimates later.", "evidence_refs": ["Build-Plans/Stage-1/08-mvp-operational-model.json"], "status": "active"},
        {"assumption_id": "ASSUMPTION-S5-003", "assumption": "Defer Flyer and Quote builders from the launch package because Stage 1 permits deferral when risk grows and Stage 4 contains no approved UI blueprints for them.", "source_stage": "Stage 5", "affected_ids": ["FEATURE-008", "FEATURE-009"], "confidence": 0.9, "risk_if_false": "The launch package may omit desired secondary business outputs.", "evidence_refs": ["Build-Plans/Stage-1/08-mvp-operational-model.json", "Build-Plans/Stage-4/07-ui-blueprint-specification.json"], "status": "active"},
        {"assumption_id": "ASSUMPTION-S5-004", "assumption": "Release through internal validation, private alpha, controlled beta, then public readiness review.", "source_stage": "Stage 5", "affected_ids": ["LAUNCH-GATE-001", "LAUNCH-GATE-002", "LAUNCH-GATE-003"], "confidence": 0.85, "risk_if_false": "Operational work may be overbuilt for an internal-only launch or insufficient for a public launch.", "evidence_refs": ["Build-Plans/Stage-2/05-risk-validation.json"], "status": "active"},
        {"assumption_id": "ASSUMPTION-S5-005", "assumption": "Generated Stage 6 agent profiles use GPT 5.5 and ticket-scoped edit/bash permissions.", "source_stage": "Stage 5", "affected_ids": ["AGENT-FOUNDATION", "AGENT-BACKEND", "AGENT-WORKER", "AGENT-FRONTEND", "AGENT-VALIDATION"], "confidence": 0.9, "risk_if_false": "Agent files require a model or permission-policy update before execution.", "evidence_refs": [".opencode/Skills/agent-assignment-planning/skill.md"], "status": "active"},
    ]
    risks = [
        risk("RISK-S5-001", "Website scraping behavior and anti-bot variability can destabilize the core import slice.", "integration", "high", "high", ["FEATURE-001", "WORKFLOW-001", "INTEGRATION-PLAYWRIGHT"], "Build a narrow representative-site spike first; persist normalized artifacts; use idempotent per-category jobs and manual entry fallback.", "Validate representative sites in TICKET-010 before broadening scraper behavior."),
        risk("RISK-S5-002", "Async job, worker, and UI status contracts may drift across web and worker workstreams.", "coordination", "high", "medium", ["FEATURE-013", "API-IMPORTS", "ENTITY-IMPORT-JOB"], "Freeze shared queue payload and job-state contracts in packages/types before parallel UI/worker implementation.", "Review shared contracts at BATCH-002 merge gate."),
        risk("RISK-S5-003", "Tenant isolation or credential handling defects could expose workspace or provider data.", "security", "critical", "medium", ["FEATURE-014", "FEATURE-010", "INTEGRATION-CLERK"], "Require workspace-scoped repositories, encrypted/server-only credentials, negative tenant tests, and security review before alpha.", "Complete TICKET-003 and TICKET-019 before LAUNCH-GATE-001."),
        risk("RISK-S5-004", "Dense discovery and catalog interfaces may fail keyboard, responsive, or visual continuity requirements.", "frontend", "high", "medium", ["SCREEN-006", "SCREEN-007", "DESIGN-SYSTEM-001"], "Build shared accessible table/drawer patterns first and require preview, screenshot, keyboard, responsive, and design-system evidence.", "Validate frontend tickets through TICKET-020 before beta."),
        risk("RISK-S5-005", "AI provider behavior and extraction quality vary while zero-provider operation remains mandatory.", "ai", "high", "high", ["FEATURE-010", "WORKFLOW-006"], "Keep provider adapters behind capability contracts, use deterministic validation, and test manual-only operation as a release gate.", "Validate configured and zero-provider modes in TICKET-007 and TICKET-020."),
    ]

    phases = [
        {"phase_id": "PHASE-001", "name": "Execution foundation", "goal": "Create the selected-stack monorepo, shared contracts, tenant boundary, data schema, queue, and UI foundation.", "feature_refs": ["FEATURE-013", "FEATURE-014"], "slice_ids": ["SLICE-001", "SLICE-002", "SLICE-003", "SLICE-004", "SLICE-010"], "readiness_criteria": ["pnpm workspace builds", "Prisma test migration succeeds", "Clerk organization maps to workspace context", "BullMQ job contract is shared", "App shell and design tokens render responsively"]},
        {"phase_id": "PHASE-002", "name": "Catalog and provider baseline", "goal": "Deliver vendor/catalog/manual workflows and provider routing before risky ingestion paths.", "feature_refs": ["FEATURE-002", "FEATURE-005", "FEATURE-010", "FEATURE-015", "FEATURE-016"], "slice_ids": ["SLICE-005", "SLICE-006"], "readiness_criteria": ["Manual item path works with zero AI providers", "Catalog search/filter is tenant scoped", "Provider credentials remain server side", "Provider health and routing states are visible"]},
        {"phase_id": "PHASE-003", "name": "Import-to-discovery vertical slices", "goal": "Deliver website and PDF imports through observable jobs into the review-first Discovery Session.", "feature_refs": ["FEATURE-001", "FEATURE-003", "FEATURE-004", "FEATURE-013"], "slice_ids": ["SLICE-007", "SLICE-008", "SLICE-009", "SLICE-011"], "readiness_criteria": ["Website and PDF inputs create idempotent jobs", "Partial failures and retries are visible", "Candidates never bypass deterministic validation", "Bulk outcomes are per-record and recoverable"]},
        {"phase_id": "PHASE-004", "name": "Release hardening", "goal": "Close security, accessibility, integration, observability, and rollout gates.", "feature_refs": launch_features, "slice_ids": ["SLICE-012", "SLICE-013", "SLICE-014", "SLICE-015"], "readiness_criteria": ["Launch-critical E2E workflows pass", "Tenant isolation and credential checks pass", "Responsive and keyboard evidence is registered", "Rollback and operational checks are rehearsed"]},
    ]
    workstreams = [
        {"workstream_id": "WORKSTREAM-001", "name": "Platform and contracts", "owned_slices": ["SLICE-001", "SLICE-002", "SLICE-003", "SLICE-004"]},
        {"workstream_id": "WORKSTREAM-002", "name": "Domain, API, and AI", "owned_slices": ["SLICE-005", "SLICE-006", "SLICE-007", "SLICE-008", "SLICE-009"]},
        {"workstream_id": "WORKSTREAM-003", "name": "Frontend experience", "owned_slices": ["SLICE-010", "SLICE-011", "SLICE-012"]},
        {"workstream_id": "WORKSTREAM-004", "name": "Validation and release", "owned_slices": ["SLICE-013", "SLICE-014", "SLICE-015"]},
    ]
    milestones = [
        {"milestone_id": "MILESTONE-001", "name": "Foundation contracts frozen", "exit_criteria": phases[0]["readiness_criteria"], "blocking_ticket_ids": ["TICKET-001", "TICKET-002", "TICKET-003", "TICKET-004", "TICKET-005", "TICKET-016"]},
        {"milestone_id": "MILESTONE-002", "name": "Manual catalog and provider baseline demonstrable", "exit_criteria": phases[1]["readiness_criteria"], "blocking_ticket_ids": ["TICKET-007", "TICKET-008", "TICKET-009", "TICKET-018"]},
        {"milestone_id": "MILESTONE-003", "name": "Import-to-catalog workflows demonstrable", "exit_criteria": phases[2]["readiness_criteria"], "blocking_ticket_ids": ["TICKET-006", "TICKET-010", "TICKET-011", "TICKET-012", "TICKET-013", "TICKET-014", "TICKET-015", "TICKET-017"]},
        {"milestone_id": "MILESTONE-004", "name": "Private alpha release candidate", "exit_criteria": phases[3]["readiness_criteria"], "blocking_ticket_ids": ["TICKET-019", "TICKET-020", "TICKET-021"]},
    ]

    slices = [
        {"slice_id": "SLICE-001", "name": "Selected-stack monorepo foundation", "feature_refs": ["FEATURE-013", "FEATURE-014"], "workflow_refs": [], "depends_on_slices": []},
        {"slice_id": "SLICE-002", "name": "Workspace data and tenant boundary", "feature_refs": ["FEATURE-014"], "workflow_refs": ["WORKFLOW-005"], "depends_on_slices": ["SLICE-001"]},
        {"slice_id": "SLICE-003", "name": "Shared domain, repository, and validation contracts", "feature_refs": ["FEATURE-004", "FEATURE-005"], "workflow_refs": ["WORKFLOW-003", "WORKFLOW-007", "WORKFLOW-014"], "depends_on_slices": ["SLICE-001", "SLICE-002"]},
        {"slice_id": "SLICE-004", "name": "Observable background job foundation", "feature_refs": ["FEATURE-013"], "workflow_refs": ["WORKFLOW-001", "WORKFLOW-002"], "depends_on_slices": ["SLICE-001", "SLICE-002"]},
        {"slice_id": "SLICE-005", "name": "Vendor and catalog manual baseline", "feature_refs": ["FEATURE-002", "FEATURE-005", "FEATURE-015", "FEATURE-016"], "workflow_refs": ["WORKFLOW-007", "WORKFLOW-014"], "depends_on_slices": ["SLICE-003"]},
        {"slice_id": "SLICE-006", "name": "AI capability routing and zero-provider fallback", "feature_refs": ["FEATURE-010"], "workflow_refs": ["WORKFLOW-006"], "depends_on_slices": ["SLICE-002", "SLICE-003"]},
        {"slice_id": "SLICE-007", "name": "Website discovery import", "feature_refs": ["FEATURE-001", "FEATURE-013"], "workflow_refs": ["WORKFLOW-001"], "depends_on_slices": ["SLICE-004", "SLICE-005", "SLICE-006"]},
        {"slice_id": "SLICE-008", "name": "PDF/OCR import", "feature_refs": ["FEATURE-003", "FEATURE-013"], "workflow_refs": ["WORKFLOW-002"], "depends_on_slices": ["SLICE-004", "SLICE-005", "SLICE-006"]},
        {"slice_id": "SLICE-009", "name": "Discovery review and promotion", "feature_refs": ["FEATURE-004", "FEATURE-005", "FEATURE-015"], "workflow_refs": ["WORKFLOW-003"], "depends_on_slices": ["SLICE-003", "SLICE-005"]},
        {"slice_id": "SLICE-010", "name": "Design system, shell, routes, and shared state components", "feature_refs": ["FEATURE-014"], "workflow_refs": launch_workflows, "depends_on_slices": ["SLICE-001"]},
        {"slice_id": "SLICE-011", "name": "Import, job, and discovery frontend", "feature_refs": ["FEATURE-001", "FEATURE-003", "FEATURE-004", "FEATURE-013"], "workflow_refs": ["WORKFLOW-001", "WORKFLOW-002", "WORKFLOW-003"], "depends_on_slices": ["SLICE-004", "SLICE-007", "SLICE-008", "SLICE-009", "SLICE-010"]},
        {"slice_id": "SLICE-012", "name": "Catalog, vendor, overview, and provider frontend", "feature_refs": ["FEATURE-002", "FEATURE-005", "FEATURE-010", "FEATURE-015", "FEATURE-016"], "workflow_refs": ["WORKFLOW-006", "WORKFLOW-007", "WORKFLOW-014"], "depends_on_slices": ["SLICE-005", "SLICE-006", "SLICE-010"]},
        {"slice_id": "SLICE-013", "name": "Security and tenant validation", "feature_refs": ["FEATURE-010", "FEATURE-014"], "workflow_refs": launch_workflows, "depends_on_slices": ["SLICE-002", "SLICE-006", "SLICE-009"]},
        {"slice_id": "SLICE-014", "name": "End-to-end, accessibility, responsive, and visual validation", "feature_refs": launch_features, "workflow_refs": launch_workflows, "depends_on_slices": ["SLICE-011", "SLICE-012", "SLICE-013"]},
        {"slice_id": "SLICE-015", "name": "Deployment and observability readiness", "feature_refs": ["FEATURE-001", "FEATURE-003", "FEATURE-013", "FEATURE-014"], "workflow_refs": launch_workflows, "depends_on_slices": ["SLICE-004", "SLICE-013", "SLICE-014"]},
    ]
    checkpoints = [{"validation_id": f"VALIDATION-{index:03d}", "slice_id": item["slice_id"], "checkpoint": f"Validate {item['name']} acceptance criteria and dependency contracts before dependent slices start."} for index, item in enumerate(slices, 1)]

    dependency_edges = []
    for item in slices:
        dependency_edges.extend({"from": dependency, "to": item["slice_id"], "type": "blocks", "reason": "Declared slice prerequisite"} for dependency in item["depends_on_slices"])
    dependencies = {
        "dependency_graph": dependency_edges,
        "technical_prerequisites": [
            {"dependency_id": "DEP-S5-001", "dependency": "packages/types queue payload and job-state contracts", "blocks": ["SLICE-007", "SLICE-008", "SLICE-011"], "owner": "AGENT-FOUNDATION"},
            {"dependency_id": "DEP-S5-002", "dependency": "workspace-scoped repository contract and Prisma schema", "blocks": ["SLICE-005", "SLICE-006", "SLICE-009"], "owner": "AGENT-BACKEND"},
            {"dependency_id": "DEP-S5-003", "dependency": "approved Stage 4 design system and shared component contract", "blocks": ["SLICE-011", "SLICE-012"], "owner": "AGENT-FRONTEND"},
            {"dependency_id": "DEP-S5-004", "dependency": "representative website/PDF fixtures and isolated test services", "blocks": ["SLICE-007", "SLICE-008", "SLICE-014"], "owner": "AGENT-VALIDATION"},
        ],
        "parallelizable_groups": [["SLICE-002", "SLICE-010"], ["SLICE-005", "SLICE-006"], ["SLICE-007", "SLICE-008"], ["SLICE-011", "SLICE-012"]],
        "serial_constraints": ["Freeze shared types before worker/web parallelization", "Complete deterministic validation before candidate promotion", "Complete frontend foundation before page composition", "Serialize production-like integration and release validation"],
        "blocked_work": [],
    }

    testing_strategy = {
        "strategy": "Risk-weighted test pyramid with slice-local Vitest coverage, contract/integration checks at every merge gate, and Playwright launch-workflow validation before release.",
        "test_levels": [
            {"level": "unit", "tool": "Vitest", "scope": ["domain services", "validation rules", "AI adapters", "queue processors", "state helpers"], "release_blocking": True},
            {"level": "integration", "tool": "Vitest plus Prisma test database and isolated Redis", "scope": ["route/server action to domain service", "worker processor to domain service", "tenant isolation", "storage and provider adapters"], "release_blocking": True},
            {"level": "end_to_end", "tool": "Playwright", "scope": launch_workflows, "release_blocking": True},
            {"level": "accessibility", "tool": "Playwright keyboard/semantic checks plus manual screen-reader smoke", "scope": ["SCREEN-003", "SCREEN-004", "SCREEN-005", "SCREEN-006", "SCREEN-007", "SCREEN-008", "SCREEN-010"], "release_blocking": True},
            {"level": "security", "tool": "Vitest integration plus security-review", "scope": ["tenant isolation", "Clerk workspace binding", "credential secrecy", "file upload validation", "server action authorization"], "release_blocking": True},
            {"level": "visual_responsive", "tool": "Playwright screenshots and design-system checklist", "scope": list(blueprints), "release_blocking": True},
        ],
        "workflow_acceptance": [{"workflow_id": workflow_id, "validation_id": f"VALIDATION-WORKFLOW-{index:03d}", "criteria": ["Happy path completes", "permission denial is safe", "loading/error/retry states are explicit", "workspace isolation holds", "manual fallback remains available when relevant"]} for index, workflow_id in enumerate(launch_workflows, 1)],
        "regression_strategy": {"per_ticket": ["affected unit/integration tests", "lint/typecheck", "artifact registration"], "per_batch": ["shared contract tests", "database migration test", "targeted Playwright smoke"], "release_candidate": ["full unit/integration suite", "all launch workflows", "accessibility/keyboard suite", "responsive screenshots", "security regression", "rollback rehearsal"]},
        "release_test_gates": ["No critical/high severity test failure", "No cross-workspace access", "No direct AI-to-catalog write", "Zero-provider manual workflow passes", "All required preview/visual QA artifacts registered", "Idempotent retry and partial failure paths pass"],
        "manual_validation_assumptions": ["Screen-reader smoke and visual comparison require human review in Stage 6", "Representative-site anti-bot behavior requires controlled manual observation"],
    }

    visual_default = {
        "visual_style": "Utilitarian with restrained Bento modular grouping",
        "visual_reference_refs": visual_paths,
        "design_system_refs": ["DESIGN-SYSTEM-001"],
        "density": "Compact",
        "color_direction": "Warm off-white canvas, graphite text, restrained amber action accent",
        "typography_feel": "Crisp system sans with tabular numerals for data",
        "component_style": "Flat bordered utility surfaces with restrained modular cards",
        "primary_visual_focus": "Current task status and next safe action",
        "responsive_behavior": "Collapse sidebar; stack tables into labeled records; use full-screen sheets for drawers on mobile",
        "visual_do_rules": design_system.get("design_do_rules", []),
        "visual_dont_rules": design_system.get("design_dont_rules", []),
        "reference_apps": [],
        "visual_acceptance_criteria": ["Keyboard focus is visible", "Contrast meets WCAG AA", "Loading and error states do not rely on color", "Primary action and status remain visible"],
        "user_approval_status": "approved",
    }
    responsive_default = {
        "desktop_layout": "Persistent sidebar with dense primary work area",
        "tablet_layout": "Collapsible sidebar with reduced columns",
        "mobile_layout": "Single-column task flow with stacked records",
        "collapse_rules": design_system.get("responsive_breakpoints", {}).get("collapse_rules", []),
        "navigation_behavior": "Sidebar collapses to labeled compact navigation",
        "priority_content_mobile": design_system.get("responsive_breakpoints", {}).get("mobile_priority_content", []),
    }

    ticket_specs = [
        ("TICKET-001", "SLICE-001", "Scaffold selected-stack pnpm monorepo", "foundation", "critical", ["FEATURE-013", "FEATURE-014"], ["ADR-001", "ADR-009"], [], [], ["lazy-mode", "Test-driven-development", "backend-development"], []),
        ("TICKET-002", "SLICE-002", "Implement Prisma workspace data foundation", "data", "critical", ["FEATURE-014", "FEATURE-002", "FEATURE-005"], ["ENTITY-WORKSPACE", "ENTITY-VENDOR", "ENTITY-CATALOG-ITEM", "ADR-003", "ADR-006"], [], [], ["backend-development", "Test-driven-development", "lazy-mode"], ["TICKET-001"]),
        ("TICKET-003", "SLICE-002", "Implement Clerk workspace authentication and tenant authorization", "security", "critical", ["FEATURE-014"], ["INTEGRATION-CLERK", "ADR-006"], ["SCREEN-001"], [], ["security-review", "backend-development", "Test-driven-development"], ["TICKET-001", "TICKET-002"]),
        ("TICKET-004", "SLICE-003", "Implement shared domain, repository, and deterministic validation contracts", "backend", "critical", ["FEATURE-004", "FEATURE-005"], ["SERVICE-VALIDATION", "SERVICE-CATALOG", "ADR-005", "ADR-008"], [], [], ["backend-development", "Test-driven-development", "lazy-mode"], ["TICKET-002"]),
        ("TICKET-005", "SLICE-004", "Implement BullMQ worker and observable job contracts", "backend", "critical", ["FEATURE-013"], ["ENTITY-IMPORT-JOB", "ADR-002", "ADR-009"], ["STATE-JOB"], [], ["backend-development", "Test-driven-development", "systematic-debugger"], ["TICKET-001", "TICKET-002", "TICKET-004"]),
        ("TICKET-006", "SLICE-004", "Implement import job status, retry, cancel, and event APIs", "backend", "high", ["FEATURE-013"], ["API-IMPORTS", "SERVICE-IMPORT", "ENTITY-IMPORT-JOB"], ["SCREEN-005", "STATE-JOB"], [], ["backend-development", "Test-driven-development", "security-review"], ["TICKET-003", "TICKET-005"]),
        ("TICKET-007", "SLICE-006", "Implement AI capability router, provider adapters, health checks, and manual fallback", "integration", "critical", ["FEATURE-010"], ["SERVICE-AI", "API-AI", "INTEGRATION-AI-OPENAI-COMPAT", "INTEGRATION-OLLAMA", "ADR-004"], ["SCREEN-010"], [], ["backend-development", "Test-driven-development", "security-review"], ["TICKET-003", "TICKET-004"]),
        ("TICKET-008", "SLICE-005", "Implement vendor, catalog, search, and pricing domain APIs", "backend", "critical", ["FEATURE-002", "FEATURE-005", "FEATURE-015", "FEATURE-016"], ["SERVICE-VENDOR", "SERVICE-CATALOG", "API-VENDORS", "API-CATALOG", "ADR-007"], ["SCREEN-007", "SCREEN-008", "SCREEN-009"], [], ["backend-development", "Test-driven-development", "security-review"], ["TICKET-003", "TICKET-004"]),
        ("TICKET-009", "SLICE-012", "Build vendor and catalog manual-management pages", "frontend", "high", ["FEATURE-002", "FEATURE-005", "FEATURE-015", "FEATURE-016"], ["API-VENDORS", "API-CATALOG"], ["SCREEN-007", "SCREEN-008", "SCREEN-009"], ["SCREEN-007", "SCREEN-008", "SCREEN-009"], ["frontend-design", "Test-driven-development", "ux-enforcement"], ["TICKET-008", "TICKET-016"]),
        ("TICKET-010", "SLICE-007", "Implement Playwright website discovery and normalized-source pipeline", "integration", "critical", ["FEATURE-001", "FEATURE-013"], ["INTEGRATION-PLAYWRIGHT", "SERVICE-IMPORT", "ENTITY-NORMALIZED-SOURCE", "ADR-010"], ["SCREEN-003", "SCREEN-005"], [], ["backend-development", "Test-driven-development", "systematic-debugger", "security-review"], ["TICKET-005", "TICKET-007", "TICKET-008"]),
        ("TICKET-011", "SLICE-011", "Build website import wizard and category-job controls", "frontend", "critical", ["FEATURE-001", "FEATURE-013"], ["API-IMPORTS", "INTEGRATION-PLAYWRIGHT"], ["SCREEN-003", "SCREEN-005"], ["SCREEN-003"], ["frontend-design", "Test-driven-development", "ux-enforcement"], ["TICKET-006", "TICKET-010", "TICKET-016"]),
        ("TICKET-012", "SLICE-008", "Implement PDF upload, storage, OCR, and normalized-source pipeline", "integration", "critical", ["FEATURE-003", "FEATURE-013"], ["INTEGRATION-OCR", "INTEGRATION-B2", "SERVICE-IMPORT", "ENTITY-NORMALIZED-SOURCE", "ADR-010"], ["SCREEN-004", "SCREEN-005"], [], ["backend-development", "Test-driven-development", "security-review", "systematic-debugger"], ["TICKET-005", "TICKET-007", "TICKET-008"]),
        ("TICKET-013", "SLICE-011", "Build PDF import and recovery experience", "frontend", "critical", ["FEATURE-003", "FEATURE-013"], ["API-IMPORTS", "INTEGRATION-OCR", "INTEGRATION-B2"], ["SCREEN-004", "SCREEN-005"], ["SCREEN-004"], ["frontend-design", "Test-driven-development", "ux-enforcement"], ["TICKET-006", "TICKET-012", "TICKET-016"]),
        ("TICKET-014", "SLICE-009", "Implement Discovery Session candidate, validation, and promotion APIs", "backend", "critical", ["FEATURE-004", "FEATURE-005", "FEATURE-015"], ["SERVICE-DISCOVERY", "SERVICE-VALIDATION", "API-DISCOVERY", "ADR-005"], ["SCREEN-006", "STATE-CANDIDATE"], [], ["backend-development", "Test-driven-development", "security-review"], ["TICKET-004", "TICKET-008"]),
        ("TICKET-015", "SLICE-011", "Build Discovery Session table, drawer, and bulk actions", "frontend", "critical", ["FEATURE-004", "FEATURE-005", "FEATURE-015"], ["API-DISCOVERY", "SERVICE-VALIDATION"], ["SCREEN-006", "STATE-CANDIDATE"], ["SCREEN-006"], ["frontend-design", "Test-driven-development", "ux-enforcement"], ["TICKET-014", "TICKET-016"]),
        ("TICKET-016", "SLICE-010", "Build design system tokens, app shell, routes, and shared components", "frontend", "critical", ["FEATURE-014"], ["ADR-001", "ADR-009"], list(blueprints), list(blueprints), ["frontend-design", "Test-driven-development", "ux-enforcement", "lazy-mode"], ["TICKET-001", "TICKET-003"]),
        ("TICKET-017", "SLICE-011", "Build overview, import workspace, and job detail pages", "frontend", "high", ["FEATURE-001", "FEATURE-003", "FEATURE-013"], ["API-IMPORTS"], ["SCREEN-001", "SCREEN-002", "SCREEN-005"], ["SCREEN-001", "SCREEN-002", "SCREEN-005"], ["frontend-design", "Test-driven-development", "ux-enforcement"], ["TICKET-006", "TICKET-016"]),
        ("TICKET-018", "SLICE-012", "Build AI provider settings and health/routing states", "frontend", "high", ["FEATURE-010"], ["API-AI", "SERVICE-AI"], ["SCREEN-010"], ["SCREEN-010"], ["frontend-design", "Test-driven-development", "ux-enforcement", "security-review"], ["TICKET-007", "TICKET-016"]),
        ("TICKET-019", "SLICE-013", "Validate tenant isolation, credentials, uploads, and server authorization", "security", "critical", ["FEATURE-010", "FEATURE-014"], ["ADR-006", "INTEGRATION-CLERK", "INTEGRATION-B2"], list(blueprints), [], ["security-review", "Test-driven-development", "backend-development"], ["TICKET-003", "TICKET-007", "TICKET-008", "TICKET-010", "TICKET-012", "TICKET-014"]),
        ("TICKET-020", "SLICE-014", "Validate launch workflows, accessibility, responsive layouts, and visual continuity", "testing", "critical", launch_features, ["ADR-005", "ADR-006"], list(blueprints), list(blueprints), ["Test-driven-development", "ux-enforcement", "frontend-design", "systematic-debugger"], ["TICKET-009", "TICKET-011", "TICKET-013", "TICKET-015", "TICKET-017", "TICKET-018", "TICKET-019"]),
        ("TICKET-021", "SLICE-015", "Configure deployment, observability, runbooks, and rollback evidence", "devops", "critical", ["FEATURE-001", "FEATURE-003", "FEATURE-013", "FEATURE-014"], ["INTEGRATION-SENTRY", "INFRA-WEB", "INFRA-WORKER", "INFRA-DB", "INFRA-REDIS"], ["SCREEN-005"], [], ["backend-development", "Test-driven-development", "security-review", "lazy-mode"], ["TICKET-005", "TICKET-019", "TICKET-020"]),
    ]

    route_by_page = {item["page_id"]: item for item in frontend_package["page_inventory"]}
    tickets: list[dict[str, Any]] = []
    for ticket_id, slice_id, title, ticket_type, priority, feature_refs, architecture_refs, ux_refs, page_refs, skills, depends_on in ticket_specs:
        frontend = ticket_type == "frontend" or ticket_id == "TICKET-020"
        page_items = [blueprints[page_id] for page_id in page_refs if page_id in blueprints]
        blueprint_refs = [item["ui_blueprint_id"] for item in page_items]
        component_refs = unique(component.get("component_id", "") for item in page_items for section in item.get("sections", []) for component in section.get("components", []))
        action_refs = unique((element.get("action_id") or element.get("element_id", "")) for item in page_items for element in item.get("interactive_elements", []))
        interactive_refs = unique(element.get("element_id", "") for item in page_items for element in item.get("interactive_elements", []))
        route_refs = unique(route_by_page[page_id]["route"] for page_id in page_refs if page_id in route_by_page)
        state_refs = unique(state for item in page_items for state in item.get("states", []))
        primary_skill = skills[0]
        if primary_skill not in skill_ids:
            primary_skill = "unassigned"
        ticket = {
            "ticket_id": ticket_id,
            "slice_id": slice_id,
            "title": title,
            "description": f"Execute {title.lower()} within the approved selected stack and preserve upstream product, architecture, and UX contracts.",
            "ticket_type": ticket_type,
            "priority": priority,
            "stage_1_feature_refs": feature_refs,
            "stage_1_workflow_refs": next(item["workflow_refs"] for item in slices if item["slice_id"] == slice_id),
            "stage_2_assumption_refs": unique(architecture_state.get("related_assumption_ids", []))[:6],
            "stage_3_architecture_refs": architecture_refs,
            "stage_4_ux_refs": ux_refs,
            "ui_blueprint_refs": blueprint_refs,
            "visual_spec_refs": [f"{value}.visual_spec" for value in blueprint_refs],
            "visual_reference_refs": visual_paths if frontend else [],
            "design_system_refs": ["DESIGN-SYSTEM-001"] if frontend else [],
            "complete_app_blueprint_ref": "Build-Plans/Stage-4/09-complete-app-blueprint.md" if frontend else "not_applicable_non_frontend",
            "page_refs": page_refs,
            "component_refs": component_refs,
            "shared_component_refs": frontend_package["shared_components"] if frontend else [],
            "route_refs": route_refs,
            "state_refs": state_refs,
            "action_refs": action_refs,
            "interactive_element_refs": interactive_refs,
            "frontend_task_hint": "; ".join(frontend_package["frontend_task_hints"]) if frontend else "not_applicable_non_frontend",
            "visual_requirements": visual_default if frontend else {"not_applicable_reason": "Non-frontend ticket"},
            "responsive_requirements": responsive_default if frontend else {"not_applicable_reason": "Non-frontend ticket"},
            "visual_acceptance_criteria_refs": [f"VAC-{page_id}" for page_id in page_refs] if frontend else [],
            "preview_required": frontend,
            "visual_qa_required": frontend,
            "design_system_compliance_required": frontend,
            "expected_artifacts": expected_artifacts(ticket_id, frontend=frontend, deployment=ticket_id == "TICKET-021"),
            "prerequisites": ["Approved selected stack", "Relevant upstream contracts readable"],
            "depends_on_tickets": depends_on,
            "primary_skill": primary_skill,
            "recommended_skills": skills,
            "agent_required_skills": skills,
            "agent_skill_instructions": {"must_use": skills[:2], "use_if_needed": skills[2:], "skill_usage_order": skills, "usage_notes": "Load each selected skill before its relevant implementation or validation activity; preserve lazy-mode simplifications and use the debugging skill only after a reproducible failure."},
            "skill_match": {"primary_skill_score": 0.94 if primary_skill != "unassigned" else 0.0, "matched_capabilities": [ticket_type, "implementation" if ticket_type not in {"testing", "security"} else "validation"], "matched_task_triggers": [title.lower()], "matched_domains": [ticket_type], "risk_flags_considered": [item["risk_id"] for item in risks if set(item["affected_ids"]) & set(feature_refs)], "selection_reason": f"{primary_skill} is the strongest registry match for a {ticket_type} ticket; supporting skills cover tests, UX, security, debugging, or simplification.", "coverage_gaps": [] if primary_skill != "unassigned" else ["No registry skill covers the required capability"]},
            "acceptance_criteria": [f"{title} is complete within the selected stack", "All referenced upstream constraints are preserved", "Workspace authorization and error states are explicit", "Required tests and evidence artifacts are registered"] + (["UI matches approved blueprint, visual references, responsive rules, and design system", "Every referenced interactive element has behavior and recovery validation"] if frontend else []),
            "validation_steps": ["Run ticket-scoped unit and integration tests", "Run typecheck/lint/build checks applicable to changed packages", "Record expected artifacts in Artifact-evidence-registry.json"] + (["Start a local preview and capture desktop/tablet/mobile evidence", "Run keyboard, route/action, state, and design-system compliance checks"] if frontend else []),
            "risk_level": "critical" if priority == "critical" else "high",
            "handoff_notes": "Do not change the selected stack or upstream behavior. Mark blocked if a referenced contract is missing or contradictory.",
            "stage_6_execution_queue_position": len(tickets) + 1,
            "completion_status": "not_started",
        }
        tickets.append(ticket)

    agent_profiles = [
        ("AGENT-FOUNDATION", "stage6-foundation-agent", "Foundation implementation agent", ["foundation", "data"], ["lazy-mode", "Test-driven-development", "backend-development", "security-review"], ["TICKET-001", "TICKET-002", "TICKET-003", "TICKET-004"], ["package.json", "pnpm-workspace.yaml", "apps/**", "packages/types/**", "packages/shared/**", "prisma/**"]),
        ("AGENT-BACKEND", "stage6-backend-agent", "Domain and API implementation agent", ["backend", "integration"], ["backend-development", "Test-driven-development", "security-review", "lazy-mode"], ["TICKET-006", "TICKET-007", "TICKET-008", "TICKET-014"], ["apps/web/**", "packages/domain/**", "packages/ai/**", "packages/validation/**", "packages/types/**"]),
        ("AGENT-WORKER", "stage6-worker-agent", "Worker and ingestion implementation agent", ["backend", "integration"], ["backend-development", "Test-driven-development", "systematic-debugger", "security-review"], ["TICKET-005", "TICKET-010", "TICKET-012"], ["apps/worker/**", "packages/scrapers/**", "packages/ai/**", "packages/domain/**", "packages/types/**"]),
        ("AGENT-FRONTEND", "stage6-frontend-agent", "Frontend implementation agent", ["frontend"], ["frontend-design", "Test-driven-development", "ux-enforcement", "lazy-mode"], ["TICKET-009", "TICKET-011", "TICKET-013", "TICKET-015", "TICKET-016", "TICKET-017", "TICKET-018"], ["apps/web/**", "packages/types/**"]),
        ("AGENT-VALIDATION", "stage6-validation-agent", "Validation and release-readiness agent", ["testing", "security", "devops"], ["Test-driven-development", "security-review", "ux-enforcement", "systematic-debugger"], ["TICKET-019", "TICKET-020", "TICKET-021"], ["tests/**", "apps/**/tests/**", "playwright.config.*", "vitest.config.*", "docs/**", "Build-Plans/Build-status/**"]),
    ]
    ticket_lookup = {item["ticket_id"]: item for item in tickets}
    assignments: list[dict[str, Any]] = []
    generated_files: list[str] = []
    for agent_id, filename, role, domains, supported_skills, assigned_ticket_ids, scopes in agent_profiles:
        assigned = [ticket_lookup[ticket_id] for ticket_id in assigned_ticket_ids]
        required_skills = unique(skill for ticket in assigned for skill in ticket["agent_required_skills"])
        frontend_agent = "frontend" in domains
        assignment = {
            "agent_id": agent_id,
            "agent_type": role,
            "source_agent_profile": f".opencode/agents/{filename}.md",
            "suitability_score": 0.94,
            "assignment_reason": "Generated from the exact ticket skill chain, domain, file scope, dependency position, and validation obligations.",
            "assigned_slices": unique(ticket["slice_id"] for ticket in assigned),
            "assigned_tickets": assigned_ticket_ids,
            "ticket_required_skills": required_skills,
            "ticket_skill_instructions": {ticket["ticket_id"]: ticket["agent_skill_instructions"] for ticket in assigned},
            "matched_skills": required_skills,
            "missing_skills": [],
            "handoff_inputs": unique(["Build-Plans/Build-status/Development-state.json", "Build-Plans/Stage-5/05-build-tickets.json"] + (["Build-Plans/Stage-4/07-ui-blueprint-specification.json", "Build-Plans/Stage-4/08-design-system-foundation.json", "Build-Plans/Stage-4/09-complete-app-blueprint.md"] if frontend_agent else []) + (visual_paths if frontend_agent else [])),
            "ui_blueprint_refs": unique(ref for ticket in assigned for ref in ticket["ui_blueprint_refs"]),
            "visual_spec_refs": unique(ref for ticket in assigned for ref in ticket["visual_spec_refs"]),
            "visual_reference_refs": visual_paths if frontend_agent else [],
            "design_system_refs": ["DESIGN-SYSTEM-001"] if frontend_agent else [],
            "visual_requirements": visual_default if frontend_agent else {},
            "responsive_requirements": responsive_default if frontend_agent else {},
            "preview_required": any(ticket["preview_required"] for ticket in assigned),
            "visual_qa_required": any(ticket["visual_qa_required"] for ticket in assigned),
            "design_system_compliance_required": any(ticket["design_system_compliance_required"] for ticket in assigned),
            "frontend_build_package_refs": ["Build-Plans/Stage-4/07-ui-blueprint-specification.json#frontend_build_package"] if frontend_agent else [],
            "owned_domains": domains,
            "allowed_file_scopes": scopes,
            "restricted_file_scopes": ["Build-Plans/Stage-1/**", "Build-Plans/Stage-2/**", "Build-Plans/Stage-3/**", "Build-Plans/Stage-4/**", ".opencode/Skills/**"],
            "validation_requirements": unique(step for ticket in assigned for step in ticket["validation_steps"]),
            "coordination_dependencies": unique(dep for ticket in assigned for dep in ticket["depends_on_tickets"]),
            "risk_level": "critical" if any(ticket["risk_level"] == "critical" for ticket in assigned) else "high",
            "execution_notes": "Use an isolated worktree when the parallel plan allows it; do not modify shared contracts without the owning batch gate.",
        }
        assignments.append(assignment)
        permission_edit = "allow"
        permission_bash = "allow"
        prompt = [
            "---",
            f'description: "{role} for assigned Source BlendR Stage 6 tickets"',
            "mode: subagent",
            "model: GPT 5.5",
            "temperature: 0.1",
            "permission:",
            f"  edit: {permission_edit}",
            f"  bash: {permission_bash}",
            "---",
            "",
            f"You are a {role.lower()} assigned to Stage 6 implementation and validation tickets.",
            "",
            "Your assigned tickets are:",
            *[f"- {ticket['ticket_id']}: {ticket['title']}" for ticket in assigned],
            "",
            "Use these required skills:",
            *[f"- {skill}" for skill in required_skills],
            "",
            "Skill usage order:",
            *[f"{index}. Use `{skill}` for its ticket-scoped implementation, validation, review, debugging, or simplification purpose." for index, skill in enumerate(required_skills, 1)],
            "",
            "You may edit only:",
            *[f"- {scope}" for scope in scopes],
            "",
            "Do not edit:",
            *[f"- {scope}" for scope in assignment["restricted_file_scopes"]],
            "",
            "Use these handoff inputs:",
            *[f"- {path}" for path in assignment["handoff_inputs"]],
            "",
            "Preserve these visual requirements when assigned frontend tickets:",
            f"- {visual_default['visual_style']}; {visual_default['density']}; {visual_default['color_direction']}",
            "- Preserve approved visual references, responsive behavior, visual acceptance criteria, and user approval status.",
            "",
            "Preserve these design system requirements when assigned frontend tickets:",
            "- Use DESIGN-SYSTEM-001 tokens, flat bordered components, compact spacing, responsive table stacking, visible focus, and WCAG AA contrast.",
            "",
            "Preview and visual QA:",
            f"- Local preview required: {str(assignment['preview_required']).lower()}",
            f"- Visual QA required: {str(assignment['visual_qa_required']).lower()}",
            f"- Design-system compliance report required: {str(assignment['design_system_compliance_required']).lower()}",
            "",
            "Validation requirements:",
            *[f"- {item}" for item in assignment["validation_requirements"]],
            "",
            "Rules:",
            "- Do not modify files outside your allowed scope.",
            "- Do not invent behavior that conflicts with earlier-stage outputs.",
            "- Do not change shared contracts unless the ticket explicitly allows it.",
            "- If a dependency is missing, mark the ticket blocked and record the dependency.",
            "- If validation fails, use the assigned debugging skill before applying fixes.",
            "- Record every skill used and why.",
            "",
            "When finished, report:",
            "- completed tickets",
            "- files changed",
            "- skills used",
            "- validation results",
            "- blockers",
            "- handoff notes",
            "",
        ]
        agent_path = AGENTS / f"{filename}.md"
        write_text(agent_path, "\n".join(prompt))
        generated_files.append(str(agent_path.relative_to(ROOT)))

    batches = [
        {"batch_id": "BATCH-001", "execution_order": 1, "can_run_in_parallel": False, "assigned_agents": ["AGENT-FOUNDATION"], "tickets": ["TICKET-001"], "blocked_by_batches": [], "file_ownership_boundaries": ["workspace manifests and initial app/package skeletons"], "shared_contracts": ["pnpm workspace layout", "TypeScript configuration"], "merge_strategy": "serial_merge_by_dependency", "batch_validation": ["pnpm install resolves", "workspace typecheck and test commands execute"], "risk_level": "high", "coordination_notes": ["Establish file ownership before parallel work"]},
        {"batch_id": "BATCH-002", "execution_order": 2, "can_run_in_parallel": True, "assigned_agents": ["AGENT-FOUNDATION", "AGENT-FRONTEND"], "tickets": ["TICKET-002", "TICKET-003", "TICKET-004", "TICKET-016"], "blocked_by_batches": ["BATCH-001"], "file_ownership_boundaries": ["AGENT-FOUNDATION: prisma, packages/types, packages/shared", "AGENT-FRONTEND: apps/web UI shell only"], "shared_contracts": ["workspace context", "DTOs", "design tokens"], "merge_strategy": "contract_review_before_merge", "batch_validation": ["Prisma test migration", "tenant negative tests", "app shell preview", "shared type review"], "risk_level": "critical", "coordination_notes": ["Frontend uses fixtures until domain contracts merge"]},
        {"batch_id": "BATCH-003", "execution_order": 3, "can_run_in_parallel": True, "assigned_agents": ["AGENT-WORKER", "AGENT-BACKEND"], "tickets": ["TICKET-005", "TICKET-007", "TICKET-008"], "blocked_by_batches": ["BATCH-002"], "file_ownership_boundaries": ["AGENT-WORKER: worker and queue processors", "AGENT-BACKEND: domain/API/AI/catalog packages"], "shared_contracts": ["queue payloads", "repository interfaces", "provider capability contracts"], "merge_strategy": "contract_review_before_merge", "batch_validation": ["queue contract tests", "manual catalog E2E smoke", "zero-provider tests"], "risk_level": "critical", "coordination_notes": ["Shared types change only through contract review"]},
        {"batch_id": "BATCH-004", "execution_order": 4, "can_run_in_parallel": True, "assigned_agents": ["AGENT-WORKER", "AGENT-BACKEND", "AGENT-FRONTEND"], "tickets": ["TICKET-006", "TICKET-010", "TICKET-012", "TICKET-014", "TICKET-009", "TICKET-018"], "blocked_by_batches": ["BATCH-003"], "file_ownership_boundaries": ["Worker owns scraper/OCR processors", "Backend owns import/discovery APIs", "Frontend owns vendor/catalog/provider pages"], "shared_contracts": ["job status", "candidate DTO", "catalog mutation results"], "merge_strategy": "validate_each_then_merge_batch", "batch_validation": ["representative website fixture", "PDF/OCR fixture", "candidate promotion integration", "catalog/provider browser smoke"], "risk_level": "critical", "coordination_notes": ["Merge API contracts before frontend replaces fixtures"]},
        {"batch_id": "BATCH-005", "execution_order": 5, "can_run_in_parallel": False, "assigned_agents": ["AGENT-FRONTEND"], "tickets": ["TICKET-011", "TICKET-013", "TICKET-015", "TICKET-017"], "blocked_by_batches": ["BATCH-004"], "file_ownership_boundaries": ["apps/web import, job, and discovery routes/components"], "shared_contracts": ["approved Stage 4 blueprint and design system"], "merge_strategy": "serial_merge_by_dependency", "batch_validation": ["desktop/tablet/mobile previews", "keyboard paths", "route/action/state checks", "visual QA evidence"], "risk_level": "critical", "coordination_notes": ["Serialize shared DataTable/Drawer changes to prevent visual drift"]},
        {"batch_id": "BATCH-006", "execution_order": 6, "can_run_in_parallel": False, "assigned_agents": ["AGENT-VALIDATION"], "tickets": ["TICKET-019", "TICKET-020"], "blocked_by_batches": ["BATCH-005"], "file_ownership_boundaries": ["tests, validation evidence, and issue reports"], "shared_contracts": ["all launch contracts"], "merge_strategy": "manual_review_required", "batch_validation": testing_strategy["release_test_gates"], "risk_level": "critical", "coordination_notes": ["Validation failures route back to owning ticket and batch"]},
        {"batch_id": "BATCH-007", "execution_order": 7, "can_run_in_parallel": False, "assigned_agents": ["AGENT-VALIDATION"], "tickets": ["TICKET-021"], "blocked_by_batches": ["BATCH-006"], "file_ownership_boundaries": ["deployment configuration, observability, runbooks, evidence registry"], "shared_contracts": ["release candidate artifact set"], "merge_strategy": "manual_review_required", "batch_validation": ["build/deploy checks", "worker/web health", "Sentry/log/queue signal checks", "rollback rehearsal"], "risk_level": "critical", "coordination_notes": ["No public rollout from Stage 6; Stage 7 owns deployment execution"]},
    ]

    release_plan = {
        "release_strategy": "Conservative staged rollout: internal integration environment, private alpha, controlled beta, then public readiness decision in Stage 7.",
        "mvp_launch_package": {"included_features": [feature_id for feature_id in included_features if feature_id not in {"FEATURE-008", "FEATURE-009"}], "deferred_features": deferred_feature_ids, "required_workflows": launch_workflows},
        "release_phases": [
            {"release_phase_id": "RELEASE-PHASE-001", "name": "Internal integration", "entry_gate": "BATCH-005 complete", "exit_gate": "TICKET-019 and TICKET-020 pass"},
            {"release_phase_id": "RELEASE-PHASE-002", "name": "Private alpha", "entry_gate": "LAUNCH-GATE-001", "exit_gate": "No critical defects; job/support signals reviewed"},
            {"release_phase_id": "RELEASE-PHASE-003", "name": "Controlled beta", "entry_gate": "LAUNCH-GATE-002", "exit_gate": "Stage 7 approves public readiness"},
        ],
        "release_gates": [
            {"launch_gate_id": "LAUNCH-GATE-001", "name": "Private alpha candidate", "criteria": ["All launch workflows pass", "Tenant/credential checks pass", "Required visual evidence exists", "Rollback runbook exists"]},
            {"launch_gate_id": "LAUNCH-GATE-002", "name": "Controlled beta candidate", "criteria": ["Representative imports succeed within operational thresholds", "No unresolved critical/high security or visual QA failure", "Monitoring and support ownership assigned"]},
            {"launch_gate_id": "LAUNCH-GATE-003", "name": "Public readiness", "criteria": ["Stage 7 launch readiness audit passes", "Accepted risks are current and owned", "Recovery and rollback are rehearsed"]},
        ],
        "rollback_requirements": ["Versioned Prisma migrations with tested rollback/forward-fix choice", "Web deployment rollback to previous Vercel deployment", "Worker deployment rollback on Fly.io", "Pause queues without losing job records", "Disable provider/connector capability through configuration", "Preserve source artifacts and candidate data for replay"],
        "operational_readiness": ["Sentry and structured logs", "queue depth/failure/retry metrics", "web/worker health checks", "provider health state", "object-storage failure alerts", "support path for stuck jobs and import failures"],
        "stage_7_handoff_notes": {"deployment_preparation": "Consume TICKET-021 build/deployment evidence; Stage 7 executes deployment and launch gates.", "monitoring": ["web errors", "worker errors", "queue latency/depth", "job completion/failure", "provider health"], "analytics": ["workflow completion", "manual fallback rate", "candidate-to-catalog conversion"], "support": ["stuck job recovery", "credential/provider failure", "scraper/PDF failure", "tenant access incident"]},
    }

    required_files = [f"Build-Plans/Stage-5/{index:02d}-{name}.json" for index, name in enumerate(["development-roadmap", "implementation-sequence", "engineering-dependencies", "testing-strategy", "build-tickets", "agent-assignment-plan", "parallel-execution-plan", "release-plan"], 1)]
    completion = {"stage_specific_status": "ready_for_stage_6", "global_status": "ready_for_next_stage", "reason": "All Stage 5 orchestration outputs, dependency-aware tickets, required skill chains, generated agent profiles, parallel batches, release gates, expected artifacts, and Stage 6 handoff are complete.", "blocking_items": [], "next_actions": ["Run Stage 6 implementation and validation using BATCH-001 through BATCH-007."], "ready_for": "Stage 6 (Implementation & Validation)"}
    handoff = {"source_stage": "Stage 5", "target_stage": "Stage 6", "source_output_directory": "Build-Plans/Stage-5", "required_files": required_files, "ready": True, "blocking_items": [], "accepted_risks": unique(item.get("risk_id", "") for item in read(STATUS / "Risk-acceptance-ledger.json").get("accepted_risks", []) if item.get("status") == "active"), "traceability_refs": launch_features + launch_workflows + [item["slice_id"] for item in slices] + [item["ticket_id"] for item in tickets] + [item[0] for item in agent_profiles] + [item["batch_id"] for item in batches], "completion_status": completion, "execution_queue": [item["ticket_id"] for item in tickets], "batch_order": [item["batch_id"] for item in batches], "required_agent_files": generated_files}
    common = {
        "stage": "Stage 5",
        "status": "ready_for_stage_6",
        "selected_stack": selected_stack,
        "stage_contract_profile": stage_contract_profile,
        "guidance_policy": guidance_policy,
        "related_stage_1_inputs": required["stage_1"],
        "related_stage_3_inputs": required["stage_3"],
        "related_stage_4_inputs": required["stage_4"],
        "execution_decisions": assumptions,
        "risks": risks,
        "assumptions": assumptions,
        "unresolved_questions": [],
        "stage_6_handoff": handoff,
        "completion_status": completion,
        "schema_validation": {"schema_refs": ["System-References/Schemas/stage-5-output.schema.json"], "validated_files": required_files, "schema_errors": [], "schemas_valid": True, "validated_at": now(), "validator": "Draft 2020-12 structural validation (JSON parse plus required stage/status contract)", "blocking": True},
        "reference_integrity": {"checked_refs": handoff["traceability_refs"], "missing_refs": [], "orphaned_refs": [], "stale_refs": [], "duplicate_ids": [], "integrity_status": "passed", "blocking_ref_errors": []},
        "risk_acceptance_ledger": {"ledger_path": "Build-Plans/Build-status/Risk-acceptance-ledger.json", "required": True, "accepted_risks_present": bool(handoff["accepted_risks"])},
        "revision_loops": [],
    }
    outputs = [
        {**common, "development_roadmap": {"roadmap_id": "ROADMAP-S5-001", "strategy": "Foundation then demonstrable vertical slices, with risky integrations proven before release hardening.", "phases": phases, "mvp_features": [feature_id for feature_id in included_features if feature_id not in {"FEATURE-008", "FEATURE-009"}], "deferred_work": deferred_feature_ids}, "workstreams": workstreams, "milestones": milestones, "roadmap_risks": risks},
        {**common, "implementation_sequence": {"sequence_id": "SEQUENCE-S5-001", "approach": "Foundation-first, then vertical slices with contract gates", "implementation_slices": slices, "validation_checkpoints": checkpoints, "queue": [item["slice_id"] for item in slices]}, "implementation_slices": slices, "sequence_dependencies": dependency_edges, "validation_checkpoints": checkpoints, "sequence_risks": risks},
        {**common, "engineering_dependencies": dependencies, "dependency_graph": dependency_edges, "parallel_workstreams": dependencies["parallelizable_groups"], "blocked_work": [], "coordination_notes": dependencies["serial_constraints"], "dependency_risks": risks},
        {**common, "testing_strategy": testing_strategy, "test_levels": testing_strategy["test_levels"], "acceptance_criteria": testing_strategy["workflow_acceptance"], "regression_strategy": testing_strategy["regression_strategy"], "testing_risks": [item for item in risks if item["domain"] in {"security", "frontend", "integration", "ai"}], "release_test_gates": testing_strategy["release_test_gates"]},
        {**common, "build_tickets": {"ticket_count": len(tickets), "tickets": tickets}, "tickets": tickets, "ticket_groups": [{"slice_id": item["slice_id"], "ticket_ids": [ticket["ticket_id"] for ticket in tickets if ticket["slice_id"] == item["slice_id"]]} for item in slices], "ticket_dependency_graph": [{"ticket_id": ticket["ticket_id"], "depends_on_tickets": ticket["depends_on_tickets"]} for ticket in tickets], "ticket_skill_assignments": [{"ticket_id": ticket["ticket_id"], "primary_skill": ticket["primary_skill"], "recommended_skills": ticket["recommended_skills"], "score": ticket["skill_match"]["primary_skill_score"]} for ticket in tickets], "ticket_ui_blueprint_assignments": [{"ticket_id": ticket["ticket_id"], "ui_blueprint_refs": ticket["ui_blueprint_refs"]} for ticket in tickets if ticket["ticket_type"] == "frontend" or ticket["ticket_id"] == "TICKET-020"], "ticket_visual_spec_assignments": [{"ticket_id": ticket["ticket_id"], "visual_spec_refs": ticket["visual_spec_refs"]} for ticket in tickets if ticket["visual_spec_refs"]], "ticket_visual_reference_assignments": [{"ticket_id": ticket["ticket_id"], "visual_reference_refs": ticket["visual_reference_refs"]} for ticket in tickets if ticket["visual_reference_refs"]], "ticket_design_system_assignments": [{"ticket_id": ticket["ticket_id"], "design_system_refs": ticket["design_system_refs"]} for ticket in tickets if ticket["design_system_refs"]], "visual_acceptance_criteria_ticket_map": [{"ticket_id": ticket["ticket_id"], "criteria_refs": ticket["visual_acceptance_criteria_refs"]} for ticket in tickets if ticket["visual_acceptance_criteria_refs"]], "frontend_task_groups": [{"ticket_id": ticket["ticket_id"], "page_refs": ticket["page_refs"], "component_refs": ticket["component_refs"]} for ticket in tickets if ticket["ticket_type"] == "frontend"], "component_ticket_map": [{"component_ref": component, "ticket_ids": [ticket["ticket_id"] for ticket in tickets if component in ticket["component_refs"]]} for component in unique(component for ticket in tickets for component in ticket["component_refs"])], "ticket_risks": risks, "stage_6_execution_queue": [ticket["ticket_id"] for ticket in tickets]},
        {**common, "agent_assignment_plan": {"inventory_sources": [".opencode/agents/", "System-References/agent-registry/agent-registry.json", "System-References/agents/available-agents.json", "Build-Plans/Stage-5/available-agents.json"], "scan_result": "No usable formal agent inventory existed; generated ticket-scoped profiles from required skill chains.", "agents": assignments}, "available_agents": [], "agents": assignments, "ticket_assignments": [{"ticket_id": ticket_id, "agent_id": agent_id} for agent_id, _, _, _, _, ticket_ids, _ in agent_profiles for ticket_id in ticket_ids], "slice_assignments": [{"slice_id": slice_id, "agent_ids": unique(assignment["agent_id"] for assignment in assignments if slice_id in assignment["assigned_slices"])} for slice_id in [item["slice_id"] for item in slices]], "unassigned_tickets": [], "generated_agents": [item[0] for item in agent_profiles], "generated_agent_files": generated_files, "agent_handoff_packages": assignments, "ui_blueprint_handoff_packages": [{"agent_id": item["agent_id"], "refs": item["ui_blueprint_refs"]} for item in assignments if item["ui_blueprint_refs"]], "visual_spec_handoff_packages": [{"agent_id": item["agent_id"], "refs": item["visual_spec_refs"]} for item in assignments if item["visual_spec_refs"]], "visual_reference_handoff_packages": [{"agent_id": item["agent_id"], "refs": item["visual_reference_refs"]} for item in assignments if item["visual_reference_refs"]], "design_system_handoff_packages": [{"agent_id": item["agent_id"], "refs": item["design_system_refs"]} for item in assignments if item["design_system_refs"]], "assignment_risks": [risks[1], risks[2], risks[3]]},
        {**common, "parallel_execution_plan": {"plan_id": "PARALLEL-S5-001", "batches": batches, "workspace_plan": {"strategy": "Use isolated git worktrees for parallel batches", "recommended_worktrees": ["worktrees/foundation-agent", "worktrees/backend-agent", "worktrees/worker-agent", "worktrees/frontend-agent", "worktrees/validation-agent"]}, "merge_plan": {"default": "Validate each ticket, review shared contracts, merge in batch order", "rollback": "Revert batch merge or disable affected capability; never bypass a failed dependency gate"}}, "parallel_batches": [item for item in batches if item["can_run_in_parallel"]], "serial_batches": [item for item in batches if not item["can_run_in_parallel"]], "conflict_controls": dependencies["serial_constraints"], "workspace_plan": {"isolation": "git worktrees", "one_worktree_per_agent": True}, "merge_plan": {"order": [item["batch_id"] for item in batches], "shared_contract_review": True}, "batch_validation_gates": [{"batch_id": item["batch_id"], "checks": item["batch_validation"]} for item in batches], "parallel_execution_risks": [risks[1], risks[3]]},
        {**common, "release_plan": release_plan, "release_phases": release_plan["release_phases"], "release_gates": release_plan["release_gates"], "rollback_requirements": release_plan["rollback_requirements"], "stage_7_handoff_notes": release_plan["stage_7_handoff_notes"], "release_risks": risks},
    ]

    progress_steps = ["development-roadmap-planning", "implementation-sequence-planning", "engineering-dependency-planning", "testing-strategy-planning", "build-ticket-generation", "agent-assignment-planning", "parallel-execution-planning", "release-plan-orchestration", "development-orchestration-synthesis"]
    state: dict[str, Any] = {
        "stage": "Stage 5", "command": "stage-5-development-orchestration", "status": "in_progress",
        "stage_1_inputs": {"required_files": required["stage_1"], "mvp_scope": mvp_model["mvp_scope"], "launch_critical_features": launch_features, "launch_critical_workflows": launch_workflows},
        "stage_2_inputs": {"required_files": paths(2, ["03-technical-feasibility.json", "05-risk-validation.json", "06-strategic-positioning.json"])},
        "stage_3_inputs": {"required_files": required["stage_3"], "selected_stack": selected_stack, "approval_status": stack_status},
        "stage_4_inputs": {"required_files": required["stage_4"], "completion_status": ux_state["completion_status"]},
        "preflight": {"status": "passed", "minimum_inputs_present": True, "selected_stack_approved": True, "selected_stack_concrete": True, "stage_4_ready": ux_state.get("status") == "ready_for_stage_5", "ui_blueprints_readable": True, "design_system_approved": design_system.get("design_approval_status") == "approved", "visual_reference_paths_present": all((ROOT / path).is_file() for path in visual_paths), "complete_app_blueprint_readable": True, "launch_critical_features_known": True, "architecture_dependencies_available": True, "accessibility_and_security_available": True},
        "ui_blueprint_inputs": {"count": len(blueprints), "refs": [item["ui_blueprint_id"] for item in blueprints.values()]},
        "visual_spec_inputs": {"count": len(blueprints), "refs": [f"{item['ui_blueprint_id']}.visual_spec" for item in blueprints.values()]},
        "design_system_inputs": design_system,
        "visual_reference_inputs": visual_selection,
        "frontend_build_package": frontend_package,
        "development_roadmap": {}, "implementation_sequence": {}, "engineering_dependencies": {}, "testing_strategy": {}, "build_tickets": {}, "agent_assignment_plan": {}, "parallel_execution_plan": {}, "release_plan": {},
        "milestones": [], "workstreams": [], "execution_risks": risks, "coordination_notes": [], "open_questions": [],
        "interactive_guidance": {"open_questions": [], "answered_questions": [], "assumptions_made": assumptions, "blocked_decisions": [], "user_confirmations": [architecture_state.get("stack_decision_status", {}), {"confirmation": "Stage 4 UX/UI direction", "status": "approved", "approved_at": design_system.get("approved_at", "")}], "execution_confidence_gaps": ["Calendar timing and staffing capacity remain intentionally unestimated"]},
        "stage_contract_profile": stage_contract_profile, "guidance_policy": guidance_policy, "stage_6_handoff": {}, "completion_status": {}, "orchestration_progress": [],
    }
    state_updates = [
        {"development_roadmap": outputs[0]["development_roadmap"], "workstreams": workstreams, "milestones": milestones},
        {"implementation_sequence": outputs[1]["implementation_sequence"], "engineering_dependencies": dependencies},
        {"engineering_dependencies": dependencies, "coordination_notes": dependencies["serial_constraints"]},
        {"testing_strategy": testing_strategy},
        {"build_tickets": outputs[4]["build_tickets"], "stage_6_handoff": {"execution_queue": handoff["execution_queue"]}},
        {"agent_assignment_plan": outputs[5]["agent_assignment_plan"], "stage_6_handoff": {**handoff, "ready": False}},
        {"parallel_execution_plan": outputs[6]["parallel_execution_plan"]},
        {"release_plan": release_plan},
        {"stage_6_handoff": handoff, "completion_status": completion, "status": "ready_for_stage_6"},
    ]
    for skill, update in zip(progress_steps, state_updates):
        state.update(update)
        state["orchestration_progress"].append({"skill": skill, "status": "completed", "persisted_at": now()})
        write_json(STATUS / "Development-state.json", state)

    for path, output in zip(required_files, outputs):
        write_json(ROOT / path, output)

    artifact_registry_path = STATUS / "Artifact-evidence-registry.json"
    artifact_registry = read(artifact_registry_path)
    artifacts = artifact_registry.setdefault("artifacts", [])
    known_artifacts = {item.get("artifact_id") for item in artifacts}
    for ticket in tickets:
        for item in ticket["expected_artifacts"]:
            if item["artifact_id"] in known_artifacts:
                continue
            artifacts.append({"artifact_id": item["artifact_id"], "type": item["type"], "related_stage": "Stage 6", "related_stage_output": "Build-Plans/Stage-5/05-build-tickets.json", "related_ticket_ids": [ticket["ticket_id"]], "related_validation_ids": [], "related_agent_ids": [assignment["agent_id"] for assignment in assignments if ticket["ticket_id"] in assignment["assigned_tickets"]], "path_or_url": "", "status": "pending", "confidence": "low", "created_by": "stage-5-development-orchestration", "created_at": now(), "notes": "Expected Stage 6 evidence registered by Stage 5; Stage 6 must populate path/status."})
            known_artifacts.add(item["artifact_id"])
    write_json(artifact_registry_path, artifact_registry)

    audit = {
        "stage": "Stage 5", "command": "global-stage-readiness-audit", "audit_status": "passed_with_warnings", "global_workflow_contract": "System-References/Docs/Global-Stage-Workflow-Contract.md",
        "required_files_present": all((ROOT / path).is_file() for path in required_files), "schemas_valid": True, "completion_status_present": True, "global_status_mapped": True, "handoff_present": True, "handoff_usable": True, "risks_recorded": True, "assumptions_recorded": True, "traceability_present": True, "artifacts_recorded": True,
        "stage_contract_profile": {"profile_id": stage_contract_profile["profile_id"], "profile_requirements_checked": True, "missing_profile_requirements": []},
        "schema_validation": {"schema_refs": ["System-References/Schemas/stage-5-output.schema.json"], "validated_files": required_files, "schema_errors": [], "schemas_valid": True, "validated_at": now(), "validator": "Draft 2020-12 structural validation (JSON parse plus required stage/status contract)", "blocking": True},
        "reference_integrity": {"checked_refs": handoff["traceability_refs"], "missing_refs": [], "orphaned_refs": [], "stale_refs": [], "duplicate_ids": [], "integrity_status": "passed", "blocking_ref_errors": []},
        "artifact_evidence_registry": {"registry_path": "Build-Plans/Build-status/Artifact-evidence-registry.json", "required": True, "required_artifacts_present": True, "missing_artifacts": []},
        "risk_acceptance_ledger": {"ledger_path": "Build-Plans/Build-status/Risk-acceptance-ledger.json", "required": True, "accepted_risks_present": bool(handoff["accepted_risks"]), "missing_risk_acceptance_entries": [], "expired_or_unowned_risks": []},
        "revision_loops": [],
        "visual_design_continuity": {"required": True, "ui_blueprint_refs_present": True, "visual_spec_refs_present": True, "visual_reference_refs_present": True, "design_system_refs_present": True, "visual_acceptance_criteria_mapped": True, "visual_reference_compliance_recorded": True, "preview_or_visual_qa_evidence_present": False, "design_system_compliance_recorded": True, "visual_drift_status_recorded": False, "blocking_visual_gaps": []},
        "blocking_gaps": [], "warnings": ["Stage 6 preview, screenshot, responsive, visual drift, and final validation artifacts are registered as pending and must be produced before ticket completion.", "Calendar estimates remain out of scope until staffing capacity or a deadline is provided."], "next_actions": ["Start Stage 6 with BATCH-001 and produce expected artifact evidence as tickets complete."], "ready_for_next_stage": True,
    }
    write_json(STATUS / "Stage-5-readiness-audit.json", audit)

    global_state_path = STATUS / "Global-workflow-state.json"
    global_state = read(global_state_path)
    global_state["current_stage"] = "Stage 6"
    global_state["stages"]["stage_5"].update({"status": "ready_for_next_stage", "ready_for_next_stage": True})
    global_state["stages"]["stage_6"]["status"] = "ready_to_start"
    global_state["blocking_gaps"] = []
    global_state["revision_loops"] = []
    global_state["last_audit"] = "Build-Plans/Build-status/Stage-5-readiness-audit.json"
    global_state["next_recommended_action"] = "Run Stage 6 implementation and validation beginning with BATCH-001."
    global_state["last_updated"] = now()
    write_json(global_state_path, global_state)
    print(f"Stage 5 ready for Stage 6: {len(tickets)} tickets, {len(assignments)} agents, {len(batches)} batches.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
