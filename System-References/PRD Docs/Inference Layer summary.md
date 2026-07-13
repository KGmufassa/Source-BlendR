# Source BlendR Architecture Decision Record (ADR)

# ADR-001: AI-Agnostic Inference Architecture

**Status:** Approved

## Vision

Source BlendR is **not an AI platform**.

Source BlendR is a **business application that uses AI**.

The architecture should allow **any supported AI provider** to power any AI feature within the application without requiring changes to business logic.

The application should never know whether OpenAI, Anthropic, Gemini, Ollama, or a future model performed the work.

---

# Core Principles

- AI Provider Agnostic
- Capability-Based Routing
- Separation of Scraping and AI
- Universal Import Pipeline
- Deterministic Business Logic
- Standardized Data Contracts
- Modular Components
- Future Extensibility Without Overengineering

---

# High Level Architecture

```text
                        Source BlendR
                               │
                               ▼
                     Universal Import Pipeline
                               │
      ┌────────────────────────┼────────────────────────┐
      │                        │                        │
      ▼                        ▼                        ▼
 Website Scanner          PDF Importer          CSV/API Importer
 (Playwright)             (Parser)             (Parser/Connector)
      │                        │                        │
      └────────────────────────┴────────────────────────┘
                               │
                               ▼
                      Ingestion Engine
                               │
                Parse • Clean • Normalize • Transform
                               │
                               ▼
                  Normalized Product JSON
                               │
                               ▼
                           AI Engine
                               │
                     Capability Router
                               │
                      Provider Registry
          ┌────────────┼────────────┼────────────┐
          │            │            │            │
     OpenAI Adapter Claude Adapter Gemini Adapter Ollama Adapter
                               │
                               ▼
                  AI Enriched Product JSON
                               │
                               ▼
                      Validation Engine
                               │
                               ▼
                  Clickable Product Catalog
                               │
                               ▼
                      Inventory Database
```

---

# Universal Import Pipeline

Every source follows the exact same pipeline.

```
External Source

↓

Import Connector

↓

Ingestion Engine

↓

Normalized Product JSON

↓

AI Engine

↓

Validation

↓

User Review

↓

Inventory
```

The source changes.

The pipeline never changes.

---

# Import Connectors

Import connectors are responsible only for collecting raw data.

Examples:

- Playwright Website Scanner
- PDF Catalog Parser
- CSV Importer
- Excel Importer
- Vendor API Connector
- Shopify Connector (future)
- PromoStandards Connector (future)

Import Connectors DO NOT use AI.

Their only responsibility is collecting data.

---

# Ingestion Engine

The Ingestion Engine is responsible for preparing data for AI.

Responsibilities:

- Parse
- Normalize
- Clean
- Transform
- Standardize
- Convert into Source BlendR format

Every import source produces the exact same output.

Example:

```json
{
  "vendor": "S&S Activewear",
  "title": "Bella Canvas 3001",
  "description": "...",
  "price": "$6.25",
  "images": [],
  "documents": [],
  "attributes": {},
  "metadata": {}
}
```

This object becomes the application's canonical product format before AI enrichment.

---

# AI Engine

The AI Engine receives only Normalized Product JSON.

It never receives:

- HTML
- PDFs
- CSV files
- Website pages

Responsibilities:

- Execute AI requests
- Route requests
- Normalize responses
- Handle retries
- Handle fallbacks
- Manage providers

---

# AI Provider Adapter Pattern

Source BlendR uses an Adapter Architecture instead of a Plugin Architecture.

Every AI provider implements the same interface.

```ts
interface AIProvider {

    generate(request: AIRequest): Promise<AIResponse>

    embed?(text: string): Promise<number[]>

    vision?(input: VisionRequest): Promise<AIResponse>

    speechToText?(audio: File): Promise<string>

    healthCheck?(): Promise<boolean>

}
```

Examples:

```
OpenAI Adapter

Claude Adapter

Gemini Adapter

Ollama Adapter
```

Adapters translate Source BlendR requests into provider-specific API calls and return standardized responses.

Business logic never communicates directly with provider SDKs.

---

# Provider Registry

Providers are registered once.

Example:

```ts
AIRegistry.register("openai", new OpenAIProvider())

AIRegistry.register("anthropic", new ClaudeProvider())

AIRegistry.register("gemini", new GeminiProvider())

AIRegistry.register("ollama", new OllamaProvider())
```

Adding a provider requires:

1. Create Adapter
2. Register Adapter
3. Configure Routing

Nothing else changes.

---

# Capability Router

The application routes AI requests by capability.

Example:

```json
{
    "catalogExtraction": "anthropic",
    "semanticSearch": "gemini",
    "marketingCopy": "openai",
    "ocrCleanup": "ollama"
}
```

The application never asks for:

```
Use GPT

Use Claude
```

Instead it asks:

```
Execute catalogExtraction

Execute semanticSearch

Execute flyerGeneration
```

The router selects the provider.

---

# AI Workflow

Example:

Vendor Website

↓

Playwright Scraper

↓

Raw HTML

↓

Ingestion Engine

↓

Normalized Product JSON

↓

AI Engine

↓

Catalog Extraction Capability

↓

Claude Adapter

↓

Structured Product JSON

↓

Validation Engine

↓

Clickable Product List

↓

User Imports Products

---

# Validation Engine

Validation is deterministic.

AI never writes directly to inventory.

Validation checks include:

- Missing Fields
- Duplicate Products
- SKU Validation
- Price Validation
- Category Validation
- Business Rules
- Inventory Conflicts

Only validated products proceed.

---

# User Review

Users review products before import.

Example:

```
☑ Bella Canvas 3001

☑ Gildan 5000

☐ Next Level 3600

☑ Richardson 112
```

Users control what enters inventory.

---

# Inventory Import

Only validated products become inventory records.

Inventory always originates from the same pipeline regardless of source.

---

# Future Expansion

The architecture intentionally supports future additions without redesign.

Examples:

New AI Providers

- Groq
- DeepSeek
- Mistral
- xAI
- OpenRouter
- Future Models

New Import Sources

- Shopify
- WooCommerce
- SanMar API
- PromoStandards
- Google Drive
- Dropbox
- Email Attachments

Future AI Features

- Cost-based Routing
- User-selected Providers
- Automatic Failover
- Provider Health Monitoring
- Workflow Orchestration
- MCP Integration

These additions do not require changes to the business layer.

---

# Out of Scope (Version 1)

The following are intentionally excluded to avoid unnecessary complexity:

- Plugin Marketplace
- Runtime Plugin Discovery
- Dynamic Module Loading
- Third-party Extension System
- Manifest Files
- Complex Dependency Injection
- AI Agent Frameworks

These can be added later if real product requirements justify them.

---

# Guiding Principles

### 1. AI is an implementation detail.

Business workflows never know which model is being used.

---

### 2. Every product enters through one pipeline.

No matter the source.

---

### 3. AI only enriches structured data.

AI never scrapes websites.

AI never parses PDFs directly within workflows.

---

### 4. Validation is deterministic.

AI assists.

Business logic decides.

---

### 5. Adapters isolate provider differences.

Changing AI providers should never require rewriting business logic.

---

### 6. Build only what is needed today.

Design for extension.

Do not design for hypothetical complexity.

---

# Architecture Philosophy

> **Source BlendR is an inventory and business management platform powered by AI—not an AI platform itself.**

The architecture prioritizes simplicity, maintainability, and provider independence by treating AI as a replaceable service behind a stable adapter interface, allowing any supported model to power application capabilities without affecting business workflows.
