"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties, type FormEvent, type KeyboardEvent } from "react";

type VendorOption = { id: string; name: string };

const styles = {
  page: { boxSizing: "border-box", minHeight: "100vh", width: "100%", minWidth: 1120, background: "#f9f8f6", color: "#333", paddingBottom: 48 },
  content: { width: "100%", maxWidth: 1040, padding: "32px 32px 0" },
  header: { marginBottom: 30 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 10, margin: "0 0 8px", color: "#a8a29e", fontSize: 13, fontWeight: 700 },
  title: { margin: "0 0 8px", color: "#1c1917", fontSize: 20, fontWeight: 900, letterSpacing: "-.03em", lineHeight: 1.15 },
  description: { margin: "0 0 30px", color: "#78716c", fontSize: 13, lineHeight: 1.5 },
  stack: { display: "grid", gap: 28 },
  card: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", boxShadow: "0 1px 2px rgb(0 0 0 / 4%)" },
  cardHeader: { minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, borderBottom: "1px solid #f5f5f4", padding: "0 24px" },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  stepNumberActive: { width: 25, height: 25, display: "grid", placeItems: "center", borderRadius: 999, background: "#a85e2a", color: "#fff", fontSize: 12, fontWeight: 900 },
  stepNumberMuted: { width: 25, height: 25, display: "grid", placeItems: "center", borderRadius: 999, background: "#e7e5e4", color: "#78716c", fontSize: 12, fontWeight: 900 },
  cardTitle: { margin: 0, color: "#292524", fontSize: 16, fontWeight: 800 },
  stepBody: { padding: 24 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 24 },
  field: { display: "grid", gap: 8 },
  label: { color: "#57534e", fontSize: 12, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" },
  comboboxWrap: { position: "relative" },
  vendorInput: { boxSizing: "border-box", height: 42, width: "100%", border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", color: "#292524", padding: "0 36px 0 14px", fontSize: 14 },
  comboboxIcon: { position: "absolute", right: 13, top: 13, color: "#78716c", fontSize: 12, pointerEvents: "none" },
  suggestionList: { position: "absolute", zIndex: 10, top: "calc(100% + 6px)", right: 0, left: 0, maxHeight: 220, overflowY: "auto", border: "1px solid #d6d3d1", borderRadius: 5, background: "#fff", boxShadow: "0 10px 24px rgb(0 0 0 / 10%)", margin: 0, padding: 4, listStyle: "none" },
  suggestion: { width: "100%", border: 0, borderRadius: 4, background: "transparent", color: "#292524", padding: "10px 12px", textAlign: "left", fontSize: 13 },
  noResults: { padding: "10px 12px", color: "#78716c", fontSize: 12 },
  input: { height: 42, width: "100%", border: "1px solid #fca5a5", borderRadius: 5, background: "rgb(254 242 242 / 30%)", color: "#292524", padding: "0 40px 0 14px", fontSize: 14 },
  inputWrap: { position: "relative" },
  errorIcon: { position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: "#ef4444", fontSize: 17, fontWeight: 900 },
  help: { margin: 0, color: "#a8a29e", fontSize: 12 },
  errorText: { margin: 0, color: "#dc2626", fontSize: 12, fontWeight: 700 },
  actionRow: { gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", borderTop: "1px solid #f5f5f4", paddingTop: 20 },
  primaryButton: { minHeight: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 24px", fontSize: 14, fontWeight: 900 },
  categoryBox: { border: "1px solid #e7e5e4", borderRadius: 5, background: "#fafaf9", padding: 20 },
  categoryTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, marginBottom: 18 },
  categoryCount: { color: "#78716c", fontSize: 12, fontWeight: 900, letterSpacing: "-.02em", textTransform: "uppercase" },
  selectAll: { border: 0, background: "transparent", color: "#a85e2a", padding: 0, fontSize: 12, fontWeight: 900 },
  tree: { display: "grid", gap: 14 },
  row: { display: "flex", alignItems: "center", gap: 12, color: "#57534e", fontSize: 13 },
  nested: { display: "grid", gap: 14, marginLeft: 26, borderLeft: "1px solid #e7e5e4", paddingLeft: 24 },
  checkbox: { width: 16, minHeight: 16, accentColor: "#a85e2a" },
  itemCount: { marginLeft: "auto", color: "#a8a29e", fontSize: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  footerAction: { display: "flex", justifyContent: "flex-end", borderTop: "1px solid #f5f5f4", marginTop: 24, paddingTop: 22 },
  footer: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, borderTop: "1px solid #e7e5e4", marginTop: 48, paddingTop: 24, color: "#a8a29e", fontSize: 12 },
  footerLeft: { display: "flex", alignItems: "center", gap: 26 },
  readyDot: { width: 7, height: 7, borderRadius: 999, background: "#10b981" },
  message: { minHeight: 18, marginTop: 10, color: "#57534e", fontSize: 12 },
} satisfies Record<string, CSSProperties>;

async function responseData(response: Response) {
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message ?? "The request could not be completed.");
  return result.data;
}

function Glyph({ children }: { children: string }) {
  return <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.2em", lineHeight: 1, fontWeight: 900 }}>{children}</span>;
}

export function WebsiteImportClient({ vendors, initialVendorId }: { vendors: VendorOption[]; initialVendorId?: string }) {
  const router = useRouter();
  const initialVendor = vendors.find((vendor) => vendor.id === initialVendorId);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [vendorQuery, setVendorQuery] = useState(initialVendor?.name ?? "");
  const [selectedVendorId, setSelectedVendorId] = useState(initialVendor?.id ?? "");
  const [vendorError, setVendorError] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  // lazy: local filtering is sufficient for current workspace vendor volumes; use a paginated lookup endpoint when lists become large.
  const normalizedQuery = vendorQuery.trim().toLocaleLowerCase();
  const filteredVendors = vendors.filter((vendor) => !normalizedQuery || vendor.name.toLocaleLowerCase().includes(normalizedQuery));

  function selectVendor(vendor: VendorOption) {
    setVendorQuery(vendor.name);
    setSelectedVendorId(vendor.id);
    setVendorError("");
    setSuggestionsOpen(false);
    setActiveSuggestion(-1);
  }

  function handleVendorKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSuggestionsOpen(true);
      setActiveSuggestion((index) => Math.min(index + 1, filteredVendors.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSuggestionsOpen(true);
      setActiveSuggestion((index) => index <= 0 ? filteredVendors.length - 1 : index - 1);
    } else if (event.key === "Enter" && suggestionsOpen && activeSuggestion >= 0) {
      event.preventDefault();
      const vendor = filteredVendors[activeSuggestion];
      if (vendor) selectVendor(vendor);
    } else if (event.key === "Escape") {
      setSuggestionsOpen(false);
      setActiveSuggestion(-1);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedVendorId) {
      setVendorError("Select an existing vendor from the suggestions before analysis.");
      setSuggestionsOpen(true);
      return;
    }
    setPending(true);
    setMessage("Creating website import…");
    const form = new FormData(event.currentTarget);
    try {
      const job = await responseData(await fetch("/api/imports/website", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
        body: JSON.stringify({ url: form.get("url"), vendorId: form.get("vendorId") || undefined }),
      }));
      setMessage("Website import queued. Opening the job…");
      router.push(`/app/imports/jobs/${job.id}?entry=website-import`);
    } catch (error) {
      setMessage(`Unable to create website import: ${error instanceof Error ? error.message : "unknown error"}`);
      setPending(false);
    }
  }

  return (
    <div className="website-import-prototype-page" style={styles.page}>
      <main style={styles.content}>
        <header style={styles.header}>
          <nav aria-label="Breadcrumb" style={styles.breadcrumb}><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link><Glyph>›</Glyph><Link href="/app/imports" style={{ color: "inherit", textDecoration: "none" }}>Imports</Link><Glyph>›</Glyph><strong aria-current="page" style={{ color: "#292524" }}>Website Import</strong></nav>
          <h1 style={styles.title}>Import from Website</h1>
          <p style={styles.description}>Configure source parameters and analyze catalog structure for automated ingestion.</p>
        </header>

        <form style={styles.stack} onSubmit={submit}>
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.headerLeft}><span style={styles.stepNumberActive}>1</span><h2 style={styles.cardTitle}>Vendor Selection &amp; URL</h2></div>
            </div>
            <div style={styles.stepBody}>
              <div style={styles.formGrid}>
                <div style={styles.field} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setSuggestionsOpen(false); }}>
                  <label htmlFor="vendor-entity" style={styles.label}>Vendor Entity</label>
                  <div style={styles.comboboxWrap}>
                    <input
                      id="vendor-entity"
                      type="text"
                      role="combobox"
                      autoComplete="off"
                      aria-autocomplete="list"
                      aria-controls="vendor-suggestions"
                      aria-expanded={suggestionsOpen}
                      aria-activedescendant={activeSuggestion >= 0 ? `vendor-option-${filteredVendors[activeSuggestion]?.id}` : undefined}
                      aria-describedby={vendorError ? "vendor-error" : "vendor-help"}
                      aria-invalid={Boolean(vendorError)}
                      value={vendorQuery}
                      data-element="EL-WEB-001"
                      placeholder="Type a vendor name…"
                      style={{ ...styles.vendorInput, borderColor: vendorError ? "#fca5a5" : "#d6d3d1" }}
                      onFocus={() => setSuggestionsOpen(true)}
                      onKeyDown={handleVendorKeyDown}
                      onChange={(event) => {
                        setVendorQuery(event.target.value);
                        setSelectedVendorId("");
                        setVendorError("");
                        setSuggestionsOpen(true);
                        setActiveSuggestion(-1);
                      }}
                    />
                    <span aria-hidden="true" style={styles.comboboxIcon}>⌄</span>
                    {suggestionsOpen ? (
                      <ul id="vendor-suggestions" role="listbox" aria-label="Workspace vendors" style={styles.suggestionList}>
                        {filteredVendors.map((vendor, index) => (
                          <li key={vendor.id} role="option" id={`vendor-option-${vendor.id}`} aria-selected={vendor.id === selectedVendorId}>
                            <button
                              type="button"
                              tabIndex={-1}
                              style={{ ...styles.suggestion, background: index === activeSuggestion ? "#fffbeb" : "transparent" }}
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => selectVendor(vendor)}
                            >
                              {vendor.name}
                            </button>
                          </li>
                        ))}
                        {!filteredVendors.length ? <li role="presentation" style={styles.noResults}>No matching vendors. Create the vendor before starting analysis.</li> : null}
                      </ul>
                    ) : null}
                  </div>
                  <input type="hidden" name="vendorId" value={selectedVendorId} />
                  <p id="vendor-help" style={styles.help}>Type to find and select an existing workspace vendor.</p>
                  {vendorError ? <p id="vendor-error" role="alert" style={styles.errorText}>{vendorError}</p> : null}
                </div>
                <label style={styles.field}><span style={styles.label}>Website URL</span><span style={styles.inputWrap}><input name="url" data-element="EL-WEB-002" type="url" required placeholder="https://vendor.example/catalog" style={{ ...styles.input, borderColor: "#d6d3d1", background: "#fff" }} /></span><p style={styles.help}>Use a complete HTTP or HTTPS catalog URL.</p></label>
                <div style={styles.actionRow}><button disabled={pending} type="submit" data-element="EL-WEB-003" data-action="ACTION-START-WEBSITE" style={styles.primaryButton}>{pending ? "Analyzing…" : "Analyze Website"} <Glyph>▣</Glyph></button></div>
              </div>
              <p aria-live="polite" style={styles.message}>{message}</p>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}
