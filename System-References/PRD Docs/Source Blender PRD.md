# Source BlendR Feature PRD

**Version:** 1.0\
**Status:** Feature Specification

# Product Overview

Source BlendR is an AI-agnostic Vendor Intelligence Platform that allows
businesses to aggregate products and services from multiple vendors into
a single curated catalog. The platform emphasizes selective discovery,
user ownership of catalog data, and flexible AI integration.

------------------------------------------------------------------------

# Core Product Principles

-   AI-provider agnostic
-   Discovery before import
-   Catalog Items are the primary entity
-   User-owned catalog
-   Manual entry is a first-class workflow
-   Background processing for imports
-   Modular, extensible architecture

------------------------------------------------------------------------

# Core Features

## Workspace Management

-   Multi-tenant workspaces
-   Team support (future)
-   Workspace AI settings
-   Workspace branding

## Vendor Management

-   Create/edit/archive vendors
-   Vendor website
-   Vendor contacts
-   Vendor notes
-   Vendor categories
-   Sync history

## Import Methods

### Website Import

-   Playwright-based discovery
-   JavaScript rendering
-   Infinite scrolling
-   Pagination
-   Category traversal
-   Product discovery
-   Service discovery

### PDF Catalog Import

-   Upload vendor catalogs
-   OCR support
-   AI extraction
-   Clickable discovery items

### Manual Entry

-   Products
-   Services
-   Rentals
-   Labor
-   Manufacturing
-   Installation

### Future

-   CSV import
-   API connectors
-   ERP integrations

------------------------------------------------------------------------

# Discovery Sessions

Temporary staging area for imported content.

Features: - Candidate items - Minimal list interface - Search -
Filtering - Multi-select - Preview panel - Edit before import - Bulk
import - Ignore items

Candidate States: - New - Imported - Updated - Ignored - Archived

------------------------------------------------------------------------

# Catalog

Universal Catalog Items support: - Products - Services - Rentals -
Labor - Manufacturing

Fields: - Name - Description - Vendor - Images - Category - Tags - SKU -
Vendor Cost - Selling Price - Margin - Availability - Notes

------------------------------------------------------------------------

# Pricing Engine

-   Fixed pricing
-   Percentage markup
-   Manual pricing
-   Formula pricing (future)

------------------------------------------------------------------------

# Collections

-   Mixed item collections
-   Reusable packages
-   Bulk editing
-   Export support

------------------------------------------------------------------------

# Flyer Builder

-   Drag-and-drop editor
-   Products and services
-   Branding
-   Templates
-   PDF export
-   PNG export

------------------------------------------------------------------------

# Quote Builder

-   Mixed catalog items
-   Quantities
-   Taxes
-   Discounts
-   Shipping
-   PDF export

------------------------------------------------------------------------

# Analytics

-   Vendor spend
-   Monthly spend
-   Margin analytics
-   Top vendors
-   Category analytics
-   Quote analytics
-   Catalog growth

------------------------------------------------------------------------

# AI Features

AI is optional and provider agnostic.

Capabilities: - Product extraction - Service extraction - PDF
extraction - Categorization - Data normalization - Duplicate detection -
Flyer assistance - Quote assistance - Collection suggestions (future) -
Semantic search (future)

Users may configure: - OpenAI-compatible APIs - Anthropic - Google -
Ollama - LM Studio - LiteLLM - Local models - Custom endpoints

------------------------------------------------------------------------

# Document Memory

-   Version uploaded PDFs
-   Detect new items
-   Detect removed items
-   Detect price changes
-   Detect description changes
-   Review changes before applying

------------------------------------------------------------------------

# Vendor Memory

Track changes across: - Website imports - PDF imports - Future CSV
imports - Future API imports

Timeline includes: - Catalog versions - Price history - New offerings -
Removed offerings

------------------------------------------------------------------------

# Synchronization

-   Manual sync
-   Scheduled sync (future)
-   Incremental updates
-   Review before applying changes

------------------------------------------------------------------------

# Search & Filtering

-   Global search
-   Vendor filter
-   Category filter
-   Item type filter
-   Tags
-   Favorites

------------------------------------------------------------------------

# User Experience

-   Minimal list-based discovery
-   Keyboard friendly
-   Bulk actions
-   Fast search
-   Responsive design

------------------------------------------------------------------------

# Technical Decisions (Locked)

-   Playwright is the web discovery engine.
-   AI is provider agnostic.
-   Catalog Items replace Product-only architecture.
-   Discovery Sessions prevent automatic imports.
-   Manual entry is a primary workflow.
-   PDF imports are equal to website imports.
-   Document Memory and Vendor Memory are core platform features.
-   Background workers handle scraping and AI processing.

------------------------------------------------------------------------

# Future Features

-   Inventory management
-   Purchase orders
-   Customer portals
-   Public catalogs
-   Vendor comparison
-   Price history dashboards
-   AI bundle recommendations
-   Mobile application
-   ERP integrations
-   Marketplace integrations
