"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { blueprintActions } from "../workspace-routes";
import { ButtonLink, FormField } from "./page-actions";

type VendorOption = { id: string; name: string };

function useMutationState() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  return { message, setMessage, pending, setPending };
}

async function responseData(response: Response) {
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message ?? "The request could not be completed.");
  return result.data;
}

function FormMessage({ message }: { message: string }) {
  return <p aria-live="polite" className={message.startsWith("Unable") ? "error" : "status"}>{message}</p>;
}

export function WebsiteImportForm({ vendors }: { vendors: VendorOption[] }) {
  const router = useRouter();
  const state = useMutationState();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    state.setPending(true);
    state.setMessage("Creating website import…");
    const form = new FormData(event.currentTarget);
    try {
      const job = await responseData(await fetch("/api/imports/website", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
        body: JSON.stringify({ url: form.get("url"), vendorId: form.get("vendorId") || undefined }),
      }));
      state.setMessage("Website import queued. Opening the job…");
      router.push(`/app/imports/jobs/${job.id}`);
    } catch (error) {
      state.setMessage(`Unable to create website import: ${error instanceof Error ? error.message : "unknown error"}`);
      state.setPending(false);
    }
  }

  return <form className="form-grid stitch-form" onSubmit={submit}>
    <FormField label="Vendor"><select name="vendorId" data-element="EL-WEB-001"><option value="">No vendor</option>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></FormField>
    <FormField label="Website URL"><input data-element="EL-WEB-002" name="url" type="url" required placeholder="https://vendor.example/catalog" /></FormField>
    <div className="wide"><button className="primary" disabled={state.pending} type="submit" data-element={blueprintActions.analyzeWebsite.elementId} data-action={blueprintActions.analyzeWebsite.actionId}>{state.pending ? "Queuing…" : blueprintActions.analyzeWebsite.label}</button></div>
    <div className="wide"><FormMessage message={state.message} /></div>
  </form>;
}

export function PdfImportForm({ vendors }: { vendors: VendorOption[] }) {
  const router = useRouter();
  const state = useMutationState();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    state.setPending(true);
    state.setMessage("Uploading PDF catalog…");
    try {
      const job = await responseData(await fetch("/api/imports/pdf", { method: "POST", body: new FormData(event.currentTarget) }));
      state.setMessage("PDF import queued. Opening the job…");
      router.push(`/app/imports/jobs/${job.id}`);
    } catch (error) {
      state.setMessage(`Unable to create PDF import: ${error instanceof Error ? error.message : "unknown error"}`);
      state.setPending(false);
    }
  }

  return <form className="form-grid stitch-form" onSubmit={submit}>
    <FormField label="Vendor"><select name="vendor_id" data-element="EL-PDF-001"><option value="">No vendor</option>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></FormField>
    <FormField label="PDF catalog"><input data-element="EL-PDF-002" name="pdf_file" type="file" accept="application/pdf" required /></FormField>
    <div className="wide"><button className="primary" disabled={state.pending} type="submit" data-element={blueprintActions.startPdf.elementId} data-action={blueprintActions.startPdf.actionId}>{state.pending ? "Uploading…" : blueprintActions.startPdf.label}</button></div>
    <div className="wide"><FormMessage message={state.message} /></div>
  </form>;
}

export function CatalogItemForm({ vendors }: { vendors: VendorOption[] }) {
  const router = useRouter();
  const state = useMutationState();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    state.setPending(true);
    state.setMessage("Saving catalog item…");
    const form = new FormData(event.currentTarget);
    try {
      const item = await responseData(await fetch("/api/catalog-items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: form.get("type"), name: form.get("name"), sku: form.get("sku"),
          priceCents: Math.round(Number(form.get("price")) * 100), currency: form.get("currency"),
          vendorId: form.get("vendorId") || null,
        }),
      }));
      state.setMessage("Catalog item saved. Opening the record…");
      router.push(`/app/catalog/${item.id}`);
    } catch (error) {
      state.setMessage(`Unable to save catalog item: ${error instanceof Error ? error.message : "unknown error"}`);
      state.setPending(false);
    }
  }

  return <form className="form-grid stitch-form catalog-item-form" onSubmit={submit} data-action="ACTION-SAVE-ITEM">
    <fieldset className="segmented-control wide" data-element="EL-FORM-001">
      <legend>Item type</legend>
      {["product", "service"].map((type) => <label key={type}><input name="type" type="radio" value={type} defaultChecked={type === "product"} />{type}</label>)}
    </fieldset>
    <FormField label="Vendor"><select name="vendorId"><option value="">No vendor</option>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></FormField>
    <FormField label="Name"><input name="name" data-element="EL-FORM-002" required maxLength={200} /></FormField>
    <FormField label="SKU"><input name="sku" data-element="EL-FORM-003" required maxLength={80} /></FormField>
    <FormField label="Price"><input name="price" data-element="EL-FORM-004" required min="0" step="0.01" type="number" /></FormField>
    <FormField label="Currency"><input name="currency" required defaultValue="USD" minLength={3} maxLength={3} /></FormField>
    <div className="wide actions"><button className="primary" disabled={state.pending} type="submit" data-element={blueprintActions.saveItem.elementId} data-action={blueprintActions.saveItem.actionId}>{state.pending ? "Saving…" : blueprintActions.saveItem.label}</button><ButtonLink href={blueprintActions.cancelItem.href}>Cancel</ButtonLink></div>
    <div className="wide"><FormMessage message={state.message} /></div>
  </form>;
}

export function VendorForm() {
  const router = useRouter();
  const state = useMutationState();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    state.setPending(true);
    state.setMessage("Saving vendor…");
    const form = new FormData(event.currentTarget);
    try {
      const vendor = await responseData(await fetch("/api/vendors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: form.get("name"), websiteUrl: form.get("websiteUrl") || null }),
      }));
      state.setMessage("Vendor saved. Opening the record…");
      router.push(`/app/vendors/${vendor.id}`);
    } catch (error) {
      state.setMessage(`Unable to save vendor: ${error instanceof Error ? error.message : "unknown error"}`);
      state.setPending(false);
    }
  }

  return <form className="form-grid stitch-form" onSubmit={submit}>
    <FormField label="Name"><input name="name" required maxLength={200} /></FormField>
    <FormField label="Website"><input name="websiteUrl" type="url" /></FormField>
    <div className="wide actions"><button className="primary" disabled={state.pending} type="submit">{state.pending ? "Saving…" : "Save vendor"}</button><ButtonLink href="/app/vendors">Cancel</ButtonLink></div>
    <div className="wide"><FormMessage message={state.message} /></div>
  </form>;
}
