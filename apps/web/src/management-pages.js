import { DESIGN_TOKENS, renderAppShell } from "./app-shell.js";

function renderRows(items) {
  return items
    .map((item) => `<tr><td data-label="Name">${item.name}</td><td data-label="SKU">${item.sku}</td><td data-label="Price">${item.priceCents}</td></tr>`)
    .join("");
}

export function renderCatalogManagementPage({ items = [] } = {}) {
  return `${renderAppShell({ activePath: "/app/catalog", workspaceName: "Catalog" })}
<section data-route="/app/catalog" data-component="DataTable" data-mobile-behavior="stacked_labeled_records">
  <form role="search" data-action="ACTION-SEARCH-CATALOG">
    <label>Search catalog <input name="query" type="search" data-element="EL-CAT-001"></label>
    <label>Type filter <select name="type" data-element="EL-CAT-002" data-action="ACTION-FILTER-CATALOG"><option>all</option><option>product</option></select></label>
    <label>Category filter <select name="category" data-element="EL-CAT-005" data-action="ACTION-FILTER-CATALOG-CATEGORY"><option>all categories</option><option>products</option><option>services</option></select></label>
    <button type="submit">Search</button>
  </form>
  <a href="/app/catalog">Catalog</a>
  <a href="/app/catalog/new" data-element="EL-CAT-003">New item</a>
  <table>
    <thead><tr><th>Name</th><th>SKU</th><th>Price</th></tr></thead>
    <tbody>${renderRows(items)}</tbody>
  </table>
  <a href="/app/catalog/item-preview" data-element="EL-CAT-004">Open item</a>
  <a href="/app/vendors" data-element="EL-VEN-001">Vendors</a>
</section>`;
}

export function renderCatalogItemFormPage() {
  return `${renderAppShell({ activePath: "/app/catalog/new", workspaceName: "New Catalog Item" })}
<section data-route="/app/catalog/new" data-component="COMP-SCREEN-008-PRIMARY">
  <form data-action="ACTION-SAVE-ITEM">
    <fieldset data-element="EL-FORM-001" class="segmented-control"><legend>Item type</legend><label><input name="item_type" type="radio" value="product" checked>Product</label><label><input name="item_type" type="radio" value="service">Service</label></fieldset>
    <label>Name <input data-element="EL-FORM-002" name="name" value="Green Tea"></label>
    <label>SKU <input data-element="EL-FORM-003" name="sku" value="TEA-1"></label>
    <label>Price <input data-element="EL-FORM-004" name="price" inputmode="numeric" value="450"></label>
    <button type="submit" data-element="EL-FORM-005" data-action="ACTION-SAVE-ITEM">Save item</button>
    <a href="/app/catalog" data-element="EL-FORM-006">Cancel</a>
  </form>
</section>`;
}

export function renderVendorsPage({ vendors = [] } = {}) {
  const rows = vendors
    .map((vendor) => `<tr><td data-label="Vendor">${vendor.name}</td><td data-label="Action"><a href="/app/vendors/${vendor.id}" data-element="EL-VEN-002">Open vendor</a></td></tr>`)
    .join("");

  return `${renderAppShell({ activePath: "/app/vendors", workspaceName: "Vendors" })}
<section data-route="/app/vendors" data-component="COMP-SCREEN-009-PRIMARY">
  <a href="/app/vendors/new" data-element="EL-VEN-001">New vendor</a>
  <table data-component="DataTable" data-mobile-behavior="stacked_labeled_records">
    <thead><tr><th>Vendor</th><th>Action</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</section>`;
}

export function renderAiSettingsPage({ providers = [] } = {}) {
  const providerRows = providers
    .map((provider) => `<tr><td>${provider.id}</td><td>${provider.status}</td><td>${provider.capability}</td></tr>`)
    .join("");

  return `${renderAppShell({ activePath: "/app/settings/ai", workspaceName: "AI Settings" })}
<section data-route="/app/settings/ai" data-state="manual_fallback">
  <a href="/app/settings/ai">AI Provider Settings</a>
  <button type="button" data-element="EL-AI-001">Add provider</button>
  <button type="button" data-element="EL-AI-002" data-action="ACTION-HEALTH-CHECK">Check provider health</button>
  <section aria-label="Provider summary"><p>Configured providers are summarized without exposing credentials.</p></section>
  <table data-component="DataTable" data-mobile-behavior="stacked_labeled_records">
    <thead><tr><th>Provider</th><th>Status</th><th>Capability</th></tr></thead>
    <tbody>${providerRows}</tbody>
  </table>
  <label>Capability route <select data-element="EL-AI-003"><option>Manual fallback</option><option>Local provider</option></select></label>
  <button type="button" style="background:${DESIGN_TOKENS.color.action};color:${DESIGN_TOKENS.color.actionText}" data-element="EL-AI-004" data-action="ACTION-SAVE-AI">Save AI settings</button>
</section>`;
}
