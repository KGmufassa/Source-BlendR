"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties, type FormEvent } from "react";

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", minWidth: 1120, background: "#f9f8f6", color: "#292524", padding: "32px" },
  header: { marginBottom: 24 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "#78716c", fontSize: 13 },
  title: { margin: 0, fontSize: 20, fontWeight: 900 },
  description: { margin: "8px 0 0", color: "#78716c", fontSize: 13 },
  form: { maxWidth: 760 },
  card: { border: "1px solid #e7e5e4", borderRadius: 6, background: "#fff", padding: 30 },
  sectionTitle: { margin: "0 0 24px", color: "#57534e", fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em" },
  fields: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 24 },
  label: { display: "grid", gap: 8, color: "#292524", fontSize: 13, fontWeight: 800 },
  input: { minHeight: 46, border: "1px solid #d6d3d1", borderRadius: 5, padding: "0 14px", fontSize: 15 },
  actions: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e7e5e4", marginTop: 24, paddingTop: 24 },
  cancel: { minWidth: 112, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d6d3d1", borderRadius: 5, color: "#57534e", textDecoration: "none", fontSize: 14, fontWeight: 800 },
  save: { minWidth: 150, minHeight: 44, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", fontSize: 14, fontWeight: 900 },
  message: { minHeight: 20, color: "#57534e", fontSize: 13 },
} satisfies Record<string, CSSProperties>;

export function NewCatalogItemClient() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("Creating catalog…");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/catalogs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: form.get("name"), categoryType: form.get("categoryType") }) });
    const result = await response.json();
    if (response.ok) {
      setMessage("Catalog created. Opening details…");
      router.push(`/app/catalog/${result.data.id}`);
    } else {
      setMessage(result.error?.message ?? "Unable to create this catalog.");
      setPending(false);
    }
  }

  return <div className="new-catalog-prototype-page" style={styles.page}>
    <header style={styles.header}><nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><span>›</span><Link href="/app/catalog" style={{ color: "inherit", textDecoration: "none" }}>Catalog</Link><span>›</span><strong aria-current="page">New Catalog</strong></nav><h1 style={styles.title}>Create Catalog</h1><p style={styles.description}>Name the catalog and define its category type. Add products and services after saving.</p></header>
    <form style={styles.form} onSubmit={submit}>
      <section style={styles.card}><h2 style={styles.sectionTitle}>General Information</h2><div style={styles.fields}><label style={styles.label}>Name<input name="name" required maxLength={120} autoFocus style={styles.input} /></label><label style={styles.label}>Category Type<input name="categoryType" required maxLength={80} placeholder="e.g. Office Furniture" style={styles.input} /></label></div></section>
      <div style={styles.actions}><Link href="/app/catalog" style={styles.cancel}>Cancel</Link><button type="submit" disabled={pending} style={styles.save}>{pending ? "Saving Catalog…" : "Save Catalog"}</button></div>
      <p aria-live="polite" style={styles.message}>{message}</p>
    </form>
  </div>;
}
