# SageReel Playwright Scraping Architecture (v1.0)

## Guiding Principle

Playwright is responsible for **rendering and navigating websites**, not interpreting them. AI is responsible for **understanding the website structure and extracting normalized data**. The two systems remain decoupled so any AI model can be swapped in without changing the scraping engine.

---

# Architecture Overview

```text
User
 │
 ▼
Vendor URL
 │
 ▼
Discovery Engine (Playwright)
 │
 ▼
AI Site Analysis
 │
 ▼
Category Tree Cache
 │
 ▼
User Category Selection
 │
 ▼
Category Jobs
 │
 ▼
Subcategory Jobs
 │
 ▼
Product / Service Extraction
 │
 ▼
Normalization
 │
 ▼
Minimal Product Picker
 │
 ▼
User Catalog
```

---

# Phase 1 — Vendor Discovery

When a vendor is first added:

1. Launch Playwright.
2. Render the homepage.
3. Expand navigation menus if necessary.
4. Capture the rendered DOM.
5. Send the rendered content to the AI extraction layer.
6. AI identifies:

   * Categories
   * Subcategories
   * Services
   * Navigation hierarchy
7. Save the discovered navigation tree to the database.

No products are scraped during this phase.

---

# Phase 2 — Category Tree

The AI builds a normalized navigation tree.

Example:

```text
Vendor
│
├── Apparel
│     ├── T-Shirts
│     ├── Hoodies
│     └── Hats
│
├── Drinkware
│     ├── Tumblers
│     └── Bottles
│
└── Printing
      ├── Business Cards
      └── Flyers
```

This tree becomes the primary navigation structure for all future scraping.

---

# Phase 3 — User Selection

Users select only the categories and subcategories they want to import.

Example:

```text
☑ Apparel
    ☑ Hoodies
    ☑ Hats

☐ Drinkware

☑ Printing
    ☑ Business Cards
```

Each selected node becomes an independent scraping job.

---

# Phase 4 — Recursive Scraping

Each selected node is processed independently.

Workflow:

1. Open category.
2. Navigate to subcategory.
3. Scroll as needed.
4. Handle pagination.
5. Handle "Load More" buttons.
6. Collect product or service listings.
7. Continue recursively until product or service pages are reached.

The scraper walks the website as a tree instead of attempting a full-site crawl.

---

# Phase 5 — AI Classification

For every page visited, the AI classifies the page type:

* Category
* Subcategory
* Product Listing
* Product Detail
* Service Listing
* Service Detail
* Informational Page
* Ignore

The classification determines the next action.

---

# Phase 6 — Extraction

When a product or service listing is reached, the AI extracts structured data such as:

Products:

* Name
* Description
* Price
* Images
* SKU (when available)
* Brand
* Category
* Variant information

Services:

* Service name
* Description
* Starting price
* Turnaround
* Options
* Images
* Requirements

---

# Phase 7 — Normalization

All extracted data is converted into SageReel's unified schema regardless of vendor terminology.

Examples:

* "Price", "Starting At", and "As Low As" become `basePrice`.
* "MOQ", "Minimum Qty", and "Minimum Order" become `minimumOrder`.

This ensures all vendors use a consistent data model.

---

# Phase 8 — Product Picker

Users never interact with raw scraped HTML.

Instead, they see minimal product or service cards with an option to import only the items they need.

Imported items become fully editable within SageReel.

---

# Category-First Strategy

SageReel will never perform full-site scraping by default.

Instead, it follows this workflow:

1. Discover website structure.
2. Cache the navigation tree.
3. Allow user selection.
4. Scrape only selected categories and subcategories.
5. Extract products and services.
6. Normalize and import.

---

# Lazy Scraping

Products are not scraped until requested.

Example:

```text
Vendor Added
      │
      ▼
Discover Categories
      │
      ▼
Save Tree
      │
      ▼
User Selects Category
      │
      ▼
Scrape Category
      │
      ▼
Extract Products
```

This reduces bandwidth, browser usage, AI costs, and processing time.

---

# Parallel Job Processing

Each category or subcategory is treated as an independent job, allowing concurrent processing.

Example:

```text
Job 1
Apparel → Hoodies

Job 2
Printing → Flyers

Job 3
Drinkware → Tumblers
```

Jobs can be retried or resumed independently without affecting others.

---

# Responsibilities

## Playwright

* Launch browser
* Render JavaScript
* Navigate pages
* Expand menus
* Click categories
* Scroll pages
* Handle pagination
* Handle infinite scrolling
* Capture rendered DOM

Playwright never determines product meaning or business logic.

## AI Layer

* Discover categories
* Build navigation tree
* Classify page types
* Extract structured information
* Normalize data
* Support interchangeable AI models

The AI layer remains model-agnostic to support OpenAI, Anthropic, local models, or future providers.

---

# Core Design Principles

* Category-first discovery
* Recursive navigation
* Lazy scraping
* Parallel job execution
* Cached navigation trees
* Model-agnostic AI extraction
* Normalized vendor schema
* Minimal product selection interface
* Fully editable imported products and services
* Independent, fault-tolerant scraping jobs

This architecture serves as the foundational scraping system for SageReel and should guide future development of the scraping engine, extraction pipeline, and vendor import workflow.
