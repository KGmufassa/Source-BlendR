# Stage 2 - Open Risks Mitigation Suggestions

**Brief ID:** `BRIEF-STAGE-2-001`
**Related:** `00-stage-decision-brief.md`
**Status:** Draft suggestions for decision support

---

## RISK-001: Vendor-site scraping reliability remains unproven

### Assessment
Playwright automation is technically feasible, but representative vendor-site reliability is untested. Sites may change DOM structure, add bot detection, rate-limit, or require authentication.

### Mitigation Suggestions

| Priority | Action | Owner | Timeline |
|----------|--------|-------|----------|
| **P0** | Build a **scraping probe harness** targeting 5–10 representative vendor sites; measure success rate, latency, and failure modes over 2 weeks | Stage 3 Architecture + Dev | Sprint 1–2 |
| **P0** | Define **scraping SLIs/SLOs** (e.g., 90% success per site per week, p95 < 30s) and make them launch gates | Stage 3 Architecture | Sprint 1 |
| **P1** | Implement **adaptive selector strategies**: CSS + XPath + text-based fallback, with auto-healing via ML-based DOM diffing | Dev | Sprint 2–3 |
| **P1** | Add **vendor-site health dashboard**: per-site success rate, last successful scrape, error categorization | Dev + Observability | Sprint 2 |
| **P2** | Negotiate **official APIs / data feeds** with top 3 vendors to bypass scraping entirely | Product + Partnerships | Quarter 1 |
| **P2** | Design **graceful degradation**: manual CSV/JSON import as fallback when scraping fails | Dev | Sprint 3 |

### Stage 3 Architecture Constraints (from decision brief)
- Treat scraping as bounded, observable, retryable background jobs
- Not guaranteed full-site crawling
- Queue with dead-letter handling and exponential backoff

---

## RISK-005: Multi-tenant isolation and AI credential isolation are security-critical

### Assessment
Multi-tenancy spans database, storage, search, queue, and AI credentials. A breach in any layer compromises all tenants. AI credentials (API keys) are high-value targets.

### Mitigation Suggestions

| Priority | Action | Owner | Timeline |
|----------|--------|-------|----------|
| **P0** | Adopt **tenant-per-row with RLS** (Row Level Security) in PostgreSQL; enforce via policy on every table | Stage 3 Architecture + Dev | Sprint 1 |
| **P0** | **Separate AI credential stores per tenant**: HashiCorp Vault or AWS Secrets Manager with tenant-scoped IAM policies | DevOps + Security | Sprint 1 |
| **P0** | **Zero-trust network**: Private subnets per tenant workload, no cross-tenant VPC peering | DevOps | Sprint 1 |
| **P1** | **Search isolation**: Dedicated OpenSearch/Elasticsearch indices per tenant with index-level permissions | Dev | Sprint 2 |
| **P1** | **Queue isolation**: Separate RabbitMQ/Redis streams per tenant; no shared queues | Dev | Sprint 2 |
| **P1** | **Storage isolation**: S3 bucket per tenant with bucket policies; or single bucket with tenant-prefix IAM conditions | DevOps | Sprint 2 |
| **P2** | **Penetration test** focused on cross-tenant data access before launch | Security | Pre-launch |
| **P2** | **Automated compliance checks**: CI gate verifying RLS policies exist on all new tables | DevOps | Sprint 2 |

### Stage 3 Architecture Constraints (from decision brief)
- Enforce tenant isolation across database, storage, search, queue, and AI credentials

---

## RISK-010: Willingness to pay is not directly validated

### Assessment
No pricing research, no pilot customers, no LOI (Letter of Intent). Business confidence at 0.60 (below target).

### Mitigation Suggestions

| Priority | Action | Owner | Timeline |
|----------|--------|-------|----------|
| **P0** | Run **15–20 structured pricing interviews** with target buyers (promo distributors, manufacturers, decorators); use Van Westendorp + feature-value mapping | Product | 2 weeks |
| **P0** | Secure **3–5 LOIs** at proposed price points before Stage 3 completion | Sales + Product | 4 weeks |
| **P1** | Build **pricing calculator** modeling: per-seat vs. per-catalog-item vs. usage-based (scrapes, AI calls) | Product + Finance | Sprint 1 |
| **P1** | Analyze **commonsku / Akeneo / Plytix public pricing** and position relative to value delivered | Product | 1 week |
| **P2** | Design **pilot program**: 90-day free trial with success criteria → auto-convert to paid | Product + Sales | Sprint 3 |
| **P2** | Model **unit economics**: CAC, LTV, gross margin at scale (100 / 1k / 10k tenants) | Finance | Sprint 2 |

### Decision Gate
Do not mark Stage 3 `ready_for_stage_4` without ≥3 LOIs at target price.

---

## RISK-012: Scraping legal/ToS posture is unresolved

### Assessment
Vendor sites' Terms of Service may prohibit automated access. Legal exposure ranges from cease-and-desist to CFAA liability (US) or GDPR/ePrivacy (EU).

### Mitigation Suggestions

| Priority | Action | Owner | Timeline |
|----------|--------|-------|----------|
| **P0** | **Legal review** of ToS for top 20 target vendor sites; classify: allowed / ambiguous / prohibited | Legal (external counsel) | 2 weeks |
| **P0** | Implement **robots.txt compliance** + crawl-delay enforcement as baseline | Dev | Sprint 1 |
| **P1** | **Official data partnership outreach** to vendors in "prohibited" category; negotiate data license | Partnerships + Legal | Quarter 1 |
| **P1** | Build **scraping ethics layer**: user-agent identification, rate limiting per domain, opt-out registry | Dev | Sprint 2 |
| **P2** | **Jurisdiction-aware routing**: Disable scraping for EU vendors unless explicit consent (GDPR Art. 6) | Dev + Legal | Sprint 3 |
| **P2** | Document **risk acceptance** for "ambiguous" sites with mitigation controls | Legal + Product | Sprint 2 |

### Stage 3 Architecture Constraints
- Scraping module must be **pluggable and disableable** per vendor per tenant
- Audit log every scrape request (who, what, when, response code)

---

## RISK-015: Long-running background jobs can silently stall without observability

### Assessment
Scraping, AI enrichment, catalog sync jobs run minutes to hours. No visibility into progress, stalls, or partial failures.

### Mitigation Suggestions

| Priority | Action | Owner | Timeline |
|----------|--------|-------|----------|
| **P0** | **Structured job telemetry**: Emit events at `started`, `checkpoint:N`, `completed`, `failed`, `retried` with correlation IDs | Dev | Sprint 1 |
| **P0** | **Dead-letter queue (DLQ)** with alerting after N retries; auto-create incident in PagerDuty/Opsgenie | DevOps | Sprint 1 |
| **P1** | **Job dashboard**: Per-tenant, per-job-type: throughput, latency p50/p95, success rate, queue depth | Dev + Observability | Sprint 2 |
| **P1** | **Heartbeat mechanism**: Jobs emit progress every 30s; alert if heartbeat missed > 2x expected interval | Dev | Sprint 2 |
| **P1** | **Idempotency keys** on every job; safe retry without duplicate side effects | Dev | Sprint 1 |
| **P2** | **Automatic stall detection**: If job exceeds p99 historical duration, auto-escalate | Observability | Sprint 3 |
| **P2** | **Replay tooling**: One-click re-enqueue of failed jobs with same inputs after fix | Dev | Sprint 3 |

### Stage 3 Architecture Constraints (from decision brief)
- Long-running background jobs must be observable, retryable, and bounded
- Silent stalls are unacceptable

---

## Cross-Risk Architecture Decisions for Stage 3

| Decision | Rationale | Risks Addressed |
|----------|-----------|-----------------|
| **Scraping as async job queue (not sync API)** | Bounded, observable, retryable | RISK-001, RISK-015 |
| **Universal Catalog Item = base entity + JSONB extensions** | Type-specific attributes without schema sprawl | RISK-001 (data shape variance) |
| **AI Provider Adapter Interface (minimal: `complete`, `embed`, `moderate`)** | Swappable providers, capability-based routing | RISK-005 (credential isolation) |
| **Deterministic validation gate (JSON Schema + business rules)** | Discovery Session → Catalog write requires validation | RISK-001 (bad scraped data) |
| **Tenant-scoped everything (DB, search, queue, storage, secrets)** | Zero cross-tenant blast radius | RISK-005 |

---

## Recommended Decision Path

| Option | When to Choose |
|--------|----------------|
| **Proceed to architecture** | You accept all 5 risks and commit to P0 mitigations in Stage 3 Sprint 1 |
| **Run deeper validation** | You need LOIs (RISK-010) or legal opinion (RISK-012) before committing engineering |
| **Revise product assumptions** | You want to drop scraping (RISK-001/012) or multi-tenancy (RISK-005) from MVP |
| **Block progression** | Any single risk is a "showstopper" for your org |

---

*Generated to support Stage 2 decision. Update as mitigations progress.*