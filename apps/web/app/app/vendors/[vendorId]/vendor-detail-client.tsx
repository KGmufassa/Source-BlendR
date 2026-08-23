"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties, type FormEvent } from "react";

type VendorProfile = {
  id: string;
  name: string;
  websiteUrl: string | null;
  description: string | null;
  logoUrl: string | null;
  contactName: string | null;
  contactRole: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  defaultImportMethod: string;
  offeringType: string | null;
  offeringCategories: string[];
  offeringDescription: string | null;
  archived: boolean;
  itemCount: number;
  derivedTypes: string[];
  derivedCategories: string[];
  importJobs: { id: string; sourceType: string; status: string; createdAt: string }[];
};

type EditingCard = "identity" | "contact" | "website" | "offering" | null;

const styles = {
  page: { minHeight: "100vh", minWidth: 1120, background: "#f9f8f6", padding: 32, color: "#292524" },
  header: { display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 24 },
  breadcrumb: { display: "flex", gap: 8, marginBottom: 8, color: "#78716c", fontSize: 13 },
  title: { margin: 0, fontSize: 20, fontWeight: 900 },
  subtitle: { margin: "8px 0 0", color: "#78716c", fontSize: 13 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 20 },
  card: { border: "1px solid #e7e5e4", borderRadius: 8, background: "#fff", padding: 22 },
  wide: { gridColumn: "1 / -1" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 18 },
  cardTitle: { margin: 0, fontSize: 15, fontWeight: 900 },
  dl: { display: "grid", gap: 14, margin: 0 },
  row: { display: "grid", gridTemplateColumns: "150px 1fr", gap: 16, borderBottom: "1px solid #f5f5f4", paddingBottom: 12 },
  dt: { color: "#78716c", fontSize: 11, fontWeight: 900, textTransform: "uppercase" },
  dd: { margin: 0, color: "#292524", fontSize: 13 },
  form: { display: "grid", gap: 14 },
  field: { display: "grid", gap: 7, color: "#57534e", fontSize: 12, fontWeight: 800 },
  input: { boxSizing: "border-box", width: "100%", minHeight: 40, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#292524", padding: "0 12px", fontSize: 13 },
  textarea: { boxSizing: "border-box", width: "100%", minHeight: 96, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#292524", padding: 12, fontSize: 13, resize: "vertical" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 },
  edit: { minHeight: 34, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 14px", fontSize: 12, fontWeight: 800 },
  primary: { minHeight: 36, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 16px", fontSize: 12, fontWeight: 900 },
  secondary: { minHeight: 36, border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#57534e", padding: "0 16px", fontSize: 12, fontWeight: 800 },
  message: { minHeight: 18, margin: "0 0 16px", color: "#57534e", fontSize: 12 },
  external: { color: "#a85e2a", fontWeight: 800 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { borderBottom: "1px solid #e7e5e4", background: "#fafaf9", padding: 12, textAlign: "left", color: "#78716c", fontSize: 11, textTransform: "uppercase" },
  td: { borderBottom: "1px solid #f5f5f4", padding: 12, fontSize: 13 },
  action: { color: "#a85e2a", fontWeight: 900, textDecoration: "none" },
  hint: { color: "#78716c", fontSize: 12 },
  categoryGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 },
  check: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700 },
} satisfies Record<string, CSSProperties>;

function safeWebsite(value: string | null): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

function notProvided(value: string | null | undefined) {
  return value?.trim() || "Not provided";
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={styles.row}><dt style={styles.dt}>{label}</dt><dd style={styles.dd}>{children}</dd></div>;
}

export function VendorDetailClient({ initialVendor, canEdit }: { initialVendor: VendorProfile; canEdit: boolean }) {
  const [vendor, setVendor] = useState(initialVendor);
  const [editing, setEditing] = useState<EditingCard>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(canEdit ? "" : "Only workspace editors can edit vendor details.");
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(vendor.offeringCategories);
  const website = safeWebsite(vendor.websiteUrl);
  const categoryOptions = useMemo(() => [...new Set([...vendor.derivedCategories, ...selectedCategories].filter(Boolean))].sort((a, b) => a.localeCompare(b)), [vendor.derivedCategories, selectedCategories]);

  function beginEdit(card: Exclude<EditingCard, null>) {
    setEditing(card);
    if (card === "offering") setSelectedCategories(vendor.offeringCategories);
    setMessage("");
  }

  function cancelEdit() {
    setEditing(null);
    setSelectedCategories(vendor.offeringCategories);
    setNewCategory("");
    setMessage("");
  }

  async function save(event: FormEvent<HTMLFormElement>, payload: Record<string, unknown>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(`/api/vendors/${vendor.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Unable to save vendor details.");
      setVendor((current) => ({ ...current, ...result.data, archived: Boolean(result.data.archivedAt), importJobs: current.importJobs, itemCount: current.itemCount, derivedTypes: current.derivedTypes, derivedCategories: current.derivedCategories }));
      setEditing(null);
      setMessage("Vendor details saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save vendor details.");
    } finally {
      setPending(false);
    }
  }

  function toggleCategory(value: string, checked: boolean) {
    setSelectedCategories((current) => checked ? [...new Set([...current, value])] : current.filter((category) => category !== value));
  }

  return <div style={styles.page}>
    <header style={styles.header}>
      <div><nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span aria-hidden="true">›</span><Link href="/app/vendors" style={{ color: "inherit", textDecoration: "none" }}>Vendors</Link><span aria-hidden="true">›</span><strong aria-current="page">Vendor Details</strong></nav><h1 style={styles.title}>{vendor.name}</h1><p style={styles.subtitle}>Complete vendor profile and source activity.</p></div>
    </header>
    <p aria-live="polite" style={styles.message}>{message}</p>
    <main style={styles.grid}>
      <section style={styles.card}>
        <div style={styles.cardHeader}><h2 style={styles.cardTitle}>Identity</h2>{canEdit && editing !== "identity" ? <button type="button" style={styles.edit} disabled={pending || editing !== null} onClick={() => beginEdit("identity")}>Edit</button> : null}</div>
        {editing === "identity" ? <form style={styles.form} onSubmit={(event) => void save(event, { name: new FormData(event.currentTarget).get("name"), archived: new FormData(event.currentTarget).get("status") === "inactive", description: new FormData(event.currentTarget).get("description"), logoUrl: new FormData(event.currentTarget).get("logoUrl") })}><label style={styles.field}>Name<input required maxLength={200} name="name" defaultValue={vendor.name} style={styles.input} /></label><label style={styles.field}>Status<select name="status" defaultValue={vendor.archived ? "inactive" : "active"} style={styles.input}><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label style={styles.field}>Description<textarea maxLength={2000} name="description" defaultValue={vendor.description ?? ""} style={styles.textarea} /></label><label style={styles.field}>Logo URL<input name="logoUrl" type="url" defaultValue={vendor.logoUrl ?? ""} style={styles.input} /></label><div style={styles.actions}><button type="button" style={styles.secondary} onClick={cancelEdit}>Cancel</button><button type="submit" disabled={pending} style={styles.primary}>{pending ? "Saving..." : "Save"}</button></div></form> : <dl style={styles.dl}><Detail label="Name">{vendor.name}</Detail><Detail label="Status">{vendor.archived ? "Inactive" : "Active"}</Detail><Detail label="Description">{notProvided(vendor.description)}</Detail><Detail label="Logo">{vendor.logoUrl ? <a href={vendor.logoUrl} target="_blank" rel="noreferrer" style={styles.external}>Open logo</a> : "Not provided"}</Detail></dl>}
      </section>
      <section style={styles.card}>
        <div style={styles.cardHeader}><h2 style={styles.cardTitle}>Contact Information</h2>{canEdit && editing !== "contact" ? <button type="button" style={styles.edit} disabled={pending || editing !== null} onClick={() => beginEdit("contact")}>Edit</button> : null}</div>
        {editing === "contact" ? <form style={styles.form} onSubmit={(event) => { const form = new FormData(event.currentTarget); void save(event, { contactName: form.get("contactName"), contactRole: form.get("contactRole"), contactEmail: form.get("contactEmail"), contactPhone: form.get("contactPhone"), address: form.get("address") }); }}><label style={styles.field}>Primary Contact<input maxLength={160} name="contactName" defaultValue={vendor.contactName ?? ""} style={styles.input} /></label><label style={styles.field}>Role<input maxLength={160} name="contactRole" defaultValue={vendor.contactRole ?? ""} style={styles.input} /></label><label style={styles.field}>Email<input name="contactEmail" type="email" defaultValue={vendor.contactEmail ?? ""} style={styles.input} /></label><label style={styles.field}>Phone<input maxLength={80} name="contactPhone" defaultValue={vendor.contactPhone ?? ""} style={styles.input} /></label><label style={styles.field}>Address<textarea maxLength={500} name="address" defaultValue={vendor.address ?? ""} style={styles.textarea} /></label><div style={styles.actions}><button type="button" style={styles.secondary} onClick={cancelEdit}>Cancel</button><button type="submit" disabled={pending} style={styles.primary}>{pending ? "Saving..." : "Save"}</button></div></form> : <dl style={styles.dl}><Detail label="Primary Contact">{notProvided(vendor.contactName)}</Detail><Detail label="Role">{notProvided(vendor.contactRole)}</Detail><Detail label="Email">{vendor.contactEmail ? <a href={`mailto:${vendor.contactEmail}`} style={styles.external}>{vendor.contactEmail}</a> : "Not provided"}</Detail><Detail label="Phone">{vendor.contactPhone ? <a href={`tel:${vendor.contactPhone}`} style={styles.external}>{vendor.contactPhone}</a> : "Not provided"}</Detail><Detail label="Address">{notProvided(vendor.address)}</Detail></dl>}
      </section>
      <section style={styles.card}>
        <div style={styles.cardHeader}><h2 style={styles.cardTitle}>Website Details</h2>{canEdit && editing !== "website" ? <button type="button" style={styles.edit} disabled={pending || editing !== null} onClick={() => beginEdit("website")}>Edit</button> : null}</div>
        {editing === "website" ? <form style={styles.form} onSubmit={(event) => { const form = new FormData(event.currentTarget); void save(event, { websiteUrl: form.get("websiteUrl"), defaultImportMethod: form.get("defaultImportMethod") }); }}><label style={styles.field}>Website URL<input name="websiteUrl" type="url" defaultValue={vendor.websiteUrl ?? ""} style={styles.input} /></label><label style={styles.field}>Default Import Method<select name="defaultImportMethod" defaultValue={vendor.defaultImportMethod} style={styles.input}><option value="website">Website</option><option value="pdf">PDF</option></select></label><div style={styles.actions}><button type="button" style={styles.secondary} onClick={cancelEdit}>Cancel</button><button type="submit" disabled={pending} style={styles.primary}>{pending ? "Saving..." : "Save"}</button></div></form> : <dl style={styles.dl}><Detail label="Website">{website ? <a href={website.href} target="_blank" rel="noreferrer" style={styles.external}>{website.href}</a> : "Not provided"}</Detail><Detail label="Domain">{website?.hostname ?? "Not provided"}</Detail><Detail label="Default Import">{vendor.defaultImportMethod === "pdf" ? "PDF" : "Website"}</Detail><Detail label="Last Access">{vendor.importJobs[0] ? new Date(vendor.importJobs[0].createdAt).toLocaleString() : "Not provided"}</Detail></dl>}
      </section>
      <section style={styles.card}>
        <div style={styles.cardHeader}><h2 style={styles.cardTitle}>Products and Services</h2>{canEdit && editing !== "offering" ? <button type="button" style={styles.edit} disabled={pending || editing !== null} onClick={() => beginEdit("offering")}>Edit</button> : null}</div>
        {editing === "offering" ? <form style={styles.form} onSubmit={(event) => { const form = new FormData(event.currentTarget); void save(event, { offeringType: form.get("offeringType"), offeringDescription: form.get("offeringDescription"), offeringCategories: selectedCategories }); }}><label style={styles.field}>Offering Type<input maxLength={80} name="offeringType" defaultValue={vendor.offeringType ?? ""} placeholder={vendor.derivedTypes.join(", ") || "Product or service"} style={styles.input} /></label><div style={styles.field}><span>Categories</span><div style={styles.categoryGrid}>{categoryOptions.map((category) => <label key={category} style={styles.check}><input type="checkbox" checked={selectedCategories.includes(category)} onChange={(event) => toggleCategory(category, event.target.checked)} />{category}</label>)}</div><span style={styles.actions}><input aria-label="Add offering category" value={newCategory} placeholder="Add category" style={styles.input} onChange={(event) => setNewCategory(event.target.value)} /><button type="button" style={styles.secondary} onClick={() => { const value = newCategory.trim(); if (!value) return; toggleCategory(value, true); setNewCategory(""); }}>Add</button></span></div><label style={styles.field}>Description<textarea maxLength={2000} name="offeringDescription" defaultValue={vendor.offeringDescription ?? ""} style={styles.textarea} /></label><p style={styles.hint}>Imported item rows and record counts are read-only here.</p><div style={styles.actions}><button type="button" style={styles.secondary} onClick={cancelEdit}>Cancel</button><button type="submit" disabled={pending} style={styles.primary}>{pending ? "Saving..." : "Save"}</button></div></form> : <dl style={styles.dl}><Detail label="Offering Type">{notProvided(vendor.offeringType) !== "Not provided" ? vendor.offeringType : vendor.derivedTypes.join(", ") || "Not provided"}</Detail><Detail label="Categories">{vendor.offeringCategories.length ? vendor.offeringCategories.join(", ") : vendor.derivedCategories.join(", ") || "Not provided"}</Detail><Detail label="Records">{String(vendor.itemCount)}</Detail><Detail label="Description">{notProvided(vendor.offeringDescription)}</Detail></dl>}
      </section>
      <section style={{ ...styles.card, ...styles.wide }}><div style={styles.cardHeader}><h2 style={styles.cardTitle}>Recent Import Activity</h2><span style={styles.hint}>Read-only</span></div>{vendor.importJobs.length ? <table style={styles.table}><thead><tr><th style={styles.th}>Source</th><th style={styles.th}>Status</th><th style={styles.th}>Created</th><th style={styles.th}>Action</th></tr></thead><tbody>{vendor.importJobs.map((job) => <tr key={job.id}><td style={styles.td}>{job.sourceType}</td><td style={styles.td}>{job.status}</td><td style={styles.td}>{new Date(job.createdAt).toLocaleString()}</td><td style={styles.td}><Link href={`/app/imports/jobs/${job.id}`} style={styles.action}>Job Details</Link></td></tr>)}</tbody></table> : <p style={styles.dd}>No imports have been created for this vendor.</p>}</section>
    </main>
  </div>;
}
