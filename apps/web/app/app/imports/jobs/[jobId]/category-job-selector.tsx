"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";

type Category = { name: string; url: string };
type CategoryGroup = { label: string; categories: Category[] };

const styles = {
  card: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", boxShadow: "0 1px 2px rgb(0 0 0 / 4%)" },
  header: { minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, borderBottom: "1px solid #e7e5e4", background: "#fafaf9", padding: "0 20px" },
  title: { margin: 0, color: "#333", fontSize: 12, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase" },
  description: { margin: "4px 0 0", color: "#78716c", fontSize: 12 },
  count: { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, minHeight: 24, borderRadius: 999, background: "#f5f5f4", color: "#57534e", padding: "0 10px", fontSize: 12, fontWeight: 900 },
  fieldset: { display: "grid", gap: 18, border: 0, margin: 0, padding: 20 },
  branch: { display: "grid", gap: 12 },
  branchTitle: { margin: 0, color: "#292524", fontSize: 14, fontWeight: 900, textTransform: "capitalize" },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },
  label: { display: "flex", alignItems: "flex-start", gap: 12, border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", padding: 14, color: "#292524" },
  checkbox: { width: 17, minHeight: 17, marginTop: 2, accentColor: "#a85e2a" },
  categoryName: { display: "block", marginBottom: 3, fontSize: 13, fontWeight: 900 },
  categoryUrl: { display: "block", color: "#78716c", fontSize: 11, overflowWrap: "anywhere" },
  footer: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, borderTop: "1px solid #f5f5f4", background: "#fafaf9", padding: "14px 20px" },
  primary: { minHeight: 34, border: 0, borderRadius: 5, background: "#a85e2a", color: "#fff", padding: "0 16px", fontSize: 13, fontWeight: 900 },
  status: { margin: 0, color: "#78716c", fontSize: 12 },
  toggle: { display: "inline-flex", border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", padding: 3 },
  toggleButton: { minHeight: 30, border: 0, borderRadius: 4, background: "transparent", color: "#57534e", padding: "0 12px", fontSize: 12, fontWeight: 800 },
  toggleActive: { background: "#fffbeb", color: "#b45309" },
  treeRoot: { border: "1px solid #e7e5e4", borderRadius: 5, background: "#fff", padding: 14 },
  parentRow: { display: "flex", alignItems: "center", gap: 10 },
  parentCheck: { width: 24, minHeight: 24, border: "1px solid #d6d3d1", borderRadius: 4, background: "#fff", color: "#a85e2a", fontWeight: 900 },
  children: { display: "grid", gap: 8, borderLeft: "1px solid #e7e5e4", margin: "12px 0 0 12px", paddingLeft: 20 },
  jobLinks: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 },
  jobLink: { color: "#a85e2a", fontSize: 12, fontWeight: 800 },
} satisfies Record<string, CSSProperties>;

function groupCategories(categories: Category[]): CategoryGroup[] {
  const groups = new Map<string, Category[]>();
  for (const category of categories) {
    let label = "Detected categories";
    try {
      const path = new URL(category.url).pathname.split("/").filter(Boolean);
      label = path[0] ? path[0].replaceAll("-", " ") : label;
    } catch {
      label = category.name.includes("/") ? category.name.split("/")[0]!.trim() : label;
    }
    groups.set(label, [...(groups.get(label) ?? []), category]);
  }
  return [...groups.entries()].map(([label, groupCategories]) => ({ label, categories: groupCategories }));
}

export function CategoryJobSelector({ jobId }: { jobId: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("Loading discovered categories…");
  const [pending, setPending] = useState(false);
  const [view, setView] = useState<"collections" | "tree">("collections");
  const [childJobs, setChildJobs] = useState<Array<{ id: string }>>([]);
  const groupedCategories = groupCategories(categories);

  useEffect(() => {
    void fetch(`/api/imports/jobs/${jobId}/categories`).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Unable to load categories.");
      setCategories(result.data.categories);
      setMessage(result.data.categories.length ? "Select one or more categories to scrape independently." : "No categories were discovered for this source.");
    }).catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load categories."));
  }, [jobId]);

  async function launch() {
    setPending(true);
    setMessage("Creating category jobs…");
    const response = await fetch(`/api/imports/jobs/${jobId}/categories`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ categoryUrls: selected }),
    });
    const result = await response.json();
    setPending(false);
    if (response.ok) {
      setChildJobs(result.data.jobs);
      setMessage(`${result.data.jobs.length} category job(s) queued.`);
    } else setMessage(result.error?.message ?? "Unable to create category jobs.");
  }

  function toggleGroup(group: CategoryGroup) {
    const urls = group.categories.map((category) => category.url);
    const allSelected = urls.every((url) => selected.includes(url));
    setSelected((current) => allSelected ? current.filter((url) => !urls.includes(url)) : [...new Set([...current, ...urls])]);
  }

  const categoryControl = (category: Category) => <label style={styles.label} key={category.url}>
    <input style={styles.checkbox} type="checkbox" name="categoryUrls" value={category.url} checked={selected.includes(category.url)} onChange={(event) => setSelected((current) => event.target.checked ? [...new Set([...current, category.url])] : current.filter((url) => url !== category.url))} />
    <span><strong style={styles.categoryName}>{category.name}</strong><small style={styles.categoryUrl}>{category.url}</small></span>
  </label>;

  return <section style={styles.card}>
    <div style={styles.header}>
      <div><h2 style={styles.title}>Discovered Categories</h2><p style={styles.description}>Select scrape-eligible categories in either view.</p></div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div role="group" aria-label="Category view" style={styles.toggle}>
          <button type="button" aria-pressed={view === "collections"} style={{ ...styles.toggleButton, ...(view === "collections" ? styles.toggleActive : {}) }} onClick={() => setView("collections")}>Collections</button>
          <button type="button" aria-pressed={view === "tree"} style={{ ...styles.toggleButton, ...(view === "tree" ? styles.toggleActive : {}) }} onClick={() => setView("tree")}>Category Tree</button>
        </div>
        <span style={styles.count}>{categories.length}</span>
      </div>
    </div>
    <fieldset style={styles.fieldset} disabled={pending || !categories.length}>
      <legend className="sr-only">Select categories</legend>
      {view === "collections" ? groupedCategories.map((group) => (
        <div style={styles.branch} key={group.label}>
          <h3 style={styles.branchTitle}>{group.label}</h3>
          <div style={styles.grid}>{group.categories.map(categoryControl)}</div>
        </div>
      )) : groupedCategories.map((group) => {
        const selectedCount = group.categories.filter((category) => selected.includes(category.url)).length;
        const state = selectedCount === group.categories.length ? "true" : selectedCount ? "mixed" : "false";
        return <details open style={styles.treeRoot} key={group.label}>
          <summary style={styles.parentRow}>
            <button type="button" role="checkbox" aria-checked={state} aria-label={`Select all eligible categories in ${group.label}`} style={styles.parentCheck} onClick={(event) => { event.preventDefault(); toggleGroup(group); }}>{state === "true" ? "✓" : state === "mixed" ? "−" : ""}</button>
            <strong style={styles.branchTitle}>{group.label}</strong>
            <span style={styles.count}>{selectedCount}/{group.categories.length}</span>
          </summary>
          <div style={styles.children}>{group.categories.map(categoryControl)}</div>
        </details>;
      })}
    </fieldset>
    <div style={styles.footer}><div><p style={styles.status} aria-live="polite">{message}</p>{childJobs.length ? <div style={styles.jobLinks}>{childJobs.map((job) => <Link key={job.id} href={`/app/imports/jobs/${job.id}`} style={styles.jobLink}>Open child job {job.id}</Link>)}</div> : null}</div><button style={styles.primary} type="button" disabled={pending || !selected.length} onClick={launch}>{pending ? "Queuing…" : `Scrape selected (${selected.length})`}</button></div>
  </section>;
}
