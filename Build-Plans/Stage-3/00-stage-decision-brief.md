# Stage 3 - Source BlendR System Architecture Decision Brief

**Stage:** Stage 3 - System Architecture
**Brief ID:** `BRIEF-STAGE-3-001`
**Status:** Approved
**Approved by:** user
**Approved at:** 2026-07-13T04:54:03.245720+00:00

---

# Revised Direction

The architecture has been revised to match your requested constraints:

- Keep **Next.js full-stack** and do not introduce a separate backend framework.
- Retain a **separate BullMQ worker** for all long-running tasks.
- Centralize business logic in a shared **Domain Service layer**.
- Use a **pnpm monorepo** with shared packages consumed by both web and worker.
- Preserve the **AI Capability Router + Provider Adapter** interface.
- Separate **scraping** and **AI enrichment** so records can be re-enriched without re-scraping.

---

# Selected Concrete Stack

| Area | Selection |
|---|---|
| Frontend / app | Next.js App Router full-stack app |
| Backend boundary | Next.js route handlers and server actions |
| Business logic layer | Route Handler / Server Action -> Domain Service -> Repository -> Prisma |
| Worker logic layer | BullMQ Processor -> Domain Service -> Repository -> Prisma |
| Worker runtime | Separate TypeScript BullMQ worker on Redis |
| Long-running work | Website scraping, PDF/OCR extraction, AI enrichment, re-enrichment, sync, exports |
| Database | PostgreSQL with Prisma |
| Search | PostgreSQL full-text for MVP; external search deferred |
| Auth | Clerk Organizations |
| Storage | Backblaze B2 |
| Web/API deployment | Vercel |
| Worker deployment | Fly.io |
| Database hosting | Neon PostgreSQL |
| Redis hosting | Upstash Redis |
| Package manager | pnpm workspaces |
| Testing | Vitest, route/server action tests, worker tests, Playwright, Prisma test DB, tenant/security tests |

---

# Monorepo Layout

```text
apps/
  web/       # Next.js app, route handlers, server actions
  worker/    # BullMQ processors, Playwright runtime, OCR/export jobs
packages/
  domain/    # Domain services, use cases, business orchestration
  ai/        # AI Capability Router, Provider Adapters, normalized AI contracts
  scrapers/  # Playwright/PDF/OCR source collection and normalization
  shared/    # Logging, config, errors, utilities
  validation/# Deterministic validation rules and catalog write gates
  types/     # Shared DTOs, queue payloads, API contracts, schemas
```

Both `apps/web` and `apps/worker` consume the same domain, validation, types, and shared packages. The worker also consumes `packages/scrapers`; AI integration is always through `packages/ai`.

---

# Domain Service Rule

Business logic must not live directly in route handlers, server actions, or BullMQ processors.

Required flow:

```text
Route Handler / Server Action
  -> Domain Service
  -> Repository
  -> Prisma
  -> PostgreSQL
```

Worker flow:

```text
BullMQ Processor
  -> Domain Service
  -> Repository
  -> Prisma
  -> PostgreSQL
```

This keeps web and worker behavior consistent and prevents duplicated business logic.

---

# AI Integration Rule

The **AI Capability Router + Provider Adapter** architecture remains the stable interface for every AI integration.

Rules:

- Domain services request capabilities, not providers.
- No route handler, worker processor, scraper, or validation rule calls provider SDKs directly.
- Provider swaps create new enrichment versions, not new scraping runs.
- Provider-specific request/response details stay inside `packages/ai`.

---

# Scraping And Enrichment Separation

Scraping and AI enrichment are independent pipelines.

Scraping pipeline:

```text
External source
  -> scraper / PDF extractor
  -> raw import artifact
  -> normalized source record
  -> candidate seed
```

AI enrichment pipeline:

```text
Normalized source record or candidate
  -> AI Capability Router
  -> Provider Adapter
  -> enrichment result
  -> validation
  -> candidate/catalog update
```

Because normalized source records are persisted, Source BlendR can re-enrich data when the provider, prompt, route, or validation rules change without re-scraping vendor websites or reprocessing PDFs from scratch.

---

# Key Architecture Decisions

- `ADR-001` Use Next.js full-stack monorepo plus separate TypeScript BullMQ worker; do not introduce a separate backend framework.
- `ADR-002` Use BullMQ/Redis for all long-running tasks.
- `ADR-003` Use UniversalCatalogItem base table plus type-specific attributes and normalized fields.
- `ADR-004` Preserve AI Capability Router plus Provider Adapter architecture as the stable AI integration interface.
- `ADR-005` Catalog writes go through deterministic validation from Discovery Session candidate to Catalog Item.
- `ADR-006` Tenant isolation is enforced through workspace_id/tenant_id constraints and service-layer authorization.
- `ADR-007` PostgreSQL full-text search is MVP search; external search is deferred.
- `ADR-008` Centralize business logic in shared Domain Services.
- `ADR-009` Organize implementation as pnpm monorepo with shared packages.
- `ADR-010` Treat scraping and AI enrichment as independent pipelines.

---

# Approval Question

Do you approve this revised architecture for the build?

Allowed decisions:

- Approve tech stack
- Change frontend stack
- Change backend stack
- Change database/auth/deployment
- Choose even simpler architecture
- Choose more scalable architecture

Stage 3 cannot mark `ready_for_stage_4` or send Stage 5 architecture handoff until this stack is approved.
