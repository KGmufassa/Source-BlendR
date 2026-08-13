"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";

export type DiscoveryItem = {
  id: string;
  sourceKind: "candidate" | "manual";
  sessionId: string | null;
  itemType: string;
  name: string;
  sku: string;
  priceCents: number;
  vendorPriceCents: number | null;
  currency: string;
  status: string;
  vendorId: string | null;
  vendorName: string;
  sourceType: string;
  sourceLabel: string;
  category: string;
  imageUrl: string | null;
};

type CatalogOption = { id: string; name: string };

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", width: "100%", minWidth: 1120, background: "#f9f8f6", color: "#333" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, padding: "32px 32px 20px" },
  breadcrumb: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "#78716c", fontSize: 13 },
  title: { margin: 0, color: "#1c1917", fontSize: 20, fontWeight: 900, letterSpacing: "-.03em" },
  subtitle: { margin: "8px 0 0", color: "#78716c", fontSize: 13 },
  content: { padding: "0 32px 48px" },
  toolbar: { display: "grid", gap: 12, border: "1px solid #e7e5e4", borderBottom: 0, borderRadius: "8px 8px 0 0", background: "#fff", padding: 16 },
  toolbarRow: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  controls: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 },
  input: { minHeight: 36, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#292524", padding: "0 12px", fontSize: 12 },
  search: { width: 280 },
  select: { minHeight: 36, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 30px 0 10px", fontSize: 12 },
  primary: { minHeight: 34, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 14px", fontSize: 12, fontWeight: 900 },
  secondary: { minHeight: 34, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 14px", fontSize: 12, fontWeight: 800 },
  tableCard: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: "0 0 8px 8px", background: "#fff", boxShadow: "0 1px 3px rgb(0 0 0 / 6%)" },
  scroll: { overflowX: "auto" },
  table: { width: "100%", minWidth: 1120, borderCollapse: "collapse", fontSize: 13 },
  th: { borderBottom: "1px solid #e7e5e4", background: "#fafaf9", color: "#71717a", padding: "14px", textAlign: "left", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" },
  td: { borderBottom: "1px solid #f5f5f4", padding: "13px 14px", verticalAlign: "middle", color: "#57534e" },
  checkbox: { width: 17, minHeight: 17, accentColor: "#a85e2a" },
  thumb: { width: 44, height: 44, display: "grid", placeItems: "center", overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: 5, background: "#f5f5f4", color: "#78716c" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  name: { display: "block", marginBottom: 4, color: "#1c1917", fontWeight: 900 },
  meta: { color: "#78716c", fontSize: 11 },
  status: { display: "inline-flex", border: "1px solid #e7e5e4", borderRadius: 5, background: "#f5f5f4", padding: "5px 9px", fontSize: 11, fontWeight: 800, textTransform: "capitalize" },
  edit: { border: 0, background: "transparent", color: "#a85e2a", padding: 0, fontSize: 12, fontWeight: 900 },
  footer: { minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "0 18px", color: "#78716c", fontSize: 12 },
  pager: { display: "flex", alignItems: "center", gap: 10 },
  drawer: { position: "fixed", inset: "0 0 0 auto", zIndex: 70, width: 460, display: "flex", flexDirection: "column", borderLeft: "1px solid #e7e5e4", background: "#fff", boxShadow: "-20px 0 50px rgb(0 0 0 / 16%)" },
  drawerHeader: { minHeight: 70, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e7e5e4", padding: "0 24px" },
  drawerBody: { flex: 1, overflowY: "auto", display: "grid", alignContent: "start", gap: 18, padding: 24 },
  field: { display: "grid", gap: 6, color: "#57534e", fontSize: 11, fontWeight: 800 },
  drawerFooter: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, borderTop: "1px solid #e7e5e4", padding: 24 },
  message: { margin: 0, color: "#57534e", fontSize: 12 },
  empty: { padding: 44, textAlign: "center", color: "#78716c" },
} satisfies Record<string, CSSProperties>;

function ImagePreview({ item }: { item: DiscoveryItem }) {
  const [failed, setFailed] = useState(false);
  return <span style={styles.thumb}>{item.imageUrl && !failed ? <img src={item.imageUrl} alt={`${item.name} preview`} style={styles.image} onError={() => setFailed(true)} /> : <span aria-label="No image available">No image</span>}</span>;
}

function paramValue(params: URLSearchParams, name: string, fallback = ""): string {
  return params.get(name) ?? fallback;
}

export function DiscoveryOverviewClient({ initialItems, catalogs }: { initialItems: DiscoveryItem[]; catalogs: CatalogOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<string[]>([]);
  const [editId, setEditId] = useState<string | null>(searchParams.get("edit"));
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [catalogId, setCatalogId] = useState(catalogs[0]?.id ?? "");

  const query = paramValue(searchParams, "query");
  const type = paramValue(searchParams, "type");
  const vendor = paramValue(searchParams, "vendor");
  const source = paramValue(searchParams, "source");
  const category = paramValue(searchParams, "category");
  const rawStatus = paramValue(searchParams, "status");
  const pageSize = [20, 50, 100].includes(Number(paramValue(searchParams, "pageSize", "20"))) ? Number(paramValue(searchParams, "pageSize", "20")) : 20;
  const requestedPage = Math.max(1, Number(paramValue(searchParams, "page", "1")) || 1);

  const options = useMemo(() => ({
    vendors: [...new Set(items.map((item) => item.vendorName))].sort(),
    sources: [...new Set(items.map((item) => item.sourceType))].sort(),
    categories: [...new Set(items.map((item) => item.category))].sort(),
    statuses: [...new Set(items.map((item) => item.status))].sort(),
    types: [...new Set(items.map((item) => item.itemType))].sort(),
  }), [items]);

  const filtered = useMemo(() => items.filter((item) => {
    const haystack = `${item.name} ${item.sku} ${item.vendorName} ${item.category} ${item.sourceType} ${item.sourceLabel}`.toLowerCase();
    const statusMatch = rawStatus === "review-required" ? ["new", "updated", "conflict"].includes(item.status) : rawStatus === "resolved" ? ["imported", "ignored", "archived"].includes(item.status) : rawStatus ? item.status === rawStatus : true;
    return (!query || haystack.includes(query.toLowerCase())) && (!type || item.itemType === type) && (!vendor || item.vendorName === vendor) && (!source || item.sourceType === source) && (!category || item.category === category) && statusMatch;
  }), [items, query, type, vendor, source, category, rawStatus]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const selectedItems = items.filter((item) => selected.includes(item.id));
  const editItem = items.find((item) => item.id === editId) ?? null;

  function updateParams(changes: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) value ? next.set(key, value) : next.delete(key);
    if (!("page" in changes)) next.set("page", "1");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    setSelected([]);
  }

  async function mutate(action: "import" | "ignore" | "archive") {
    if (!selectedItems.length) return;
    setPending(true);
    setMessage(`${action === "import" ? "Importing" : action === "ignore" ? "Ignoring" : "Archiving"} selected items…`);
    const response = await fetch("/api/discovery-items", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, items: selectedItems.map(({ id, sourceKind, sessionId }) => ({ id, sourceKind, sessionId })) }) });
    const result = await response.json();
    if (response.ok) {
      const status = action === "import" ? "imported" : action === "ignore" ? "ignored" : "archived";
      setItems((current) => current.map((item) => selected.includes(item.id) && !(action === "import" && item.sourceKind === "manual") ? { ...item, status } : item));
      setSelected([]);
      setMessage(`${result.data.updated ?? result.data.imported ?? 0} item(s) ${status}.`);
    } else setMessage(result.error?.message ?? "The selected action failed.");
    setPending(false);
  }

  async function addToCatalog() {
    const candidateIds = selectedItems.filter((item) => item.sourceKind === "candidate").map((item) => item.id);
    if (!catalogId || !candidateIds.length) return;
    setPending(true);
    const response = await fetch(`/api/catalogs/${catalogId}/members`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ candidateIds }) });
    const result = await response.json();
    setMessage(response.ok ? `${result.data.added} item(s) added to the catalog.` : result.error?.message ?? "Unable to add items to the catalog.");
    if (response.ok) setSelected([]);
    setPending(false);
  }

  const allVisibleSelected = visible.length > 0 && visible.every((item) => selected.includes(item.id));

  return <div className="discovery-prototype-page" style={styles.page}>
    <header style={styles.header}>
      <div><nav style={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span aria-hidden="true">›</span><strong aria-current="page" style={{ color: "#1c1917" }}>Discovery</strong></nav><h1 style={styles.title}>Discovery</h1><p style={styles.subtitle}>Review imported products and services, then organize them into catalogs.</p></div>
      <Link href="/app/catalog/new" style={{ ...styles.primary, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>Create Catalog</Link>
    </header>
    <main style={styles.content}>
      <section style={styles.toolbar} aria-label="Discovery controls">
        <div style={styles.toolbarRow}>
          <div style={styles.controls}>
            <label><span className="sr-only">Search discovery</span><input type="search" value={query} placeholder="Search products, SKU, vendors…" style={{ ...styles.input, ...styles.search }} onChange={(event) => updateParams({ query: event.target.value })} /></label>
            <Filter label="Type" value={type} options={options.types} onChange={(value) => updateParams({ type: value })} />
            <Filter label="Vendor" value={vendor} options={options.vendors} onChange={(value) => updateParams({ vendor: value })} />
            <Filter label="Source" value={source} options={options.sources} onChange={(value) => updateParams({ source: value })} />
            <Filter label="Category" value={category} options={options.categories} onChange={(value) => updateParams({ category: value })} />
            <Filter label="Status" value={rawStatus} options={options.statuses} onChange={(value) => updateParams({ status: value })} />
            <button type="button" style={styles.secondary} onClick={() => { router.replace(pathname); setSelected([]); }}>Clear filters</button>
          </div>
          <label style={styles.meta}>Items per page <select aria-label="Items per page" value={pageSize} style={styles.select} onChange={(event) => updateParams({ pageSize: event.target.value })}><option>20</option><option>50</option><option>100</option></select></label>
        </div>
        <div style={styles.toolbarRow}>
          <span style={styles.meta}>{selected.length} selected on this page</span>
          <div style={styles.controls}>
            <button disabled={pending || !selected.length} type="button" style={styles.primary} onClick={() => void mutate("import")}>Import Selected</button>
            <button disabled={pending || !selected.length} type="button" style={styles.secondary} onClick={() => void mutate("ignore")}>Ignore</button>
            <button disabled={pending || !selected.length} type="button" style={styles.secondary} onClick={() => void mutate("archive")}>Archive</button>
            {catalogs.length ? <><select aria-label="Catalog destination" value={catalogId} style={styles.select} onChange={(event) => setCatalogId(event.target.value)}>{catalogs.map((catalog) => <option key={catalog.id} value={catalog.id}>{catalog.name}</option>)}</select><button disabled={pending || !selectedItems.some((item) => item.sourceKind === "candidate")} type="button" style={styles.secondary} onClick={() => void addToCatalog()}>Add to Catalog</button></> : null}
          </div>
        </div>
        <p aria-live="polite" style={styles.message}>{message}</p>
      </section>
      <section style={styles.tableCard}>
        <div style={styles.scroll}><table aria-label="Imported products and services" style={styles.table}>
          <thead><tr><th style={styles.th}><input type="checkbox" aria-label="Select visible page" checked={allVisibleSelected} style={styles.checkbox} onChange={(event) => setSelected(event.target.checked ? visible.map((item) => item.id) : [])} /></th><th style={styles.th}>Image</th><th style={styles.th}>Product or Service</th><th style={styles.th}>Type</th><th style={styles.th}>SKU</th><th style={styles.th}>Vendor</th><th style={styles.th}>Vendor Price</th><th style={styles.th}>Category</th><th style={styles.th}>Source</th><th style={styles.th}>Status</th><th style={{ ...styles.th, textAlign: "right" }}>Action</th></tr></thead>
          <tbody>{visible.map((item) => <tr key={`${item.sourceKind}:${item.id}`}>
            <td style={styles.td}><input type="checkbox" aria-label={`Select ${item.name}`} checked={selected.includes(item.id)} style={styles.checkbox} onChange={(event) => setSelected((current) => event.target.checked ? [...new Set([...current, item.id])] : current.filter((id) => id !== item.id))} /></td>
            <td style={styles.td}><ImagePreview item={item} /></td>
            <td style={styles.td}><strong style={styles.name}>{item.name}</strong><span style={styles.meta}>{item.sourceLabel}</span></td>
            <td style={styles.td}>{item.itemType}</td><td style={styles.td}>{item.sku}</td><td style={styles.td}>{item.vendorName}</td>
            <td style={styles.td}>{item.vendorPriceCents === null ? "Not provided" : new Intl.NumberFormat("en-US", { style: "currency", currency: item.currency }).format(item.vendorPriceCents / 100)}</td>
            <td style={styles.td}>{item.category}</td><td style={styles.td}>{item.sourceType}</td><td style={styles.td}><span style={styles.status}>{item.status}</span></td>
            <td style={{ ...styles.td, textAlign: "right" }}><button type="button" style={styles.edit} onClick={() => setEditId(item.id)}>Edit</button></td>
          </tr>)}</tbody>
        </table></div>
        {!visible.length ? <div style={styles.empty}>{items.length ? "No products or services match these filters." : "No imported products or services are available yet."}</div> : null}
        <footer style={styles.footer}><span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><span style={styles.pager}><button type="button" style={styles.secondary} disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}>Previous</button><span>Page {page} of {pageCount}</span><button type="button" style={styles.secondary} disabled={page >= pageCount} onClick={() => updateParams({ page: String(page + 1) })}>Next</button></span></footer>
      </section>
    </main>
    {editItem ? <ProductDrawer item={editItem} onClose={() => setEditId(null)} onSaved={(updated) => { setItems((current) => current.map((item) => item.id === updated.id ? updated : item)); setEditId(null); setMessage(`${updated.name} saved.`); }} /> : null}
  </div>;
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label><span className="sr-only">{label}</span><select aria-label={label} value={value} style={styles.select} onChange={(event) => onChange(event.target.value)}><option value="">All {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function ProductDrawer({ item, onClose, onSaved }: { item: DiscoveryItem; onClose: () => void; onSaved: (item: DiscoveryItem) => void }) {
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
    const updated = { ...item, name: String(form.get("name")), sku: String(form.get("sku")), priceCents: Math.round(Number(form.get("price")) * 100), vendorPriceCents: form.get("vendorPrice") === "" ? null : Math.round(Number(form.get("vendorPrice")) * 100), currency: String(form.get("currency")).toUpperCase(), status: item.sourceKind === "candidate" ? "updated" : item.status };
    const response = await fetch("/api/discovery-items", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "save", id: item.id, sourceKind: item.sourceKind, name: updated.name, sku: updated.sku, priceCents: updated.priceCents, vendorPriceCents: updated.vendorPriceCents, currency: updated.currency }) });
    const result = await response.json();
    if (response.ok) onSaved(updated); else setMessage(result.error?.message ?? "Unable to save this item.");
    setPending(false);
  }

  return <aside style={styles.drawer} aria-label="Product Details"><header style={styles.drawerHeader}><div><h2 style={{ margin: 0, fontSize: 18 }}>Product Details</h2><p style={styles.meta}>{item.vendorName} · {item.sourceType}</p></div><button aria-label="Close product details" type="button" style={styles.edit} onClick={onClose}>Close</button></header><form onSubmit={save} style={{ display: "contents" }}><div style={styles.drawerBody}><ImagePreview item={item} /><label style={styles.field}>Product or Service Name<input required name="name" defaultValue={item.name} style={styles.input} /></label><label style={styles.field}>SKU<input required name="sku" defaultValue={item.sku} style={styles.input} /></label><label style={styles.field}>Unit Price<input required name="price" type="number" min="0" step="0.01" defaultValue={(item.priceCents / 100).toFixed(2)} style={styles.input} /></label><label style={styles.field}>Vendor Price<input name="vendorPrice" type="number" min="0" step="0.01" defaultValue={item.vendorPriceCents === null ? "" : (item.vendorPriceCents / 100).toFixed(2)} style={styles.input} /></label><label style={styles.field}>Currency<input required name="currency" minLength={3} maxLength={3} defaultValue={item.currency} style={styles.input} /></label><p role="alert" style={styles.message}>{message}</p></div><footer style={styles.drawerFooter}><button type="button" style={styles.secondary} onClick={onClose}>Cancel</button><button disabled={pending} type="submit" style={styles.primary}>{pending ? "Saving…" : "Save"}</button></footer></form></aside>;
}
