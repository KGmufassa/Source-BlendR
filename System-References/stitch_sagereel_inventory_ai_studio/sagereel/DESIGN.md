---
name: SageReel
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#a43a3a'
  on-tertiary: '#ffffff'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base-unit: 8px
  sidebar-width: 260px
  sidebar-collapsed: 72px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system embodies a "Precision Minimalist" aesthetic tailored for B2B inventory automation and AI workflows. The personality is calm, efficient, and authoritative, prioritizing cognitive ease over decorative flair. 

The visual style is characterized by a "Corporate Modern" approach with a flat, structured execution. It utilizes ample white space, high-quality typography, and a strict adherence to a logical grid to facilitate rapid data processing. Every element serves a functional purpose, avoiding gradients, blurs, or unnecessary ornamentation to maintain a professional atmosphere that feels reliable and "always-on."

## Colors
The palette is intentionally restrained to focus the user's attention on data and status. 

- **Primary Emerald (#10B981):** Reserved strictly for primary call-to-actions, success states, and active automation indicators. 
- **Neutral Slate (#64748B):** Used for secondary text, icons, and non-critical UI elements to reduce visual noise.
- **Surface & Background (#F8FAFC, #FFFFFF):** A crisp white is used for card surfaces and inputs, while the slate-tinted background provides subtle contrast for the layout structure.
- **Borders (#E2E8F0):** Low-contrast dividers that define structure without interrupting the flow of information.

## Typography
This design system uses Inter exclusively to ensure high legibility in data-dense environments. 

- **Headlines:** Use semi-bold weights with slight negative letter-spacing for a modern, compact look.
- **Body Text:** Standard body text is set at 14px to balance density and readability.
- **Labels:** Small labels and metadata use a slightly heavier weight (Medium/Semi-bold) to ensure clarity at small sizes.
- **Mobile Adjustments:** For mobile screens, `headline-lg` should scale down to 24px to maintain visual hierarchy without excessive scrolling.

## Layout & Spacing
The layout follows a precise 8px grid system. The interface is desktop-first, designed for efficiency and multi-pane workflows.

- **Grid Model:** A 12-column fluid grid is used for the main content area, while the persistent sidebar remains fixed.
- **Sidebar:** A collapsible navigation drawer (260px) allows for maximum screen real estate when needed.
- **Top Bar:** A global header contains search and breadcrumbs, pinned to the top of the viewport.
- **Density:** Padding inside cards and lists should be consistent (16px or 24px) to maintain a dense but "breathable" feel.
- **Responsive Behavior:** On tablet, the sidebar collapses by default. On mobile, the grid shifts to 1 column with reduced horizontal margins (16px).

## Elevation & Depth
Depth is conveyed through subtle tonal layers and "Ambient Shadows" rather than heavy borders or deep shadows.

- **Tonal Layering:** The background is #F8FAFC, and primary content containers (cards, modals) are #FFFFFF.
- **Shadows:** Use a single, very soft shadow for floating elements: `0px 1px 3px rgba(0,0,0,0.05), 0px 4px 6px rgba(0,0,0,0.02)`. This provides just enough lift to signify interactable surfaces.
- **Outlines:** All containers should feature a 1px solid border in #E2E8F0 to provide crisp definition in the light-themed UI.

## Shapes
The shape language is "Rounded," striking a balance between professional rigidity and modern softness.

- **Base Radius:** All primary UI components (Buttons, Inputs, Cards) use a **12px (0.75rem)** corner radius.
- **Small Elements:** Tooltips and tags use a reduced 4px or 6px radius to maintain sharp definition.
- **Interactive States:** Focus states should use a 2px offset ring in the primary Emerald color to ensure high accessibility.

## Components
- **Buttons:** Primary buttons are solid Emerald (#10B981) with white text. Secondary buttons use a slate outline or ghost style. High-contrast hover states are required.
- **Inputs:** Text fields feature a 1px #E2E8F0 border, 12px radius, and a subtle #F8FAFC background that turns white on focus.
- **Cards:** White background, 12px radius, 1px border, and the ambient shadow defined in the Elevation section.
- **Sidebar:** A vertical navigation system using Slate (#64748B) icons. Active states are indicated by a 3px Emerald vertical bar on the left edge and a subtle background tint.
- **Chips/Tags:** Used for inventory status (e.g., "In Stock"). Use a very pale tint of the status color (e.g., pale green background with dark green text) for high readability.
- **Global Search:** Centrally located in the top bar, featuring a prominent search icon and a keyboard shortcut hint (e.g., ⌘K).
- **Data Tables:** High-density rows with 1px bottom borders. Row hovering should trigger a subtle #F8FAFC background highlight.