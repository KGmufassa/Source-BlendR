# Skill — ui-blueprint-specification

# Purpose

The `ui-blueprint-specification` skill transforms Stage 4 UX requirements into implementation-ready UI blueprints without generating frontend code.

It defines:

* pages
* screens
* layouts
* components
* navigation
* user actions
* forms
* tables
* cards
* modals
* drawers
* loading states
* empty states
* error states
* frontend build package inputs

This skill is the bridge between Stage 4 UX architecture and Stage 5 frontend implementation planning.

It consumes the selected Stage 4 design system and visual references from `design-system-foundation`. It applies those decisions per page instead of inventing a separate visual direction for each blueprint.

---

# Operating Rule

Do not ask broad questions such as:

```text
What should this dashboard look like?
```

Force every launch-critical page through the page-definition matrix:

```text
PAGE
Purpose
Primary User
Screen Type
Layout Type
Sections
Components
Actions
Data Needed
States
Validation
Navigation
```

Then force every launch-critical page through the visual spec matrix:

```text
VISUAL SPEC
Visual Style
Design System Refs
Visual Reference Refs
Density
Color Direction
Typography Feel
Component Style
Primary Visual Focus
Responsive Behavior
Visual Do Rules
Visual Don't Rules
Reference Apps
Design System Alignment
Visual Acceptance Criteria
User Approval Status
```

---

# Controlled Choices

Screen type options:

```text
Dashboard
List
Detail View
Form
Wizard
Settings
Profile
Analytics
Messaging
Landing Page
Hero Page
Marketing Page
Onboarding
Pricing
Authentication
Admin
Checkout
Custom
```

Screen/page type selection must be contextual.

These options are a controlled vocabulary, not a required checklist. Include only page or screen types justified by:

* Stage 1 product category and MVP scope
* Stage 1 workflows and feature structure
* Stage 3 selected stack and architecture constraints
* Stage 4 user journeys and launch-critical interactions
* user roles, permissions, and navigation needs

Do not add `Landing Page`, `Hero Page`, `Dashboard`, `Admin`, `Checkout`, `Authentication`, `Pricing`, or any other page type unless the product model requires it.

For each selected page type, record:

```json
{
  "page_name": "",
  "screen_type": "",
  "included_because": [],
  "source_refs": [],
  "excluded_page_types": [
    {
      "screen_type": "",
      "reason": ""
    }
  ]
}
```

Ask the user only when a launch-critical page type is ambiguous. Otherwise infer the page type from upstream workflow, role, feature, and route evidence, and record the assumption.

Layout type options:

```text
Sidebar
Top Navigation
Split View
Card Grid
Table
Mobile First
Full Screen
Custom
```

Component options:

```text
Cards
Charts
Tables
Search
Filters
Forms
Tabs
Modals
Drawers
Notifications
File Upload
Comments
Timeline
Maps
Calendar
```

Action options:

```text
Create
Read
Update
Delete
Export
Share
Invite
Approve
Reject
Upload
Download
```

Visual style options:

```text
Minimal
Enterprise
Editorial
Consumer App
SaaS Dashboard
Data Dense
Playful
Luxury
Utility
Custom
```

Density options:

```text
Compact
Balanced
Spacious
Data Dense
Mobile First
Custom
```

Component style options:

```text
Flat
Outlined
Soft Card
High Contrast
Dense Utility
Media Rich
Custom
```

---

# Complete App Blueprint Markdown

Generate a readable complete app blueprint tree at:

```text
Build-Plans/Stage-4/09-complete-app-blueprint.md
```

The markdown tree must use this structure, adapted to the app being built. The example page names below are illustrative only; the generated tree must include the pages required by the actual product:

```text
Complete App Blueprint
│
├── Pages
│   ├── Example Landing Page
│   │   ├── Hero
│   │   ├── Feature Preview
│   │   ├── CTA
│   │   └── Footer
│   ├── Example Dashboard
│   │   ├── Summary Cards
│   │   ├── Activity Feed
│   │   └── Task Table
│
├── Components
│
├── Shared Components
│
├── Navigation
│
├── Routes
│
├── Actions
│
├── States
│
├── Data Requirements
│
└── Frontend Build Package
```

Every launch-critical page in the markdown tree must map to a `ui_blueprint_id` and include its sections, components, primary actions, route, states, and data requirements.

---

# Visual Hierarchy Model

Each page blueprint must preserve:

```text
Page
├─ Section
│  ├─ Component
│  │  ├─ Action
│  │  ├─ Data Source
│  │  ├─ Validation
│  │  └─ States
```

---

# Interactive Element Schema

Every interactive element on a page (button, link, icon button, menu item, tab, input, etc.) must be enumerated with:

```json
{
  "element_id": "",
  "element_type": "button | link | icon_button | menu_item | tab | toggle | checkbox | radio | select | text_input | search_input | file_upload | date_picker",
  "label": "",
  "icon": "",
  "route_target": "",
  "action_id": "",
  "behavior": "navigate | submit | open_modal | open_drawer | toggle | trigger_action | open_link | download | call_api | scroll_to",
  "behavior_target": "",
  "states": {
    "default": {},
    "loading": {},
    "disabled": {},
    "active": {},
    "hover": {}
  },
  "permission_required": "",
  "confirmation_required": false,
  "analytics_event": "",
  "source_trace": []
}
```

# Action Inventory Schema

Every action across all pages must be recorded in a global action inventory:

```json
{
  "action_id": "",
  "name": "",
  "element_type": "button | link | icon_button | menu_item | tab | toggle | checkbox | radio | select",
  "label": "",
  "route_target": "",
  "behavior": "navigate | submit | open_modal | open_drawer | toggle | trigger_action | open_link | download | call_api | scroll_to",
  "behavior_target": "",
  "owning_page_refs": [],
  "owning_component_refs": [],
  "permission_required": "",
  "confirmation_required": false,
  "states": {},
  "analytics_event": "",
  "source_trace": []
}
```

# Route Inventory Schema

Every route across all pages must be recorded in a global route inventory:

```json
{
  "route_id": "",
  "path": "",
  "page_ref": "",
  "page_name": "",
  "screen_type": "",
  "is_launch_critical": false,
  "role_access": [],
  "owning_journey_ids": [],
  "related_routes": [],
  "source_trace": []
}
```

# Navigation Inventory Schema

Every navigation item across the app must be recorded:

```json
{
  "nav_item_id": "",
  "label": "",
  "route_target": "",
  "icon": "",
  "order": 0,
  "group": "",
  "permission_required": "",
  "children": [],
  "owning_page_refs": []
}
```

---

# Interactive Guidance Responsibilities

Ask the user to confirm or choose:

* screen type
* layout type
* sections
* components
* user actions
* required states
* shared components
* route and navigation expectations
* visual style
* density
* color direction
* typography feel
* component style
* primary visual focus
* visual do and don't rules
* visual acceptance criteria
* user approval status

Ask no more than 1-3 page-definition questions at once.

Infer common UI patterns when strongly implied by screen type and workflow, but record assumptions in:

```text
interactive_guidance.assumptions_made
```

Pause for user input when:

* a launch-critical page lacks purpose
* a screen type cannot be inferred
* layout choice materially affects navigation or implementation
* required components or actions are ambiguous
* required states are missing for a launch-critical interaction
* visual style, density, or primary visual focus is missing for a launch-critical page
* the user has not approved the visual spec for a launch-critical page

---

# Inputs

```json
{
  "user_journeys": {},
  "interaction_architecture": {},
  "screen_system": {},
  "feature_behaviors": {},
  "state_transition_map": {},
  "accessibility_framework": {},
  "design_system_foundation": {},
  "visual_reference_selection": {},
  "existing_state": {}
}
```

Read and update shared UX state from:

```text
Build-Plans/Build-status/UX-state.json
```

---

# Outputs

Write or update:

```text
Build-Plans/Stage-4/07-ui-blueprint-specification.json
```

The output must include:

```json
{
  "stage": "Stage 4",
  "status": "",
  "ui_blueprints": [],
  "page_inventory": [],
  "page_type_selection_rationale": [],
  "component_inventory": [],
  "visual_spec_inventory": [],
  "visual_reference_selection": {},
  "shared_components": [],
  "navigation_inventory": [],
  "route_inventory": [],
  "state_inventory": [],
  "action_inventory": [],
  "frontend_build_package": {
    "page_count": 0,
    "component_count": 0,
    "shared_component_count": 0,
    "frontend_tasks": [],
    "recommended_skills": [
      "frontend-design",
      "frontend-builder"
    ],
    "task_generator_notes": [],
    "agent_builder_notes": []
  },
  "visual_approval_status": {},
  "ui_blueprint_markdown_path": "",
  "complete_app_blueprint_markdown_path": "Build-Plans/Stage-4/09-complete-app-blueprint.md",
  "stage_5_handoff": {}
}
```

Each `ui_blueprints[]` entry must include the page-definition matrix, interactive element hierarchy, and visual spec:

```json
{
  "ui_blueprint_id": "",
  "page_ref": "",
  "page_name": "",
  "purpose": "",
  "primary_user_role": "",
  "screen_type": "",
  "layout_type": "",
  "route": "",
  "design_system_refs": [],
  "visual_reference_refs": [],
  "design_system_alignment": {
    "aligned": false,
    "alignment_notes": [],
    "intentional_deviations": []
  },
  "sections": [
    {
      "section_id": "",
      "name": "",
      "components": [
        {
          "component_id": "",
          "component_type": "",
          "interactive_elements": [
            {
              "element_id": "",
              "element_type": "button | link | icon_button | ...",
              "label": "",
              "route_target": "",
              "action_id": "",
              "behavior": "navigate | submit | ...",
              "behavior_target": "",
              "states": {},
              "permission_required": "",
              "confirmation_required": false
            }
          ],
          "data_source": "",
          "validation": ""
        }
      ]
    }
  ],
  "navigation": [
    {
      "nav_item_id": "",
      "label": "",
      "route_target": "",
      "icon": "",
      "permission_required": "",
      "children": []
    }
  ],
  "global_actions": [
    {
      "element_id": "",
      "element_type": "button | link | ...",
      "label": "",
      "route_target": "",
      "action_id": "",
      "behavior": "navigate | submit | ...",
      "behavior_target": ""
    }
  ],
  "states": {
    "loading": {},
    "empty": {},
    "error": {},
    "success": {},
    "populated": {}
  },
  "data_requirements": [],
  "validation_requirements": [],
  "accessibility_requirements": [],
  "responsive_requirements": [],
  "frontend_task_hints": [],
  "recommended_skills": ["frontend-design", "frontend-builder"],
  "visual_spec": {
    "visual_style": "",
    "design_system_refs": [],
    "visual_reference_refs": [],
    "density": "",
    "color_direction": "",
    "typography_feel": "",
    "component_style": "",
    "primary_visual_focus": "",
    "responsive_behavior": "",
    "visual_do_rules": [],
    "visual_dont_rules": [],
    "reference_apps": [],
    "design_system_alignment": {
      "aligned": false,
      "alignment_notes": [],
      "intentional_deviations": []
    },
    "visual_acceptance_criteria": [],
    "user_approval_status": "unconfirmed"
  },
  "source_trace": []
}
```

Also produce the required complete app blueprint tree under:

```text
Build-Plans/Stage-4/09-complete-app-blueprint.md
```

When useful, also produce a readable `UI_BLUEPRINT.md` reference under:

```text
Build-Plans/Stage-4/UI_BLUEPRINT.md
```

---

# Shared State Updates

Update:

```text
ui_blueprints
visual_spec_inventory
visual_reference_selection
frontend_build_package
stage_5_handoff
interactive_guidance
ux_confidence_gaps
```

Persist updates to:

```text
Build-Plans/Build-status/UX-state.json
```

---

# Validation Responsibilities

Validate:

* every launch-critical page has a UI blueprint
* every launch-critical page appears in `Build-Plans/Stage-4/09-complete-app-blueprint.md`
* every selected page type has an inclusion rationale tied to upstream product, workflow, role, feature, journey, or route evidence
* every UI blueprint has purpose, primary user, screen type, layout type, sections, components, actions, data needs, states, validation, and navigation
* every launch-critical UI blueprint has a visual spec with style, density, color direction, typography feel, component style, primary visual focus, responsive behavior, visual do and don't rules, visual acceptance criteria, and user approval status
* every launch-critical UI blueprint references the selected design system or explicitly records why no design system applies
* every launch-critical UI blueprint references selected visual style references or explicitly records why no visual reference applies
* every launch-critical UI blueprint records design system alignment and any intentional deviations
* every UI blueprint maps page -> section -> component -> interactive element -> route -> data source -> validation -> states
* every interactive element has an element_type, label, and either a route_target or action_id
* every interactive element with navigate behavior has a route_target that exists in route_inventory
* every action in action_inventory maps back to its owning page and component
* every route in route_inventory maps to a blueprint page_ref
* every navigation item has a route_target pointing to a valid route in route_inventory
* every launch-critical page enumerates every interactive element in every component and section
* every frontend build package can reference visual specs for frontend tickets
* component inventory, shared components, routes, states, actions, and interactive elements are defined
* complete app blueprint markdown maps every launch-critical page to a `ui_blueprint_id`
* complete app blueprint markdown includes page sections, components, actions, routes, states, data requirements, and frontend build package summary
* frontend build package is usable by frontend-design, frontend-builder, task generators, and agent builders
* no frontend code is generated
