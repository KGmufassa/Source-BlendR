"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { blueprintActions } from "../../workspace-routes";
import { DataTable, FormField, SearchFilterBar } from "../page-actions";

type CatalogItem = {
  id: string;
  name: string;
  sku: string;
  type: string;
  priceCents: number;
  currency: string;
};

export function CatalogClient({ initialItems }: { initialItems: CatalogItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [message, setMessage] = useState("");
  const visibleItems = items.filter((item) => {
    const matchesQuery = [item.name, item.sku].some((value) => value.toLowerCase().includes(query.toLowerCase()));
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesQuery && matchesType;
  });

  async function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Saving…");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/catalog-items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        sku: form.get("sku"),
        type: form.get("type"),
        priceCents: Math.round(Number(form.get("price")) * 100),
        currency: form.get("currency"),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error?.message ?? "Unable to save item.");
      return;
    }
    setItems((current) => [result.data, ...current]);
    event.currentTarget.reset();
    setMessage("Catalog item saved.");
  }

  return (
    <>
      <section className="panel">
        <div className="section-header">
          <div>
            <h2>Catalog</h2>
            <p className="muted">Search, filter, and open workspace-owned records.</p>
          </div>
          <Link className="button primary" href={blueprintActions.newCatalogItem.href} data-element={blueprintActions.newCatalogItem.elementId}>{blueprintActions.newCatalogItem.label}</Link>
        </div>
        <SearchFilterBar onSubmit={(event) => event.preventDefault()}>
          <label>Search catalog
            <input data-element={blueprintActions.searchCatalog.elementId} data-action={blueprintActions.searchCatalog.actionId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label>Type filter
            <select data-element={blueprintActions.filterCatalog.elementId} data-action={blueprintActions.filterCatalog.actionId} value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="all">all</option>
              {["product", "service", "rental", "labor", "manufacturing", "installation"].map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
        </SearchFilterBar>
        <DataTable label="Catalog records">
          <thead><tr><th>Name</th><th>SKU</th><th>Type</th><th>Price</th><th>Action</th></tr></thead>
          <tbody>
            {visibleItems.map((item) => (
              <tr key={item.id}>
                <td data-label="Name">{item.name}</td>
                <td data-label="SKU">{item.sku}</td>
                <td data-label="Type">{item.type}</td>
                <td data-label="Price">{new Intl.NumberFormat("en-US", { style: "currency", currency: item.currency }).format(item.priceCents / 100)}</td>
                <td data-label="Action"><Link className="button" href={`/app/catalog/${item.id}`} data-element={blueprintActions.openItem.elementId}>{blueprintActions.openItem.label}</Link></td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
      <section className="panel">
        <h2>Add catalog item</h2>
        <form className="form-grid" onSubmit={createItem}>
          <FormField label="Name"><input name="name" required maxLength={200} /></FormField>
          <FormField label="SKU"><input name="sku" required maxLength={80} /></FormField>
          <FormField label="Type">
            <select name="type" defaultValue="product">
              {["product", "service", "rental", "labor", "manufacturing", "installation"].map((type) => <option key={type}>{type}</option>)}
            </select>
          </FormField>
          <FormField label="Price"><input name="price" required min="0" step="0.01" type="number" /></FormField>
          <FormField label="Currency"><input name="currency" required defaultValue="USD" minLength={3} maxLength={3} /></FormField>
          <div className="wide"><button type="submit" data-element={blueprintActions.saveItem.elementId} data-action={blueprintActions.saveItem.actionId}>{blueprintActions.saveItem.label}</button></div>
        </form>
        <p aria-live="polite" className={message.startsWith("Unable") ? "error" : "status"}>{message}</p>
      </section>
    </>
  );
}
