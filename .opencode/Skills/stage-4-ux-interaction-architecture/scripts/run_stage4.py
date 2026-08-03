from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[4]
STATUS = ROOT / "Build-Plans/Build-status"
OUT = ROOT / "Build-Plans/Stage-4"


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


def stitch_prototype_gate() -> dict[str, Any]:
    prompt_block = """Prototype constraints for Source BlendR Stage 4:
Product scope boundaries: B2B inventory import/review/catalog workspace only. MVP role is workspace_owner. Do not create marketing, billing, checkout, auth, onboarding, team admin, BI dashboard, storefront, order management, or AI auto-publish experiences.
Approved workflows: website vendor import, PDF catalog import, Discovery Session candidate review, manual catalog curation, vendor access, and AI provider routing settings.
Allowed page types: use only the page type already mapped to the current Stage 4 UI blueprint.
Forbidden pages/features: no new routes, roles, product capabilities, integrations, collaboration, billing, customer-facing storefront, or admin surfaces unless already supported by Stage 1-3 and existing Stage 4 artifacts.
Design system rules: compact utilitarian operations workspace; warm off-white canvas; white bordered surfaces; graphite text; muted secondary text; restrained amber primary action; Inter/system sans; dense tables and status panels; visible focus; no decorative hero treatment.
Accessibility constraints: semantic controls, accessible names, keyboard-reachable interactions, visible focus, WCAG AA contrast, text/icon status labels, no color-only status, reduced-motion-safe progress.
Required states: loading, empty, populated, saving, success, error, permission_denied.
Required permissions: workspace_owner in MVP; permission denied must be visible, non-destructive, and recoverable.
Route/action discipline: every clickable/input/add component must resolve to an approved route, approved action, or no_navigation. Do not invent orphan controls."""
    return {
        "status": "not_started",
        "stage_scope": "stage_4_local_only",
        "stitch_is_downstream_dependency": False,
        "prototype_constraints_prompt_template": {
            "template_id": "STITCH-PROMPT-STAGE-4-PROTOTYPE-CONSTRAINTS",
            "name": "Stage 4 Stitch prototype constraints prompt",
            "required_sections": [
                "product_scope_boundaries",
                "approved_workflows",
                "allowed_page_types",
                "forbidden_pages_features",
                "design_system_rules",
                "accessibility_constraints",
                "required_states",
                "required_permissions",
                "route_action_discipline",
            ],
            "prompt_block": prompt_block,
        },
        "page_approval_ledger": [],
        "component_categories": [
            "navigation",
            "primary_action",
            "secondary_action",
            "destructive_action",
            "form_input",
            "filter_sort_control",
            "bulk_action",
            "status_control",
            "disclosure",
            "system_feedback",
            "unknown_or_unmapped",
        ],
        "component_extraction_checklist": [
            "navigation_components",
            "content_data_components",
            "forms_and_inputs",
            "buttons_and_links",
            "menus_dropdowns",
            "tabs",
            "modals_drawers",
            "clickable_cards_rows",
            "filters_search_sort_controls",
            "status_indicators",
            "empty_loading_error_success_states",
        ],
        "stitch_divergence_rule": {
            "classifications": [
                "accepted_stage_4_refinement",
                "requires_stage_1_revision",
                "requires_stage_3_revision",
                "rejected_out_of_scope",
            ],
            "rule": "Any Stitch suggestion not supported by Stage 1-3 or earlier Stage 4 work must be classified before approval and may not silently mutate Stage 5 scope.",
        },
        "no_orphan_interaction_gate": {
            "required_resolution_values": ["route", "action", "no_navigation"],
            "status": "not_started",
            "rule": "Every interactive component must resolve to route, action, or no_navigation before Stage 4 can complete.",
        },
        "responsive_review_expectations": {
            "desktop_layout": "record whether desktop-only layout is sufficient",
            "tablet_collapse_behavior": "record sidebar/table/form collapse expectations",
            "mobile_transformation": "record table-to-record and drawer-to-sheet transformations",
            "hidden_deprioritized_mobile_content": "record secondary content that may collapse without hiding status, validation, permissions, or primary actions",
        },
        "post_inventory_accessibility_checks": [
            "accessible_names",
            "keyboard_interaction",
            "focus_states",
            "disabled_loading_states",
            "destructive_action_confirmation",
            "permission_denied_behavior",
            "error_recovery",
        ],
    }


def el(element_id: str, element_type: str, label: str, behavior: str, target: str, component: str, section: str, action: str = "") -> dict[str, Any]:
    return {
        "element_id": element_id, "element_type": element_type, "label": label,
        "route_target": target if behavior == "navigate" else "",
        "action_id": action, "behavior": behavior, "behavior_target": target,
        "permission_required": "workspace_owner", "confirmation_required": behavior == "trigger_action" and "archive" in label.lower(),
        "states": {"disabled_when": ["request_pending"] if behavior in {"submit", "trigger_action", "call_api"} else [], "feedback": "inline status plus toast"},
        "owning_component": component, "owning_section": section,
    }


def action_ref(item: dict[str, Any]) -> str:
    return str(item.get("action_id") or item["element_id"])


def optional_text(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value)
    if not text:
        return None
    return text


def required_text(value: Any) -> str:
    text = optional_text(value)
    if text is None:
        raise ValueError("Expected a non-empty text value.")
    return text


def action_refs(items: list[dict[str, Any]]) -> list[str]:
    refs: list[str] = []
    for item in items:
        if item.get("action_id") or item.get("element_id"):
            refs.append(action_ref(item))
    return refs


def sorted_text_values(values: list[str]) -> list[str]:
    unique_values: list[str] = []
    for value in values:
        if value not in unique_values:
            unique_values.append(value)
    for index in range(1, len(unique_values)):
        current_value = unique_values[index]
        previous_index = index - 1
        while previous_index >= 0 and unique_values[previous_index] > current_value:
            unique_values[previous_index + 1] = unique_values[previous_index]
            previous_index -= 1
        unique_values[previous_index + 1] = current_value
    return unique_values


def get_text_values(items: list[dict[str, Any]], key: str) -> list[str]:
    values: list[str] = []
    for item in items:
        value = optional_text(item.get(key))
        if value is not None:
            values.append(value)
    return values


def page(page_id: str, name: str, route: str, purpose: str, screen_type: str, layout: str, journey: list[str], features: list[str], sections: list[dict[str, Any]], data: list[str], states: list[str], rationale: list[str]) -> dict[str, Any]:
    interactive: list[dict[str, Any]] = []
    for section in sections:
        for component in section.get("components", []):
            interactive.extend(component.get("interactive_elements", []))
    page_actions = action_refs(interactive)
    blueprint: dict[str, Any] = {
        "ui_blueprint_id": f"UI-BLUEPRINT-{page_id}", "page_id": page_id, "page_name": name,
        "page_type_selection_rationale": {"screen_type": screen_type, "included_because": rationale, "source_refs": journey + features, "excluded_page_types": []},
        "purpose": purpose, "primary_user": "USER-001", "screen_type": screen_type, "layout_type": layout,
        "owning_journey_ids": journey, "supported_feature_ids": features, "sections": sections,
        "actions": page_actions,
        "data_needed": data,
        "states": states, "validation": ["Show field-level validation before submission", "Never promote unvalidated AI output to catalog"],
        "navigation": {"route": route, "back_targets": ["/app"], "route_inventory_refs": [route]},
        "interactive_elements": interactive,
        "visual_spec": {"visual_style": "Utilitarian", "design_system_refs": ["DESIGN-SYSTEM-001"], "visual_reference_refs": ["REF-UTILITARIAN", "REF-BENTO-MODIFIER"], "density": "Compact", "color_direction": "Warm off-white canvas, graphite text, restrained amber action accent", "typography_feel": "Crisp sans-serif with tabular numerals for data", "component_style": "Dense Utility with restrained Soft Card grouping", "primary_visual_focus": "Current task status and next safe action", "responsive_behavior": "Sidebar collapses to labeled bottom/overflow navigation; tables become stacked records; drawers become full-screen sheets", "visual_do_rules": ["Keep status and primary action visible", "Use color with text/icon labels, never color alone"], "visual_dont_rules": ["No decorative hero treatment in operational screens", "No hidden bulk-action consequences"], "visual_acceptance_criteria": ["Keyboard focus is visible", "Contrast meets WCAG AA", "Loading and error states are visible without relying on color"], "user_approval_status": "assumption_pending_stage_decision_brief"},
        "stage_5_ticket_hints": ["Implement route from route inventory", "Cover every interactive element with a route/action test"],
    }
    return blueprint


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    required_1 = ["02-user-system-map.json", "03-workflow-architecture.json", "04-product-capabilities.json", "05-feature-structure.json", "06-product-boundaries.json", "08-mvp-operational-model.json", "10-success-framework.json"]
    required_2 = ["01-market-analysis.json", "05-risk-validation.json", "06-strategic-positioning.json"]
    required_3 = ["01-system-topology.json", "02-service-architecture.json", "03-data-architecture.json", "04-api-architecture.json", "06-security-foundations.json", "08-scalability-framework.json"]
    paths = {"stage_1": [f"Build-Plans/Stage-1/{x}" for x in required_1], "stage_2": [f"Build-Plans/Stage-2/{x}" for x in required_2], "stage_3": [f"Build-Plans/Stage-3/{x}" for x in required_3]}
    present = {k: all((ROOT / p).is_file() for p in v) for k, v in paths.items()}
    missing_inputs = [p for values in paths.values() for p in values if not (ROOT / p).is_file()]
    if missing_inputs:
        write_json(STATUS / "UX-state.json", {"stage": "Stage 4", "command": "stage-4-ux-interaction-architecture", "status": "blocked", "stage_1_inputs": paths["stage_1"], "stage_2_inputs": paths["stage_2"], "stage_3_inputs": paths["stage_3"], "preflight": {"status": "failed", "required_inputs_present": present, "missing_inputs": missing_inputs}, "completion_status": {"status": "blocked", "reason": "missing_ux_inputs"}, "generated_at": now()})
        print("Stage 4 blocked: missing required UX inputs.")
        return 1
    s1 = {x: read(ROOT / "Build-Plans/Stage-1" / x) for x in required_1}
    s2 = {x: read(ROOT / "Build-Plans/Stage-2" / x) for x in required_2}
    s3 = {x: read(ROOT / "Build-Plans/Stage-3" / x) for x in required_3}
    workflows = s1["03-workflow-architecture.json"]["workflows"]
    features = s1["05-feature-structure.json"]["features"]
    launch_features = [x["feature_id"] for x in features if x.get("launch_critical")]
    launch_workflows = [x["workflow_id"] for x in s1["08-mvp-operational-model.json"]["launch_critical_workflows"]]
    assumptions = [
        {"assumption_id": "ASSUMPTION-UX-001", "decision": "Workspace owner is the only MVP interactive role; AI admin permissions are represented as a workspace settings capability.", "reason": "Stage 1 explicitly defers team support."},
        {"assumption_id": "ASSUMPTION-UX-002", "decision": "Long-running imports use a persistent job status surface and can be left and resumed.", "reason": "Stage 3 requires BullMQ jobs and user-visible status."},
        {"assumption_id": "ASSUMPTION-UX-003", "decision": "Utilitarian visual direction with Bento modular grouping is the recommended design direction.", "reason": "The product is a high-frequency operations/catalog tool with dense tables and async status."},
        {"assumption_id": "ASSUMPTION-UX-004", "decision": "Destructive archive/ignore actions require confirmation; bulk actions report partial success per item.", "reason": "Discovery review is a trust boundary before catalog writes."},
    ]
    journeys = [
        {"journey_id": "JOURNEY-001", "name": "Import vendor website into reviewed catalog", "primary_user_id": "USER-001", "workflow_ids": ["WORKFLOW-001", "WORKFLOW-003"], "entry_points": ["/app/imports", "/app/vendors/:vendorId"], "steps": ["Choose or create vendor", "Start website discovery", "Review cached category tree", "Select categories", "Monitor queued jobs", "Open Discovery Session", "Search/filter/select candidates", "Edit and validate", "Bulk import or ignore"], "success_state": "Selected validated candidates become editable catalog items", "failure_states": ["Vendor blocks traversal", "AI classification is unavailable", "One or more category jobs fail", "Validation conflict or duplicate"], "recovery_paths": ["Retry failed job", "Correct category tree", "Use manual entry", "Edit, merge, or ignore candidate"], "mvp": True},
        {"journey_id": "JOURNEY-002", "name": "Import and review a PDF catalog", "primary_user_id": "USER-001", "workflow_ids": ["WORKFLOW-002", "WORKFLOW-003"], "entry_points": ["/app/imports"], "steps": ["Choose vendor", "Upload PDF", "Monitor OCR/extraction", "Review Discovery Session candidates", "Validate and import selected items"], "success_state": "Validated PDF candidates are promoted to catalog", "failure_states": ["Unreadable PDF", "OCR/extraction failure", "Duplicate/conflict"], "recovery_paths": ["Retry OCR", "Upload a replacement", "Use manual entry", "Edit or ignore candidate"], "mvp": True},
        {"journey_id": "JOURNEY-003", "name": "Curate catalog manually", "primary_user_id": "USER-001", "workflow_ids": ["WORKFLOW-014", "WORKFLOW-007"], "entry_points": ["/app/catalog", "/app/catalog/new"], "steps": ["Choose item type", "Enter normalized fields", "Set pricing/tags", "Validate", "Save", "Search and edit later"], "success_state": "A fully editable searchable catalog item exists", "failure_states": ["Required field missing", "Invalid price", "Duplicate SKU"], "recovery_paths": ["Inline correction", "Save draft locally in form state", "Cancel without mutation"], "mvp": True},
        {"journey_id": "JOURNEY-004", "name": "Configure AI provider routing", "primary_user_id": "USER-003", "workflow_ids": ["WORKFLOW-006", "WORKFLOW-005"], "entry_points": ["/app/settings/ai"], "steps": ["Open AI settings", "Add provider credentials", "Run health check", "Assign capability route", "Save", "Review provider status"], "success_state": "Capabilities route to a healthy configured provider", "failure_states": ["No provider configured", "Credential rejected", "Provider unhealthy/rate limited"], "recovery_paths": ["Use fallback provider", "Retry health check", "Keep manual-only workflows available"], "mvp": True},
    ]
    nav = {"model": "Persistent workspace sidebar with task-oriented groups; contextual breadcrumbs and command-style actions inside work areas", "items": [{"label": "Overview", "route_target": "/app"}, {"label": "Imports", "route_target": "/app/imports"}, {"label": "Discovery", "route_target": "/app/discovery"}, {"label": "Catalog", "route_target": "/app/catalog"}, {"label": "Vendors", "route_target": "/app/vendors"}, {"label": "Settings", "route_target": "/app/settings"}], "rules": ["Preserve job status access globally", "Keep primary task action in page header", "Use drawers for candidate preview/edit to preserve list context"]}
    interactions = {"navigation_model": nav, "patterns": ["Persistent status banner for active jobs", "Search/filter with URL state", "Bulk selection toolbar appears only after selection", "Confirm archive/ignore; allow retry for failed jobs", "Use optimistic UI only for reversible local selection; server mutations show pending state"], "feedback_patterns": ["Inline field errors", "Toast for completed mutation", "Progress timeline for async jobs", "Partial-success summary with per-item recovery"], "permission_model": "workspace_owner in MVP; all data reads/mutations require authenticated workspace context", "tradeoffs": ["A persistent job surface adds navigation overhead but prevents silent long-running work", "Drawer editing preserves list context but requires explicit save/cancel focus management"]}
    screens = [
        {"screen_id": "SCREEN-001", "name": "Workspace Overview", "route": "/app", "type": "Dashboard", "launch_critical": True, "journey_ids": ["JOURNEY-001", "JOURNEY-003", "JOURNEY-004"], "interactive_elements": [el("EL-OV-001", "button", "Start import", "navigate", "/app/imports", "QuickActions", "Actions"), el("EL-OV-002", "link", "Open catalog", "navigate", "/app/catalog", "QuickActions", "Actions"), el("EL-OV-003", "link", "View active jobs", "navigate", "/app/imports/jobs", "JobStatus", "Active Jobs")]},
        {"screen_id": "SCREEN-002", "name": "Imports Workspace", "route": "/app/imports", "type": "List", "launch_critical": True, "journey_ids": ["JOURNEY-001", "JOURNEY-002"], "interactive_elements": [el("EL-IM-001", "button", "Website import", "navigate", "/app/imports/website", "ImportMethods", "Start Import"), el("EL-IM-002", "button", "PDF import", "navigate", "/app/imports/pdf", "ImportMethods", "Start Import"), el("EL-IM-003", "link", "Open job", "navigate", "/app/imports/jobs/:jobId", "JobTable", "Recent Jobs")]},
        {"screen_id": "SCREEN-003", "name": "Website Import Wizard", "route": "/app/imports/website", "type": "Wizard", "launch_critical": True, "journey_ids": ["JOURNEY-001"], "interactive_elements": [el("EL-WEB-001", "select", "Vendor", "submit", "vendor_id", "SourceForm", "Source"), el("EL-WEB-002", "text_input", "Website URL", "submit", "website_url", "SourceForm", "Source"), el("EL-WEB-003", "button", "Analyze website", "submit", "start_website_discovery", "SourceForm", "Source", "ACTION-START-WEBSITE"), el("EL-WEB-004", "checkbox", "Category", "toggle", "category_selection", "CategoryTree", "Categories"), el("EL-WEB-005", "button", "Start selected categories", "trigger_action", "enqueue_selected_categories", "CategoryTree", "Categories", "ACTION-QUEUE-CATEGORIES"), el("EL-WEB-006", "link", "Open job", "navigate", "/app/imports/jobs/:jobId", "JobResult", "Result")]},
        {"screen_id": "SCREEN-004", "name": "PDF Import", "route": "/app/imports/pdf", "type": "Form", "launch_critical": True, "journey_ids": ["JOURNEY-002"], "interactive_elements": [el("EL-PDF-001", "select", "Vendor", "submit", "vendor_id", "PdfForm", "Upload"), el("EL-PDF-002", "file_upload", "PDF catalog", "submit", "pdf_file", "PdfForm", "Upload"), el("EL-PDF-003", "button", "Start PDF extraction", "submit", "start_pdf_import", "PdfForm", "Upload", "ACTION-START-PDF"), el("EL-PDF-004", "link", "Open job", "navigate", "/app/imports/jobs/:jobId", "JobResult", "Result")]},
        {"screen_id": "SCREEN-005", "name": "Import Job Detail", "route": "/app/imports/jobs/:jobId", "type": "Detail View", "launch_critical": True, "journey_ids": ["JOURNEY-001", "JOURNEY-002"], "interactive_elements": [el("EL-JOB-001", "button", "Retry failed work", "trigger_action", "retry_job", "JobActions", "Actions", "ACTION-RETRY-JOB"), el("EL-JOB-002", "button", "Cancel job", "trigger_action", "cancel_job", "JobActions", "Actions", "ACTION-CANCEL-JOB"), el("EL-JOB-003", "link", "Open Discovery Session", "navigate", "/app/discovery/:sessionId", "JobActions", "Actions")]},
        {"screen_id": "SCREEN-006", "name": "Discovery Session", "route": "/app/discovery/:sessionId", "type": "List", "launch_critical": True, "journey_ids": ["JOURNEY-001", "JOURNEY-002"], "interactive_elements": [el("EL-DIS-001", "search_input", "Search candidates", "call_api", "candidate_search", "CandidateTable", "Candidates", "ACTION-SEARCH-CANDIDATES"), el("EL-DIS-002", "select", "Status filter", "call_api", "candidate_status_filter", "CandidateTable", "Candidates", "ACTION-FILTER-CANDIDATES"), el("EL-DIS-003", "checkbox", "Select candidate", "toggle", "candidate_selection", "CandidateTable", "Candidates"), el("EL-DIS-004", "button", "Preview candidate", "open_drawer", "candidate_preview", "CandidateTable", "Candidates", "ACTION-PREVIEW-CANDIDATE"), el("EL-DIS-005", "button", "Import selected", "trigger_action", "bulk_import", "BulkToolbar", "Bulk Actions", "ACTION-BULK-IMPORT"), el("EL-DIS-006", "button", "Ignore selected", "trigger_action", "bulk_ignore", "BulkToolbar", "Bulk Actions", "ACTION-BULK-IGNORE"), el("EL-DIS-007", "button", "Archive selected", "trigger_action", "bulk_archive", "BulkToolbar", "Bulk Actions", "ACTION-BULK-ARCHIVE") ]},
        {"screen_id": "SCREEN-007", "name": "Catalog", "route": "/app/catalog", "type": "List", "launch_critical": True, "journey_ids": ["JOURNEY-003"], "interactive_elements": [el("EL-CAT-001", "search_input", "Search catalog", "call_api", "catalog_search", "CatalogTable", "Catalog", "ACTION-SEARCH-CATALOG"), el("EL-CAT-002", "select", "Type filter", "call_api", "catalog_type_filter", "CatalogTable", "Catalog", "ACTION-FILTER-CATALOG"), el("EL-CAT-003", "button", "New catalog item", "navigate", "/app/catalog/new", "CatalogHeader", "Actions"), el("EL-CAT-004", "link", "Open item", "navigate", "/app/catalog/:itemId", "CatalogTable", "Catalog") ]},
        {"screen_id": "SCREEN-008", "name": "Catalog Item Form", "route": "/app/catalog/new", "type": "Form", "launch_critical": True, "journey_ids": ["JOURNEY-003"], "interactive_elements": [el("EL-FORM-001", "select", "Item type", "toggle", "item_type", "CatalogForm", "Item Details"), el("EL-FORM-002", "text_input", "Name", "submit", "name", "CatalogForm", "Item Details"), el("EL-FORM-003", "text_input", "SKU", "submit", "sku", "CatalogForm", "Item Details"), el("EL-FORM-004", "text_input", "Price", "submit", "price", "CatalogForm", "Pricing"), el("EL-FORM-005", "button", "Save item", "submit", "create_catalog_item", "CatalogForm", "Actions", "ACTION-SAVE-ITEM"), el("EL-FORM-006", "button", "Cancel", "navigate", "/app/catalog", "CatalogForm", "Actions") ]},
        {"screen_id": "SCREEN-009", "name": "Vendors", "route": "/app/vendors", "type": "List", "launch_critical": True, "journey_ids": ["JOURNEY-001", "JOURNEY-002"], "interactive_elements": [el("EL-VEN-001", "button", "New vendor", "navigate", "/app/vendors/new", "VendorHeader", "Actions"), el("EL-VEN-002", "link", "Open vendor", "navigate", "/app/vendors/:vendorId", "VendorTable", "Vendors") ]},
        {"screen_id": "SCREEN-010", "name": "AI Provider Settings", "route": "/app/settings/ai", "type": "Settings", "launch_critical": True, "journey_ids": ["JOURNEY-004"], "interactive_elements": [el("EL-AI-001", "button", "Add provider", "open_modal", "provider_form", "ProviderList", "Providers"), el("EL-AI-002", "button", "Run health check", "trigger_action", "health_check", "ProviderList", "Providers", "ACTION-HEALTH-CHECK"), el("EL-AI-003", "select", "Capability route", "submit", "capability_route", "RoutingTable", "Capability Routing"), el("EL-AI-004", "button", "Save routing", "submit", "save_ai_settings", "RoutingTable", "Capability Routing", "ACTION-SAVE-AI") ]},
    ]
    route_paths = sorted_text_values(get_text_values(screens, "route") + get_text_values(nav["items"], "route_target") + ["/app/imports/jobs", "/app/vendors/new", "/app/vendors/:vendorId", "/app/catalog/:itemId", "/app/settings"])
    route_inventory = [{"route_id": f"ROUTE-{i:03d}", "path": p, "owner_page_id": next((required_text(x["screen_id"]) for x in screens if x["route"] == p), "SCREEN-001")} for i, p in enumerate(route_paths, 1)]
    action_inventory = []
    for screen in screens:
        for item in screen["interactive_elements"]:
            action_inventory.append({"action_id": action_ref(item), "owning_page_id": required_text(screen["screen_id"]), "owning_component": required_text(item["owning_component"]), "element_id": required_text(item["element_id"]), "behavior": required_text(item["behavior"]), "route_target": optional_text(item.get("route_target")) or "", "behavior_target": optional_text(item.get("behavior_target")) or "", "recovery": "Inline error and retry where server-backed"})
    screen_system = {"screen_groups": [{"group_id": "GROUP-IMPORT", "name": "Import and Discovery", "screen_ids": [x["screen_id"] for x in screens[:6]]}, {"group_id": "GROUP-CATALOG", "name": "Catalog and Vendors", "screen_ids": [x["screen_id"] for x in screens[6:9]]}, {"group_id": "GROUP-PLATFORM", "name": "Workspace Settings", "screen_ids": [screens[0]["screen_id"], screens[9]["screen_id"]]}], "screen_inventory": screens, "navigation_structure": nav, "route_inventory": route_inventory, "action_inventory": action_inventory, "risks": ["Import job status must remain reachable after leaving wizard", "Dense candidate tables need mobile stacked fallback"]}
    behavior_rules = [{"feature_id": fid, "trigger": "User action through owning screen", "response": "Validate, authorize in workspace context, mutate or enqueue job, return explicit status", "states": ["idle", "loading", "empty", "success", "error", "permission_denied"], "recovery": "Retry where idempotent; preserve user input; offer manual fallback when AI/import unavailable"} for fid in launch_features]
    feature_behaviors = {"feature_behaviors": {"rules": behavior_rules, "validation_rules": ["Required common catalog fields are validated deterministically", "SKU uniqueness is checked within workspace", "Price is numeric and non-negative", "AI output stays candidate-scoped until explicit user import", "Bulk actions are idempotent and return per-record outcomes"], "permission_behaviors": ["All launch features require authenticated workspace_owner", "Provider credentials are server-side only", "No cross-workspace identifiers are accepted without scope check"], "error_behaviors": ["Async failures show failed step, reason, retry, and manual fallback", "Partial bulk failure keeps successful records committed and exposes failed records", "Empty states explain next action"]}, "feature_ids": launch_features, "workflow_ids": launch_workflows, "ux_risks": ["ARCH-RISK-001: scraper failure can interrupt import", "ARCH-RISK-004: insufficient queue observability can hide state"]}
    states = {"workflow_states": [{"workflow_id": w["workflow_id"], "states": ["ready", "processing", "review_required", "success", "failed", "cancelled"], "recovery": "retry or manual fallback"} for w in workflows if w["workflow_id"] in launch_workflows], "screen_states": ["loading", "empty", "populated", "saving", "success", "error", "permission_denied", "offline_or_stale"], "feature_states": ["candidate_new", "candidate_validated", "candidate_conflict", "candidate_imported", "candidate_ignored", "job_queued", "job_running", "job_partial_failure", "job_complete"], "transitions": [{"from": "job_queued", "trigger": "worker starts", "to": "job_running"}, {"from": "job_running", "trigger": "all steps complete", "to": "job_complete"}, {"from": "job_running", "trigger": "retryable step fails", "to": "job_partial_failure"}, {"from": "candidate_new", "trigger": "validation passes and user imports", "to": "candidate_imported"}, {"from": "candidate_new", "trigger": "user ignores", "to": "candidate_ignored"}]}
    accessibility = {"wcag_target": "WCAG 2.2 AA baseline", "keyboard": ["All actions reachable in logical order", "Table selection and bulk toolbar keyboard-operable", "Escape closes modal/drawer and returns focus", "Skip link and landmark navigation"], "screen_reader": ["Every control has an accessible name", "Async progress uses polite live region; failures use assertive announcement", "Status badges expose text and state, not color alone", "Table row context and selection state are announced"], "focus": ["Move focus to opened drawer heading", "Return focus to trigger on close", "Move focus to first invalid field after failed submit"], "forms_and_errors": ["Persistent labels, descriptions, and field-level errors", "File upload exposes accepted type and size", "Confirm destructive bulk actions with count and consequence"], "visual_and_motion": ["AA contrast for text and controls", "Respect reduced motion", "Do not communicate job state by animation alone", "Responsive layouts preserve task order"], "risks": ["Dense tables may be difficult at narrow widths; use stacked records and persistent action access", "Bulk-selection semantics need screen-reader verification"]}
    design_system = {"design_system_id": "DESIGN-SYSTEM-001", "product_visual_personality": "Precise, calm, trustworthy operations workspace", "design_style": "Utilitarian with Bento modular grouping", "color_tokens": {"canvas": "#F7F6F2", "surface": "#FFFFFF", "surface_subtle": "#ECEBE6", "text": "#1F2421", "text_muted": "#68716B", "border": "#D7D9D2", "action": "#A85E2A", "action_text": "#FFFFFF", "success": "#2F6B4F", "warning": "#8A651D", "danger": "#A43D35", "focus": "#155E75"}, "typography_tokens": {"font_family": "system sans", "body": "14px/1.45", "label": "12px/1.3 medium", "heading": "20-28px semibold", "data": "tabular-nums"}, "spacing_scale": [4, 8, 12, 16, 24, 32], "radius_rules": {"default": "6px", "pill": "999px", "avoid": "large decorative radii"}, "elevation_rules": {"default": "border only", "drawer": "0 12px 32px rgba(31,36,33,.14)"}, "icon_rules": "Use simple outlined icons with text labels for consequential actions", "component_style_rules": {"buttons": "solid primary, outlined secondary, destructive text-plus-icon", "cards": "flat bordered modules", "forms": "labeled two-column desktop, single-column mobile", "tables": "sticky header, compact rows, visible selection", "modals": "confirmation only; keep forms in pages/drawers", "drawers": "candidate preview/edit with explicit save/cancel", "navigation": "persistent sidebar with active route"}, "responsive_breakpoints": {"desktop": ">= 1200px", "tablet": "768-1199px", "mobile": "< 768px", "collapse_rules": ["Sidebar collapses", "Tables stack into labeled records", "Two-column forms become one column"], "mobile_priority_content": ["current status", "primary action", "candidate identity", "validation errors"]}, "visual_references": ["REF-UTILITARIAN", "REF-BENTO-MODIFIER"], "visual_reference_selection": {"primary_reference": {"name": "Utilitarian", "path": ".opencode/Skills/design-system-foundation/references/Utilitarian.md", "selected_because": ["Fits high-frequency operations and dense catalog/discovery work", "Supports trust, clarity, keyboard use, and status visibility"], "applicable_surfaces": ["workspace shell", "tables", "forms", "job status", "settings"], "token_implications": ["high contrast", "flat surfaces", "compact spacing"], "component_implications": ["tables, forms, status badges, explicit actions"], "accessibility_risks": ["Avoid excessive density; preserve readable line height and responsive stacking"]}, "secondary_references": [{"name": "Bento Grid Tech Minimalist", "path": ".opencode/Skills/design-system-foundation/references/Bento Grid Tech Minimalist.md", "selected_because": ["Adds modular grouping for overview and status panels without changing utility-first behavior"], "applicable_surfaces": ["overview cards", "import method chooser"]}], "rejected_references": [{"name": "Glassmorphism", "reason": "Potential contrast and status legibility issues for operational screens"}, {"name": "Aurora", "reason": "Atmospheric treatment would compete with dense workflows"}]}, "liked_patterns": ["Strong alignment", "Explicit status", "Modular summary panels", "Compact data tables"], "disliked_patterns": ["Decorative gradients", "Hidden actions", "Color-only status", "Large marketing hero treatment"], "accessibility_constraints": accessibility["visual_and_motion"], "design_do_rules": ["Use one primary action per page", "Make workflow status visible at a glance", "Keep data labels explicit"], "design_dont_rules": ["Do not hide validation conflicts in tooltips", "Do not use animation as the only progress signal"], "design_approval_status": "unconfirmed"}
    page_blueprints = [page(x["screen_id"], x["name"], x["route"], "Support the launch-critical workflow represented by this screen", x["type"], "Sidebar", x["journey_ids"], launch_features[:3], [{"section_id": f"SEC-{x['screen_id']}", "name": "Primary work area", "components": [{"component_id": f"COMP-{x['screen_id']}-PRIMARY", "name": "Primary task component", "interactive_elements": x["interactive_elements"]}]}], ["workspace_id", "authenticated_user", "screen-specific records", "job status where applicable"], ["loading", "empty", "populated", "saving", "success", "error", "permission_denied"], ["Supports a launch-critical journey", "Matches the role and feature evidence", "Keeps the primary action and recovery path visible"]) for x in screens]
    component_values: list[str] = []
    for page_blueprint in page_blueprints:
        for section in page_blueprint["sections"]:
            component_values.extend(get_text_values(section["components"], "component_id"))
    component_ids = sorted_text_values(component_values)
    frontend = {"page_inventory": [{"page_id": x["page_id"], "route": x["navigation"]["route"], "ui_blueprint_id": x["ui_blueprint_id"], "launch_critical": True} for x in page_blueprints], "component_inventory": component_ids, "shared_components": ["AppShell", "Sidebar", "Breadcrumbs", "StatusBadge", "JobProgressTimeline", "SearchFilterBar", "BulkActionToolbar", "DataTable", "FormField", "ConfirmDialog", "Toast", "EmptyState", "ErrorState", "AccessibleDrawer"], "route_inventory": route_inventory, "action_inventory": action_inventory, "state_inventory": states["screen_states"] + states["feature_states"], "frontend_task_hints": ["Build shared job status and recovery patterns first", "Implement table-to-stacked responsive behavior", "Keep route handlers/server actions thin; consume domain contracts", "Add keyboard and screen-reader tests for discovery bulk actions"], "recommended_frontend_skills": ["Next.js App Router", "TypeScript", "Tailwind CSS", "shadcn/ui-compatible primitives", "Playwright accessibility and workflow tests"]}
    stitch_gate = stitch_prototype_gate()
    risk_list = [{"risk_id": "UX-RISK-001", "severity": "high", "risk": "Users cannot understand long-running import progress", "mitigation": "Persistent job detail, step timeline, event log, retry/cancel, and partial-result access", "owner": "Stage 4 / Stage 6"}, {"risk_id": "UX-RISK-002", "severity": "high", "risk": "AI extraction creates unsafe or duplicate catalog records", "mitigation": "Discovery Session review gate, deterministic validation, explicit conflict states, no direct AI catalog writes", "owner": "Stage 4 / Stage 6"}, {"risk_id": "UX-RISK-003", "severity": "medium", "risk": "Dense tables reduce mobile and assistive-technology usability", "mitigation": "Responsive stacked records, semantic table headers, keyboard selection, live announcements", "owner": "Stage 4 / Stage 6"}]
    brief = {"brief_id": "STAGE4-BRIEF-001", "stage": "Stage 4", "brief_path": "Build-Plans/Stage-4/00-stage-decision-brief.md", "recommended_direction": "A precise, compact operations workspace: Utilitarian foundation, Bento-style modular overview panels, persistent sidebar, dense searchable tables, explicit async job status, and review-first import flows.", "alternatives_considered": ["Atmospheric AI dashboard: rejected because it weakens dense operational scanning", "Marketing-led dashboard: rejected because launch-critical work is import/review/catalog operations", "Pure card-only layout: rejected because discovery and catalog require table density"], "key_decisions": ["Workspace owner is the MVP role", "Website/PDF imports converge on Discovery Session review", "Manual entry remains first-class and works with zero AI providers", "Async jobs expose progress, retry, cancel, and partial failure recovery", "AI never writes directly to catalog"], "assumptions": assumptions, "risks": risk_list, "downstream_impact": ["Stage 5 should implement shared data table, bulk toolbar, status timeline, and accessible drawer primitives before page-specific work", "Stage 6 must validate async recovery, candidate review gate, tenant-scoped actions, responsive tables, and keyboard behavior"], "user_decision_required": True, "approval_status": "pending", "approved_by": "", "approved_at": "", "revision_notes": []}
    brief_md = """# Stage 4 UX/UI Decision Brief\n\n## Recommended direction\n\nBuild Source BlendR as a precise, compact operations workspace: a Utilitarian foundation with restrained Bento-style modular grouping for overview and status panels. Use a persistent workspace sidebar, dense searchable tables, explicit async job status, and review-first import flows.\n\n## Why this fits\n\n- The primary user is a workspace owner performing high-frequency import, review, and catalog curation work.\n- Website and PDF imports converge on a Discovery Session before catalog writes.\n- Manual entry must remain fully capable when no AI provider is configured.\n- BullMQ-backed work is asynchronous and needs visible progress, retry, cancel, and partial-failure recovery.\n- Accessibility requires semantic controls, visible focus, text-based status, and responsive table fallbacks.\n\n## Key UX decisions\n\n- MVP role: `workspace_owner`; future roles are not given separate MVP workflows.\n- Navigation: persistent sidebar with Overview, Imports, Discovery, Catalog, Vendors, and Settings.\n- Editing: candidate preview/edit uses an accessible drawer; catalog creation uses a dedicated form.\n- Safety: AI output remains a candidate until deterministic validation and explicit user import.\n- Visual system: compact spacing, flat bordered surfaces, high contrast, restrained amber action accent, tabular data numerals.\n\n## Main risks and mitigations\n\n- Long-running jobs: persistent job detail with step timeline, event log, retry/cancel, and partial-result access.\n- Unsafe extraction: Discovery Session review gate, validation, duplicate/conflict states, and manual fallback.\n- Dense responsive UI: stacked mobile records, semantic table headers, keyboard selection, and live announcements.\n\n## Approval\n\nDo you approve this recommended UX/UI direction?\n\n- [ ] Approve recommended UI direction\n- [ ] Revise visual style\n- [ ] Revise page/screen structure\n- [ ] Revise navigation/layout\n- [ ] Revise component priorities\n\nApproval is required before Stage 4 can use `ready_for_stage_5`.\n"""
    write_json(OUT / "01-user-journeys.json", {"stage": "Stage 4", "status": "draft", "user_journeys": journeys, "related_stage_1_workflows": launch_workflows, "related_stage_2_context": list(s2), "ux_decisions": assumptions[:2], "risks": risk_list, "unresolved_questions": ["Stage 4 decision brief approval"], "stage_5_handoff": {"ready": False, "reason": "Awaiting Stage 4 decision brief approval"}})
    write_json(OUT / "02-interaction-architecture.json", {"stage": "Stage 4", "status": "draft", "interaction_architecture": interactions, "related_stage_3_constraints": s3["04-api-architecture.json"].get("stage_4_handoff_notes", []), "ux_decisions": assumptions, "risks": risk_list})
    write_json(OUT / "03-screen-system.json", {"stage": "Stage 4", "status": "draft", **screen_system, "related_stage_1_workflows": launch_workflows, "related_stage_3_constraints": ["Async jobs return job IDs", "Authenticated workspace context required", "Bulk actions idempotent"]})
    write_json(OUT / "04-feature-behaviors.json", {"stage": "Stage 4", "status": "draft", **feature_behaviors, "related_stage_1_features": launch_features, "related_stage_3_architecture_constraints": ["Deterministic validation gate", "Route Handler -> Domain Service -> Repository", "BullMQ for long-running work"]})
    write_json(OUT / "05-state-transition-map.json", {"stage": "Stage 4", "status": "draft", **states, "ux_decisions": assumptions, "risks": risk_list})
    write_json(OUT / "06-accessibility-framework.json", {"stage": "Stage 4", "status": "draft", "accessibility_framework": accessibility, "related_stage_4_states": states["screen_states"]})
    write_json(OUT / "07-ui-blueprint-specification.json", {"stage": "Stage 4", "status": "draft", "ui_blueprints": page_blueprints, "frontend_build_package": frontend, "visual_spec_inventory": [x["visual_spec"] for x in page_blueprints], "visual_reference_selection": design_system["visual_reference_selection"], "stitch_prototype_gate": stitch_gate, "stage_5_handoff": {"ready": False, "reason": "Awaiting Stage 4 decision brief approval"}})
    write_json(OUT / "08-design-system-foundation.json", {"stage": "Stage 4", "status": "draft", "design_system": design_system, "ui_blueprint_alignment": [{"ui_blueprint_id": x["ui_blueprint_id"], "design_system_id": "DESIGN-SYSTEM-001"} for x in page_blueprints], "stitch_design_system_mapping": {"stage_scope": "stage_4_local_only", "source_design_system_id": "DESIGN-SYSTEM-001", "important_note": "Stitch remains prototype evidence only; Stage 5 consumes canonical Stage 4 outputs."}, "stage_5_handoff": {"ready": False, "reason": "Awaiting approval"}})
    write_text(OUT / "09-complete-app-blueprint.md", "# Complete App Blueprint\n\n## Pages\n\n" + "\n".join(f"- **{x['page_name']}** (`{x['ui_blueprint_id']}`)\n  - Route: `{x['navigation']['route']}`\n  - Sections: Primary work area\n  - Components: Primary task component; shared AppShell patterns\n  - Actions: " + ", ".join(x["actions"]) + "\n  - States: loading, empty, populated, saving, success, error, permission_denied\n  - Data: workspace-scoped records and status where applicable" for x in page_blueprints) + "\n\n## Shared Components\n\n" + "\n".join(f"- {x}" for x in frontend["shared_components"]) + "\n\n## Routes\n\n" + "\n".join(f"- `{x['path']}`" for x in route_inventory) + "\n\n## Frontend build package summary\n\n- Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui-compatible primitives.\n- Implement shared job status, searchable data tables, bulk actions, accessible drawers, forms, and state components before page-specific composition.\n- Every interactive element is mapped in `07-ui-blueprint-specification.json` action inventory.\n\n## Stage 4 Stitch prototype gate\n\nStitch MCP prototype evidence is Stage-4-local and does not change the Stage 5 handoff contract.\n\n- Prototype constraints prompt: `STITCH-PROMPT-STAGE-4-PROTOTYPE-CONSTRAINTS`\n- Page approval ledger: recorded in `07-ui-blueprint-specification.json` and `Build-Plans/Build-status/UX-state.json`\n- Component extraction checklist: required after page approval\n- No orphan interaction gate: every interactive component must resolve to `route`, `action`, or `no_navigation`\n")
    write_json(STATUS / "UX-state.json", {"stage": "Stage 4", "command": "stage-4-ux-interaction-architecture", "status": "needs_ux_revision", "stage_1_inputs": paths["stage_1"], "stage_2_inputs": paths["stage_2"], "stage_3_inputs": paths["stage_3"], "preflight": {"status": "passed", "required_inputs_present": present, "primary_users_defined": True, "mvp_workflows_defined": True, "feature_structure_clear": True, "security_constraints_available": True, "api_and_data_constraints_available": True, "architecture_status": read(STATUS / "Architecture-state.json").get("status")}, "user_journeys": {"output": "Build-Plans/Stage-4/01-user-journeys.json", "journeys": journeys}, "interaction_architecture": {"output": "Build-Plans/Stage-4/02-interaction-architecture.json", **interactions}, "screen_system": {"output": "Build-Plans/Stage-4/03-screen-system.json", **screen_system}, "feature_behaviors": {"output": "Build-Plans/Stage-4/04-feature-behaviors.json", **feature_behaviors}, "state_transition_map": states, "accessibility_framework": accessibility, "ui_blueprints": {"output": "Build-Plans/Stage-4/07-ui-blueprint-specification.json", "pages": page_blueprints}, "visual_spec_inventory": [x["visual_spec"] for x in page_blueprints], "design_system_foundation": design_system, "visual_reference_selection": design_system["visual_reference_selection"], "frontend_build_package": frontend, "stitch_prototype": stitch_gate, "ux_decisions": assumptions, "ux_risks": risk_list, "interaction_tradeoffs": interactions["tradeoffs"], "open_questions": ["Approve recommended UX/UI direction in Stage 4 decision brief"], "interactive_guidance": {"open_questions": ["UX-GUIDANCE-001"], "answered_questions": [], "assumptions_made": assumptions, "blocked_decisions": [], "user_confirmations": [], "ux_confidence_gaps": ["Visual direction approval pending"]}, "stage_decision_brief": brief, "stage_5_handoff": {"ready": False, "reason": "Stage 4 decision brief approval is required"}, "completion_status": {"status": "needs_ux_revision", "reason": "Awaiting user approval of recommended UX/UI direction", "ready_for": "stage_5"}, "generated_at": now()})
    write_text(OUT / "00-stage-decision-brief.md", brief_md)
    print("Stage 4 artifacts generated; approval pending.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
