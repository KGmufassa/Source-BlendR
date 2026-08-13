"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties, type FormEvent } from "react";

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", width: "100%", minWidth: 1120, background: "#f9f8f6", color: "#1f2933" },
  content: { width: "100%", maxWidth: "none", margin: 0, padding: "32px 32px 0" },
  header: { marginBottom: 24 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 10, margin: "0 0 8px", color: "#a8a29e", fontSize: 13, fontWeight: 700 },
  title: { margin: 0, color: "#111827", fontSize: 20, fontWeight: 900, letterSpacing: "-.03em", lineHeight: 1.15 },
  description: { margin: "0 0 24px", color: "#6b7280", fontSize: 13 },
  card: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", padding: "24px 24px 24px", boxShadow: "0 1px 2px rgb(0 0 0 / 4%)" },
  fieldGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 22 },
  field: { display: "grid", gap: 8, marginBottom: 0 },
  label: { color: "#111827", fontSize: 12, fontWeight: 600 },
  input: { height: 36, width: "100%", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", color: "#111827", padding: "0 12px", fontSize: 12 },
  divider: { height: 1, background: "#f1f3f5", margin: "18px 0 22px" },
  actions: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 },
  cancel: { minHeight: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", color: "#374151", padding: "0 18px", fontSize: 12, fontWeight: 700, textDecoration: "none" },
  save: { minHeight: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", border: 0, borderRadius: 6, background: "#a85e2a", color: "#fff", padding: "0 18px", fontSize: 12, fontWeight: 800 },
  message: { minHeight: 16, margin: "10px 0 0", color: "#6b7280", fontSize: 12 },
} satisfies Record<string, CSSProperties>;

async function responseData(response: Response) {
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message ?? "The request could not be completed.");
  return result.data;
}

function Glyph({ children }: { children: string }) {
  return <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.2em", lineHeight: 1, fontWeight: 900 }}>{children}</span>;
}

export function NewVendorClient() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("Saving vendor…");
    const form = new FormData(event.currentTarget);
    try {
      const vendor = await responseData(await fetch("/api/vendors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: form.get("name"), websiteUrl: form.get("websiteUrl") || null }),
      }));
      setMessage("Vendor saved. Opening the record…");
      router.push(`/app/vendors/${vendor.id}`);
    } catch (error) {
      setMessage(`Unable to save vendor: ${error instanceof Error ? error.message : "unknown error"}`);
      setPending(false);
    }
  }

  return (
    <div className="new-vendor-prototype-page" style={styles.page}>
      <main style={styles.content}>
        <header style={styles.header}>
          <nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><Glyph>›</Glyph><Link href="/app/vendors" style={{ color: "inherit", textDecoration: "none" }}>Vendors</Link><Glyph>›</Glyph><strong aria-current="page" style={{ color: "#111827" }}>New Vendor</strong></nav>
          <h1 style={styles.title}>New Vendor</h1>
          <p style={styles.description}>Create a vendor source for import workflows.</p>
        </header>
        <form onSubmit={submit} style={styles.card}>
          <div style={styles.fieldGrid}>
            <label style={styles.field}><span style={styles.label}>Vendor Name</span><input name="name" required maxLength={200} placeholder="e.g. Acme Corp Suppy" style={styles.input} /></label>
            <label style={styles.field}><span style={styles.label}>Website URL</span><input name="websiteUrl" type="url" placeholder="https://www.example.com" style={styles.input} /></label>
          </div>
          <div style={styles.divider} />
          <div style={styles.actions}><Link href="/app/vendors" style={styles.cancel}>Cancel</Link><button disabled={pending} type="submit" style={styles.save}>{pending ? "Saving…" : "Save vendor"}</button></div>
          <p aria-live="polite" style={styles.message}>{message}</p>
        </form>
      </main>
    </div>
  );
}
