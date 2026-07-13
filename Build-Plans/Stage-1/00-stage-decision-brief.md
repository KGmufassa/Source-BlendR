# Stage 1 — Source BlendR Decision Brief

**Stage:** Stage 1 — Product Initialization
**Brief ID:** `BRIEF-STAGE-1-001`
**Product:** Source BlendR
**Status:** Pending user approval

---

# App Concept

Source BlendR is an **AI-agnostic Vendor Intelligence Platform** that lets businesses aggregate products and services from multiple vendors into a single curated, user-owned catalog. It emphasizes selective discovery (staging before import), universal catalog items, manual entry as a first-class workflow, background workers for all scraping and AI work, and an adapter architecture that keeps AI providers swappable.

The platform is **not an AI platform** — it is a business application that uses AI as an implementation detail.

---

# Target Users

- **Primary:** Workspace Owner / Catalog Manager (`USER-001`) — owns the workspace, configures vendors, runs imports, reviews Discovery Sessions, curates the catalog, and produces business outputs.
- **Secondary (future):** Team Member (`USER-002`) — invited collaborators once team support ships.
- **Secondary:** AI Provider Administrator (`USER-003`) — configures AI providers, capability routing, and monitors provider health. In V1, this role overlaps with the workspace owner.

---

# Core Problem

Businesses maintain product and service data across many vendors using manual, fragmented, and inconsistent processes. Catalogs drift, copy/paste errors propagate, and there is no single owned source of truth that works with any AI provider.

---

# Main User Outcomes

- One owned catalog assembled from many vendor sources (website, PDF, manual, future connectors).
- Safe discovery via Discovery Sessions — no auto-import; deterministic validation; user review before anything enters inventory.
- AI enrichment that is provider-agnostic and degrades gracefully when no provider is configured.
- Business outputs (flyers, quotes) generated from owned catalog data.
- Transparent vendor and document change history across imports.

---

# Proposed Feature List

## Must-have (launch-critical)

- `FEATURE-001` Website Import (Playwright) — category-first discovery, JS rendering, infinite scroll, pagination, lazy scraping, parallel jobs.
- `FEATURE-002` Vendor Management — create/edit/archive vendors; contacts, notes, categories, sync history.
- `FEATURE-003` PDF Catalog Import — upload, OCR, AI extraction, clickable discovery items.
- `FEATURE-004` Discovery Sessions — staging with candidate states, search, filter, multi-select, preview, edit, bulk import, ignore, archive.
- `FEATURE-005` Universal Catalog Items — products, services, rentals, labor, manufacturing, installation; manual entry as first-class.
- `FEATURE-010` AI Provider Adapter Architecture — pluggable providers, capability router, provider registry, retries/fallbacks, graceful degradation with zero providers.
- `FEATURE-013` Background Workers — scraping and AI processing off the UI thread; per-category jobs independently retryable/resumable.
- `FEATURE-014` Workspace Management — multi-tenant workspaces with AI settings and branding.
- `FEATURE-015` Search and Filtering — global search; vendor, category, item-type filters; tags; favorites.

## Should-have

- `FEATURE-008` Flyer Builder (drag-and-drop, templates, PDF/PNG export)
- `FEATURE-009` Quote Builder (items, quantities, taxes, discounts, shipping, PDF export)
- `FEATURE-011` Document Memory (PDF versioning, change detection)
- `FEATURE-012` Vendor Memory (cross-import change tracking)
- `FEATURE-016` Pricing Engine (fixed, percentage markup, manual; formula deferred)
- `FEATURE-018` Synchronization (manual sync, incremental updates, review before applying)

## Could-have

- `FEATURE-007` Collections (mixed item collections, reusable packages, bulk edit, export)
- `FEATURE-017` Analytics (vendor spend, monthly spend, margin, top vendors, category, quote, catalog growth)

## Deferred (future)

CSV import, team support, inventory management, purchase orders, customer portals, public catalogs, vendor comparison, mobile app, ERP integrations, marketplace integrations, semantic search, collection suggestions, formula pricing, scheduled sync, AI provider health monitoring, automatic failover, cost-based routing, MCP integration.

---

# Feature Priorities (MVP Boundary)

| Priority | Features |
|----------|----------|
| **Must** | 001, 002, 003, 004, 005, 010, 013, 014, 015 |
| **Should** | 008, 009, 011, 012, 016, 018 |
| **Could** | 007, 017 |
| **Defer** | All remaining (future) features |

**Implementation phases:** Foundation → Import & AI → Catalog & Pricing → Business Outputs (should-have; trim/defer if MVP risk grows).

---

# How the App Should Work

1. **Workspace provisioning** — owner creates a workspace and configures AI providers (optional, can be zero).
2. **Vendor management** — owner adds vendors (website URL, PDF, or future sources).
3. **Website discovery** — Playwright renders the vendor homepage; AI builds a normalized category tree; owner selects categories/subcategories; lazy per-category parallel scraping jobs run in the background; AI classifies pages, extracts products/services, and normalizes into the unified schema.
4. **PDF import** — owner uploads a vendor PDF; OCR runs; AI extracts clickable catalog items; output normalized into the unified schema.
5. **Discovery Session staging** — all extracted candidates land in a temporary staging area with states (New, Imported, Updated, Ignored, Archived). Owner searches, filters, multi-selects, previews, edits, bulk-imports, ignores, or archives. Validation engine gates writes.
6. **Catalog** — approved candidates become Universal Catalog Items owned by the workspace. Manual entry is a fully first-class alternative path that requires no AI provider.
7. **Pricing** — owner applies fixed, percentage markup, or manual pricing (formula deferred).
8. **Outputs** — Flyer Builder and Quote Builder compose owned catalog items into PDF/PNG flyers or PDF quotes with taxes, discounts, and shipping.
9. **Memory & sync (should-have)** — repeat imports diff against prior versions; Document Memory and Vendor Memory keep timeline history; manual sync with review before applying changes.
10. **Background workers** keep the UI responsive throughout. AI never writes directly to inventory; deterministic validation decides.

---

# MVP Boundary

- Single workspace owner role; team support deferred.
- Manual sync only; scheduled sync deferred.
- Fixed, percentage, manual pricing only; formula pricing deferred.
- No live marketplace/ERP/Shopify/WooCommerce/PromoStandards/CSV integrations.
- No semantic search or collection suggestions.
- Analytics dashboards not launch-blocking.
- Flyer/Quote Builders are should-have; may be trimmed to MVP-minimal or deferred if risk grows.
- Document Memory / Vendor Memory are should-have; ship minimal version history or defer.
- No AI plug-in marketplace, runtime plug-in discovery, dynamic module loading, manifest files, complex DI, or AI agent frameworks.
- **AI is optional**; manual entry and Discovery Sessions fully operate without any provider.

---

# Assumptions

- `ASSUMPTION-SEED-001` (0.60) — Playwright + AI-assisted site analysis handles the majority of target-market vendor sites.
- `ASSUMPTION-SEED-002` (0.65) — Target users value provider independence and owned catalog data.
- `ASSUMPTION-SEED-003` (0.70) — Discovery Sessions are accepted as friction-positive vs auto-import competitors.
- `ASSUMPTION-SEED-004` (0.70) — Universal Catalog Items cover the target market without forcing partial re-architecture.
- `ASSUMPTION-SEED-005` (0.80) — Background workers keep the UI responsive for expected scrape/AI durations without a streaming UI.

---

# High-Severity Risks

- `RISK-001` (high) — Playwright reliability across diverse vendor websites.
- `RISK-005` (high) — Multi-tenancy isolation security gap.
- `RISK-010` (high) — Target market too small or insufficient willingness to pay.

All risks are open with proposed mitigations and are routed to Stage 2 / Stage 3 / Stage 6 for validation.

---

# Intentionally Out of Scope

- Plugin marketplace / runtime plug-in discovery / dynamic module loading
- Third-party extension systems / manifest files / complex DI
- AI agent frameworks
- Scheduled sync, team support, inventory management, purchase orders
- Customer portals, public catalogs, vendor comparison
- Formula pricing, semantic search, collection suggestions
- Mobile app, ERP integrations, marketplace integrations, MCP integration
- E-commerce checkout and payments

---

# Stage 2 Handoff

Stage 2 receives all 10 Stage 1 output files plus the following:

- 5 validation seed assumptions
- 2 high-risk assumption candidates
- 2 architecture-critical assumption candidates
- 3 market validation targets
- 4 technical validation targets
- 2 business validation targets
- 1 operational validation target
- 1 scalability validation target
- 5 known planning gaps

Stage 2 should be able to extract and prioritize assumptions from this handoff without redoing Stage 1 product structuring.

---

# Approval Question

> Does this correctly describe the app you want to build, the features it should include, and how it should work?

**Approval options:**

- Approve direction
- Revise app idea
- Add/remove features
- Change how the app works
- Redefine MVP scope

Stage 1 may not lock product direction or mark itself `ready_for_stage_2` until `stage_decision_brief.approval_status = approved`.
