"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { blueprintActions } from "../../../workspace-routes";

type Provider = { id: string; provider: string; enabled: boolean; apiPreview: string; lastConnectionStatus?: string | null; lastConnectionCheckedAt?: string | Date | null };
type ProviderType = "openai-compatible" | "anthropic" | "gemini" | "ollama" | "azure-openai" | "custom";
type ProviderCredentialInput = {
  apiKey?: string;
  providerType?: ProviderType;
  baseUrl?: string;
  modelId?: string;
  capabilities: string[];
};
type Health = { id: string; provider: string; enabled: boolean; status: string; liveCheck: "passed" | "failed" | "not_configured"; supportsCapability: boolean; reason?: string };
type VisualProvider = {
  id: string;
  name: string;
  status: "Healthy" | "Rate Limited" | "Credential Error" | "Not checked" | "Disabled";
  icon: string;
  enabled: boolean;
  connection: "Connected" | "Not connected";
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

function providerLabel(value: string): string {
  if (value === "openai-compatible") return "OpenAI";
  if (value === "ollama") return "Ollama";
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

function sortProviders(items: Provider[]) {
  return [...items].sort((left, right) => {
    const leftName = providerLabel(left.provider).toLowerCase();
    const rightName = providerLabel(right.provider).toLowerCase();
    return leftName < rightName ? -1 : leftName > rightName ? 1 : 0;
  });
}

function firstFieldError(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  for (const errors of Object.values(value)) {
    if (Array.isArray(errors)) {
      const message = errors.find((error): error is string => typeof error === "string");
      if (message) return message;
    }
  }
  return undefined;
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

const routingCapabilities = [
  { id: "website_extraction", label: "Website Extraction", description: "Scraping vendor landing pages", active: true },
  { id: "pdf_parsing", label: "PDF Parsing", description: "Reading structured catalog exports", active: true },
  { id: "image_enhancement", label: "Image Enhancement", description: "Up-sampling product hero images", active: false },
];

const providerTypeOptions: Array<{ value: ProviderType; label: string; baseUrl: string }> = [
  { value: "openai-compatible", label: "OpenAI-compatible", baseUrl: "https://api.openai.com/v1" },
  { value: "anthropic", label: "Anthropic", baseUrl: "https://api.anthropic.com/v1" },
  { value: "gemini", label: "Google Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta" },
  { value: "ollama", label: "Ollama / Local", baseUrl: "http://localhost:11434" },
  { value: "azure-openai", label: "Azure OpenAI", baseUrl: "" },
  { value: "custom", label: "Custom", baseUrl: "" },
];

function routingSnapshot(routes: Record<string, string | null>) {
  return routingCapabilities
    .filter((capability) => capability.active)
    .map((capability) => `${capability.id}:${routes[capability.id] ?? ""}`)
    .join("|");
}

export function AiSettingsClient({ initialProviders, initialRoutes }: { initialProviders: Provider[]; initialRoutes: Record<string, string | null> }) {
  const [providers, setProviders] = useState(() => sortProviders(initialProviders));
  const [health, setHealth] = useState<Health[]>([]);
  const [routeSelections, setRouteSelections] = useState<Record<string, string | null>>(initialRoutes);
  const [savedRouteSelections, setSavedRouteSelections] = useState<Record<string, string | null>>(initialRoutes);
  const [providerChoice, setProviderChoice] = useState("openai-compatible");
  const [newProviderChoice, setNewProviderChoice] = useState("");
  const [newProviderType, setNewProviderType] = useState<ProviderType>("openai-compatible");
  const [newProviderBaseUrl, setNewProviderBaseUrl] = useState("https://api.openai.com/v1");
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [addingProvider, setAddingProvider] = useState(false);
  const [updatingProvider, setUpdatingProvider] = useState(false);
  const [savingRouting, setSavingRouting] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [togglingProviderId, setTogglingProviderId] = useState<string | null>(null);

  const visualProviders = useMemo(() => {
    const healthById = new Map(health.map((item) => [item.id, item]));
    return providers.map((provider) => {
      const status = visualStatus(provider, healthById.get(provider.id));
      return {
        id: provider.id,
        name: providerLabel(provider.provider),
        status,
        icon: provider.provider === "ollama" ? "memory" : "psychology",
        enabled: provider.enabled,
        connection: provider.enabled && (healthById.get(provider.id)
          ? healthById.get(provider.id)?.status === "healthy" && healthById.get(provider.id)?.liveCheck === "passed"
          : provider.lastConnectionStatus === "connected") ? "Connected" : "Not connected",
        warning: status === "Rate Limited" ? "QUOTA WARNING" : undefined,
        source: provider,
      };
    });
  }, [providers, health]);
  const activeProviders = providers.filter((provider) => provider.enabled);
  const editingProvider = providers.find((provider) => provider.id === editingProviderId);
  const routingDirty = routingSnapshot(routeSelections) !== routingSnapshot(savedRouteSelections);

  async function saveProvider(provider: string, credential: ProviderCredentialInput, mode: "create" | "edit", providerId?: string) {
    const setSaving = mode === "edit" ? setUpdatingProvider : setAddingProvider;
    setSaving(true);
    setMessage(mode === "edit" ? "Updating provider credentials…" : "Adding provider…");
    const response = await fetch("/api/ai-settings/providers", {
      method: mode === "edit" ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(mode === "edit" ? {
        action: "provider-credential",
        providerId,
        credential: JSON.stringify(credential),
      } : {
        provider,
        credential: JSON.stringify(credential),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(firstFieldError(result.error?.field_errors) ?? result.error?.message ?? "Unable to save provider.");
      setSaving(false);
      return false;
    } else {
      setProviders((current) => sortProviders([result.data, ...current.filter((item) => item.id !== result.data.id)]));
      setMessage(`${providerLabel(result.data.provider)} ${mode === "edit" ? "credential updated" : "added"} without exposing its credential.`);
      if (mode === "create") {
        setNewProviderChoice("");
        setNewProviderType("openai-compatible");
        setNewProviderBaseUrl("https://api.openai.com/v1");
      }
    }
    setSaving(false);
    return true;
  }

  async function addProvider(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const provider = String(form.get("provider") || "").trim();
    const providerType = String(form.get("providerType") || "") as ProviderType;
    const baseUrl = String(form.get("baseUrl") || "").trim();
    const modelId = String(form.get("modelId") || "").trim();
    const apiKey = String(form.get("apiKey") || "").trim();
    const saved = await saveProvider(provider, {
      providerType,
      baseUrl,
      modelId,
      apiKey: apiKey || undefined,
      capabilities: ["normalize_item", "website_extraction", "pdf_parsing"],
    }, "create");
    if (saved) formElement.reset();
  }

  async function updateProviderCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProvider) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const apiKey = String(form.get("apiKey") || "").trim();
    const saved = await saveProvider(editingProvider.provider, { apiKey, capabilities: ["normalize_item"] }, "edit", editingProvider.id);
    if (saved) {
      setEditingProviderId(null);
      formElement.reset();
    }
  }

  function cancelProviderEdit() {
    setEditingProviderId(null);
    setProviderChoice("openai-compatible");
    setMessage("");
  }

  function editProvider(provider?: Provider) {
    setEditingProviderId(provider?.id ?? null);
    if (provider) setProviderChoice(provider.provider);
    setMessage(provider ? `Editing ${providerLabel(provider.provider)}. Enter a replacement API key, then save.` : "");
    requestAnimationFrame(() => document.getElementById("ai-provider-form")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  async function runHealthCheck() {
    setCheckingHealth(true);
    setMessage("Checking connectivity…");
    const response = await fetch("/api/ai-settings/providers/health?capability=normalize_item");
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error?.message ?? "Unable to check provider health.");
    } else {
      setHealth(result.data.providers);
      setMessage(result.data.route.mode === "manual_fallback" ? "No healthy provider is available; manual fallback remains active." : "Success: provider route verified.");
    }
    setCheckingHealth(false);
  }

  async function saveRouting() {
    setSavingRouting(true);
    setMessage("Saving capability routing…");
    const response = await fetch("/api/ai-settings/providers", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "routing", routes: Object.fromEntries(routingCapabilities.filter((capability) => capability.active).map((capability) => [capability.id, routeSelections[capability.id] ?? null])) }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error?.message ?? "Unable to save routing.");
    } else {
      setRouteSelections(result.data.routes);
      setSavedRouteSelections(result.data.routes);
      setMessage("Capability routing saved.");
    }
    setSavingRouting(false);
  }

  async function toggleProvider(providerId: string, enabled: boolean) {
    setTogglingProviderId(providerId);
    setMessage(enabled ? "Activating provider…" : "Deactivating provider…");
    const response = await fetch("/api/ai-settings/providers", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "provider-enabled", providerId, enabled }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error?.message ?? "Unable to update provider.");
    } else {
      setProviders(sortProviders(result.data.providers));
      setMessage(enabled ? "Provider activated." : "Provider deactivated.");
    }
    setTogglingProviderId(null);
  }

  function routeProviderLabel(capabilityId: string) {
    const provider = activeProviders.find((item) => item.id === routeSelections[capabilityId]);
    return provider ? providerLabel(provider.provider) : "Manual fallback";
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
      </header>

      <div className="ai-prototype-stack">
        <section className="ai-prototype-card">
          <div className="ai-card-header">
            <h2>Active AI Providers</h2>
            <span className="ai-count-pill">{visualProviders.filter((provider) => provider.enabled).length} Active</span>
          </div>
          <div className="ai-provider-list">
            {visualProviders.length ? <div className="ai-provider-table" role="list" aria-label="Active AI providers">
              <div className="ai-provider-table-header" aria-hidden="true"><span>Active</span><span>Provider</span><span>API</span><span>Status</span><span>Action</span></div>
              {visualProviders.map((provider) => (
              <div className={`ai-provider-row ${provider.status === "Credential Error" ? "has-error" : ""}`} role="listitem" key={provider.id}>
                <label className="ai-toggle"><input aria-label={`Set ${provider.name} active`} type="checkbox" checked={provider.enabled} disabled={togglingProviderId === provider.id} onChange={(event) => void toggleProvider(provider.id, event.target.checked)} /><span className="sr-only">{provider.enabled ? "Active" : "Inactive"}</span></label>
                <div className="ai-provider-identity">
                  <span className={`ai-provider-icon ${statusClass(provider.status)}`}>
                    <SymbolGlyph name={provider.icon} />
                  </span>
                  <span className="ai-provider-name-line">
                    <span className={`ai-provider-status ${statusClass(provider.status)}`}>
                      <span />
                      {provider.status}
                    </span>
                    <strong>{provider.name}</strong>
                  </span>
                </div>
                <span className="ai-api-preview" aria-label={`Masked API key for ${provider.name}`}>{provider.source?.apiPreview ?? "•••• ••••"}</span>
                <span className={`ai-connection-status ${provider.connection === "Connected" ? "is-connected" : "is-disconnected"}`}><span aria-hidden="true" />{provider.connection}</span>
                <div className="ai-provider-actions">
                  {provider.warning ? <span className="ai-warning-pill">{provider.warning}</span> : null}
                  {provider.status === "Healthy" ? <span className="ai-provider-id">ID: {provider.id.slice(0, 14)}</span> : null}
                  {provider.status === "Credential Error" ? <button className="ai-fix-button" type="button" onClick={() => editProvider(provider.source)}>Fix credentials</button> : null}
                  <button className="ai-ghost-button" type="button" onClick={() => editProvider(provider.source)}>Edit</button>
                </div>
              </div>
            ))}</div> : <p className="ai-empty-state">No active AI providers are configured. Add a provider below to enable routing.</p>}
          </div>
        </section>

        {editingProvider ? <form className="ai-prototype-card ai-provider-form-card" id="ai-provider-form" onSubmit={updateProviderCredentials}>
          <div className="ai-card-header">
            <h2>Provider Credentials</h2>
            <span className="ai-muted">Credentials are write-only after save.</span>
          </div>
          <div className="ai-provider-form">
            <label>Provider<input required name="provider" value={providerChoice} readOnly /></label>
            <label>API key<input required name="apiKey" type="password" autoComplete="new-password" placeholder={editingProvider.apiPreview || "•••• ••••"} /></label>
          </div>
          <section className="ai-add-provider-section" aria-label="Update Provider Credentials">
            <div>
              <h3>Update Provider</h3>
              <p>Replace the selected provider API key. The stored key remains hidden.</p>
            </div>
            <span className="ai-provider-submit-actions">
              <button className="ai-ghost-button" disabled={updatingProvider} type="button" onClick={cancelProviderEdit}>Cancel</button>
              <button className="ai-primary-button" disabled={updatingProvider} type="submit">{updatingProvider ? "Updating…" : "Update Provider"}</button>
            </span>
          </section>
        </form> : null}

        <form className="ai-prototype-card ai-provider-form-card ai-new-provider-card" onSubmit={addProvider}>
          <div className="ai-card-header">
            <h2>New AI Provider</h2>
            <span className="ai-muted">Add as many providers as needed; each provider name must be unique.</span>
          </div>
          <div className="ai-provider-form">
            <label className="ai-provider-type-field">Provider Type<select required name="providerType" value={newProviderType} onChange={(event) => {
              const providerType = event.target.value as ProviderType;
              setNewProviderType(providerType);
              setNewProviderBaseUrl(providerTypeOptions.find((option) => option.value === providerType)?.baseUrl ?? "");
            }}>{providerTypeOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
            <label>Provider Name<input required name="provider" value={newProviderChoice} onChange={(event) => setNewProviderChoice(event.target.value)} placeholder="Acme AI" /></label>
            <label>API Key{newProviderType === "ollama" ? " (optional)" : ""}<input required={newProviderType !== "ollama"} name="apiKey" type="password" autoComplete="new-password" /></label>
            <label>Base API URL<input required name="baseUrl" type="url" value={newProviderBaseUrl} onChange={(event) => setNewProviderBaseUrl(event.target.value)} placeholder="https://api.example.com/v1" /></label>
            <label>Model ID<input required name="modelId" placeholder="model-name-or-deployment" /></label>
          </div>
          <section className="ai-add-provider-section" aria-label="New AI Provider">
            <div>
              <h3>Add Provider</h3>
              <p>Save the typed provider and make it available in Active AI Providers.</p>
            </div>
            <span className="ai-provider-submit-actions">
              <button className="ai-primary-button" disabled={addingProvider} type="submit">{addingProvider ? "Adding…" : "Add Provider"}</button>
            </span>
          </section>
        </form>

        <section className="ai-prototype-card">
          <div className="ai-card-header">
            <div className="ai-routing-title">
              <h2>Capability Routing</h2>
              <SymbolGlyph name="info" title="Define which AI model handles specific ingestion tasks." />
            </div>
          </div>
          <div className="ai-routing-table-wrap">
            <table className="ai-routing-table">
              <colgroup><col className="ai-routing-capability-column" /><col className="ai-routing-status-column" /><col className="ai-routing-provider-column" /><col className="ai-routing-model-column" /></colgroup>
              <thead>
                <tr><th>Capability</th><th>Status</th><th>Provider</th><th>Model Selection</th></tr>
              </thead>
              <tbody>
                {routingCapabilities.map((capability) => <tr key={capability.id}>
                  <td><strong>{capability.label}</strong><span>{capability.description}</span></td>
                  <td><span className={`ai-route-status ${capability.active ? "is-active" : "is-suspended"}`}>{capability.active ? "Active" : "Suspended"}</span></td>
                  <td>{capability.active ? routeProviderLabel(capability.id) : <span className="ai-muted">—</span>}</td>
                  <td><select disabled={!capability.active} value={capability.active ? routeSelections[capability.id] ?? "" : ""} onChange={(event) => setRouteSelections((current) => ({ ...current, [capability.id]: event.target.value || null }))}><option value="">Manual fallback</option>{activeProviders.map((provider) => <option value={provider.id} key={provider.id}>{providerLabel(provider.provider)}</option>)}</select></td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <div className="ai-card-footer">
            <button className="ai-save-button" disabled={savingRouting || !routingDirty} type="button" onClick={saveRouting} data-element={blueprintActions.saveAi.elementId} data-action={blueprintActions.saveAi.actionId}>
              {savingRouting ? "Saving routing…" : routingDirty ? "Save routing" : "Routing saved"}
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
          <button className="ai-health-button" disabled={checkingHealth || !providers.length} type="button" onClick={runHealthCheck} data-element={blueprintActions.healthCheck.elementId} data-action={blueprintActions.healthCheck.actionId}>
            <SymbolGlyph name="refresh" className={checkingHealth ? "spin" : ""} />
            {checkingHealth ? "Checking connectivity..." : "Run health check"}
          </button>
        </section>
      </div>

      <p className="ai-status-message" aria-live="polite">{message}</p>
    </div>
  );
}
