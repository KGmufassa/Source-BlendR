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
Density
Color Direction
Typography Feel
Component Style
Primary Visual Focus
Responsive Behavior
Visual Do Rules
Visual Don't Rules
Reference Apps
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
Custom
```

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
  "component_inventory": [],
  "visual_spec_inventory": [],
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
  "stage_5_handoff": {}
}
```

Each `ui_blueprints[]` entry must include:

```json
{
  "ui_blueprint_id": "",
  "page_ref": "",
  "visual_spec": {
    "visual_style": "",
    "density": "",
    "color_direction": "",
    "typography_feel": "",
    "component_style": "",
    "primary_visual_focus": "",
    "responsive_behavior": "",
    "visual_do_rules": [],
    "visual_dont_rules": [],
    "reference_apps": [],
    "visual_acceptance_criteria": [],
    "user_approval_status": "unconfirmed"
  }
}
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
* every UI blueprint has purpose, primary user, screen type, layout type, sections, components, actions, data needs, states, validation, and navigation
* every launch-critical UI blueprint has a visual spec with style, density, color direction, typography feel, component style, primary visual focus, responsive behavior, visual do and don't rules, visual acceptance criteria, and user approval status
* every UI blueprint maps page -> section -> component -> action -> data source -> validation -> states
* every frontend build package can reference visual specs for frontend tickets
* component inventory, shared components, routes, states, and actions are defined
* frontend build package is usable by frontend-design, frontend-builder, task generators, and agent builders
* no frontend code is generated
