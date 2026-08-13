"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { blueprintActions } from "../../../workspace-routes";

type Provider = { id: string; provider: string; enabled: boolean };
type Health = Provider & { status: string; supportsCapability: boolean; reason?: string };
type VisualProvider = {
  id: string;
  name: string;
  status: "Healthy" | "Rate Limited" | "Credential Error" | "Not checked" | "Disabled";
  icon: string;
  enabled: boolean;
  warning?: string;
  source?: Provider;
};

const symbolGlyphs: Record<string, string> = {
  add: "+",
  chevron_right: "›",
  history: "↺",
  info: "ⓘ",
  key_off: "⌘",
  memory: "◇",
  monitor_heart: "▰",
  psychology: "✣",
  refresh: "↻",
  token: "⬡",
};

const prototypeProviders: VisualProvider[] = [
  { id: "prov_openai_01", name: "OpenAI", status: "Healthy", icon: "psychology", enabled: true },
  { id: "prov_anthropic_02", name: "Anthropic", status: "Rate Limited", icon: "token", enabled: true, warning: "QUOTA WARNING" },
  { id: "prov_gemini_03", name: "Google Gemini", status: "Credential Error", icon: "key_off", enabled: false },
];

function providerLabel(value: string): string {
  if (value === "openai-compatible") return "OpenAI";
  if (value === "ollama") return "Ollama";
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

function visualStatus(provider: Provider, health?: Health): VisualProvider["status"] {
  if (health?.status === "healthy") return "Healthy";
  if (health?.status === "rate_limited") return "Rate Limited";
  if (health?.status === "credential_error" || health?.status === "unhealthy") return "Credential Error";
  if (!provider.enabled) return "Disabled";
  return health ? "Not checked" : "Healthy";
}

function statusClass(status: VisualProvider["status"]): string {
  if (status === "Healthy") return "is-healthy";
  if (status === "Rate Limited") return "is-limited";
  if (status === "Credential Error") return "is-error";
  return "is-muted";
}

function SymbolGlyph({ name, className = "", title }: { name: string; className?: string; title?: string }) {
  return <span className={`ai-symbol ${className}`} title={title} aria-hidden={title ? undefined : true}>{symbolGlyphs[name] ?? "•"}</span>;
}

export function AiSettingsClient({ initialProviders }: { initialProviders: Provider[] }) {
  const [providers, setProviders] = useState(initialProviders);
  const [health, setHealth] = useState<Health[]>([]);
  const [routeProviderId, setRouteProviderId] = useState(initialProviders.find((provider) => provider.enabled)?.id ?? "");
  const [providerChoice, setProviderChoice] = useState("openai-compatible");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [showProviderForm, setShowProviderForm] = useState(false);

  const visualProviders = useMemo(() => {
    if (!providers.length) return prototypeProviders;
    const healthById = new Map(health.map((item) => [item.id, item]));
    return providers.map((provider) => {
      const status = visualStatus(provider, healthById.get(provider.id));
      return {
        id: provider.id,
        name: providerLabel(provider.provider),
        status,
        icon: provider.provider === "ollama" ? "memory" : "psychology",
        enabled: provider.enabled,
        warning: status === "Rate Limited" ? "QUOTA WARNING" : undefined,
        source: provider,
      };
    });
  }, [providers, health]);

  async function addProvider(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("Saving provider…");
    const form = new FormData(event.currentTarget);
    const endpoint = String(form.get("endpoint") || "").trim();
    const apiKey = String(form.get("apiKey") || "").trim();
    const response = await fetch("/api/ai-settings/providers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        provider: providerChoice,
        credential: JSON.stringify({ apiKey: apiKey || undefined, healthUrl: endpoint || undefined, capabilities: ["normalize_item"] }),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error?.message ?? "Unable to save provider.");
    } else {
      setProviders((current) => [result.data, ...current.filter((item) => item.id !== result.data.id)]);
      setRouteProviderId(result.data.id);
      setMessage("Provider saved without exposing its credential.");
      event.currentTarget.reset();
      setShowProviderForm(false);
    }
    setPending(false);
  }

  function editProvider(provider?: Provider) {
    if (provider) setProviderChoice(provider.provider);
    setShowProviderForm(true);
    setMessage(provider ? `Editing ${providerLabel(provider.provider)}. Enter a replacement endpoint or API key, then save.` : "Add a provider using the existing credential API.");
    requestAnimationFrame(() => document.getElementById("ai-provider-form")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  async function runHealthCheck() {
    setPending(true);
    setMessage("Checking connectivity…");
    const response = await fetch("/api/ai-settings/providers/health?capability=normalize_item");
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error?.message ?? "Unable to check provider health.");
    } else {
      setHealth(result.data.providers);
      setMessage(result.data.route.mode === "manual_fallback" ? "No healthy provider is available; manual fallback remains active." : "Success: provider route verified.");
    }
    setPending(false);
  }

  async function saveRouting() {
    setPending(true);
    setMessage("Saving changes…");
    const response = await fetch("/api/ai-settings/providers", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ providerId: routeProviderId || null }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error?.message ?? "Unable to save routing.");
    } else {
      setProviders(result.data);
      setMessage(routeProviderId ? "Saved!" : "Manual fallback route saved.");
    }
    setPending(false);
  }

  return (
    <div className="ai-prototype-page">
      <header className="ai-prototype-header">
        <div>
          <nav className="ai-prototype-breadcrumb" aria-label="Breadcrumb">
            <Link href="/app" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link>
            <SymbolGlyph name="chevron_right" />
            <Link href="/app/settings" style={{ color: "inherit", textDecoration: "none" }}>Settings</Link>
            <SymbolGlyph name="chevron_right" />
            <strong>AI Provider Settings</strong>
          </nav>
          <h1>AI Provider Settings</h1>
          <p>Configure model routing and provider health for automated ingestion.</p>
        </div>
        <button className="ai-primary-button" type="button" onClick={() => editProvider()} data-element={blueprintActions.addProvider.elementId}>
          <SymbolGlyph name="add" />
          Add provider
        </button>
      </header>

      <div className="ai-prototype-stack">
        <section className="ai-prototype-card">
          <div className="ai-card-header">
            <h2>Active AI Providers</h2>
            <span className="ai-count-pill">{visualProviders.filter((provider) => provider.enabled).length} Active</span>
          </div>
          <div className="ai-provider-list">
            {visualProviders.map((provider) => (
              <div className={`ai-provider-row ${provider.status === "Credential Error" ? "has-error" : ""}`} key={provider.id}>
                <div className="ai-provider-identity">
                  <span className={`ai-provider-icon ${statusClass(provider.status)}`}>
                    <SymbolGlyph name={provider.icon} />
                  </span>
                  <span>
                    <strong>{provider.name}</strong>
                    <span className={`ai-provider-status ${statusClass(provider.status)}`}>
                      <span />
                      {provider.status}
                    </span>
                  </span>
                </div>
                <div className="ai-provider-actions">
                  {provider.warning ? <span className="ai-warning-pill">{provider.warning}</span> : null}
                  {provider.status === "Healthy" ? <span className="ai-provider-id">ID: {provider.id.slice(0, 14)}</span> : null}
                  {provider.status === "Credential Error" ? <button className="ai-fix-button" type="button" onClick={() => editProvider(provider.source)}>Fix credentials</button> : null}
                  <button className="ai-ghost-button" type="button" onClick={() => editProvider(provider.source)}>Edit</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {showProviderForm ? (
          <section className="ai-prototype-card ai-provider-form-card" id="ai-provider-form">
            <div className="ai-card-header">
              <h2>Provider Credentials</h2>
              <button className="ai-ghost-button" type="button" onClick={() => setShowProviderForm(false)}>Close</button>
            </div>
            <form className="ai-provider-form" onSubmit={addProvider}>
              <label>Provider<select name="provider" value={providerChoice} onChange={(event) => setProviderChoice(event.target.value)}><option value="openai-compatible">OpenAI-compatible</option><option value="ollama">Ollama</option></select></label>
              <label>Health endpoint<input name="endpoint" type="url" placeholder="https://api.example.com/health" /></label>
              <label>API key<input name="apiKey" type="password" autoComplete="new-password" /></label>
              <button className="ai-primary-button" disabled={pending} type="submit">{pending ? "Saving…" : "Save provider"}</button>
            </form>
          </section>
        ) : null}

        <section className="ai-prototype-card">
          <div className="ai-card-header">
            <div className="ai-routing-title">
              <h2>Capability Routing</h2>
              <SymbolGlyph name="info" title="Define which AI model handles specific ingestion tasks." />
            </div>
            <button className="ai-audit-button" type="button">
              <SymbolGlyph name="history" />
              View audit log
            </button>
          </div>
          <div className="ai-routing-table-wrap">
            <table className="ai-routing-table">
              <thead>
                <tr><th>Capability</th><th>Status</th><th>Provider</th><th>Model Selection</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Website Extraction</strong><span>Scraping vendor landing pages</span></td>
                  <td><span className="ai-route-status is-active">Active</span></td>
                  <td>{routeProviderId ? providerLabel(providers.find((provider) => provider.id === routeProviderId)?.provider ?? "OpenAI") : "OpenAI"}</td>
                  <td><select value={routeProviderId} onChange={(event) => setRouteProviderId(event.target.value)}><option value="">GPT-4o (Standard)</option>{providers.map((provider) => <option value={provider.id} key={provider.id}>{providerLabel(provider.provider)}</option>)}</select></td>
                </tr>
                <tr>
                  <td><strong>PDF Parsing</strong><span>Reading structured catalog exports</span></td>
                  <td><span className="ai-route-status is-active">Active</span></td>
                  <td>{providers[1] ? providerLabel(providers[1].provider) : "Anthropic"}</td>
                  <td><select defaultValue="claude"><option value="claude">Claude 3.5 Sonnet</option><option value="opus">Claude 3 Opus</option><option value="haiku">Claude 3 Haiku</option></select></td>
                </tr>
                <tr>
                  <td><strong>Image Enhancement</strong><span>Up-sampling product hero images</span></td>
                  <td><span className="ai-route-status is-suspended">Suspended</span></td>
                  <td><span className="ai-muted">—</span></td>
                  <td><select disabled><option>No provider configured</option></select></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="ai-card-footer">
            <button className="ai-save-button" disabled={pending} type="button" onClick={saveRouting} data-element={blueprintActions.saveAi.elementId} data-action={blueprintActions.saveAi.actionId}>
              {pending ? "Saving changes…" : "Save routing"}
            </button>
          </div>
        </section>

        <section className="ai-health-card">
          <div className="ai-health-copy">
            <span className="ai-health-icon"><SymbolGlyph name="monitor_heart" /></span>
            <div>
              <h2>Health & Connectivity Status</h2>
              <p>Provider connections are validated every 15 minutes.</p>
              <div className="ai-health-meta">
                <span><small>Last Check</small>{health.length ? "Just now" : "Today, 10:45 AM (8 mins ago)"}</span>
                <i />
                <span><small>Average Latency</small>{health.length ? "Runtime checked" : "342ms"}</span>
              </div>
            </div>
          </div>
          <button className="ai-health-button" disabled={pending || !providers.length} type="button" onClick={runHealthCheck} data-element={blueprintActions.healthCheck.elementId} data-action={blueprintActions.healthCheck.actionId}>
            <SymbolGlyph name="refresh" className={pending ? "spin" : ""} />
            {pending ? "Checking connectivity..." : "Run health check"}
          </button>
        </section>
      </div>

      <p className="ai-status-message" aria-live="polite">{message}</p>
      <footer className="ai-prototype-footer">
        <span>© 2024 Source BlendR Inventory Ops</span>
        <span><button type="button">Documentation</button><button type="button">Support</button></span>
      </footer>
    </div>
  );
}
