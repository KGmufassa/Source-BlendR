# Skill — design-system-foundation

# Purpose

The `design-system-foundation` skill defines the shared visual system that all Stage 4 UI blueprints must follow.

It produces an implementation-ready design contract without generating frontend code.

It defines:

* design system identity
* color tokens
* typography tokens
* spacing scale
* radius rules
* elevation and shadow rules
* icon rules
* button styles
* card styles
* form styles
* table styles
* modal and drawer styles
* navigation styles
* responsive breakpoints
* visual reference handling
* design approval status

This skill turns page-level visual intent into a shared UI consistency foundation.

---

# Operating Rule

Do not generate frontend code or mockups.

Do not ask broad questions such as:

```text
What should the app look like?
```

Use structured choices and targeted confirmation questions to define a reusable design system.

---

# Design System Matrix

Force the shared app design system through this matrix:

```text
DESIGN SYSTEM
Product Visual Personality
Design Style
Color System
Typography System
Spacing System
Radius System
Elevation System
Icon Style
Button Rules
Card Rules
Form Rules
Table Rules
Modal And Drawer Rules
Navigation Rules
Responsive Breakpoints
Visual References
Liked Patterns
Disliked Patterns
Accessibility Constraints
Design Do Rules
Design Don't Rules
Design Approval Status
```

---

# Inputs

```json
{
  "user_journeys": {},
  "interaction_architecture": {},
  "screen_system": {},
  "accessibility_framework": {},
  "ui_blueprints": {},
  "visual_spec_inventory": [],
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
Build-Plans/Stage-4/08-design-system-foundation.json
```

The output must include:

```json
{
  "stage": "Stage 4",
  "status": "",
  "design_system": {
    "design_system_id": "",
    "product_visual_personality": "",
    "design_style": "",
    "color_tokens": {},
    "typography_tokens": {},
    "spacing_scale": {},
    "radius_rules": {},
    "elevation_rules": {},
    "icon_rules": {},
    "component_style_rules": {
      "buttons": {},
      "cards": {},
      "forms": {},
      "tables": {},
      "modals": {},
      "drawers": {},
      "navigation": {}
    },
    "responsive_breakpoints": {
      "desktop": "",
      "tablet": "",
      "mobile": "",
      "collapse_rules": [],
      "mobile_priority_content": []
    },
    "visual_references": [],
    "liked_patterns": [],
    "disliked_patterns": [],
    "accessibility_constraints": [],
    "design_do_rules": [],
    "design_dont_rules": [],
    "design_approval_status": "unconfirmed"
  },
  "ui_blueprint_alignment": [],
  "stage_5_handoff": {}
}
```

---

# Interactive Guidance Responsibilities

Ask the user to confirm or choose:

* product visual personality
* design style
* color direction
* typography feel
* density and spacing
* component style direction
* visual references
* liked and disliked patterns
* approval status for the shared design system

Ask no more than 1-3 design-system questions at once.

Infer low-risk defaults only when they are strongly implied by the product category and visual specs. Record assumptions in:

```text
interactive_guidance.assumptions_made
```

Pause for user input when:

* launch-critical visual specs conflict with each other
* product visual personality is unclear
* color or typography direction is missing
* component style rules are too vague for frontend implementation
* responsive breakpoints or collapse rules are missing
* design approval status is unconfirmed

---

# Shared State Updates

Update:

```text
design_system_foundation
visual_spec_inventory
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

* shared design system exists for launch-critical frontend work
* design system includes color, typography, spacing, radius, elevation, icon, component, and responsive rules
* design system records visual references, liked patterns, disliked patterns, and accessibility constraints when provided
* launch-critical UI blueprints reference or align with the design system
* design approval status is recorded
* Stage 5 can consume the design system without inventing visual direction
* no frontend code is generated
