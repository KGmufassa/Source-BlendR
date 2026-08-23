"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";

export type CatalogMemberView = { id: string; sourceId: string; name: string; description: string; sku: string; vendor: string; category: string; basePriceCents: number; customPriceCents: number | null; currency: string; imageUrl: string | null };
export type CandidateOption = { id: string; name: string; description: string; sku: string; vendor: string; category: string; priceCents: number; currency: string; imageUrl: string | null };

const styles = {
  page: { minHeight: "100vh", minWidth: 1120, background: "#f9f8f6", padding: 32, color: "#292524" },
  header: { display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 24 },
  breadcrumb: { display: "flex", gap: 8, marginBottom: 8, color: "#78716c", fontSize: 13 },
  title: { margin: 0, fontSize: 20, fontWeight: 900 },
  subtitle: { margin: "8px 0 0", color: "#78716c", fontSize: 13 },
  primary: { minHeight: 40, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 16px", fontSize: 12, fontWeight: 900 },
  card: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: 8, background: "#fff" },
  toolbar: { display: "grid", gap: 18, borderBottom: "1px solid #e7e5e4", padding: 20 },
  toolbarRow: { display: "flex", alignItems: "end", flexWrap: "wrap", gap: 16 },
  searchField: { display: "grid", flex: "1 1 420px", gap: 7, maxWidth: 560 },
  filters: { display: "grid", gap: 8 },
  controls: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 },
  controlLabel: { color: "#57534e", fontSize: 11, fontWeight: 900, letterSpacing: ".06em", textTransform: "uppercase" },
  input: { boxSizing: "border-box", minHeight: 40, width: "100%", border: "1px solid #d6d3d1", borderRadius: 5, padding: "0 12px" },
  select: { minHeight: 40, minWidth: 210, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", padding: "0 28px 0 10px" },
  reset: { minHeight: 40, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 18px", fontSize: 12, fontWeight: 800 },
  scroll: { overflowX: "auto" },
  table: { width: "100%", minWidth: 980, borderCollapse: "collapse", fontSize: 13 },
  th: { borderBottom: "1px solid #e7e5e4", background: "#fafaf9", padding: 14, color: "#78716c", textAlign: "left", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em" },
  td: { borderBottom: "1px solid #f5f5f4", padding: 14, color: "#57534e", verticalAlign: "middle", fontSize: 13 },
  image: { width: 44, height: 44, display: "grid", placeItems: "center", objectFit: "cover", overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: 5, background: "#f5f5f4", color: "#78716c" },
  name: { display: "block", maxWidth: 330, overflow: "hidden", color: "#1c1917", fontWeight: 900, textOverflow: "ellipsis", whiteSpace: "nowrap" },
  description: { display: "block", maxWidth: 330, overflow: "hidden", marginTop: 4, color: "#78716c", fontSize: 11, textOverflow: "ellipsis", whiteSpace: "nowrap" },
  action: { border: 0, background: "transparent", color: "#a85e2a", padding: 0, fontWeight: 900, textDecoration: "none" },
  secondary: { minHeight: 36, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 14px", fontSize: 12, fontWeight: 800 },
  destructive: { minHeight: 36, border: "1px solid #b91c1c", borderRadius: 5, background: "#fff", color: "#b91c1c", padding: "0 14px", fontSize: 12, fontWeight: 900 },
  footer: { minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "0 16px", color: "#78716c", fontSize: 12 },
  pager: { display: "flex", alignItems: "center", gap: 10 },
  picker: { borderTop: "1px solid #e7e5e4", background: "#fafaf9", padding: "18px 0 0" },
  pickerHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "0 18px 16px" },
  pickerFooter: { display: "flex", alignItems: "center", justifyContent: "flex-end", borderTop: "1px solid #e7e5e4", padding: 16 },
  checkbox: { width: 17, minHeight: 17, accentColor: "#a85e2a" },
  message: { margin: 0, color: "#57534e", fontSize: 12 },
  empty: { padding: 42, textAlign: "center", color: "#78716c" },
  drawer: { position: "fixed", inset: "0 0 0 auto", zIndex: 70, width: 460, display: "flex", flexDirection: "column", borderLeft: "1px solid #e7e5e4", background: "#fff", boxShadow: "-20px 0 50px rgb(0 0 0 / 16%)" },
  drawerHeader: { minHeight: 70, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e7e5e4", padding: "0 24px" },
  drawerBody: { flex: 1, overflowY: "auto", display: "grid", alignContent: "start", gap: 18, padding: 24 },
  field: { display: "grid", gap: 6, color: "#57534e", fontSize: 11, fontWeight: 800 },
  readOnly: { margin: 0, color: "#292524", fontSize: 13, fontWeight: 500, lineHeight: 1.5 },
  drawerFooter: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, borderTop: "1px solid #e7e5e4", padding: 24 },
} satisfies Record<string, CSSProperties>;

function conciseText(value: string, maximumLength: number): string {
  return value.length > maximumLength ? `${value.slice(0, maximumLength - 1).trimEnd()}…` : value;
}

function formatPrice(priceCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(priceCents / 100);
}

function ImagePreview({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  return <span style={styles.image}>{imageUrl && !failed ? <img src={imageUrl} alt={`${name} preview`} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setFailed(true)} /> : <span aria-label="No image available">—</span>}</span>;
}

export function CatalogDetailsClient({ catalog, initialMembers, availableCandidates, workspaceVendors }: { catalog: { id: string; name: string; categoryType: string; status: string }; initialMembers: CatalogMemberView[]; availableCandidates: CandidateOption[]; workspaceVendors: string[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [query, setQuery] = useState("");
  const [vendor, setVendor] = useState("");
  const [page, setPage] = useState(1);
  const [showPicker, setShowPicker] = useState(false);
  const [candidateIds, setCandidateIds] = useState<string[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const pageSize = 20;
  const vendors = [...new Set([...workspaceVendors, ...members.map((member) => member.vendor)])].sort();
  const filtered = useMemo(() => members.filter((member) => (!query || `${member.name} ${member.description} ${member.sku} ${member.vendor} ${member.category}`.toLowerCase().includes(query.toLowerCase())) && (!vendor || member.vendor === vendor)), [members, query, vendor]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const editMember = members.find((member) => member.id === editId) ?? null;

  function resetFilters() { setQuery(""); setVendor(""); setPage(1); }

  async function add() {
    setPending(true);
    const response = await fetch(`/api/catalogs/${catalog.id}/members`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ candidateIds }) });
    const result = await response.json();
    if (response.ok) { setMessage(`${result.data.added} item(s) added. Refreshing…`); window.location.reload(); }
    else { setMessage(result.error?.message ?? "Unable to add these items."); setPending(false); }
  }

  return <div className="catalog-prototype-page catalog-details-prototype-page" style={styles.page}>
    <header style={styles.header}><div><nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span aria-hidden="true">›</span><Link href="/app/catalog" style={{ color: "inherit", textDecoration: "none" }}>Catalog</Link><span aria-hidden="true">›</span><strong aria-current="page">Catalog Details</strong></nav><h1 style={styles.title}>{catalog.name}</h1><p style={styles.subtitle}>{catalog.categoryType} · {catalog.status} · {members.length} items</p></div></header>
    <section style={styles.card}>
      <div aria-label="Catalog member search and filters" style={styles.toolbar}>
        <div style={styles.toolbarRow}><label style={styles.searchField}><span style={styles.controlLabel}>Search</span><input type="search" aria-label="Search catalog members" placeholder="Search products, descriptions, SKUs, vendors, or categories" value={query} style={styles.input} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></label><button disabled={!query && !vendor} type="button" style={styles.reset} onClick={resetFilters}>Reset filters</button><button disabled={pending} type="button" style={styles.primary} onClick={() => { setShowPicker((value) => !value); setCandidateIds([]); }}>{showPicker ? "Close Discovery" : "Add from Discovery"}</button></div>
        <div style={styles.filters}><span style={styles.controlLabel}>Filters</span><div style={styles.controls}><label><span className="sr-only">All Vendors</span><select aria-label="Vendor filter" value={vendor} style={styles.select} onChange={(event) => { setVendor(event.target.value); setPage(1); }}><option value="">All Vendors</option>{vendors.map((value) => <option key={value}>{value}</option>)}</select></label></div></div>
        {message ? <p aria-live="polite" style={styles.message}>{message}</p> : null}
      </div>
      {visible.length ? <div style={styles.scroll}><table aria-label={`${catalog.name} members`} style={styles.table}><thead><tr><th style={styles.th}>Image</th><th style={styles.th}>Product or Service</th><th style={styles.th}>SKU</th><th style={styles.th}>Vendor</th><th style={styles.th}>Category</th><th style={styles.th}>Price</th><th style={{ ...styles.th, textAlign: "right" }}>Action</th></tr></thead><tbody>{visible.map((member) => <tr key={member.id}><td style={styles.td}><ImagePreview imageUrl={member.imageUrl} name={member.name} /></td><td style={styles.td}><strong aria-label={member.name} title={member.name} style={styles.name}>{member.name}</strong>{member.description ? <span aria-label={member.description} title={member.description} style={styles.description}>{conciseText(member.description, 72)}</span> : null}</td><td style={styles.td}>{member.sku}</td><td style={styles.td}>{member.vendor}</td><td style={styles.td}>{member.category}</td><td style={styles.td}>{formatPrice(member.customPriceCents ?? member.basePriceCents, member.currency)}</td><td style={{ ...styles.td, textAlign: "right" }}><button type="button" style={styles.action} onClick={() => setEditId(member.id)}>Edit</button></td></tr>)}</tbody></table></div> : <div style={styles.empty}>This catalog has no matching items. Add products or services from Discovery.</div>}
      <footer style={styles.footer}><span>Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span><span style={styles.pager}><button type="button" style={styles.secondary} disabled={currentPage <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {currentPage} of {pageCount}</span><button type="button" style={styles.secondary} disabled={currentPage >= pageCount} onClick={() => setPage((value) => value + 1)}>Next</button></span></footer>
      {showPicker ? <section aria-label="Add from Discovery results" style={styles.picker}><header style={styles.pickerHeader}><div><strong>Add products and services from Discovery</strong><p style={styles.message}>{candidateIds.length} selected</p></div></header>{availableCandidates.length ? <div style={styles.scroll}><table aria-label="Discovery items available to add" style={styles.table}><thead><tr><th style={styles.th}>Select</th><th style={styles.th}>Image</th><th style={styles.th}>Product or Service</th><th style={styles.th}>SKU</th><th style={styles.th}>Vendor</th><th style={styles.th}>Category</th><th style={styles.th}>Price</th></tr></thead><tbody>{availableCandidates.map((candidate) => <tr key={candidate.id}><td style={styles.td}><input type="checkbox" aria-label={`Select ${candidate.name}`} checked={candidateIds.includes(candidate.id)} style={styles.checkbox} onChange={(event) => setCandidateIds((current) => event.target.checked ? [...current, candidate.id] : current.filter((id) => id !== candidate.id))} /></td><td style={styles.td}><ImagePreview imageUrl={candidate.imageUrl} name={candidate.name} /></td><td style={styles.td}><strong aria-label={candidate.name} title={candidate.name} style={styles.name}>{candidate.name}</strong>{candidate.description ? <span aria-label={candidate.description} title={candidate.description} style={styles.description}>{conciseText(candidate.description, 72)}</span> : null}</td><td style={styles.td}>{candidate.sku}</td><td style={styles.td}>{candidate.vendor}</td><td style={styles.td}>{candidate.category}</td><td style={styles.td}>{formatPrice(candidate.priceCents, candidate.currency)}</td></tr>)}</tbody></table></div> : <div style={styles.empty}>No additional Discovery items are available.</div>}<footer style={styles.pickerFooter}><button disabled={pending || !candidateIds.length} type="button" style={styles.primary} onClick={() => void add()}>{pending ? "Adding…" : `Add Selected (${candidateIds.length})`}</button></footer></section> : null}
    </section>
    {editMember ? <CatalogItemDrawer catalogId={catalog.id} member={editMember} onClose={() => setEditId(null)} onDiscard={(discarded) => { setMembers((current) => current.filter((member) => member.id !== discarded.id)); setEditId(null); setMessage(`${discarded.name} removed from this catalog.`); }} onSaved={(saved) => { setMembers((current) => current.map((member) => member.id === saved.id ? saved : member)); setEditId(null); setMessage(`${saved.name} saved.`); }} /> : null}
  </div>;
}

function CatalogItemDrawer({ catalogId, member, onClose, onDiscard, onSaved }: { catalogId: string; member: CatalogMemberView; onClose: () => void; onDiscard: (member: CatalogMemberView) => void; onSaved: (member: CatalogMemberView) => void }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape" && !pending) onClose(); }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, pending]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage("");
    const form = new FormData(event.currentTarget); const rawPrice = String(form.get("customPrice")); const customPriceCents = rawPrice === "" ? null : Math.round(Number(rawPrice) * 100);
    const response = await fetch(`/api/catalogs/${catalogId}/members`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ memberId: member.id, customPriceCents }) }); const result = await response.json();
    if (response.ok) onSaved({ ...member, customPriceCents }); else setMessage(result.error?.message ?? "Unable to save the custom price."); setPending(false);
  }

  async function discard() {
    if (!window.confirm(`Discard ${member.name} from this catalog? The underlying Discovery record will be preserved.`)) return;
    setPending(true); setMessage(""); const response = await fetch(`/api/catalogs/${catalogId}/members`, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ memberIds: [member.id] }) }); const result = await response.json();
    if (response.ok) onDiscard(member); else setMessage(result.error?.message ?? "Unable to remove this item from the catalog."); setPending(false);
  }

  return <aside aria-label={`Edit ${member.name}`} style={styles.drawer}><header style={styles.drawerHeader}><div><h2 style={{ margin: 0, fontSize: 18 }}>Edit Catalog Item</h2><p style={styles.message}>{member.vendor} · {member.category}</p></div><button disabled={pending} aria-label="Close catalog item editor" type="button" style={styles.action} onClick={onClose}>Close</button></header><form onSubmit={save} style={{ display: "contents" }}><div style={styles.drawerBody}><ImagePreview imageUrl={member.imageUrl} name={member.name} /><section style={styles.field}><span>Product or Service</span><p style={styles.readOnly}><strong>{member.name}</strong>{member.description ? <><br />{member.description}</> : null}</p></section><section style={styles.field}><span>SKU</span><p style={styles.readOnly}>{member.sku}</p></section><section style={styles.field}><span>Base Price</span><p style={styles.readOnly}>{formatPrice(member.basePriceCents, member.currency)}</p></section><label style={styles.field}>Custom Price<input name="customPrice" type="number" min="0" step="0.01" defaultValue={member.customPriceCents === null ? "" : (member.customPriceCents / 100).toFixed(2)} placeholder={(member.basePriceCents / 100).toFixed(2)} style={styles.input} /></label><p role="alert" style={styles.message}>{message}</p></div><footer style={styles.drawerFooter}><button disabled={pending} type="button" style={styles.destructive} onClick={() => void discard()}>{pending ? "Working…" : "Discard"}</button><button disabled={pending} type="submit" style={styles.primary}>{pending ? "Saving…" : "Save"}</button></footer></form></aside>;
}
