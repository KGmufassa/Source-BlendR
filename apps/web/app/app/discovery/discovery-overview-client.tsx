"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import type { DiscoveryItem } from "@/lib/discovery-index";

export type { DiscoveryItem } from "@/lib/discovery-index";

const BULK_ITEM_TYPES = ["product", "service", "rental", "labor", "manufacturing", "installation"] as const;

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", width: "100%", minWidth: 1120, background: "#f9f8f6", color: "#333" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, padding: "32px 32px 20px" },
  breadcrumb: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "#78716c", fontSize: 13 },
  title: { margin: 0, color: "#1c1917", fontSize: 20, fontWeight: 900, letterSpacing: "-.03em" },
  subtitle: { margin: "8px 0 0", color: "#78716c", fontSize: 13 },
  content: { padding: "0 32px 48px" },
  toolbar: { display: "grid", gap: 18, border: "1px solid #e7e5e4", borderBottom: 0, borderRadius: "8px 8px 0 0", background: "#fff", padding: 20 },
  toolbarRow: { display: "flex", alignItems: "end", justifyContent: "flex-start", flexWrap: "wrap", gap: 16 },
  searchControl: { display: "grid", flex: "1 1 420px", gap: 7, maxWidth: 560 },
  filters: { display: "grid", gap: 8 },
  controls: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 },
  controlLabel: { color: "#57534e", fontSize: 11, fontWeight: 900, letterSpacing: ".06em", textTransform: "uppercase" },
  footerSummary: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16 },
  pageSizeControl: { display: "flex", alignItems: "center", gap: 8 },
  input: { minHeight: 36, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#292524", padding: "0 12px", fontSize: 12 },
  search: { boxSizing: "border-box", width: "100%", minHeight: 40 },
  select: { minHeight: 36, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 30px 0 10px", fontSize: 12 },
  primary: { minHeight: 34, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 14px", fontSize: 12, fontWeight: 900 },
  destructive: { minHeight: 34, border: "1px solid #b91c1c", borderRadius: 5, background: "#fff", color: "#b91c1c", padding: "0 14px", fontSize: 12, fontWeight: 900 },
  secondary: { minHeight: 34, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 14px", fontSize: 12, fontWeight: 800 },
  reset: { minHeight: 40, padding: "0 18px" },
  tableCard: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: "0 0 8px 8px", background: "#fff", boxShadow: "0 1px 3px rgb(0 0 0 / 6%)" },
  scroll: { overflowX: "auto" },
  table: { width: "100%", minWidth: 900, borderCollapse: "collapse", fontSize: 13 },
  th: { borderBottom: "1px solid #e7e5e4", background: "#fafaf9", color: "#71717a", padding: "14px", textAlign: "left", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" },
  td: { borderBottom: "1px solid #f5f5f4", padding: "13px 14px", verticalAlign: "middle", color: "#57534e" },
  checkbox: { width: 17, minHeight: 17, accentColor: "#a85e2a" },
  thumb: { width: 44, height: 44, display: "grid", placeItems: "center", overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: 5, background: "#f5f5f4", color: "#78716c" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  name: { display: "block", maxWidth: 360, overflow: "hidden", color: "#1c1917", fontWeight: 900, textOverflow: "ellipsis", whiteSpace: "nowrap" },
  sku: { display: "block", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  meta: { color: "#78716c", fontSize: 11 },
  edit: { border: 0, background: "transparent", color: "#a85e2a", padding: 0, fontSize: 12, fontWeight: 900 },
  footer: { minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "0 18px", color: "#78716c", fontSize: 12 },
  pager: { display: "flex", alignItems: "center", gap: 10 },
  drawer: { position: "fixed", inset: "0 0 0 auto", zIndex: 70, width: 460, display: "flex", flexDirection: "column", borderLeft: "1px solid #e7e5e4", background: "#fff", boxShadow: "-20px 0 50px rgb(0 0 0 / 16%)" },
  drawerHeader: { minHeight: 70, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e7e5e4", padding: "0 24px" },
  drawerBody: { flex: 1, overflowY: "auto", display: "grid", alignContent: "start", gap: 18, padding: 24 },
  field: { display: "grid", gap: 6, color: "#57534e", fontSize: 11, fontWeight: 800 },
  drawerFooter: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, borderTop: "1px solid #e7e5e4", padding: 24 },
  message: { margin: 0, color: "#57534e", fontSize: 12 },
  bulkSection: { minHeight: 58, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, border: "1px solid #e7e5e4", borderBottom: 0, background: "#fafaf9", padding: "10px 20px" },
  bulkSummary: { display: "grid", gap: 2 },
  bulkTitle: { color: "#1c1917", fontSize: 12, fontWeight: 900 },
  bulkControls: { display: "flex", alignItems: "end", flexWrap: "wrap", justifyContent: "flex-end", gap: 10 },
  bulkField: { display: "grid", gap: 6 },
  bulkInput: { width: 180 },
  empty: { padding: 44, textAlign: "center", color: "#78716c" },
} satisfies Record<string, CSSProperties>;

function ImagePreview({ item }: { item: DiscoveryItem }) {
  const [failed, setFailed] = useState(false);
  return <span style={styles.thumb}>{item.imageUrl && !failed ? <img src={item.imageUrl} alt={`${item.name} preview`} style={styles.image} onError={() => setFailed(true)} /> : <span aria-label="No image available">No image</span>}</span>;
}

function paramValue(params: URLSearchParams, name: string, fallback = ""): string {
  return params.get(name) ?? fallback;
}

function conciseText(value: string, maximumLength: number): string {
  return value.length > maximumLength ? `${value.slice(0, maximumLength - 1).trimEnd()}…` : value;
}

export function DiscoveryOverviewClient({ initialItems, initialTotal }: { initialItems: DiscoveryItem[]; initialTotal: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [items, setItems] = useState(initialItems);
  const [indexPending, setIndexPending] = useState(initialItems.length < initialTotal);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<"edit" | "delete" | null>(null);
  const [bulkItemType, setBulkItemType] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [editId, setEditId] = useState<string | null>(searchParams.get("edit"));
  const [message, setMessage] = useState("");
  const bulkPending = bulkAction !== null;

  useEffect(() => {
    if (!indexPending) return;
    const controller = new AbortController();
    fetch("/api/discovery-items", { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message ?? "Unable to load the complete Discovery index.");
        setItems(result.data.items as DiscoveryItem[]);
        setIndexPending(false);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== "AbortError") {
          setMessage(error.message);
          setIndexPending(false);
        }
      });
    return () => controller.abort();
  }, [indexPending]);

  const query = paramValue(searchParams, "query");
  const type = paramValue(searchParams, "type");
  const vendor = paramValue(searchParams, "vendor");
  const category = paramValue(searchParams, "category");
  const pageSize = [20, 50, 100].includes(Number(paramValue(searchParams, "pageSize", "20"))) ? Number(paramValue(searchParams, "pageSize", "20")) : 20;
  const requestedPage = Math.max(1, Number(paramValue(searchParams, "page", "1")) || 1);

  const options = useMemo(() => ({
    vendors: [...new Set(items.map((item) => item.vendorName))].sort(),
    categories: [...new Set(items.map((item) => item.category))].sort(),
    types: [...new Set(items.map((item) => item.itemType))].sort(),
  }), [items]);

  const filtered = useMemo(() => items.filter((item) => {
    const haystack = `${item.name} ${item.sku} ${item.vendorName} ${item.category} ${item.sourceType} ${item.sourceLabel}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (!type || item.itemType === type) && (!vendor || item.vendorName === vendor) && (!category || item.category === category);
  }), [items, query, type, vendor, category]);
  const totalResults = indexPending && !query && !type && !vendor && !category ? initialTotal : filtered.length;
  const pageCount = Math.max(1, Math.ceil(totalResults / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const editItem = items.find((item) => item.id === editId) ?? null;
  const selectedItems = items.filter((item) => selected.includes(itemKey(item)));
  const visibleKeys = visible.map(itemKey);
  const allVisibleSelected = visibleKeys.length > 0 && visibleKeys.every((key) => selected.includes(key));
  const normalizedBulkItemType = bulkItemType.trim().toLowerCase();
  const bulkItemTypeValid = !normalizedBulkItemType || (BULK_ITEM_TYPES as readonly string[]).includes(normalizedBulkItemType);

  function updateParams(changes: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!("page" in changes)) next.set("page", "1");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    setSelected([]);
    setBulkItemType("");
    setBulkCategory("");
  }

  async function applyBulkChanges() {
    const categoryValue = bulkCategory.trim();
    if (!selectedItems.length || !bulkItemTypeValid || (!normalizedBulkItemType && !categoryValue)) return;
    setBulkAction("edit");
    setMessage("");
    const response = await fetch("/api/discovery-items", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "bulk-edit", items: selectedItems.map(({ id, sourceKind }) => ({ id, sourceKind })), ...(normalizedBulkItemType ? { itemType: normalizedBulkItemType } : {}), ...(categoryValue ? { category: categoryValue } : {}) }) });
    const result = await response.json();
    if (response.ok) {
      const changedKeys = new Set(selectedItems.map(itemKey));
      setItems((current) => current.map((item) => changedKeys.has(itemKey(item)) ? { ...item, ...(normalizedBulkItemType ? { itemType: normalizedBulkItemType } : {}), ...(categoryValue ? { category: categoryValue } : {}), status: item.sourceKind === "candidate" ? "updated" : item.status } : item));
      setSelected([]);
      setBulkItemType("");
      setBulkCategory("");
      setMessage(`${result.data.updated} item${result.data.updated === 1 ? "" : "s"} updated.`);
    } else setMessage(result.error?.code === "discovery_selection_invalid" ? "One or more selected items are unavailable. Nothing was changed; refresh the list and try again." : result.error?.message ?? "Unable to update the selected items.");
    setBulkAction(null);
  }

  async function deleteSelected() {
    if (!selectedItems.length || !window.confirm(`Delete ${selectedItems.length} selected item${selectedItems.length === 1 ? "" : "s"}? This action cannot be undone.`)) return;
    setBulkAction("delete");
    setMessage("");
    const response = await fetch("/api/discovery-items", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: selectedItems.map(({ id, sourceKind }) => ({ id, sourceKind })) }) });
    const result = await response.json();
    if (response.ok) {
      const deletedKeys = new Set(selectedItems.map(itemKey));
      setItems((current) => current.filter((item) => !deletedKeys.has(itemKey(item))));
      setSelected([]);
      setMessage(`${result.data.deleted} item${result.data.deleted === 1 ? "" : "s"} deleted.`);
    } else setMessage(result.error?.code === "discovery_selection_invalid" ? "One or more selected items are unavailable. Nothing was deleted; refresh the list and try again." : result.error?.message ?? "Unable to delete the selected items.");
    setBulkAction(null);
  }

  return <div className="discovery-prototype-page" style={styles.page}>
    <header style={styles.header}>
      <div><nav style={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span aria-hidden="true">›</span><strong aria-current="page" style={{ color: "#1c1917" }}>Discovery</strong></nav><h1 style={styles.title}>Discovery</h1><p style={styles.subtitle}>Search and edit imported products and services across your workspace.</p></div>
    </header>
    <main style={styles.content}>
      <section style={styles.toolbar} aria-label="Discovery controls">
        <div style={styles.toolbarRow}>
          <label style={styles.searchControl}><span style={styles.controlLabel}>Search</span><input aria-label="Search" type="search" value={query} placeholder="Search products, SKUs, vendors, categories, or sources" style={{ ...styles.input, ...styles.search }} onChange={(event) => updateParams({ query: event.target.value })} /></label>
          <button type="button" style={{ ...styles.secondary, ...styles.reset }} onClick={() => { router.replace(pathname); setSelected([]); setBulkItemType(""); setBulkCategory(""); }}>Reset filters</button>
        </div>
        <div style={styles.filters}>
          <span style={styles.controlLabel}>Filters</span>
          <div style={styles.controls}>
            <Filter label="Type" value={type} options={options.types} onChange={(value) => updateParams({ type: value })} />
            <Filter label="Vendor" value={vendor} options={options.vendors} onChange={(value) => updateParams({ vendor: value })} />
            <Filter label="Category" value={category} options={options.categories} onChange={(value) => updateParams({ category: value })} />
          </div>
        </div>
        {indexPending ? <span className="sr-only" aria-live="polite">Loading the complete Discovery index.</span> : null}
        {message ? <p aria-live="polite" style={styles.message}>{message}</p> : null}
      </section>
      <section aria-label="Bulk actions" style={styles.bulkSection}>
        <span style={styles.bulkSummary}><strong style={styles.bulkTitle}>Bulk actions</strong><span style={styles.meta}>{selected.length} selected</span></span>
        <span style={styles.bulkControls}>
          <label style={styles.bulkField}><span style={styles.controlLabel}>Product Type</span><input aria-invalid={!bulkItemTypeValid} aria-label="Bulk product type" disabled={bulkPending || indexPending} list="bulk-product-type-options" value={bulkItemType} placeholder="Enter product type" style={{ ...styles.input, ...styles.bulkInput }} title="Choose product, service, rental, labor, manufacturing, or installation" onChange={(event) => setBulkItemType(event.target.value)} /></label>
          <datalist id="bulk-product-type-options">{BULK_ITEM_TYPES.map((option) => <option key={option} value={option} />)}</datalist>
          <label style={styles.bulkField}><span style={styles.controlLabel}>Category</span><input aria-label="Bulk category" disabled={bulkPending || indexPending} list="bulk-category-options" value={bulkCategory} placeholder="Enter category" style={{ ...styles.input, ...styles.bulkInput }} onChange={(event) => setBulkCategory(event.target.value)} /></label>
          <datalist id="bulk-category-options">{options.categories.map((option) => <option key={option} value={option} />)}</datalist>
          <button disabled={bulkPending || !selected.length || indexPending || !bulkItemTypeValid || (!normalizedBulkItemType && !bulkCategory.trim())} type="button" style={styles.secondary} onClick={() => void applyBulkChanges()}>{bulkAction === "edit" ? "Applying…" : "Apply changes"}</button>
          <button disabled={bulkPending || !selected.length || indexPending} type="button" style={styles.destructive} onClick={() => void deleteSelected()}>{bulkAction === "delete" ? "Deleting…" : "Delete selected"}</button>
        </span>
      </section>
      <section style={styles.tableCard}>
        <div style={styles.scroll}><table aria-label="Imported products and services" style={styles.table}>
          <thead><tr><th style={styles.th}><input disabled={indexPending || bulkPending} type="checkbox" aria-label="Select visible page" checked={allVisibleSelected} style={styles.checkbox} onChange={(event) => setSelected(event.target.checked ? visibleKeys : [])} /></th><th style={styles.th}>Image</th><th style={styles.th}>Product or Service</th><th style={styles.th}>Type</th><th style={styles.th}>Category</th><th style={styles.th}>SKU</th><th style={styles.th}>Vendor Price</th><th style={{ ...styles.th, textAlign: "right" }}>Action</th></tr></thead>
          <tbody>{visible.map((item) => <tr key={`${item.sourceKind}:${item.id}`}>
            <td style={styles.td}><input disabled={indexPending || bulkPending} type="checkbox" aria-label={`Select ${item.name}`} checked={selected.includes(itemKey(item))} style={styles.checkbox} onChange={(event) => setSelected((current) => event.target.checked ? [...new Set([...current, itemKey(item)])] : current.filter((key) => key !== itemKey(item)))} /></td>
            <td style={styles.td}><ImagePreview item={item} /></td>
            <td style={styles.td}><strong aria-label={item.name} title={item.name} style={styles.name}>{conciseText(item.name, 58)}</strong></td>
            <td style={styles.td}>{item.itemType}</td><td style={styles.td}>{item.category}</td><td style={styles.td}><span aria-label={item.sku} title={item.sku} style={styles.sku}>{conciseText(item.sku, 24)}</span></td>
            <td style={styles.td}>{new Intl.NumberFormat("en-US", { style: "currency", currency: item.currency }).format(item.priceCents / 100)}</td>
            <td style={{ ...styles.td, textAlign: "right" }}><button disabled={indexPending || bulkPending} type="button" style={styles.edit} onClick={() => setEditId(item.id)}>Edit</button></td>
          </tr>)}</tbody>
        </table></div>
        {!visible.length ? <div style={styles.empty}>{items.length ? "No products or services match these filters." : "No imported products or services are available yet."}</div> : null}
        <footer style={styles.footer}><span style={styles.footerSummary}><label style={styles.pageSizeControl}><span className="sr-only">Items per page</span><select aria-label="Items per page" value={pageSize} style={styles.select} onChange={(event) => updateParams({ pageSize: event.target.value })}><option>20</option><option>50</option><option>100</option></select></label><span>Showing {totalResults ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, totalResults)} of {totalResults}</span></span><span style={styles.pager}><button type="button" style={styles.secondary} disabled={page <= 1 || indexPending} onClick={() => updateParams({ page: String(page - 1) })}>Previous</button><span>Page {page} of {pageCount}</span><button type="button" style={styles.secondary} disabled={page >= pageCount || indexPending} onClick={() => updateParams({ page: String(page + 1) })}>Next</button></span></footer>
      </section>
    </main>
    {editItem ? <ProductDrawer item={editItem} onClose={() => setEditId(null)} onDeleted={(deleted) => { setItems((current) => current.filter((item) => itemKey(item) !== itemKey(deleted))); setSelected((current) => current.filter((key) => key !== itemKey(deleted))); setEditId(null); setMessage(`${deleted.name} deleted.`); }} onSaved={(updated) => { setItems((current) => current.map((item) => itemKey(item) === itemKey(updated) ? updated : item)); setEditId(null); setMessage(`${updated.name} saved.`); }} /> : null}
  </div>;
}

function itemKey(item: Pick<DiscoveryItem, "id" | "sourceKind">): string {
  return `${item.sourceKind}:${item.id}`;
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label><span className="sr-only">{label}</span><select aria-label={label} value={value} style={styles.select} onChange={(event) => onChange(event.target.value)}><option value="">All {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function ProductDrawer({ item, onClose, onDeleted, onSaved }: { item: DiscoveryItem; onClose: () => void; onDeleted: (item: DiscoveryItem) => void; onSaved: (item: DiscoveryItem) => void }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    function close(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const updated = { ...item, name: String(form.get("name")), sku: String(form.get("sku")), priceCents: Math.round(Number(form.get("price")) * 100), vendorPriceCents: form.get("vendorPrice") === "" ? null : Math.round(Number(form.get("vendorPrice")) * 100), inventoryQuantity: Number(form.get("inventoryQuantity")), currency: String(form.get("currency")).toUpperCase(), status: item.sourceKind === "candidate" ? "updated" : item.status };
    const response = await fetch("/api/discovery-items", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "save", id: item.id, sourceKind: item.sourceKind, name: updated.name, sku: updated.sku, priceCents: updated.priceCents, vendorPriceCents: updated.vendorPriceCents, inventoryQuantity: updated.inventoryQuantity, currency: updated.currency }) });
    const result = await response.json();
    if (response.ok) onSaved(updated); else setMessage(result.error?.message ?? "Unable to save this item.");
    setPending(false);
  }

  async function removeItem() {
    if (!window.confirm(`Delete ${item.name}? This action cannot be undone.`)) return;
    setPending(true);
    setMessage("");
    const response = await fetch("/api/discovery-items", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: item.id, sourceKind: item.sourceKind }) });
    const result = await response.json();
    if (response.ok) onDeleted(item); else setMessage(result.error?.message ?? "Unable to delete this item.");
    setPending(false);
  }

  return <aside style={styles.drawer} aria-label="Product Details"><header style={styles.drawerHeader}><div><h2 style={{ margin: 0, fontSize: 18 }}>Product Details</h2><p style={styles.meta}>{item.vendorName} · {item.sourceType}</p></div><button aria-label="Close product details" type="button" style={styles.edit} onClick={onClose}>Close</button></header><form onSubmit={save} style={{ display: "contents" }}><div style={styles.drawerBody}><ImagePreview item={item} /><label style={styles.field}>Product or Service Name<input required name="name" defaultValue={item.name} style={styles.input} /></label><label style={styles.field}>SKU<input required name="sku" defaultValue={item.sku} style={styles.input} /></label><label style={styles.field}>Vendor Price<input required name="price" type="number" min="0" step="0.01" defaultValue={(item.priceCents / 100).toFixed(2)} style={styles.input} /></label><label style={styles.field}>Unit Price<input name="vendorPrice" type="number" min="0" step="0.01" defaultValue={item.vendorPriceCents === null ? "" : (item.vendorPriceCents / 100).toFixed(2)} style={styles.input} /></label><label style={styles.field}>Inventory Quantity<input required name="inventoryQuantity" type="number" min="0" step="1" inputMode="numeric" defaultValue={item.inventoryQuantity} style={styles.input} /></label><label style={styles.field}>Currency<input required name="currency" minLength={3} maxLength={3} defaultValue={item.currency} style={styles.input} /></label><p role="alert" style={styles.message}>{message}</p></div><footer style={styles.drawerFooter}><button disabled={pending} type="button" style={styles.destructive} onClick={() => void removeItem()}>{pending ? "Working…" : "Delete"}</button><button disabled={pending} type="submit" style={styles.primary}>{pending ? "Working…" : "Save"}</button></footer></form></aside>;
}
